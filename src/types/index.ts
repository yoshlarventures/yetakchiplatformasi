// Foydalanuvchi turlari
export type UserRole = 'admin' | 'regional_leader';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  regionId?: string; // Viloyat yetakchilari uchun
  avatar?: string;
  createdAt: Date;
}

// Geografik tuzilma
export interface Region {
  id: string;
  name: string;
  code: string;
  districts: District[];
}

export interface District {
  id: string;
  name: string;
  regionId: string;
}

export interface Mahalla {
  id: string;
  name: string;
  districtId: string;
}

// Jamoa a'zosi (Mahalla yoshlar yetakchisi)
export interface TeamMember {
  id: string;
  fullName: string;
  phone: string;
  mahallaId: string;
  mahallaName: string;
  districtId: string;
  districtName: string;
}

// Jamoa
export interface Team {
  id: string;
  name: string;
  regionId: string;
  hackathonId: string;
  members: TeamMember[];
  projectId?: string;
  createdAt: Date;
}

// Hakaton statusi
export type HackathonStatus = 'upcoming' | 'ongoing' | 'completed';

// Hakaton/Ideaton
export interface Hackathon {
  id: string;
  name: string;
  regionId: string;
  startDate: Date;
  endDate: Date;
  location: string;
  address?: string;
  description?: string;
  status: HackathonStatus;
  participantsCount: number;
  teamsCount: number;
  projectsCount: number;
  winnersCount?: number;
  totalPrize?: number;
}

// Hakaton status nomlari
export const HACKATHON_STATUS_NAMES = {
  upcoming: 'Rejalashtirilgan',
  ongoing: 'Jarayonda',
  completed: 'Yakunlangan',
} as const;

// Loyiha statusi
export type ProjectStatus =
  | 'preparation'      // Tayyorgarlik - hakaton oldidan
  | 'draft'            // Qoralama
  | 'submitted'        // Topshirilgan - ko'rib chiqishga yuborildi
  | 'under_review'     // Ko'rib chiqilmoqda
  | 'presented'        // Direktorga taqdimot qilindi
  | 'approved'         // Maqullandi - pul ajratildi
  | 'rejected'         // Rad etildi
  | 'revision'         // Qayta ishlash kerak
  | 'in_progress'      // Amalga oshirilmoqda
  | 'completed';       // Yakunlandi

// Fayl turi
export type FileType = 'presentation' | 'document' | 'image' | 'video' | 'other';

// Biriktirilgan fayl
export interface ProjectAttachment {
  id: string;
  name: string;
  originalName: string;
  url: string;
  type: FileType;
  size: number; // bytes
  mimeType: string;
  uploadedAt: Date;
  uploadedBy: string;
}

// Loyiha tarixi (timeline)
export interface ProjectHistoryItem {
  id: string;
  date: Date;
  status: ProjectStatus;
  action: string;
  description: string;
  actor: string;
}

// Loyiha
export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  teamId: string;
  regionId: string;
  hackathonId: string;
  status: ProjectStatus;

  // Direktor tomonidan maqullangandan keyin
  isApprovedByDirector: boolean;
  approvalDate?: Date;
  approvalNotes?: string;

  // Rad etilgan bo'lsa
  rejectionReason?: string;
  rejectionDate?: Date;

  // Qayta ishlash kerak bo'lsa
  revisionNotes?: string;

  // Kim bilan ishlash
  assignedPartner?: string;
  partnerContact?: string;
  partnerType?: 'ministry' | 'agency' | 'fund' | 'company' | 'other';

  // Moliyaviy ma'lumotlar
  allocatedBudget?: number;
  budgetCurrency?: string;
  budgetNotes?: string;

  // O'xshash loyihalar
  similarProjectIds?: string[];

  // Biriktirilgan fayllar
  attachments?: ProjectAttachment[];

  // Tayyorgarlik bosqichi
  isPreparation?: boolean;
  preparationNotes?: string;

  // Loyiha tarixi
  history: ProjectHistoryItem[];

  // Vaqt
  createdAt: Date;
  updatedAt: Date;
}

// Hamkor turlari
export const PARTNER_TYPES = {
  ministry: 'Vazirlik',
  agency: 'Agentlik',
  fund: 'Fond',
  company: 'Kompaniya',
  other: 'Boshqa',
} as const;

// Loyiha kategoriyalari
export const PROJECT_CATEGORIES = [
  'Ta\'lim',
  'Sog\'liqni saqlash',
  'Qishloq xo\'jaligi',
  'IT va Texnologiya',
  'Ekologiya',
  'Ijtimoiy loyihalar',
  'Tadbirkorlik',
  'Madaniyat va San\'at',
  'Sport',
  'Boshqa'
] as const;

// Statistika
export interface RegionStats {
  regionId: string;
  totalProjects: number;
  approvedProjects: number;
  pendingProjects: number;
  totalTeams: number;
  totalBudgetAllocated: number;
}
