import { NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { LeviesService } from 'src/levies/levies.service';

describe('LeviesService', () => {
  function createService() {
    const leviesRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      listApplicableForCitizen: jest.fn(),
      getDashboard: jest.fn(),
      listPayments: jest.fn(),
      listAdmin: jest.fn(),
      update: jest.fn(),
    };
    const usersRepository = {
      findById: jest.fn(),
    };
    const locationsRepository = {
      findCommunityById: jest.fn(),
      findLgaById: jest.fn(),
    };

    return {
      service: new LeviesService(
        leviesRepository as never,
        usersRepository as never,
        locationsRepository as never,
      ),
      leviesRepository,
      usersRepository,
      locationsRepository,
    };
  }

  it('rejects community levies that also provide an LGA target', async () => {
    const { service, locationsRepository } = createService();
    locationsRepository.findCommunityById.mockResolvedValue({ id: 'adeniran-ogunsanya' });

    await expect(
      service.create(
        {
          title: 'Test levy',
          description: 'test',
          levyType: 'sanitation_levy',
          amount: 1000,
          dueDate: '2026-04-01T00:00:00.000Z',
          targetType: 'community',
          targetCommunityId: 'adeniran-ogunsanya',
          targetLgaId: 'surulere',
        },
        { sub: 'admin-1', email: 'admin@citypulse.ng', role: 'admin' },
      ),
    ).rejects.toBeInstanceOf(UnprocessableEntityException);
  });

  it('filters citizen levy detail by applicability and publication state', async () => {
    const { service, leviesRepository, usersRepository } = createService();
    usersRepository.findById.mockResolvedValue({
      id: 'citizen-1',
      lgaId: 'surulere',
      communityId: 'adeniran-ogunsanya',
    });
    leviesRepository.findById.mockResolvedValue({
      id: 'levy-1',
      title: 'Draft levy',
      description: 'test',
      levyType: 'sanitation_levy',
      amount: 1000,
      dueDate: new Date('2026-04-01T00:00:00.000Z'),
      targetType: 'community',
      targetCommunityId: 'adeniran-ogunsanya',
      targetLgaId: null,
      status: 'draft',
      createdByAdminId: 'admin-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      targetCommunity: { id: 'adeniran-ogunsanya', name: 'Adeniran Ogunsanya', lgaId: 'surulere' },
      targetLga: null,
      createdByAdmin: { id: 'admin-1', fullName: 'Admin User', email: 'admin@citypulse.ng' },
    });

    await expect(
      service.getCitizenLevyDetail('levy-1', {
        sub: 'citizen-1',
        email: 'citizen@citypulse.ng',
        role: 'citizen',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
