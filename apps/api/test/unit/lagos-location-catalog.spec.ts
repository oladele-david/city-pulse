import {
  lagosCommunities,
  lagosLgas,
  lagosState,
} from 'src/locations/lagos-location-catalog';

describe('lagos location catalog', () => {
  it('normalizes the full Lagos seed catalog', () => {
    expect(lagosState).toEqual({ id: 'lagos', name: 'Lagos' });
    expect(lagosLgas).toHaveLength(20);
    expect(lagosCommunities).toHaveLength(245);
  });

  it('preserves legacy community ids used by demo data', () => {
    expect(
      lagosCommunities.find((community) => community.id === 'alausa'),
    ).toMatchObject({
      id: 'alausa',
      lgaId: 'ikeja',
      name: 'Alausa/Oregun/Olusosun',
    });

    expect(
      lagosCommunities.find((community) => community.id === 'adeniran-ogunsanya'),
    ).toMatchObject({
      id: 'adeniran-ogunsanya',
      lgaId: 'surulere',
      name: 'Adeniran/Ogunsanya',
    });

    expect(
      lagosCommunities.find((community) => community.id === 'lekki-phase-1'),
    ).toMatchObject({
      id: 'lekki-phase-1',
      lgaId: 'eti-osa',
      name: 'Lekki/Ikate and Environs',
    });
  });

  it('generates unique ids for LGAs and communities', () => {
    expect(new Set(lagosLgas.map((lga) => lga.id)).size).toBe(lagosLgas.length);
    expect(new Set(lagosCommunities.map((community) => community.id)).size).toBe(
      lagosCommunities.length,
    );
  });
});
