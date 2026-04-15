import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Team, Project, ProjectStatus, ProjectHistoryItem } from '../types';
import { TEAMS as INITIAL_TEAMS, PROJECTS as INITIAL_PROJECTS } from '../data/mockData';

interface DataContextType {
  teams: Team[];
  projects: Project[];
  addTeam: (team: Omit<Team, 'id' | 'createdAt'>) => Team;
  updateTeam: (teamId: string, updates: Partial<Team>) => void;
  deleteTeam: (teamId: string) => void;
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'history'>) => Project;
  updateProject: (projectId: string, updates: Partial<Project>) => void;
  deleteProject: (projectId: string) => void;
  // Yangi funksiyalar
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
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [teams, setTeams] = useState<Team[]>(INITIAL_TEAMS);
  const [projects, setProjects] = useState<Project[]>(
    INITIAL_PROJECTS.map(p => ({ ...p, history: p.history || [] }))
  );

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

  // Loyihani ko'rib chiqishga yuborish
  const submitProject = (projectId: string) => {
    changeProjectStatus(
      projectId,
      'submitted',
      'Ko\'rib chiqishga yuborildi',
      'Loyiha ko\'rib chiqish uchun yuborildi',
      'Viloyat yetakchisi'
    );
  };

  // Direktorga taqdimot qilish
  const presentProject = (projectId: string) => {
    changeProjectStatus(
      projectId,
      'presented',
      'Taqdimot qilindi',
      'Loyiha Direktor Alisher Sadullayevga taqdimot qilindi',
      'Admin'
    );
  };

  // Maqullash
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
          partnerType: data.partnerType as any,
          allocatedBudget: data.budget,
          budgetCurrency: 'UZS',
          history: [...(project.history || []), historyItem],
          updatedAt: new Date(),
        };
      }
      return project;
    }));
  };

  // Rad etish
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

  // Qayta ishlash so'rovi
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

  // Ishni boshlash
  const startProject = (projectId: string) => {
    changeProjectStatus(
      projectId,
      'in_progress',
      'Ish boshlandi',
      'Loyiha amalga oshirila boshlandi',
      'Admin'
    );
  };

  // Yakunlash
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
