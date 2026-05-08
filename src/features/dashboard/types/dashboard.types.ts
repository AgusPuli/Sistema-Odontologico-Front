/**
 * Mirrors backend DashboardStatsResponse.
 */
export interface DashboardStats {
  totalPatients: number
  activePatients: number
  appointmentsToday: number
  appointmentsThisWeek: number
  upcomingAppointments: number
  treatmentsInCatalog: number
  pendingTreatmentItems: number
  activeEstimates: number
  estimatedRevenuePending: number
}
