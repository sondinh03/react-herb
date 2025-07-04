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
  stemDescription?: string;
  leafDescription?: string;
  flowerDescription?: string;
  fruitDescription?: string;
  rootDescription?: string;
  activeCompoundId: number;
  activeCompoundDescription?: string;
  dataSourceId: number;
  sourceName?: string;
  sourceAuthor?: string;
  sourcePublisher?: string;
  sourcePublicationYear?: number;
  sourceType: string;
}

// Enum cho Status
export enum PlantStatus {
  DRAFT = 1, // Bản nháp
  PENDING = 2, // Chờ duyệt
  PUBLISHED = 3, // Đã xuất bản
  ARCHIVE = 4, // Lưu trữ
  REJECT = 5, // Từ chối
}