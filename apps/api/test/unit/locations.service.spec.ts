import { LocationsRepository } from 'src/locations/locations.repository';
import { LocationsService } from 'src/locations/locations.service';

describe('LocationsService', () => {
  it('resolves the nearest Lagos community center point', async () => {
    const repository = {
      listCommunities: jest.fn().mockResolvedValue([
        {
          id: 'lekki-phase-1',
          name: 'Lekki Phase 1',
          lgaId: 'eti-osa',
          latitude: 6.4478,
          longitude: 3.4702,
        },
      ]),
      listLgas: jest.fn().mockResolvedValue([
        {
          id: 'eti-osa',
          name: 'Eti-Osa',
          stateId: 'lagos',
          latitude: 6.45,
          longitude: 3.43,
        },
      ]),
      getState: jest.fn().mockResolvedValue({
        id: 'lagos',
        name: 'Lagos',
      }),
      findLgaById: jest.fn(),
      findCommunityById: jest.fn(),
      findCommunityInLga: jest.fn(),
      listCommunitiesByLga: jest.fn(),
    } as unknown as LocationsRepository;
    const service = new LocationsService(repository);

    const result = await service.resolve(6.4475, 3.4751);

    expect(result.community.id).toBe('lekki-phase-1');
    expect(result.lga?.id).toBe('eti-osa');
    expect(result.weakMatch).toBe(false);
  });
});
