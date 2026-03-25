import rawLagosLocations from '../../prisma/seeds/lagos-locations.json';

type RawCommunity = {
  name: string;
  latitude: number;
  longitude: number;
};

type RawLagosLocations = {
  state: {
    id: string;
    name: string;
  };
  lgas: Record<string, RawCommunity[]>;
};

type CatalogCommunity = RawCommunity & {
  id: string;
  lgaId: string;
};

type CatalogLga = {
  id: string;
  name: string;
  stateId: string;
  latitude: number;
  longitude: number;
  communities: CatalogCommunity[];
};

const lagosLocations = rawLagosLocations as RawLagosLocations;

const LGA_NAME_OVERRIDES: Record<string, string> = {
  Badagary: 'Badagry',
};

const COMMUNITY_ID_OVERRIDES: Record<string, string> = {
  'Alausa/Oregun/Olusosun': 'alausa',
  'Adeniran/Ogunsanya': 'adeniran-ogunsanya',
  'Lekki/Ikate and Environs': 'lekki-phase-1',
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
}

function normalizeLgaName(name: string) {
  return LGA_NAME_OVERRIDES[name] ?? name;
}

function getLgaId(name: string) {
  return slugify(normalizeLgaName(name));
}

function getCommunityId(lgaId: string, name: string) {
  return COMMUNITY_ID_OVERRIDES[name] ?? `${lgaId}-${slugify(name)}`;
}

function getLgaCenter(communities: RawCommunity[]) {
  const latitude =
    communities.reduce((sum, community) => sum + community.latitude, 0) / communities.length;
  const longitude =
    communities.reduce((sum, community) => sum + community.longitude, 0) / communities.length;

  return {
    latitude: Number(latitude.toFixed(6)),
    longitude: Number(longitude.toFixed(6)),
  };
}

export const lagosState = lagosLocations.state;

export const lagosLgaCatalog: CatalogLga[] = Object.entries(lagosLocations.lgas).map(
  ([rawLgaName, rawCommunities]) => {
    const name = normalizeLgaName(rawLgaName);
    const id = getLgaId(rawLgaName);
    const center = getLgaCenter(rawCommunities);

    return {
      id,
      name,
      stateId: lagosState.id,
      latitude: center.latitude,
      longitude: center.longitude,
      communities: rawCommunities.map((community) => ({
        id: getCommunityId(id, community.name),
        lgaId: id,
        name: community.name,
        latitude: community.latitude,
        longitude: community.longitude,
      })),
    };
  },
);

export const lagosLgas = lagosLgaCatalog.map(({ communities, ...lga }) => lga);

export const lagosCommunities = lagosLgaCatalog.flatMap((lga) => lga.communities);
