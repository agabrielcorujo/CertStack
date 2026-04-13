export type StoredSession = {
  accessToken: string
  firstName: string
  lastName: string
  role: string
}

export type ProfileCert = {
  cert: string
  correctqnum: number
  incorrectqnum: number
  attempts: number
  accuracy: number
}

export type ProfileTotals = {
  correct: number
  incorrect: number
  attempts: number
  accuracy: number
}

export type ProfileResponse = {
  name: string
  certs: ProfileCert[]
  totals: ProfileTotals
}

export type ExamDomain = {
  name: string
  question_count: number
}

export type TopicOutlineSection = {
  domain_name: string
  topics: string[]
}

export type ExamCatalogItem = {
  exam_name: string
  slug: string
  normalized_name: string
  display_name: string
  description: string
  focus: string
  question_count: number
  domains: ExamDomain[]
  domain_weights: Array<Record<string, string | number>>
  topic_outline: TopicOutlineSection[]
}

export type StudyQuestion = {
  question: string
  choices: Record<string, string> | string[]
  answer: string[] | string
  explanation?: string
  domain?: string
  subdomain?: string | null
  exam_name: string
}

export type LoginResponse = {
  access_token?: string
  role?: string
  first_name?: string
  last_name?: string
  status: string
  message?: string
}
