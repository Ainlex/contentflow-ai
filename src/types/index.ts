// Tipos globales para la aplicación

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

export interface ApiResponse<T> {
  data: T
  message: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
} 