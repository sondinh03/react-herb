export interface ActiveCompoundResponse {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

export interface ActiveCompoundForm {
  name: string;
  description: string;
}