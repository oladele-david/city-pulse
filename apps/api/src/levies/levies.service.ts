import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { LevyStatus, LevyTargetType, PaymentStatus, Prisma } from '@prisma/client';
import { AuthUser } from 'src/domain/models';
import { LocationsRepository } from 'src/locations/locations.repository';
import { UsersRepository } from 'src/users/users.repository';
import { CreateLevyDto } from './dto/create-levy.dto';
import { ListLevyPaymentsDto } from './dto/list-levy-payments.dto';
import { UpdateLevyDto } from './dto/update-levy.dto';
import { LeviesRepository } from './levies.repository';

type LevyWithRelations = Prisma.LevyGetPayload<{
  include: {
    targetCommunity: {
      select: {
        id: true;
        name: true;
        lgaId: true;
      };
    };
    targetLga: {
      select: {
        id: true;
        name: true;
        stateId: true;
      };
    };
    createdByAdmin: {
      select: {
        id: true;
        fullName: true;
        email: true;
      };
    };
  };
}>;

function toNumber(value: { toString(): string } | number | null | undefined) {
  return Number(value ?? 0);
}

function validationError(details: Array<{ field: string; message: string }>) {
  return new UnprocessableEntityException({
    error: {
      code: 'validation_error',
      message: 'Request validation failed',
      details,
    },
  });
}

function notFound(message: string) {
  return new NotFoundException({
    error: {
      code: 'not_found',
      message,
      details: [],
    },
  });
}

@Injectable()
export class LeviesService {
  constructor(
    private readonly leviesRepository: LeviesRepository,
    private readonly usersRepository: UsersRepository,
    private readonly locationsRepository: LocationsRepository,
  ) {}

  async create(dto: CreateLevyDto, admin: AuthUser) {
    await this.validateTargeting(dto);

    const levy = await this.leviesRepository.create({
      title: dto.title.trim(),
      description: dto.description.trim(),
      levyType: dto.levyType,
      amount: dto.amount,
      dueDate: new Date(dto.dueDate),
      targetType: dto.targetType,
      targetCommunityId: dto.targetCommunityId,
      targetLgaId: dto.targetLgaId,
      status: LevyStatus.draft,
      createdByAdminId: admin.sub,
    });

    return this.serializeLevy(levy);
  }

  async listAdmin(status?: LevyStatus) {
    return (await this.leviesRepository.listAdmin(status)).map((levy) => this.serializeLevy(levy));
  }

  async getAdminDetail(levyId: string) {
    const levy = await this.requireLevy(levyId);
    return this.serializeLevy(levy);
  }

  async update(levyId: string, dto: UpdateLevyDto) {
    const existing = await this.requireLevy(levyId);

    if (existing.status === LevyStatus.closed) {
      throw validationError([
        { field: 'status', message: 'Closed levies cannot be edited' },
      ]);
    }

    const merged = {
      targetType: dto.targetType ?? existing.targetType,
      targetCommunityId: dto.targetCommunityId ?? existing.targetCommunityId ?? undefined,
      targetLgaId: dto.targetLgaId ?? existing.targetLgaId ?? undefined,
    };

    await this.validateTargeting(merged);

    const levy = await this.leviesRepository.update(levyId, {
      title: dto.title?.trim(),
      description: dto.description?.trim(),
      levyType: dto.levyType,
      amount: dto.amount,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      targetType: dto.targetType,
      targetCommunityId:
        dto.targetCommunityId !== undefined
          ? dto.targetCommunityId
          : merged.targetType === LevyTargetType.community
            ? merged.targetCommunityId ?? null
            : null,
      targetLgaId:
        dto.targetLgaId !== undefined
          ? dto.targetLgaId
          : merged.targetType === LevyTargetType.lga
            ? merged.targetLgaId ?? null
            : null,
    });

    return this.serializeLevy(levy);
  }

  async publish(levyId: string) {
    const levy = await this.requireLevy(levyId);
    if (levy.status === LevyStatus.closed) {
      throw validationError([{ field: 'status', message: 'Closed levies cannot be published' }]);
    }

    return this.serializeLevy(
      await this.leviesRepository.update(levyId, { status: LevyStatus.published }),
    );
  }

  async unpublish(levyId: string) {
    const levy = await this.requireLevy(levyId);
    if (levy.status === LevyStatus.closed) {
      throw validationError([
        { field: 'status', message: 'Closed levies cannot be unpublished' },
      ]);
    }

    return this.serializeLevy(
      await this.leviesRepository.update(levyId, { status: LevyStatus.draft }),
    );
  }

  async close(levyId: string) {
    await this.requireLevy(levyId);
    return this.serializeLevy(
      await this.leviesRepository.update(levyId, { status: LevyStatus.closed }),
    );
  }

  async listCitizenLevies(user: AuthUser) {
    const citizen = await this.usersRepository.findById(user.sub);
    if (!citizen) {
      throw notFound('Citizen not found');
    }

    return (
      await this.leviesRepository.listApplicableForCitizen({
        lgaId: citizen.lgaId,
        communityId: citizen.communityId,
      })
    ).map((levy) => this.serializeLevy(levy));
  }

  async getCitizenLevyDetail(levyId: string, user: AuthUser) {
    const citizen = await this.usersRepository.findById(user.sub);
    if (!citizen) {
      throw notFound('Citizen not found');
    }

    const levy = await this.requireLevy(levyId);
    if (!this.isApplicableToCitizen(levy, citizen)) {
      throw notFound('Levy not found');
    }

    return this.serializeLevy(levy);
  }

  async getDashboard(levyId: string) {
    await this.requireLevy(levyId);
    return this.leviesRepository.getDashboard(levyId);
  }

  async listPayments(levyId: string, filters: ListLevyPaymentsDto) {
    await this.requireLevy(levyId);
    const payments = await this.leviesRepository.listPayments(
      levyId,
      filters.status as PaymentStatus | undefined,
    );

    return payments.map((payment) => ({
      id: payment.id,
      reference: payment.reference,
      amount: toNumber(payment.amount),
      status: payment.status,
      paymentType: payment.paymentType,
      gatewayProvider: payment.gatewayProvider,
      gatewayStatus: payment.gatewayStatus,
      gatewayResponseCode: payment.gatewayResponseCode,
      gatewayResponseDescription: payment.gatewayResponseDescription,
      providerReference: payment.providerReference,
      providerPaymentReference: payment.providerPaymentReference,
      confirmedAt: payment.confirmedAt?.toISOString() ?? null,
      failedAt: payment.failedAt?.toISOString() ?? null,
      createdAt: payment.createdAt.toISOString(),
      updatedAt: payment.updatedAt.toISOString(),
      user: payment.user,
    }));
  }

  private async validateTargeting(input: {
    targetType: 'community' | 'lga';
    targetCommunityId?: string;
    targetLgaId?: string;
  }) {
    if (input.targetType === LevyTargetType.community) {
      if (!input.targetCommunityId || input.targetLgaId) {
        throw validationError([
          {
            field: 'targetCommunityId',
            message: 'Community levies must include only targetCommunityId',
          },
        ]);
      }

      const community = await this.locationsRepository.findCommunityById(input.targetCommunityId);
      if (!community) {
        throw notFound('Target community not found');
      }

      return;
    }

    if (!input.targetLgaId || input.targetCommunityId) {
      throw validationError([
        {
          field: 'targetLgaId',
          message: 'LGA levies must include only targetLgaId',
        },
      ]);
    }

    const lga = await this.locationsRepository.findLgaById(input.targetLgaId);
    if (!lga) {
      throw notFound('Target LGA not found');
    }
  }

  private async requireLevy(levyId: string) {
    const levy = await this.leviesRepository.findById(levyId);
    if (!levy) {
      throw notFound('Levy not found');
    }

    return levy;
  }

  private isApplicableToCitizen(
    levy: LevyWithRelations,
    citizen: { lgaId: string; communityId: string },
  ) {
    if (levy.status !== LevyStatus.published) {
      return false;
    }

    if (levy.targetType === LevyTargetType.community) {
      return levy.targetCommunityId === citizen.communityId;
    }

    return levy.targetLgaId === citizen.lgaId;
  }

  private serializeLevy(levy: LevyWithRelations) {
    return {
      id: levy.id,
      title: levy.title,
      description: levy.description,
      levyType: levy.levyType,
      amount: toNumber(levy.amount),
      dueDate: levy.dueDate.toISOString(),
      targetType: levy.targetType,
      targetCommunityId: levy.targetCommunityId,
      targetLgaId: levy.targetLgaId,
      status: levy.status,
      createdByAdminId: levy.createdByAdminId,
      createdAt: levy.createdAt.toISOString(),
      updatedAt: levy.updatedAt.toISOString(),
      targetCommunity: levy.targetCommunity,
      targetLga: levy.targetLga,
      createdByAdmin: levy.createdByAdmin,
    };
  }
}
