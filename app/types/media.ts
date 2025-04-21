export enum FileType {
  IMAGE = 1,
  VIDEO = 2,
  DOCUMENT = 3,
}

export interface MediaResponse {
  id: number;
  fileName: string;
  filePath: string;
  fileType: number; // 1: image, 2: video, 3: document
  fileSize: number;
  altText?: string;
  createdAt: string;
  updatedAt: string;
  urlFile?: string;
}

export interface MediaUploadRequest {
  file: File;
  altText?: string;
  fileType?: number;
}

export interface MediaListResponse {
  content: MediaResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
