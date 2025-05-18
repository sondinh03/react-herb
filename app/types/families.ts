export interface Family {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

export interface FamilyForm{
  name: string;
  description: string;
}
