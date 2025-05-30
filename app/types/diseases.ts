export interface DiseasesResponse {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parentId?: number;
}

export interface DiseaseForm {
  name: string;
  description: string;
}
