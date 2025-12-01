import { request } from "./http";

type RegionResponse = {
  id: number;
  name: string;
};

type CommuneResponse = {
  id: number;
  name: string;
};

export type RegionWithCommunes = {
  id: number;
  name: string;
  communes: CommuneResponse[];
};

export async function fetchRegions(): Promise<RegionResponse[]> {
  return request<RegionResponse[]>("/api/v1/regions");
}

export async function fetchCommunes(regionId: number): Promise<CommuneResponse[]> {
  return request<CommuneResponse[]>(`/api/v1/regions/${regionId}/communes`);
}

export async function fetchRegionsMap(): Promise<Record<string, string[]>> {
  const regions = await fetchRegions();
  const result: Record<string, string[]> = {};
  for (const region of regions) {
    const communes = await fetchCommunes(region.id);
    result[region.name] = communes.map((commune) => commune.name);
  }
  return result;
}
