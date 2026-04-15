import { User, Team, Project, Hackathon, HackathonStatus } from '../types';
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

// Boshlang'ich jamoalar - bo'sh (foydalanuvchilar o'zlari qo'shadi)
export const TEAMS: Team[] = [];

// Boshlang'ich loyihalar - bo'sh (foydalanuvchilar o'zlari qo'shadi)
export const PROJECTS: Project[] = [];

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
