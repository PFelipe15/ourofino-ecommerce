 export interface MetodosPagamento {
  id: string
  name: string
  payment_type_id: string
  status: string
  secure_thumbnail: string
  thumbnail: string
  deferred_capture: string
  settings: Setting[]
  additional_info_needed: string[]
  min_allowed_amount: number
  max_allowed_amount: number
  accreditation_time: number
  financial_institutions: FinancialInstitution[]
  processing_modes: string[]
}

export interface Setting {
  card_number: CardNumber
  bin: Bin
  security_code: SecurityCode
}

export interface CardNumber {
  validation: string
  length: number
}

export interface Bin {
  pattern: string
  installments_pattern?: string
  exclusion_pattern?: string
}

export interface SecurityCode {
  length: number
  card_location: string
  mode: string
}

export interface FinancialInstitution {
  id: string
  description: string
}
