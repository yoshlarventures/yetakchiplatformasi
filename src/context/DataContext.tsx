import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Team, Project, ProjectStatus, ProjectHistoryItem, ProjectAttachment } from '../types';

// localStorage kalitlari
const STORAGE_KEYS = {
  teams: 'yetakchi_teams',
  projects: 'yetakchi_projects',
};

// Date larni qayta tiklash uchun helper
const reviveDates = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') {
    // ISO date formatini tekshirish
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(obj)) {
      return new Date(obj);
    }
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(reviveDates);
  }
  if (typeof obj === 'object') {
    const result: any = {};
    for (const key in obj) {
      result[key] = reviveDates(obj[key]);
    }
    return result;
  }
  return obj;
};

// localStorage'dan o'qish
const loadFromStorage = <T,>(key: string, fallback: T): T => {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);
      return reviveDates(parsed);
    }
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
  }
  return fallback;
};

// localStorage'ga yozish
const saveToStorage = <T,>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

interface DataContextType {
  teams: Team[];
  projects: Project[];
  addTeam: (team: Omit<Team, 'id' | 'createdAt'>) => Team;
  updateTeam: (teamId: string, updates: Partial<Team>) => void;
  deleteTeam: (teamId: string) => void;
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'history'>) => Project;
  updateProject: (projectId: string, updates: Partial<Project>) => void;
  deleteProject: (projectId: string) => void;
  changeProjectStatus: (projectId: string, status: ProjectStatus, action: string, description: string, actor: string) => void;
  submitProject: (projectId: string) => void;
  presentProject: (projectId: string) => void;
  approveProject: (projectId: string, data: { notes: string; partner?: string; partnerType?: string; budget?: number }) => void;
  rejectProject: (projectId: string, reason: string) => void;
  requestRevision: (projectId: string, notes: string) => void;
  startProject: (projectId: string) => void;
  completeProject: (projectId: string) => void;
  getTeamsByRegion: (regionId: string) => Team[];
  getProjectsByRegion: (regionId: string) => Project[];
  getProjectByTeamId: (teamId: string) => Project | undefined;
  addAttachment: (projectId: string, attachment: ProjectAttachment) => void;
  removeAttachment: (projectId: string, attachmentId: string) => void;
  clearAllData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // localStorage'dan yuklash (foydalanuvchilar o'zlari ma'lumot qo'shadi)
  const [teams, setTeams] = useState<Team[]>(() => {
    return loadFromStorage<Team[]>(STORAGE_KEYS.teams, []);
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const stored = loadFromStorage<Project[]>(STORAGE_KEYS.projects, []);
    return stored.map(p => ({ ...p, history: p.history || [] }));
  });

  // Ma'lumotlar o'zgarganda localStorage'ga saqlash
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.teams, teams);
  }, [teams]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.projects, projects);
  }, [projects]);

  const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const addTeam = (teamData: Omit<Team, 'id' | 'createdAt'>): Team => {
    const newTeam: Team = {
      ...teamData,
      id: generateId(),
      createdAt: new Date(),
    };
    setTeams(prev => [...prev, newTeam]);
    return newTeam;
  };

  const updateTeam = (teamId: string, updates: Partial<Team>) => {
    setTeams(prev => prev.map(team =>
      team.id === teamId ? { ...team, ...updates } : team
    ));
  };

  const deleteTeam = (teamId: string) => {
    setTeams(prev => prev.filter(team => team.id !== teamId));
    setProjects(prev => prev.map(project =>
      project.teamId === teamId ? { ...project, teamId: '' } : project
    ));
  };

  const addProject = (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'history'>): Project => {
    const now = new Date();
    const historyItem: ProjectHistoryItem = {
      id: generateId(),
      date: now,
      status: projectData.status || 'draft',
      action: 'Loyiha yaratildi',
      description: 'Yangi loyiha tizimga kiritildi',
      actor: 'Viloyat yetakchisi',
    };

    const newProject: Project = {
      ...projectData,
      id: generateId(),
      history: [historyItem],
      createdAt: now,
      updatedAt: now,
    };
    setProjects(prev => [...prev, newProject]);

    if (projectData.teamId) {
      updateTeam(projectData.teamId, { projectId: newProject.id });
    }

    return newProject;
  };

  const updateProject = (projectId: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(project =>
      project.id === projectId ? { ...project, ...updates, updatedAt: new Date() } : project
    ));
  };

  const deleteProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project?.teamId) {
      updateTeam(project.teamId, { projectId: undefined });
    }
    setProjects(prev => prev.filter(p => p.id !== projectId));
  };

  const changeProjectStatus = (projectId: string, status: ProjectStatus, action: string, description: string, actor: string) => {
    setProjects(prev => prev.map(project => {
      if (project.id === projectId) {
        const historyItem: ProjectHistoryItem = {
          id: generateId(),
          date: new Date(),
          status,
          action,
          description,
          actor,
        };
        return {
          ...project,
          status,
          history: [...(project.history || []), historyItem],
          updatedAt: new Date(),
        };
      }
      return project;
    }));
  };

  const submitProject = (projectId: string) => {
    changeProjectStatus(
      projectId,
      'submitted',
      'Ko\'rib chiqishga yuborildi',
      'Loyiha ko\'rib chiqish uchun yuborildi',
      'Viloyat yetakchisi'
    );
  };

  const presentProject = (projectId: string) => {
    changeProjectStatus(
      projectId,
      'presented',
      'Taqdimot qilindi',
      'Loyiha Direktor Alisher Sadullayevga taqdimot qilindi',
      'Admin'
    );
  };

  const approveProject = (projectId: string, data: { notes: string; partner?: string; partnerType?: string; budget?: number }) => {
    setProjects(prev => prev.map(project => {
      if (project.id === projectId) {
        const historyItem: ProjectHistoryItem = {
          id: generateId(),
          date: new Date(),
          status: 'approved',
          action: 'Maqullandi',
          description: data.notes || 'Direktor Alisher Sadullayev tomonidan maqullandi',
          actor: 'Direktor Alisher Sadullayev',
        };
        return {
          ...project,
          status: 'approved',
          isApprovedByDirector: true,
          approvalDate: new Date(),
          approvalNotes: data.notes,
          assignedPartner: data.partner,
          partnerType: data.partnerType as Project['partnerType'],
          allocatedBudget: data.budget,
          budgetCurrency: 'UZS',
          history: [...(project.history || []), historyItem],
          updatedAt: new Date(),
        };
      }
      return project;
    }));
  };

  const rejectProject = (projectId: string, reason: string) => {
    setProjects(prev => prev.map(project => {
      if (project.id === projectId) {
        const historyItem: ProjectHistoryItem = {
          id: generateId(),
          date: new Date(),
          status: 'rejected',
          action: 'Rad etildi',
          description: reason,
          actor: 'Direktor Alisher Sadullayev',
        };
        return {
          ...project,
          status: 'rejected',
          isApprovedByDirector: false,
          rejectionReason: reason,
          rejectionDate: new Date(),
          history: [...(project.history || []), historyItem],
          updatedAt: new Date(),
        };
      }
      return project;
    }));
  };

  const requestRevision = (projectId: string, notes: string) => {
    setProjects(prev => prev.map(project => {
      if (project.id === projectId) {
        const historyItem: ProjectHistoryItem = {
          id: generateId(),
          date: new Date(),
          status: 'revision',
          action: 'Qayta ishlash kerak',
          description: notes,
          actor: 'Direktor Alisher Sadullayev',
        };
        return {
          ...project,
          status: 'revision',
          revisionNotes: notes,
          history: [...(project.history || []), historyItem],
          updatedAt: new Date(),
        };
      }
      return project;
    }));
  };

  const startProject = (projectId: string) => {
    changeProjectStatus(
      projectId,
      'in_progress',
      'Ish boshlandi',
      'Loyiha amalga oshirila boshlandi',
      'Admin'
    );
  };

  const completeProject = (projectId: string) => {
    changeProjectStatus(
      projectId,
      'completed',
      'Yakunlandi',
      'Loyiha muvaffaqiyatli yakunlandi',
      'Admin'
    );
  };

  const getTeamsByRegion = (regionId: string) => {
    return teams.filter(team => team.regionId === regionId);
  };

  const getProjectsByRegion = (regionId: string) => {
    return projects.filter(project => project.regionId === regionId);
  };

  const getProjectByTeamId = (teamId: string) => {
    return projects.find(project => project.teamId === teamId);
  };

  const addAttachment = (projectId: string, attachment: ProjectAttachment) => {
    setProjects(prev => prev.map(project => {
      if (project.id === projectId) {
        return {
          ...project,
          attachments: [...(project.attachments || []), attachment],
          updatedAt: new Date(),
        };
      }
      return project;
    }));
  };

  const removeAttachment = (projectId: string, attachmentId: string) => {
    setProjects(prev => prev.map(project => {
      if (project.id === projectId) {
        return {
          ...project,
          attachments: (project.attachments || []).filter(a => a.id !== attachmentId),
          updatedAt: new Date(),
        };
      }
      return project;
    }));
  };

  // Barcha ma'lumotlarni tozalash
  const clearAllData = () => {
    localStorage.removeItem(STORAGE_KEYS.teams);
    localStorage.removeItem(STORAGE_KEYS.projects);
    setTeams([]);
    setProjects([]);
  };

  return (
    <DataContext.Provider value={{
      teams,
      projects,
      addTeam,
      updateTeam,
      deleteTeam,
      addProject,
      updateProject,
      deleteProject,
      changeProjectStatus,
      submitProject,
      presentProject,
      approveProject,
      rejectProject,
      requestRevision,
      startProject,
      completeProject,
      getTeamsByRegion,
      getProjectsByRegion,
      getProjectByTeamId,
      addAttachment,
      removeAttachment,
      clearAllData,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
