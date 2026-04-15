import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { REGIONS } from '../../data/regions';
import { Team, TeamMember, PROJECT_CATEGORIES, ProjectAttachment } from '../../types';
import FileUpload from '../../components/FileUpload/FileUpload';
import {
  Search,
  Eye,
  X,
  Users,
  MapPin,
  Phone,
  FolderKanban,
  Plus,
  Trash2,
  Edit3,
  Save,
  UserPlus,
  Paperclip,
} from 'lucide-react';

const UserTeams: React.FC = () => {
  const { user } = useAuth();
  const { getTeamsByRegion, getProjectByTeamId, addTeam, deleteTeam, addProject, updateProject } = useData();
  const regionId = user?.regionId || '';
  const region = REGIONS.find(r => r.id === regionId);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isAddingTeam, setIsAddingTeam] = useState(false);
  const [isEditingProject, setIsEditingProject] = useState(false);

  // New team form state
  const [newTeamName, setNewTeamName] = useState('');
  const [newMembers, setNewMembers] = useState<Omit<TeamMember, 'id'>[]>([
    { fullName: '', phone: '', mahallaId: '', mahallaName: '', districtId: '', districtName: '' }
  ]);

  // Project form state
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectCategory, setProjectCategory] = useState<string>(PROJECT_CATEGORIES[0]);
  const [projectAttachments, setProjectAttachments] = useState<ProjectAttachment[]>([]);

  const regionTeams = getTeamsByRegion(regionId);

  const filteredTeams = regionTeams.filter((team) => {
    return team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           team.members.some(m => m.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                  m.mahallaName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                  m.districtName.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  const resetNewTeamForm = () => {
    setNewTeamName('');
    setNewMembers([{ fullName: '', phone: '', mahallaId: '', mahallaName: '', districtId: '', districtName: '' }]);
    setIsAddingTeam(false);
  };

  const addMemberField = () => {
    if (newMembers.length < 7) {
      setNewMembers([...newMembers, { fullName: '', phone: '', mahallaId: '', mahallaName: '', districtId: '', districtName: '' }]);
    }
  };

  const removeMemberField = (index: number) => {
    if (newMembers.length > 1) {
      setNewMembers(newMembers.filter((_, i) => i !== index));
    }
  };

  const updateMemberField = (index: number, field: keyof Omit<TeamMember, 'id'>, value: string) => {
    const updated = [...newMembers];
    updated[index] = { ...updated[index], [field]: value };

    // Avtomatik tuman nomini to'ldirish
    if (field === 'districtId') {
      const district = region?.districts.find(d => d.id === value);
      if (district) {
        updated[index].districtName = district.name;
      }
    }

    setNewMembers(updated);
  };

  const handleAddTeam = () => {
    if (!newTeamName.trim()) {
      alert('Jamoa nomini kiriting');
      return;
    }

    const validMembers = newMembers.filter(m => m.fullName.trim() && m.districtId);
    if (validMembers.length === 0) {
      alert('Kamida bitta a\'zo qo\'shing');
      return;
    }

    const membersWithIds: TeamMember[] = validMembers.map((m, idx) => ({
      ...m,
      id: `member-${Date.now()}-${idx}`,
      mahallaId: m.mahallaId || `mahalla-${Date.now()}-${idx}`,
    }));

    addTeam({
      name: newTeamName,
      regionId,
      hackathonId: `hackathon-${regionId}`,
      members: membersWithIds,
    });

    resetNewTeamForm();
  };

  const handleDeleteTeam = (teamId: string) => {
    if (confirm('Jamoani o\'chirishni xohlaysizmi?')) {
      deleteTeam(teamId);
      setSelectedTeam(null);
    }
  };

  const openProjectEditor = (team: Team) => {
    const existingProject = getProjectByTeamId(team.id);
    if (existingProject) {
      setProjectTitle(existingProject.title);
      setProjectDescription(existingProject.description);
      setProjectCategory(existingProject.category);
      setProjectAttachments(existingProject.attachments || []);
    } else {
      setProjectTitle('');
      setProjectDescription('');
      setProjectCategory(PROJECT_CATEGORIES[0]);
      setProjectAttachments([]);
    }
    setSelectedTeam(team);
    setIsEditingProject(true);
  };

  const handleSaveProject = () => {
    if (!selectedTeam) return;
    if (!projectTitle.trim()) {
      alert('Loyiha nomini kiriting');
      return;
    }

    const existingProject = getProjectByTeamId(selectedTeam.id);

    if (existingProject) {
      updateProject(existingProject.id, {
        title: projectTitle,
        description: projectDescription,
        category: projectCategory,
        attachments: projectAttachments,
      });
    } else {
      addProject({
        title: projectTitle,
        description: projectDescription,
        category: projectCategory,
        teamId: selectedTeam.id,
        regionId,
        hackathonId: `hackathon-${regionId}`,
        status: 'draft',
        isApprovedByDirector: false,
        attachments: projectAttachments,
      });
    }

    setIsEditingProject(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jamoalar</h1>
          <p className="text-gray-600 mt-1">{region?.name} jamoalari</p>
        </div>
        <button
          onClick={() => setIsAddingTeam(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Yangi jamoa
        </button>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Jamoa, a'zo yoki mahalla qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeams.map((team) => {
          const project = getProjectByTeamId(team.id);
          return (
            <div key={team.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{team.name}</h3>
                    <p className="text-sm text-gray-500">{team.members.length} a'zo</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteTeam(team.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Members Preview */}
              <div className="flex -space-x-2 mb-4">
                {team.members.slice(0, 5).map((member) => (
                  <div
                    key={member.id}
                    className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full border-2 border-white flex items-center justify-center text-xs text-white font-medium"
                    title={member.fullName}
                  >
                    {member.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                ))}
                {team.members.length > 5 && (
                  <div className="w-8 h-8 bg-gray-300 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium">
                    +{team.members.length - 5}
                  </div>
                )}
              </div>

              {/* Project Section */}
              {project ? (
                <div className="bg-emerald-50 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-emerald-600 flex items-center gap-1 mb-1">
                        <FolderKanban className="w-3 h-3" /> Loyiha
                      </p>
                      <p className="text-sm font-medium text-emerald-800 line-clamp-1">
                        {project.title}
                      </p>
                    </div>
                    <button
                      onClick={() => openProjectEditor(team)}
                      className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                  {project.isApprovedByDirector && (
                    <span className="inline-block mt-2 text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded">
                      Maqullangan
                    </span>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => openProjectEditor(team)}
                  className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-emerald-400 hover:text-emerald-600 transition-colors mb-4 flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Loyiha qo'shish
                </button>
              )}

              <button
                onClick={() => { setSelectedTeam(team); setIsEditingProject(false); }}
                className="w-full py-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <Eye className="w-4 h-4" /> A'zolarni ko'rish
              </button>
            </div>
          );
        })}
      </div>

      {filteredTeams.length === 0 && !isAddingTeam && (
        <div className="text-center py-12 text-gray-500 card">
          <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Hali jamoalar yo'q</p>
          <button
            onClick={() => setIsAddingTeam(true)}
            className="mt-4 text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Birinchi jamoani qo'shing
          </button>
        </div>
      )}

      {/* Add Team Modal */}
      {isAddingTeam && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fadeIn">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-900">Yangi jamoa qo'shish</h2>
              <button
                onClick={resetNewTeamForm}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Team Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jamoa nomi *
                </label>
                <input
                  type="text"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="Masalan: Innovatorlar"
                  className="input-field"
                />
              </div>

              {/* Team Members */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-medium text-gray-700">
                    Jamoa a'zolari (Mahalla yoshlar yetakchilari) *
                  </label>
                  <button
                    onClick={addMemberField}
                    disabled={newMembers.length >= 7}
                    className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1 disabled:opacity-50"
                  >
                    <UserPlus className="w-4 h-4" /> A'zo qo'shish
                  </button>
                </div>

                <div className="space-y-4">
                  {newMembers.map((member, index) => (
                    <div key={index} className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-600">A'zo {index + 1}</span>
                        {newMembers.length > 1 && (
                          <button
                            onClick={() => removeMemberField(index)}
                            className="text-red-500 hover:text-red-600 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Ism Familiya *"
                          value={member.fullName}
                          onChange={(e) => updateMemberField(index, 'fullName', e.target.value)}
                          className="input-field"
                        />
                        <input
                          type="tel"
                          placeholder="Telefon raqami"
                          value={member.phone}
                          onChange={(e) => updateMemberField(index, 'phone', e.target.value)}
                          className="input-field"
                        />
                        <select
                          value={member.districtId}
                          onChange={(e) => updateMemberField(index, 'districtId', e.target.value)}
                          className="input-field"
                        >
                          <option value="">Tuman/shahar tanlang *</option>
                          {region?.districts.map(d => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          placeholder="Mahalla nomi"
                          value={member.mahallaName}
                          onChange={(e) => updateMemberField(index, 'mahallaName', e.target.value)}
                          className="input-field"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={resetNewTeamForm}
                  className="flex-1 btn-secondary"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={handleAddTeam}
                  className="flex-1 btn-success flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" /> Saqlash
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Team / Edit Project Modal */}
      {selectedTeam && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fadeIn">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-900">
                {isEditingProject ? 'Loyiha ma\'lumotlari' : 'Jamoa tafsilotlari'}
              </h2>
              <button
                onClick={() => { setSelectedTeam(null); setIsEditingProject(false); }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {isEditingProject ? (
                /* Project Form */
                <>
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{selectedTeam.name}</p>
                      <p className="text-sm text-gray-500">{selectedTeam.members.length} a'zo</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Loyiha nomi *
                    </label>
                    <input
                      type="text"
                      value={projectTitle}
                      onChange={(e) => setProjectTitle(e.target.value)}
                      placeholder="Loyiha nomini kiriting"
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kategoriya
                    </label>
                    <select
                      value={projectCategory}
                      onChange={(e) => setProjectCategory(e.target.value)}
                      className="input-field"
                    >
                      {PROJECT_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tavsifi
                    </label>
                    <textarea
                      value={projectDescription}
                      onChange={(e) => setProjectDescription(e.target.value)}
                      placeholder="Loyiha haqida qisqacha ma'lumot..."
                      rows={4}
                      className="input-field resize-none"
                    />
                  </div>

                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Paperclip className="w-4 h-4" />
                      Fayllar (prezentatsiya, hujjatlar)
                    </label>
                    <FileUpload
                      projectId={selectedTeam?.id || 'new-project'}
                      attachments={projectAttachments}
                      onUploadComplete={(attachment) => {
                        setProjectAttachments(prev => [...prev, attachment]);
                      }}
                      onDelete={(attachmentId) => {
                        setProjectAttachments(prev => prev.filter(a => a.id !== attachmentId));
                      }}
                    />
                  </div>

                  <div className="flex gap-3 pt-4 border-t">
                    <button
                      onClick={() => setIsEditingProject(false)}
                      className="flex-1 btn-secondary"
                    >
                      Bekor qilish
                    </button>
                    <button
                      onClick={handleSaveProject}
                      className="flex-1 btn-success flex items-center justify-center gap-2"
                    >
                      <Save className="w-5 h-5" /> Saqlash
                    </button>
                  </div>
                </>
              ) : (
                /* Team Details */
                <>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Users className="w-8 h-8 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{selectedTeam.name}</h3>
                      <p className="text-gray-500 flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {region?.name}
                      </p>
                    </div>
                  </div>

                  {/* Project Info */}
                  {(() => {
                    const project = getProjectByTeamId(selectedTeam.id);
                    if (project) {
                      return (
                        <div className="bg-emerald-50 rounded-xl p-4">
                          <p className="text-sm text-emerald-600 flex items-center gap-2 mb-2">
                            <FolderKanban className="w-4 h-4" /> Loyiha
                          </p>
                          <p className="font-medium text-emerald-900">{project.title}</p>
                          <p className="text-sm text-emerald-700 mt-1">{project.category}</p>
                          {project.description && (
                            <p className="text-sm text-emerald-600 mt-2">{project.description}</p>
                          )}
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {/* Members */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">
                      Jamoa a'zolari - Mahalla yoshlar yetakchilari
                    </h4>
                    <div className="space-y-3">
                      {selectedTeam.members.map((member, idx) => (
                        <div key={member.id} className="bg-gray-50 rounded-xl p-4">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0">
                              {idx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900">{member.fullName}</p>
                              {member.mahallaName && (
                                <p className="text-sm text-emerald-600 mt-1">{member.mahallaName}</p>
                              )}
                              <p className="text-xs text-gray-500">{member.districtName}</p>
                              {member.phone && (
                                <p className="text-sm text-gray-600 flex items-center gap-1 mt-2">
                                  <Phone className="w-4 h-4" />
                                  {member.phone}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t">
                    <button
                      onClick={() => openProjectEditor(selectedTeam)}
                      className="flex-1 btn-primary flex items-center justify-center gap-2"
                    >
                      <FolderKanban className="w-5 h-5" />
                      {getProjectByTeamId(selectedTeam.id) ? 'Loyihani tahrirlash' : 'Loyiha qo\'shish'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserTeams;
