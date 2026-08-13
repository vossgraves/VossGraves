export type Project = {
  id: number
  title: string
  description: string | null
  visibility: 'public' | 'personal'
  kind: 'link' | 'file'
  imageUrl: string | null
  fileUrl: string | null
  fileName: string | null
  fileType: string | null
  linkUrl: string | null
  createdAt: string | Date
}

export type Question = {
  id: number
  askerName: string
  question: string
  answer: string | null
  answeredAt: string | Date | null
  createdAt: string | Date
}

/** The archive’s editor contract, assembled from separated Neon public/private records. */
export type SiteContent = {
  alias: string
  tagline: string
  bio: string
  loveOneTitle: string
  loveOneBody: string
  loveTwoTitle: string
  loveTwoBody: string
  loveThreeTitle: string
  loveThreeBody: string
  privateTagline: string
  privateBio: string
  privateLoveOneTitle: string
  privateLoveOneBody: string
  privateLoveTwoTitle: string
  privateLoveTwoBody: string
  privateLoveThreeTitle: string
  privateLoveThreeBody: string
}
