import { User, Team, Project, Hackathon, TeamMember, ProjectHistoryItem, ProjectStatus, HackathonStatus } from '../types';
import { REGIONS } from './regions';

// Admin va viloyat yetakchilari
export const USERS: User[] = [
  {
    id: 'admin-1',
    fullName: 'Admin Adminov',
    email: 'admin@yoshlar.uz',
    phone: '+998901234567',
    role: 'admin',
    createdAt: new Date('2024-01-01'),
  },
  ...REGIONS.map((region, index) => ({
    id: `leader-${region.id}`,
    fullName: `${region.name} Yetakchisi`,
    email: `yetakchi@${region.code.toLowerCase()}.yoshlar.uz`,
    phone: `+9989${String(index + 10).padStart(2, '0')}1234567`,
    role: 'regional_leader' as const,
    regionId: region.id,
    createdAt: new Date('2024-01-01'),
  })),
];

// Hakaton sanalarini hisoblash
const getHackathonDates = (index: number): { startDate: Date; endDate: Date; status: HackathonStatus } => {
  const now = new Date();
  const currentMonth = now.getMonth();

  // Har xil statuslar uchun
  if (index < 4) {
    // Yakunlangan - o'tgan oylarda
    const month = (currentMonth - 2 - index + 12) % 12;
    return {
      startDate: new Date(2024, month, 10),
      endDate: new Date(2024, month, 12),
      status: 'completed' as HackathonStatus
    };
  } else if (index < 6) {
    // Jarayonda - hozir
    return {
      startDate: new Date(now.getFullYear(), currentMonth, 1),
      endDate: new Date(now.getFullYear(), currentMonth, 15),
      status: 'ongoing' as HackathonStatus
    };
  } else {
    // Rejalashtirilgan - kelgusi oylarda
    const futureMonth = (currentMonth + (index - 5)) % 12;
    return {
      startDate: new Date(2025, futureMonth, 15),
      endDate: new Date(2025, futureMonth, 17),
      status: 'upcoming' as HackathonStatus
    };
  }
};

// Namunaviy hakatonlar
export const HACKATHONS: Hackathon[] = REGIONS.map((region, index) => {
  const { startDate, endDate, status } = getHackathonDates(index);
  const participantsCount = Math.floor(Math.random() * 200) + 100;
  const teamsCount = Math.floor(Math.random() * 30) + 10;

  return {
    id: `hackathon-${region.id}`,
    name: `${region.name} Yoshlar Ventures Hakatoni`,
    regionId: region.id,
    startDate,
    endDate,
    location: region.districts[0]?.name || region.name,
    address: `${region.name}, ${region.districts[0]?.name || ''}, Markaziy maydon`,
    description: `${region.name}da o'tkaziladigan yoshlar uchun innovatsion loyihalar tanlovi. Eng yaxshi g'oyalar moliyalashtiriladi.`,
    status,
    participantsCount,
    teamsCount,
    projectsCount: Math.floor(teamsCount * 0.8),
    winnersCount: status === 'completed' ? Math.floor(teamsCount * 0.2) : undefined,
    totalPrize: status === 'completed' ? [50000000, 75000000, 100000000][index % 3] : undefined,
  };
});

// Namunaviy jamoa a'zolari
const createTeamMembers = (regionId: string, teamIndex: number): TeamMember[] => {
  const region = REGIONS.find(r => r.id === regionId);
  if (!region) return [];

  return Array.from({ length: 5 }, (_, i) => {
    const district = region.districts[Math.min(i + teamIndex, region.districts.length - 1)];
    return {
      id: `member-${regionId}-${teamIndex}-${i}`,
      fullName: `Jamoa a'zosi ${teamIndex + 1}-${i + 1}`,
      phone: `+998${90 + i}${String(Math.floor(Math.random() * 10000000)).padStart(7, '0')}`,
      mahallaId: `mahalla-${district.id}-${i}`,
      mahallaName: `${district.name} ${i + 1}-mahalla`,
      districtId: district.id,
      districtName: district.name,
    };
  });
};

// Namunaviy jamoalar
export const TEAMS: Team[] = REGIONS.flatMap((region, regionIndex) =>
  Array.from({ length: 3 }, (_, teamIndex) => ({
    id: `team-${region.id}-${teamIndex}`,
    name: `${region.code} Jamoa ${teamIndex + 1}`,
    regionId: region.id,
    hackathonId: `hackathon-${region.id}`,
    members: createTeamMembers(region.id, teamIndex),
    projectId: `project-${region.id}-${teamIndex}`,
    createdAt: new Date(2024, regionIndex % 12, teamIndex + 1),
  }))
);

// Namunaviy loyihalar
const projectTitles = [
  'Smart Qishloq - Aqlli qishloq xo\'jaligi tizimi',
  'EduConnect - Masofaviy ta\'lim platformasi',
  'HealthBot - Tibbiy maslahat chatboti',
  'AgriMarket - Fermerlar uchun onlayn bozor',
  'WasteRecycle - Chiqindilarni qayta ishlash ilovasi',
  'YouthJobs - Yoshlar uchun ish topish platformasi',
  'LocalCraft - Mahalliy hunarmandlar marketi',
  'GreenCity - Shahar ko\'kalamzorlashtirish loyihasi',
  'SportHub - Sport maydonlari bronlash tizimi',
  'CultureGuide - Madaniy meros sayohat ilovasi',
];

const categories = [
  'IT va Texnologiya',
  'Ta\'lim',
  'Sog\'liqni saqlash',
  'Qishloq xo\'jaligi',
  'Ekologiya',
  'Ijtimoiy loyihalar',
  'Tadbirkorlik',
  'Madaniyat va San\'at',
  'Sport',
];

// Loyiha tarixi yaratish
const createProjectHistory = (status: ProjectStatus, isApproved: boolean, index: number): ProjectHistoryItem[] => {
  const history: ProjectHistoryItem[] = [
    {
      id: `history-${index}-1`,
      date: new Date(2024, index % 12, 1),
      status: 'submitted',
      action: 'Loyiha yaratildi',
      description: 'Loyiha tizimga kiritildi va ko\'rib chiqishga yuborildi',
      actor: 'Viloyat yetakchisi',
    },
  ];

  if (['presented', 'approved', 'rejected', 'revision', 'in_progress', 'completed'].includes(status)) {
    history.push({
      id: `history-${index}-2`,
      date: new Date(2024, index % 12, 10),
      status: 'presented',
      action: 'Taqdimot qilindi',
      description: 'Loyiha Direktor Alisher Sadullayevga taqdimot qilindi',
      actor: 'Admin',
    });
  }

  if (isApproved) {
    history.push({
      id: `history-${index}-3`,
      date: new Date(2024, index % 12, 15),
      status: 'approved',
      action: 'Maqullandi',
      description: 'Direktor Alisher Sadullayev tomonidan maqullandi. Moliyalashtirish va hamkor tashkilot belgilandi.',
      actor: 'Direktor Alisher Sadullayev',
    });
  }

  if (status === 'rejected') {
    history.push({
      id: `history-${index}-3`,
      date: new Date(2024, index % 12, 15),
      status: 'rejected',
      action: 'Rad etildi',
      description: 'Loyiha hozircha qo\'llab-quvvatlanmaydi. Boshqa yo\'nalishda ishlash tavsiya etiladi.',
      actor: 'Direktor Alisher Sadullayev',
    });
  }

  if (status === 'in_progress') {
    history.push({
      id: `history-${index}-4`,
      date: new Date(2024, index % 12, 20),
      status: 'in_progress',
      action: 'Ish boshlandi',
      description: 'Loyiha amalga oshirila boshlandi',
      actor: 'Admin',
    });
  }

  return history;
};

export const PROJECTS: Project[] = TEAMS.map((team, index) => {
  const isApproved = index % 4 === 0;
  const status: ProjectStatus = isApproved ? 'approved' :
                 index % 5 === 1 ? 'in_progress' :
                 index % 6 === 2 ? 'rejected' :
                 index % 3 === 0 ? 'presented' : 'submitted';

  return {
    id: team.projectId || `project-${team.id}`,
    title: projectTitles[index % projectTitles.length],
    description: `Bu loyiha ${team.name} jamoasi tomonidan ${REGIONS.find(r => r.id === team.regionId)?.name || ''} hakatonida ishlab chiqilgan. Loyiha maqsadi mahalliy muammolarni hal qilish va yoshlar faolligini oshirish.`,
    category: categories[index % categories.length],
    teamId: team.id,
    regionId: team.regionId,
    hackathonId: team.hackathonId,
    status,
    isApprovedByDirector: isApproved,
    approvalDate: isApproved ? new Date(2024, (index % 12), 20) : undefined,
    approvalNotes: isApproved ? 'Direktor Alisher Sadullayev tomonidan maqullandi. Ijro uchun tegishli tashkilotlarga yo\'naltirilsin.' : undefined,
    rejectionReason: status === 'rejected' ? 'Loyiha hozircha qo\'llab-quvvatlanmaydi. Boshqa yo\'nalishda ishlash tavsiya etiladi.' : undefined,
    rejectionDate: status === 'rejected' ? new Date(2024, index % 12, 15) : undefined,
    assignedPartner: isApproved ? ['IT Park', 'Yoshlar agentligi', 'Innovatsion rivojlanish vazirligi'][index % 3] : undefined,
    partnerType: isApproved ? (['company', 'agency', 'ministry'] as const)[index % 3] : undefined,
    partnerContact: isApproved ? `partner${index}@example.uz` : undefined,
    allocatedBudget: isApproved ? [50000000, 100000000, 150000000, 200000000][index % 4] : undefined,
    budgetCurrency: 'UZS',
    budgetNotes: isApproved ? 'Bosqichma-bosqich moliyalashtirish' : undefined,
    similarProjectIds: index > 0 ? [`project-${TEAMS[index - 1].id}`] : undefined,
    history: createProjectHistory(status, isApproved, index),
    createdAt: new Date(2024, index % 12, 1),
    updatedAt: new Date(2024, index % 12, 15),
  };
});

// Login uchun foydalanuvchilarni topish
export const findUserByCredentials = (email: string, password: string): User | null => {
  // Admin login
  if (email === 'admin@yoshlar.uz' && password === 'admin123') {
    return USERS.find(u => u.id === 'admin-1') || null;
  }

  // Viloyat yetakchisi login (email: region code, password: region code + 123)
  const user = USERS.find(u => u.email === email);
  if (user && user.role === 'regional_leader') {
    const region = REGIONS.find(r => r.id === user.regionId);
    if (region && password === `${region.code.toLowerCase()}123`) {
      return user;
    }
  }

  return null;
};
