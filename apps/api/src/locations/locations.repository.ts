import { Injectable } from '@nestjs/common';
import { InMemoryDatabaseService } from 'src/infrastructure/in-memory/in-memory-database.service';

@Injectable()
export class LocationsRepository {
  constructor(private readonly db: InMemoryDatabaseService) {}

  getState() {
    return this.db.state;
  }

  listLgas() {
    return this.db.lgas;
  }

  listCommunitiesByLga(lgaId: string) {
    return this.db.communities.filter((community) => community.lgaId === lgaId);
  }

  listCommunities() {
    return this.db.communities;
  }
}
