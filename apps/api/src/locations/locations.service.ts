import { Injectable, NotFoundException } from '@nestjs/common';
import { LocationsRepository } from './locations.repository';
import { haversineDistanceKm } from './location.utils';

@Injectable()
export class LocationsService {
  constructor(private readonly locationsRepository: LocationsRepository) {}

  listLgas() {
    return this.locationsRepository.listLgas();
  }

  listCommunitiesByLga(lgaId: string) {
    const lga = this.locationsRepository.listLgas().find((item) => item.id === lgaId);
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

  resolve(latitude: number, longitude: number, street?: string) {
    const communities = this.locationsRepository.listCommunities();
    const lgas = this.locationsRepository.listLgas();
    const state = this.locationsRepository.getState();

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
