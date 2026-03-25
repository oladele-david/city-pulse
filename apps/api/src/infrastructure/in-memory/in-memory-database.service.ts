import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
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
import {
  lagosCommunities,
  lagosLgas,
  lagosState,
} from 'src/locations/lagos-location-catalog';

@Injectable()
export class InMemoryDatabaseService {
  readonly state: StateRecord = {
    id: lagosState.id,
    name: lagosState.name,
  };

  readonly lgas: LgaRecord[] = lagosLgas.map((lga) => ({
    id: lga.id,
    name: lga.name,
    stateId: lagosState.id,
    latitude: lga.latitude,
    longitude: lga.longitude,
  }));

  readonly communities: CommunityRecord[] = lagosCommunities.map((community) => ({
    id: community.id,
    name: community.name,
    lgaId: community.lgaId,
    latitude: community.latitude,
    longitude: community.longitude,
  }));

  users: UserRecord[] = [];
  issues: IssueRecord[] = [];
  reactions: IssueReactionRecord[] = [];
  ledger: PointsLedgerRecord[] = [];
  payments: PaymentRecord[] = [];
  paymentWebhooks: PaymentWebhookRecord[] = [];

  constructor() {
    this.bootstrapUsers();
    this.bootstrapIssues();
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

  private bootstrapIssues() {
    const citizen = this.users.find((user) => user.role === 'citizen');
    if (!citizen) {
      return;
    }

    const now = Date.now();

    this.issues = [
      {
        id: uuid(),
        type: 'drainage',
        title: 'Blocked drainage beside Adeniran Ogunsanya market',
        description:
          'Runoff is backing up beside the market entrance and spilling into the road after rainfall.',
        severity: 'high',
        status: 'open',
        confidenceScore: 82,
        confidenceBand: 'high',
        reportedByUserId: citizen.id,
        reporterTrustWeight: citizen.trustWeight,
        lgaId: 'surulere',
        communityId: 'adeniran-ogunsanya',
        streetOrLandmark: 'Adeniran Ogunsanya market frontage',
        latitude: 6.4994,
        longitude: 3.3537,
        photoUrls: [],
        videoUrl: null,
        confirmationsCount: 3,
        disagreementsCount: 0,
        fixedSignalsCount: 0,
        needsResolutionReview: false,
        createdAt: new Date(now - 1000 * 60 * 60 * 8).toISOString(),
        updatedAt: new Date(now - 1000 * 60 * 45).toISOString(),
      },
      {
        id: uuid(),
        type: 'road',
        title: 'Pothole widening near Alausa Secretariat bus stop',
        description:
          'The damaged lane is forcing buses into the next lane and causing slow traffic around the junction.',
        severity: 'medium',
        status: 'in_progress',
        confidenceScore: 74,
        confidenceBand: 'medium',
        reportedByUserId: citizen.id,
        reporterTrustWeight: citizen.trustWeight,
        lgaId: 'ikeja',
        communityId: 'alausa',
        streetOrLandmark: 'Alausa Secretariat bus stop',
        latitude: 6.6211,
        longitude: 3.3581,
        photoUrls: [],
        videoUrl: null,
        confirmationsCount: 2,
        disagreementsCount: 0,
        fixedSignalsCount: 0,
        needsResolutionReview: false,
        createdAt: new Date(now - 1000 * 60 * 60 * 26).toISOString(),
        updatedAt: new Date(now - 1000 * 60 * 60 * 2).toISOString(),
      },
      {
        id: uuid(),
        type: 'lighting',
        title: 'Streetlights out along Admiralty Way service lane',
        description:
          'Multiple streetlights have stayed off through the evening stretch, leaving the pedestrian edge very dark.',
        severity: 'medium',
        status: 'resolved',
        confidenceScore: 68,
        confidenceBand: 'medium',
        reportedByUserId: citizen.id,
        reporterTrustWeight: citizen.trustWeight,
        lgaId: 'eti-osa',
        communityId: 'lekki-phase-1',
        streetOrLandmark: 'Admiralty Way service lane',
        latitude: 6.4478,
        longitude: 3.4702,
        photoUrls: [],
        videoUrl: null,
        confirmationsCount: 4,
        disagreementsCount: 1,
        fixedSignalsCount: 1,
        needsResolutionReview: false,
        createdAt: new Date(now - 1000 * 60 * 60 * 40).toISOString(),
        updatedAt: new Date(now - 1000 * 60 * 60 * 6).toISOString(),
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
