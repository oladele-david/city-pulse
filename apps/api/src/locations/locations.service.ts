import { Injectable, NotFoundException } from '@nestjs/common';
import { LocationsRepository } from './locations.repository';
import { haversineDistanceKm } from './location.utils';

@Injectable()
export class LocationsService {
  constructor(private readonly locationsRepository: LocationsRepository) {}

  async listLgas() {
    return this.locationsRepository.listLgas();
  }

  async listCommunitiesByLga(lgaId: string) {
    const lga = await this.locationsRepository.findLgaById(lgaId);
    if (!lga) {
      throw new NotFoundException({
        error: {
          code: 'not_found',
          message: 'LGA not found',
          details: [],
        },
      });
    }

    return this.locationsRepository.listCommunitiesByLga(lgaId);
  }

  async resolve(latitude: number, longitude: number, street?: string) {
    const [communities, lgas, state] = await Promise.all([
      this.locationsRepository.listCommunities(),
      this.locationsRepository.listLgas(),
      this.locationsRepository.getState(),
    ]);

    const nearest = communities
      .map((community) => ({
        community,
        distanceKm: haversineDistanceKm(
          latitude,
          longitude,
          community.latitude,
          community.longitude,
        ),
      }))
      .sort((left, right) => left.distanceKm - right.distanceKm)[0];

    if (!nearest) {
      throw new NotFoundException({
        error: {
          code: 'not_found',
          message: 'No Lagos communities have been loaded in the database',
          details: [],
        },
      });
    }

    const lga = lgas.find((item) => item.id === nearest.community.lgaId);

    return {
      state,
      lga,
      community: nearest.community,
      street: street ?? null,
      distanceKm: Number(nearest.distanceKm.toFixed(2)),
      weakMatch: nearest.distanceKm > 20,
    };
  }
}
