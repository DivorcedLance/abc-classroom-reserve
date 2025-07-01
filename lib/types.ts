export type UserRole = "docente" | "coordinador"
export type ReservationType = "academico" | "no_academico"
export type ReservationStatus = "active" | "cancelled"

export interface Profile {
  id: string
  email: string
  full_name?: string
  role: UserRole
  created_at: string
  updated_at: string
}

export interface Classroom {
  id: string
  name: string
  capacity: number
  location?: string
  equipment?: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Reservation {
  id: string
  user_id: string
  classroom_id: string
  title: string
  description?: string
  reservation_type: ReservationType
  start_datetime: string
  end_datetime: string
  status: ReservationStatus
  created_at: string
  updated_at: string
  classroom?: Classroom
  user?: Profile
}

export interface CreateReservationData {
  classroom_id: string
  title: string
  description?: string
  reservation_type: ReservationType
  start_datetime: string
  end_datetime: string
}

export interface AvailabilityQuery {
  date: string
  start_time: string
  end_time: string
}
