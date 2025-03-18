import axios from "axios";
import { HERB_APP_API_URL } from '../config/config'

export interface SearchDto {
    pageIndex: number;        
    pageSize: number;
    keyword?: string;
}

export interface Page<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

export interface HerbResponse<T> {
    code: number;
    message: string;
    data: T;
    total: number;
}

export interface PlantResponseDto {
    id: number;
    vietnameseName: string;
    scientificName: string;
    otherName: string;
    planFamilyId: number;
    diseaseGroupId: number;
    image: string;
    uses: string;
    description: string;
    distribution: string;
    content: string;
    searchCount: number;
}

export const searchPlants = async (searchDto: SearchDto): Promise<HerbResponse<Page<PlantResponseDto>>> => {
    try {
      const response = await axios.get(`${HERB_APP_API_URL}/plants/search`, {params: searchDto});
      return response.data;
    } catch (error) {
      console.error('Error searching plants:', error);
      throw error;
    }
};

export const viewPlant = async (id: number): Promise<any> => {
    try {
        const response = await axios.get(`${HERB_APP_API_URL}/plants/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error viewing plant:', error);
        throw error;
    }
}