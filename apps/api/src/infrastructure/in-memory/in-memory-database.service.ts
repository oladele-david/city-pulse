import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import lagosLocations from '../../../prisma/seeds/lagos-locations.json';
import {
  CommunityRecord,
  IssueReactionRecord,
  IssueRecord,
  LgaRecord,
  PaymentRecord,
  PaymentWebhookRecord,
  PointsLedgerRecord,
  StateRecord,
  UserRecord,
} from 'src/domain/models';
import { deriveRank, getTrustWeight } from 'src/domain/rules/points.rules';

@Injectable()
export class InMemoryDatabaseService {
  readonly state: StateRecord = {
    id: lagosLocations.state.id,
    name: lagosLocations.state.name,
  };

  readonly lgas: LgaRecord[] = lagosLocations.lgas.map((lga) => ({
    id: lga.id,
    name: lga.name,
    stateId: lagosLocations.state.id,
    latitude: lga.latitude,
    longitude: lga.longitude,
  }));

  readonly communities: CommunityRecord[] = lagosLocations.lgas.flatMap((lga) =>
    lga.communities.map((community) => ({
      id: community.id,
      name: community.name,
      lgaId: lga.id,
      latitude: community.latitude,
      longitude: community.longitude,
    })),
  );

  users: UserRecord[] = [];
  issues: IssueRecord[] = [];
  reactions: IssueReactionRecord[] = [];
  ledger: PointsLedgerRecord[] = [];
  payments: PaymentRecord[] = [];
  paymentWebhooks: PaymentWebhookRecord[] = [];

  constructor() {
    this.bootstrapUsers();
  }

  private bootstrapUsers() {
    const adminCreatedAt = new Date().toISOString();
    const citizenCreatedAt = new Date().toISOString();

    this.users = [
      {
        id: uuid(),
        fullName: 'CityPulse Admin',
        email: 'admin@citypulse.ng',
        passwordHash: bcrypt.hashSync('AdminPass123!', 10),
        role: 'admin',
        lgaId: 'ikeja',
        communityId: 'alausa',
        streetOrArea: 'Alausa Secretariat',
        points: 75,
        rank: 'Community Sentinel',
        trustWeight: 1.5,
        createdAt: adminCreatedAt,
        updatedAt: adminCreatedAt,
      },
      {
        id: uuid(),
        fullName: 'Demo Citizen',
        email: 'citizen@citypulse.ng',
        passwordHash: bcrypt.hashSync('CitizenPass123!', 10),
        role: 'citizen',
        lgaId: 'surulere',
        communityId: 'adeniran-ogunsanya',
        streetOrArea: 'Adeniran Ogunsanya Street',
        points: 14,
        rank: 'Reliable',
        trustWeight: 1.15,
        createdAt: citizenCreatedAt,
        updatedAt: citizenCreatedAt,
      },
    ];
  }

  recalculateUserStanding(userId: string) {
    const totalPoints = this.ledger
      .filter((entry) => entry.userId === userId)
      .reduce((sum, entry) => sum + entry.pointsDelta, 0);

    const user = this.users.find((item) => item.id === userId);
    if (!user) {
      return;
    }

    user.points = totalPoints;
    user.rank = deriveRank(totalPoints);
    user.trustWeight = getTrustWeight(user.rank);
    user.updatedAt = new Date().toISOString();
  }
}
