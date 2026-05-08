export type SubscriptionPlan = 'BASIC' | 'PROFESSIONAL' | 'ENTERPRISE' | 'SUPER'

export interface Tenant {
  id: string
  name: string
  legalName: string | null
  taxId: string | null
  address: string | null
  email: string | null
  phone: string | null
  logoUrl: string | null
  publicLogoUrl: string | null
  ivaCondition: string | null
  iibb: string | null
  activityStartDate: string | null
  subscriptionPlan: SubscriptionPlan
  maxUsers: number
  active: boolean
  planExpiration: string | null
  planExpired: boolean
  createdAt: string
}

export interface UpdateTenantRequest {
  name?: string
  legalName?: string
  email?: string
  address?: string
  phone?: string
  ivaCondition?: string
  iibb?: string
  activityStartDate?: string
}
