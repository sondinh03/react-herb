export interface ExpertResponseDto {
  id: number
  name: string
  slug: string
  title: string
  specialization: string
  institution: string
  education: string
  bio: string
  achievements: string
  contactEmail: string
  avatarId: number | null
  zaloPhone: string
  status: number
  createdAt?: string
  updatedAt?: string
}