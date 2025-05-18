export interface Plant {
  id: number;
  name: string;
  scientificName: string;
  family: string;
  familyId?: number;
  generaId?: number;
  genus: string;
  otherNames: string;
  partsUsed: string;
  description: string;
  distribution: string;
  altitude: string;
  harvestSeason: string;
  status: number; // 0: draft, 1: published, 2: pending
  botanicalCharacteristics: string;
  stem: string;
  leaves: string;
  flowers: string;
  fruits: string;
  roots: string;
  chemicalComposition: string;
  ecology: string;
  medicinalUses: string;
  indications: string;
  contraindications: string;
  dosage: string;
  folkRemedies: string;
  sideEffects: string;
  featured: boolean;
  featuredMediaId: number;
  views: number;
  images?: string[]; // Thêm trường images để quản lý hình ảnh
  category?: string; // Thêm trường category
  diseaseId?: number;
}

// Enum cho Status
export enum PlantStatus {
  DRAFT = 1,
  PUBLISHED = 2,
  PENDING = 3,
}
