import { create } from "zustand"
import type { Reservation, Classroom } from "@/lib/types"

interface ReservationState {
  reservations: Reservation[]
  availableClassrooms: Classroom[]
  loading: boolean
  setReservations: (reservations: Reservation[]) => void
  setAvailableClassrooms: (classrooms: Classroom[]) => void
  setLoading: (loading: boolean) => void
  addReservation: (reservation: Reservation) => void
  updateReservation: (id: string, updates: Partial<Reservation>) => void
  removeReservation: (id: string) => void
}

export const useReservationStore = create<ReservationState>((set) => ({
  reservations: [],
  availableClassrooms: [],
  loading: false,

  setReservations: (reservations) => set({ reservations }),
  setAvailableClassrooms: (classrooms) => set({ availableClassrooms: classrooms }),
  setLoading: (loading) => set({ loading }),

  addReservation: (reservation) =>
    set((state) => ({
      reservations: [...state.reservations, reservation],
    })),

  updateReservation: (id, updates) =>
    set((state) => ({
      reservations: state.reservations.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    })),

  removeReservation: (id) =>
    set((state) => ({
      reservations: state.reservations.filter((r) => r.id !== id),
    })),
}))
