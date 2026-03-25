import { LocationsRepository } from 'src/locations/locations.repository';
import { LocationsService } from 'src/locations/locations.service';
import { InMemoryDatabaseService } from 'src/infrastructure/in-memory/in-memory-database.service';

describe('LocationsService', () => {
  it('resolves the nearest Lagos community center point', () => {
    const db = new InMemoryDatabaseService();
    const repository = new LocationsRepository(db);
    const service = new LocationsService(repository);

    const result = service.resolve(6.4475, 3.4751);

    expect(result.community.id).toBe('lekki-phase-1');
    expect(result.lga?.id).toBe('eti-osa');
    expect(result.weakMatch).toBe(false);
  });
});
