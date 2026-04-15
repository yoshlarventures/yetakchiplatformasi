import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { REGIONS } from '../../data/regions';
import { Project, PROJECT_CATEGORIES, PARTNER_TYPES } from '../../types';
import FileUpload from '../../components/FileUpload/FileUpload';
import {
  Search,
  X,
  CheckCircle,
  Edit3,
  Send,
  XCircle,
  AlertCircle,
  Play,
  Trophy,
  Presentation,
  ChevronRight,
  Paperclip,
  Rocket,
} from 'lucide-react';

const UserProjects: React.FC = () => {
  const { user } = useAuth();
  const {
    getProjectsByRegion,
    getTeamsByRegion,
    updateProject,
    submitProject,
    presentProject,
    approveProject,
    rejectProject,
    requestRevision,
    startProject,
    completeProject,
    addAttachment,
    removeAttachment,
  } = useData();
  const regionId = user?.regionId || '';
  const region = REGIONS.find(r => r.id === regionId);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'files' | 'action' | 'history'>('details');

  // Form states
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [assignedPartner, setAssignedPartner] = useState('');
  const [partnerType, setPartnerType] = useState('');
  const [allocatedBudget, setAllocatedBudget] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [revisionNotes, setRevisionNotes] = useState('');

  const regionProjects = getProjectsByRegion(regionId);
  const regionTeams = getTeamsByRegion(regionId);

  const filteredProjects = regionProjects.filter((project) => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Status guruhlari
  const pendingProjects = regionProjects.filter(p => ['submitted', 'presented'].includes(p.status));
  const approvedProjects = regionProjects.filter(p => p.isApprovedByDirector);
  const activeProjects = regionProjects.filter(p => p.status === 'in_progress');

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { bg: string; text: string; label: string; icon: any }> = {
      preparation: { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'Tayyorgarlik', icon: Rocket },
      draft: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Qoralama', icon: Edit3 },
      submitted: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Yuborilgan', icon: Send },
      presented: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Taqdimot qilindi', icon: Presentation },
      approved: { bg: 'bg-green-100', text: 'text-green-700', label: 'Maqullangan', icon: CheckCircle },
      rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rad etilgan', icon: XCircle },
      revision: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Qayta ishlash', icon: AlertCircle },
      in_progress: { bg: 'bg-cyan-100', text: 'text-cyan-700', label: 'Jarayonda', icon: Play },
      completed: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Yakunlangan', icon: Trophy },
    };
    return configs[status] || configs.draft;
  };

  const openProject = (project: Project) => {
    setSelectedProject(project);
    setActiveTab('details');
    // Reset forms
    setEditTitle(project.title);
    setEditDescription(project.description);
    setEditCategory(project.category);
    setApprovalNotes('');
    setAssignedPartner('');
    setPartnerType('');
    setAllocatedBudget('');
    setRejectionReason('');
    setRevisionNotes('');
  };

  const handleSave = () => {
    if (!selectedProject) return;
    updateProject(selectedProject.id, {
      title: editTitle,
      description: editDescription,
      category: editCategory,
    });
    setSelectedProject({ ...selectedProject, title: editTitle, description: editDescription, category: editCategory });
  };

  const handleSubmit = () => {
    if (!selectedProject) return;
    submitProject(selectedProject.id);
    setSelectedProject(null);
  };

  const handlePresent = () => {
    if (!selectedProject) return;
    presentProject(selectedProject.id);
    setSelectedProject(null);
  };

  const handleApprove = () => {
    if (!selectedProject) return;
    approveProject(selectedProject.id, {
      notes: approvalNotes || 'Direktor Alisher Sadullayev tomonidan maqullandi.',
      partner: assignedPartner,
      partnerType,
      budget: allocatedBudget ? parseFloat(allocatedBudget) * 1000000 : undefined,
    });
    setSelectedProject(null);
  };

  const handleReject = () => {
    if (!selectedProject || !rejectionReason.trim()) return alert('Sabab kiriting');
    rejectProject(selectedProject.id, rejectionReason);
    setSelectedProject(null);
  };

  const handleRevision = () => {
    if (!selectedProject || !revisionNotes.trim()) return alert('Izoh kiriting');
    requestRevision(selectedProject.id, revisionNotes);
    setSelectedProject(null);
  };

  const handleStart = () => {
    if (!selectedProject) return;
    startProject(selectedProject.id);
    setSelectedProject(null);
  };

  const handleComplete = () => {
    if (!selectedProject) return;
    completeProject(selectedProject.id);
    setSelectedProject(null);
  };

  const getTeamName = (teamId: string) => regionTeams.find(t => t.id === teamId)?.name || '-';

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Loyihalar boshqaruvi</h1>
        <p className="text-gray-500 mt-1">{region?.name}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-3xl font-bold text-gray-900">{regionProjects.length}</p>
          <p className="text-sm text-gray-500">Jami loyihalar</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
          <p className="text-3xl font-bold text-amber-600">{pendingProjects.length}</p>
          <p className="text-sm text-amber-600">Kutilmoqda</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
          <p className="text-3xl font-bold text-green-600">{approvedProjects.length}</p>
          <p className="text-sm text-green-600">Maqullangan</p>
        </div>
        <div className="bg-cyan-50 rounded-xl p-4 border border-cyan-200">
          <p className="text-3xl font-bold text-cyan-600">{activeProjects.length}</p>
          <p className="text-sm text-cyan-600">Jarayonda</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none min-w-[180px]"
        >
          <option value="all">Barcha statuslar</option>
          <option value="preparation">Tayyorgarlik</option>
          <option value="draft">Qoralama</option>
          <option value="submitted">Yuborilgan</option>
          <option value="presented">Taqdimot qilindi</option>
          <option value="approved">Maqullangan</option>
          <option value="rejected">Rad etilgan</option>
          <option value="revision">Qayta ishlash</option>
          <option value="in_progress">Jarayonda</option>
          <option value="completed">Yakunlangan</option>
        </select>
      </div>

      {/* Projects List */}
      <div className="space-y-3">
        {filteredProjects.map((project) => {
          const status = getStatusConfig(project.status);
          return (
            <div
              key={project.id}
              onClick={() => openProject(project)}
              className="bg-white rounded-xl p-5 border border-gray-200 hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                      {status.label}
                    </span>
                    <span className="text-sm text-gray-400">{project.category}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-lg">{project.title}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-gray-500 text-sm">{getTeamName(project.teamId)}</p>
                    {(project.attachments?.length || 0) > 0 && (
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Paperclip className="w-3 h-3" />
                        {project.attachments?.length} fayl
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {project.isApprovedByDirector && project.allocatedBudget && (
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">
                        {(project.allocatedBudget / 1000000).toFixed(0)} mln
                      </p>
                      <p className="text-xs text-gray-400">ajratilgan</p>
                    </div>
                  )}
                  {project.status === 'revision' && (
                    <div className="bg-orange-100 text-orange-700 px-3 py-1 rounded-lg text-sm font-medium">
                      Tuzatish kerak
                    </div>
                  )}
                  {project.status === 'rejected' && (
                    <div className="bg-red-100 text-red-700 px-3 py-1 rounded-lg text-sm font-medium">
                      Rad etildi
                    </div>
                  )}
                  {project.status === 'presented' && (
                    <div className="bg-purple-100 text-purple-700 px-3 py-1 rounded-lg text-sm font-medium">
                      Javob kutilmoqda
                    </div>
                  )}
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>
          );
        })}

        {filteredProjects.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p>Loyihalar topilmadi</p>
          </div>
        )}
      </div>

      {/* Project Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-5 border-b flex items-center justify-between bg-gray-50">
              <div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusConfig(selectedProject.status).bg} ${getStatusConfig(selectedProject.status).text}`}>
                  {getStatusConfig(selectedProject.status).label}
                </span>
              </div>
              <button onClick={() => setSelectedProject(null)} className="p-2 hover:bg-gray-200 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b">
              {['details', 'files', 'action', 'history'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-1 ${
                    activeTab === tab
                      ? 'text-emerald-600 border-b-2 border-emerald-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab === 'files' && <Paperclip className="w-4 h-4" />}
                  {tab === 'details' ? 'Ma\'lumotlar' : tab === 'files' ? 'Fayllar' : tab === 'action' ? 'Amallar' : 'Tarix'}
                  {tab === 'files' && (selectedProject.attachments?.length || 0) > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                      {selectedProject.attachments?.length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5">
              {activeTab === 'details' && (
                <div className="space-y-5">
                  {['preparation', 'draft', 'revision'].includes(selectedProject.status) ? (
                    <>
                      <div>
                        <label className="text-sm text-gray-500 mb-1 block">Loyiha nomi</label>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-500 mb-1 block">Kategoriya</label>
                        <select
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value)}
                          className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                        >
                          {PROJECT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500 mb-1 block">Tavsif</label>
                        <textarea
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          rows={4}
                          className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                        />
                      </div>
                      <button onClick={handleSave} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700">
                        Saqlash
                      </button>
                    </>
                  ) : (
                    <>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">{selectedProject.title}</h2>
                        <p className="text-gray-500 mt-1">{selectedProject.category} • {getTeamName(selectedProject.teamId)}</p>
                      </div>
                      <p className="text-gray-600">{selectedProject.description}</p>

                      {/* Maqullangan */}
                      {selectedProject.isApprovedByDirector && (
                        <div className="bg-green-50 rounded-xl p-5 space-y-3">
                          <div className="flex items-center gap-2 text-green-700 font-semibold">
                            <CheckCircle className="w-5 h-5" />
                            Direktor tomonidan maqullangan
                          </div>
                          {selectedProject.approvalNotes && (
                            <p className="text-green-700 text-sm">{selectedProject.approvalNotes}</p>
                          )}
                          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-green-200">
                            {selectedProject.assignedPartner && (
                              <div>
                                <p className="text-xs text-green-600">Kim bilan ishlash</p>
                                <p className="font-semibold text-green-800">{selectedProject.assignedPartner}</p>
                              </div>
                            )}
                            {selectedProject.allocatedBudget && (
                              <div>
                                <p className="text-xs text-green-600">Ajratilgan mablag'</p>
                                <p className="font-semibold text-green-800">{(selectedProject.allocatedBudget / 1000000).toFixed(0)} mln so'm</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Rad etilgan */}
                      {selectedProject.status === 'rejected' && (
                        <div className="bg-red-50 rounded-xl p-5">
                          <div className="flex items-center gap-2 text-red-700 font-semibold mb-2">
                            <XCircle className="w-5 h-5" />
                            Rad etildi
                          </div>
                          <p className="text-red-600">{selectedProject.rejectionReason}</p>
                        </div>
                      )}

                      {/* Qayta ishlash */}
                      {selectedProject.status === 'revision' && (
                        <div className="bg-orange-50 rounded-xl p-5">
                          <div className="flex items-center gap-2 text-orange-700 font-semibold mb-2">
                            <AlertCircle className="w-5 h-5" />
                            Qayta ishlash kerak
                          </div>
                          <p className="text-orange-600">{selectedProject.revisionNotes}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {activeTab === 'files' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">Loyiha fayllari</h3>
                      <p className="text-sm text-gray-500">Prezentatsiya, hujjatlar va boshqa materiallar</p>
                    </div>
                  </div>
                  <FileUpload
                    projectId={selectedProject.id}
                    attachments={selectedProject.attachments || []}
                    onUploadComplete={(attachment) => {
                      addAttachment(selectedProject.id, attachment);
                      setSelectedProject({
                        ...selectedProject,
                        attachments: [...(selectedProject.attachments || []), attachment],
                      });
                    }}
                    onDelete={(attachmentId) => {
                      removeAttachment(selectedProject.id, attachmentId);
                      setSelectedProject({
                        ...selectedProject,
                        attachments: (selectedProject.attachments || []).filter(a => a.id !== attachmentId),
                      });
                    }}
                    disabled={['completed', 'rejected'].includes(selectedProject.status)}
                  />
                </div>
              )}

              {activeTab === 'action' && (
                <div className="space-y-4">
                  {/* Yuborish */}
                  {['preparation', 'draft'].includes(selectedProject.status) && (
                    <button
                      onClick={handleSubmit}
                      className="w-full py-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 flex items-center justify-center gap-2"
                    >
                      <Send className="w-5 h-5" />
                      Ko'rib chiqishga yuborish
                    </button>
                  )}

                  {/* Taqdimot qilish */}
                  {selectedProject.status === 'submitted' && (
                    <button
                      onClick={handlePresent}
                      className="w-full py-4 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 flex items-center justify-center gap-2"
                    >
                      <Presentation className="w-5 h-5" />
                      Direktorga taqdimot qilish
                    </button>
                  )}

                  {/* Viloyat yetakchisi uchun - taqdimotdan keyin kutish */}
                  {selectedProject.status === 'presented' && user?.role === 'regional_leader' && (
                    <div className="bg-purple-50 rounded-xl p-6 text-center space-y-3">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                        <Presentation className="w-8 h-8 text-purple-600" />
                      </div>
                      <h3 className="font-semibold text-purple-800 text-lg">
                        Taqdimot qilindi
                      </h3>
                      <p className="text-purple-600">
                        Loyiha direktorga taqdimot qilindi. Direktor Alisher Sadullayev javobini kutmoqdasiz.
                      </p>
                      <p className="text-sm text-purple-500">
                        Direktor loyihani maqullaydi, rad etadi yoki qayta ishlashga yuboradi.
                      </p>
                    </div>
                  )}

                  {/* Admin/Direktor uchun - maqullash formasi */}
                  {selectedProject.status === 'presented' && user?.role === 'admin' && (
                    <div className="space-y-4">
                      <div className="bg-green-50 rounded-xl p-5 space-y-4">
                        <h3 className="font-semibold text-green-800 flex items-center gap-2">
                          <CheckCircle className="w-5 h-5" /> Maqullash
                        </h3>
                        <input
                          type="text"
                          placeholder="Hamkor tashkilot (IT Park, Vazirlik...)"
                          value={assignedPartner}
                          onChange={(e) => setAssignedPartner(e.target.value)}
                          className="w-full px-4 py-3 border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none bg-white"
                        />
                        <div className="flex gap-3">
                          <select
                            value={partnerType}
                            onChange={(e) => setPartnerType(e.target.value)}
                            className="flex-1 px-4 py-3 border border-green-200 rounded-xl bg-white"
                          >
                            <option value="">Hamkor turi</option>
                            {Object.entries(PARTNER_TYPES).map(([k, v]) => (
                              <option key={k} value={k}>{v}</option>
                            ))}
                          </select>
                          <input
                            type="number"
                            placeholder="Mablag' (mln)"
                            value={allocatedBudget}
                            onChange={(e) => setAllocatedBudget(e.target.value)}
                            className="w-32 px-4 py-3 border border-green-200 rounded-xl bg-white"
                          />
                        </div>
                        <textarea
                          placeholder="Izoh..."
                          value={approvalNotes}
                          onChange={(e) => setApprovalNotes(e.target.value)}
                          rows={2}
                          className="w-full px-4 py-3 border border-green-200 rounded-xl bg-white resize-none"
                        />
                        <button
                          onClick={handleApprove}
                          className="w-full py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700"
                        >
                          Maqullash
                        </button>
                      </div>

                      <div className="bg-orange-50 rounded-xl p-5 space-y-4">
                        <h3 className="font-semibold text-orange-800 flex items-center gap-2">
                          <AlertCircle className="w-5 h-5" /> Qayta ishlash
                        </h3>
                        <textarea
                          placeholder="Nima tuzatilishi kerak..."
                          value={revisionNotes}
                          onChange={(e) => setRevisionNotes(e.target.value)}
                          rows={2}
                          className="w-full px-4 py-3 border border-orange-200 rounded-xl bg-white resize-none"
                        />
                        <button
                          onClick={handleRevision}
                          className="w-full py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600"
                        >
                          Qayta ishlashga yuborish
                        </button>
                      </div>

                      <div className="bg-red-50 rounded-xl p-5 space-y-4">
                        <h3 className="font-semibold text-red-800 flex items-center gap-2">
                          <XCircle className="w-5 h-5" /> Rad etish
                        </h3>
                        <textarea
                          placeholder="Rad etish sababi..."
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          rows={2}
                          className="w-full px-4 py-3 border border-red-200 rounded-xl bg-white resize-none"
                        />
                        <button
                          onClick={handleReject}
                          className="w-full py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700"
                        >
                          Rad etish
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Yakunlash */}
                  {selectedProject.status === 'in_progress' && (
                    <button
                      onClick={handleComplete}
                      className="w-full py-4 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 flex items-center justify-center gap-2"
                    >
                      <Trophy className="w-5 h-5" />
                      Loyihani yakunlash
                    </button>
                  )}

                  {/* Viloyat yetakchisi uchun - direktor qarorini ko'rsatish */}
                  {selectedProject.status === 'approved' && user?.role === 'regional_leader' && (
                    <div className="space-y-4">
                      <div className="bg-green-50 rounded-xl p-6 space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-bold text-green-800 text-lg">Tabriklaymiz!</h3>
                            <p className="text-green-600">Loyihangiz direktor tomonidan maqullandi</p>
                          </div>
                        </div>

                        {selectedProject.approvalNotes && (
                          <div className="bg-white rounded-lg p-4 border border-green-200">
                            <p className="text-sm text-green-600 mb-1">Direktor izohi:</p>
                            <p className="text-green-800">{selectedProject.approvalNotes}</p>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                          {selectedProject.assignedPartner && (
                            <div className="bg-white rounded-lg p-4 border border-green-200">
                              <p className="text-xs text-green-600 mb-1">Hamkor tashkilot</p>
                              <p className="font-semibold text-green-800">{selectedProject.assignedPartner}</p>
                              {selectedProject.partnerType && (
                                <p className="text-sm text-green-600">{PARTNER_TYPES[selectedProject.partnerType as keyof typeof PARTNER_TYPES]}</p>
                              )}
                            </div>
                          )}
                          {selectedProject.allocatedBudget && (
                            <div className="bg-white rounded-lg p-4 border border-green-200">
                              <p className="text-xs text-green-600 mb-1">Ajratilgan mablag'</p>
                              <p className="font-bold text-green-800 text-xl">
                                {(selectedProject.allocatedBudget / 1000000).toFixed(0)} mln
                              </p>
                              <p className="text-sm text-green-600">so'm</p>
                            </div>
                          )}
                        </div>

                        <p className="text-sm text-green-600 text-center pt-2">
                          Endi "Ishni boshlash" tugmasini bosib loyihani amalga oshirishni boshlashingiz mumkin
                        </p>
                      </div>

                      <button
                        onClick={handleStart}
                        className="w-full py-4 bg-cyan-600 text-white rounded-xl font-medium hover:bg-cyan-700 flex items-center justify-center gap-2"
                      >
                        <Play className="w-5 h-5" />
                        Ishni boshlash
                      </button>
                    </div>
                  )}

                  {/* Admin uchun - ishni boshlash */}
                  {selectedProject.status === 'approved' && user?.role === 'admin' && (
                    <button
                      onClick={handleStart}
                      className="w-full py-4 bg-cyan-600 text-white rounded-xl font-medium hover:bg-cyan-700 flex items-center justify-center gap-2"
                    >
                      <Play className="w-5 h-5" />
                      Ishni boshlash
                    </button>
                  )}

                  {/* Viloyat yetakchisi uchun - rad etilgan */}
                  {selectedProject.status === 'rejected' && user?.role === 'regional_leader' && (
                    <div className="bg-red-50 rounded-xl p-6 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                          <XCircle className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-red-800 text-lg">Loyiha rad etildi</h3>
                          <p className="text-red-600">Afsuski, direktor loyihani maqullamadi</p>
                        </div>
                      </div>

                      {selectedProject.rejectionReason && (
                        <div className="bg-white rounded-lg p-4 border border-red-200">
                          <p className="text-sm text-red-600 mb-1">Rad etish sababi:</p>
                          <p className="text-red-800">{selectedProject.rejectionReason}</p>
                        </div>
                      )}

                      <p className="text-sm text-red-600 text-center">
                        Yangi loyiha taklif qilishingiz mumkin
                      </p>
                    </div>
                  )}

                  {/* Viloyat yetakchisi uchun - qayta ishlash */}
                  {selectedProject.status === 'revision' && user?.role === 'regional_leader' && (
                    <div className="space-y-4">
                      <div className="bg-orange-50 rounded-xl p-6 space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                            <AlertCircle className="w-6 h-6 text-orange-600" />
                          </div>
                          <div>
                            <h3 className="font-bold text-orange-800 text-lg">Qayta ishlash kerak</h3>
                            <p className="text-orange-600">Direktor loyihani qayta ko'rib chiqishni so'radi</p>
                          </div>
                        </div>

                        {selectedProject.revisionNotes && (
                          <div className="bg-white rounded-lg p-4 border border-orange-200">
                            <p className="text-sm text-orange-600 mb-1">Direktor ko'rsatmalari:</p>
                            <p className="text-orange-800 font-medium">{selectedProject.revisionNotes}</p>
                          </div>
                        )}

                        <p className="text-sm text-orange-600 text-center">
                          "Ma'lumotlar" tabidan loyihani tahrirlang va qayta yuboring
                        </p>
                      </div>

                      <button
                        onClick={handleSubmit}
                        className="w-full py-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 flex items-center justify-center gap-2"
                      >
                        <Send className="w-5 h-5" />
                        Qayta yuborish
                      </button>
                    </div>
                  )}

                  {selectedProject.status === 'completed' && (
                    <div className="text-center py-8 text-gray-400">
                      Bu loyiha yakunlangan
                    </div>
                  )}

                  {selectedProject.status === 'rejected' && user?.role === 'admin' && (
                    <div className="text-center py-8 text-gray-400">
                      Bu loyiha rad etilgan
                    </div>
                  )}

                  {selectedProject.status === 'revision' && user?.role === 'admin' && (
                    <div className="bg-orange-50 rounded-xl p-6 text-center space-y-3">
                      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                        <AlertCircle className="w-8 h-8 text-orange-600" />
                      </div>
                      <h3 className="font-semibold text-orange-800 text-lg">
                        Qayta ishlashga yuborilgan
                      </h3>
                      <p className="text-orange-600">
                        Loyiha viloyat yetakchisiga qayta ishlash uchun yuborildi.
                      </p>
                      {selectedProject.revisionNotes && (
                        <p className="text-sm text-orange-700 bg-white rounded-lg p-3 border border-orange-200">
                          <strong>Ko'rsatma:</strong> {selectedProject.revisionNotes}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'history' && (
                <div className="space-y-4">
                  {(selectedProject.history || []).map((item) => {
                    const config = getStatusConfig(item.status);
                    return (
                      <div key={item.id} className="flex gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${config.bg}`}>
                          <config.icon className={`w-5 h-5 ${config.text}`} />
                        </div>
                        <div className="flex-1 pb-4 border-b border-gray-100">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-gray-900">{item.action}</p>
                            <p className="text-xs text-gray-400">
                              {new Date(item.date).toLocaleDateString('uz-UZ')}
                            </p>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                          <p className="text-xs text-gray-400 mt-1">{item.actor}</p>
                        </div>
                      </div>
                    );
                  })}
                  {(!selectedProject.history || selectedProject.history.length === 0) && (
                    <p className="text-center py-8 text-gray-400">Tarix mavjud emas</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProjects;
