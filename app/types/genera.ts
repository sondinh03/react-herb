export interface GeneraResponse {
  id: number;
  name: string;
  description?: string;
  familyId: number;
  familyName: string;
}

export interface GeneraForm {
  name: string;
  description: string;
  familyId: number;
}
