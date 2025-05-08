export interface RegisterResponse {
  id: number;
  username: string;
  email: string;
  fullName: string;
  roleType: number;
  status: number;
}

export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  roleType: number;
  status: number;
  createdAt: string;
  updatedAt: string;
  lastLogin: string;
}
