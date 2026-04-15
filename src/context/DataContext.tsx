import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Team, Project, ProjectStatus, ProjectHistoryItem, ProjectAttachment, TeamMember } from '../types';
import { supabase } from '../config/supabase';

interface DataContextType {
  teams: Team[];
  projects: Project[];
  isLoading: boolean;
  addTeam: (team: Omit<Team, 'id' | 'createdAt'>) => Promise<Team>;
  updateTeam: (teamId: string, updates: Partial<Team>) => Promise<void>;
  deleteTeam: (teamId: string) => Promise<void>;
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'history'>) => Promise<Project>;
  updateProject: (projectId: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  changeProjectStatus: (projectId: string, status: ProjectStatus, action: string, description: string, actor: string) => Promise<void>;
  submitProject: (projectId: string) => Promise<void>;
  presentProject: (projectId: string) => Promise<void>;
  approveProject: (projectId: string, data: { notes: string; partner?: string; partnerType?: string; budget?: number }) => Promise<void>;
  rejectProject: (projectId: string, reason: string) => Promise<void>;
  requestRevision: (projectId: string, notes: string) => Promise<void>;
  startProject: (projectId: string) => Promise<void>;
  completeProject: (projectId: string) => Promise<void>;
  getTeamsByRegion: (regionId: string) => Team[];
  getProjectsByRegion: (regionId: string) => Project[];
  getProjectByTeamId: (teamId: string) => Project | undefined;
  addAttachment: (projectId: string, attachment: ProjectAttachment) => Promise<void>;
  removeAttachment: (projectId: string, attachmentId: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Supabase'dan Team formatiga o'tkazish
const mapTeamFromDB = (row: any): Team => ({
  id: row.id,
  name: row.name,
  regionId: row.region_id,
  hackathonId: row.hackathon_id,
  projectId: row.project_id,
  members: row.members || [],
  createdAt: new Date(row.created_at),
});

// Supabase'dan Project formatiga o'tkazish
const mapProjectFromDB = (row: any): Project => ({
  id: row.id,
  title: row.title,
  description: row.description,
  category: row.category,
  teamId: row.team_id,
  regionId: row.region_id,
  status: row.status,
  attachments: row.attachments || [],
  history: (row.history || []).map((h: any) => ({
    ...h,
    date: new Date(h.date),
  })),
  isApprovedByDirector: row.is_approved_by_director,
  approvalDate: row.approval_date ? new Date(row.approval_date) : undefined,
  approvalNotes: row.approval_notes,
  rejectionReason: row.rejection_reason,
  rejectionDate: row.rejection_date ? new Date(row.rejection_date) : undefined,
  revisionNotes: row.revision_notes,
  assignedPartner: row.assigned_partner,
  partnerType: row.partner_type,
  allocatedBudget: row.allocated_budget,
  budgetCurrency: row.budget_currency,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
});

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Ma'lumotlarni yuklash
  const loadData = async () => {
    setIsLoading(true);
    try {
      // Teams yuklash
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .order('created_at', { ascending: false });

      if (teamsError) {
        console.error('Error loading teams:', teamsError);
      } else {
        setTeams((teamsData || []).map(mapTeamFromDB));
      }

      // Projects yuklash
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (projectsError) {
        console.error('Error loading projects:', projectsError);
      } else {
        setProjects((projectsData || []).map(mapProjectFromDB));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Birinchi yuklash va realtime obuna
  useEffect(() => {
    loadData();

    // Realtime o'zgarishlarni kuzatish
    const teamsChannel = supabase
      .channel('teams-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'teams' }, () => {
        loadData();
      })
      .subscribe();

    const projectsChannel = supabase
      .channel('projects-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => {
        loadData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(teamsChannel);
      supabase.removeChannel(projectsChannel);
    };
  }, []);

  const addTeam = async (teamData: Omit<Team, 'id' | 'createdAt'>): Promise<Team> => {
    const newTeam = {
      id: generateId(),
      name: teamData.name,
      region_id: teamData.regionId,
      hackathon_id: teamData.hackathonId,
      project_id: teamData.projectId,
      members: teamData.members,
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('teams').insert(newTeam);

    if (error) {
      console.error('Error adding team:', error);
      throw error;
    }

    const team = mapTeamFromDB(newTeam);
    setTeams(prev => [team, ...prev]);
    return team;
  };

  const updateTeam = async (teamId: string, updates: Partial<Team>) => {
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.regionId !== undefined) dbUpdates.region_id = updates.regionId;
    if (updates.hackathonId !== undefined) dbUpdates.hackathon_id = updates.hackathonId;
    if (updates.projectId !== undefined) dbUpdates.project_id = updates.projectId;
    if (updates.members !== undefined) dbUpdates.members = updates.members;

    const { error } = await supabase
      .from('teams')
      .update(dbUpdates)
      .eq('id', teamId);

    if (error) {
      console.error('Error updating team:', error);
      throw error;
    }

    setTeams(prev => prev.map(team =>
      team.id === teamId ? { ...team, ...updates } : team
    ));
  };

  const deleteTeam = async (teamId: string) => {
    const { error } = await supabase.from('teams').delete().eq('id', teamId);

    if (error) {
      console.error('Error deleting team:', error);
      throw error;
    }

    setTeams(prev => prev.filter(team => team.id !== teamId));

    // Loyihalardan team_id ni olib tashlash
    const { error: projectError } = await supabase
      .from('projects')
      .update({ team_id: null })
      .eq('team_id', teamId);

    if (projectError) {
      console.error('Error updating projects:', projectError);
    }

    setProjects(prev => prev.map(project =>
      project.teamId === teamId ? { ...project, teamId: '' } : project
    ));
  };

  const addProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'history'>): Promise<Project> => {
    const now = new Date();
    const historyItem: ProjectHistoryItem = {
      id: generateId(),
      date: now,
      status: projectData.status || 'draft',
      action: 'Loyiha yaratildi',
      description: 'Yangi loyiha tizimga kiritildi',
      actor: 'Viloyat yetakchisi',
    };

    const newProject = {
      id: generateId(),
      title: projectData.title,
      description: projectData.description,
      category: projectData.category,
      team_id: projectData.teamId,
      region_id: projectData.regionId,
      status: projectData.status || 'draft',
      attachments: projectData.attachments || [],
      history: [historyItem],
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    };

    const { error } = await supabase.from('projects').insert(newProject);

    if (error) {
      console.error('Error adding project:', error);
      throw error;
    }

    const project = mapProjectFromDB(newProject);
    setProjects(prev => [project, ...prev]);

    if (projectData.teamId) {
      await updateTeam(projectData.teamId, { projectId: project.id });
    }

    return project;
  };

  const updateProject = async (projectId: string, updates: Partial<Project>) => {
    const dbUpdates: any = { updated_at: new Date().toISOString() };
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.teamId !== undefined) dbUpdates.team_id = updates.teamId;
    if (updates.regionId !== undefined) dbUpdates.region_id = updates.regionId;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.attachments !== undefined) dbUpdates.attachments = updates.attachments;
    if (updates.history !== undefined) dbUpdates.history = updates.history;

    const { error } = await supabase
      .from('projects')
      .update(dbUpdates)
      .eq('id', projectId);

    if (error) {
      console.error('Error updating project:', error);
      throw error;
    }

    setProjects(prev => prev.map(project =>
      project.id === projectId ? { ...project, ...updates, updatedAt: new Date() } : project
    ));
  };

  const deleteProject = async (projectId: string) => {
    const project = projects.find(p => p.id === projectId);

    const { error } = await supabase.from('projects').delete().eq('id', projectId);

    if (error) {
      console.error('Error deleting project:', error);
      throw error;
    }

    if (project?.teamId) {
      await updateTeam(project.teamId, { projectId: undefined });
    }

    setProjects(prev => prev.filter(p => p.id !== projectId));
  };

  const changeProjectStatus = async (
    projectId: string,
    status: ProjectStatus,
    action: string,
    description: string,
    actor: string
  ) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const historyItem: ProjectHistoryItem = {
      id: generateId(),
      date: new Date(),
      status,
      action,
      description,
      actor,
    };

    const newHistory = [...(project.history || []), historyItem];

    const { error } = await supabase
      .from('projects')
      .update({
        status,
        history: newHistory,
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId);

    if (error) {
      console.error('Error changing project status:', error);
      throw error;
    }

    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          status,
          history: newHistory,
          updatedAt: new Date(),
        };
      }
      return p;
    }));
  };

  const submitProject = (projectId: string) => {
    return changeProjectStatus(
      projectId,
      'submitted',
      'Ko\'rib chiqishga yuborildi',
      'Loyiha ko\'rib chiqish uchun yuborildi',
      'Viloyat yetakchisi'
    );
  };

  const presentProject = (projectId: string) => {
    return changeProjectStatus(
      projectId,
      'presented',
      'Taqdimot qilindi',
      'Loyiha Direktor Alisher Sadullayevga taqdimot qilindi',
      'Admin'
    );
  };

  const approveProject = async (projectId: string, data: { notes: string; partner?: string; partnerType?: string; budget?: number }) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const historyItem: ProjectHistoryItem = {
      id: generateId(),
      date: new Date(),
      status: 'approved',
      action: 'Maqullandi',
      description: data.notes || 'Direktor Alisher Sadullayev tomonidan maqullandi',
      actor: 'Direktor Alisher Sadullayev',
    };

    const newHistory = [...(project.history || []), historyItem];

    const { error } = await supabase
      .from('projects')
      .update({
        status: 'approved',
        is_approved_by_director: true,
        approval_date: new Date().toISOString(),
        approval_notes: data.notes,
        assigned_partner: data.partner,
        partner_type: data.partnerType,
        allocated_budget: data.budget,
        budget_currency: 'UZS',
        history: newHistory,
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId);

    if (error) {
      console.error('Error approving project:', error);
      throw error;
    }

    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          status: 'approved',
          isApprovedByDirector: true,
          approvalDate: new Date(),
          approvalNotes: data.notes,
          assignedPartner: data.partner,
          partnerType: data.partnerType as Project['partnerType'],
          allocatedBudget: data.budget,
          budgetCurrency: 'UZS',
          history: newHistory,
          updatedAt: new Date(),
        };
      }
      return p;
    }));
  };

  const rejectProject = async (projectId: string, reason: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const historyItem: ProjectHistoryItem = {
      id: generateId(),
      date: new Date(),
      status: 'rejected',
      action: 'Rad etildi',
      description: reason,
      actor: 'Direktor Alisher Sadullayev',
    };

    const newHistory = [...(project.history || []), historyItem];

    const { error } = await supabase
      .from('projects')
      .update({
        status: 'rejected',
        is_approved_by_director: false,
        rejection_reason: reason,
        rejection_date: new Date().toISOString(),
        history: newHistory,
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId);

    if (error) {
      console.error('Error rejecting project:', error);
      throw error;
    }

    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          status: 'rejected',
          isApprovedByDirector: false,
          rejectionReason: reason,
          rejectionDate: new Date(),
          history: newHistory,
          updatedAt: new Date(),
        };
      }
      return p;
    }));
  };

  const requestRevision = async (projectId: string, notes: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const historyItem: ProjectHistoryItem = {
      id: generateId(),
      date: new Date(),
      status: 'revision',
      action: 'Qayta ishlash kerak',
      description: notes,
      actor: 'Direktor Alisher Sadullayev',
    };

    const newHistory = [...(project.history || []), historyItem];

    const { error } = await supabase
      .from('projects')
      .update({
        status: 'revision',
        revision_notes: notes,
        history: newHistory,
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId);

    if (error) {
      console.error('Error requesting revision:', error);
      throw error;
    }

    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          status: 'revision',
          revisionNotes: notes,
          history: newHistory,
          updatedAt: new Date(),
        };
      }
      return p;
    }));
  };

  const startProject = (projectId: string) => {
    return changeProjectStatus(
      projectId,
      'in_progress',
      'Ish boshlandi',
      'Loyiha amalga oshirila boshlandi',
      'Admin'
    );
  };

  const completeProject = (projectId: string) => {
    return changeProjectStatus(
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

  const addAttachment = async (projectId: string, attachment: ProjectAttachment) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const newAttachments = [...(project.attachments || []), attachment];

    const { error } = await supabase
      .from('projects')
      .update({
        attachments: newAttachments,
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId);

    if (error) {
      console.error('Error adding attachment:', error);
      throw error;
    }

    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          attachments: newAttachments,
          updatedAt: new Date(),
        };
      }
      return p;
    }));
  };

  const removeAttachment = async (projectId: string, attachmentId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const newAttachments = (project.attachments || []).filter(a => a.id !== attachmentId);

    const { error } = await supabase
      .from('projects')
      .update({
        attachments: newAttachments,
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId);

    if (error) {
      console.error('Error removing attachment:', error);
      throw error;
    }

    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          attachments: newAttachments,
          updatedAt: new Date(),
        };
      }
      return p;
    }));
  };

  const refreshData = () => loadData();

  return (
    <DataContext.Provider value={{
      teams,
      projects,
      isLoading,
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
      refreshData,
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
