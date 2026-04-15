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

// Hakatonlar - hozircha statik, keyinchalik Supabase'dan olinadi
export const HACKATHONS: Hackathon[] = REGIONS.map((region) => {
  // Hozirgi oy uchun hakaton
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 15);
  const endDate = new Date(now.getFullYear(), now.getMonth(), 17);

  return {
    id: `hackathon-${region.id}`,
    name: `${region.name} Yoshlar Ventures Hakatoni`,
    regionId: region.id,
    startDate,
    endDate,
    location: region.districts[0]?.name || region.name,
    address: `${region.name}, ${region.districts[0]?.name || ''}, Markaziy maydon`,
    description: `${region.name}da o'tkaziladigan yoshlar uchun innovatsion loyihalar tanlovi.`,
    status: 'ongoing' as HackathonStatus,
    participantsCount: 0, // Real data DataContext'dan olinadi
    teamsCount: 0,
    projectsCount: 0,
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
