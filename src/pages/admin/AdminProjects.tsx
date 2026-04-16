import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { REGIONS } from '../../data/regions';
import { Project, PARTNER_TYPES } from '../../types';
import { formatMoney } from '../../utils/format';
import {
  Search,
  X,
  Users,
  Calendar,
  ChevronDown,
  CheckCircle,
  XCircle,
  AlertCircle,
  Play,
  Trophy,
  History,
  Clock,
  Edit3,
  Presentation,
  Send,
  Banknote,
  Building,
  MapPin,
} from 'lucide-react';

const AdminProjects: React.FC = () => {
  const { projects, teams } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [viewMode, setViewMode] = useState<'info' | 'history'>('info');

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    const matchesRegion = regionFilter === 'all' || project.regionId === regionFilter;
    return matchesSearch && matchesStatus && matchesRegion;
  });

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'draft':
        return { badge: 'bg-gray-100 text-gray-700', text: 'Qoralama', icon: Edit3, color: 'text-gray-500' };
      case 'submitted':
        return { badge: 'bg-blue-100 text-blue-700', text: 'Yuborilgan', icon: Send, color: 'text-blue-500' };
      case 'under_review':
        return { badge: 'bg-amber-100 text-amber-700', text: 'Ko\'rib chiqilmoqda', icon: Clock, color: 'text-amber-500' };
      case 'presented':
        return { badge: 'bg-purple-100 text-purple-700', text: 'Taqdimot qilindi', icon: Presentation, color: 'text-purple-500' };
      case 'approved':
        return { badge: 'bg-green-100 text-green-700', text: 'Maqullandi', icon: CheckCircle, color: 'text-green-500' };
      case 'rejected':
        return { badge: 'bg-red-100 text-red-700', text: 'Rad etildi', icon: XCircle, color: 'text-red-500' };
      case 'revision':
        return { badge: 'bg-orange-100 text-orange-700', text: 'Qayta ishlash', icon: AlertCircle, color: 'text-orange-500' };
      case 'in_progress':
        return { badge: 'bg-cyan-100 text-cyan-700', text: 'Amalga oshirilmoqda', icon: Play, color: 'text-cyan-500' };
      case 'completed':
        return { badge: 'bg-emerald-100 text-emerald-700', text: 'Yakunlandi', icon: Trophy, color: 'text-emerald-500' };
      default:
        return { badge: 'bg-gray-100 text-gray-700', text: status, icon: Clock, color: 'text-gray-500' };
    }
  };

  const statusOptions = [
    { value: 'all', label: 'Barcha statuslar' },
    { value: 'submitted', label: 'Yuborilgan' },
    { value: 'presented', label: 'Taqdimot qilindi' },
    { value: 'approved', label: 'Maqullandi' },
    { value: 'rejected', label: 'Rad etildi' },
    { value: 'revision', label: 'Qayta ishlash' },
    { value: 'in_progress', label: 'Amalga oshirilmoqda' },
    { value: 'completed', label: 'Yakunlandi' },
  ];

  // Statistika
  const stats = {
    total: projects.length,
    approved: projects.filter(p => p.status === 'approved' || p.status === 'in_progress' || p.status === 'completed').length,
    pending: projects.filter(p => ['submitted', 'presented'].includes(p.status)).length,
    rejected: projects.filter(p => p.status === 'rejected').length,
    totalBudget: projects.reduce((sum, p) => sum + (p.allocatedBudget || 0), 0),
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Loyihalar monitoring</h1>
          <p className="text-sm text-gray-500 mt-1">Barcha hududlardan kelgan loyihalarni kuzatish</p>
        </div>
        <div className="bg-blue-50 text-blue-700 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium self-start sm:self-auto">
          Kuzatuv rejimi
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-500">Jami</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-green-200">
          <p className="text-sm text-green-600">Maqullangan</p>
          <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-amber-200">
          <p className="text-sm text-amber-600">Kutilmoqda</p>
          <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-red-200">
          <p className="text-sm text-red-600">Rad etilgan</p>
          <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-emerald-200">
          <p className="text-sm text-emerald-600">Jami byudjet</p>
          <p className="text-xl font-bold text-emerald-600">{formatMoney(stats.totalBudget)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <div className="relative flex-1 sm:flex-none">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full appearance-none pl-4 pr-10 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white sm:min-w-[160px]"
              >
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative flex-1 sm:flex-none">
              <select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                className="w-full appearance-none pl-4 pr-10 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white sm:min-w-[180px]"
              >
                <option value="all">Barcha hududlar</option>
                {REGIONS.map(region => (
                  <option key={region.id} value={region.id}>{region.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Projects List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="divide-y divide-gray-100">
          {filteredProjects.map((project) => {
            const region = REGIONS.find(r => r.id === project.regionId);
            const statusInfo = getStatusInfo(project.status);
            const StatusIcon = statusInfo.icon;

            return (
              <div
                key={project.id}
                onClick={() => { setSelectedProject(project); setViewMode('info'); }}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${statusInfo.badge}`}>
                      <StatusIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{project.title}</h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {region?.name}
                        </span>
                        <span>{project.category}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0">
                    {project.isApprovedByDirector && project.allocatedBudget && (
                      <div className="text-right">
                        <p className="text-sm font-semibold text-green-600">
                          {formatMoney(project.allocatedBudget)}
                        </p>
                        {project.assignedPartner && (
                          <p className="text-xs text-gray-500">{project.assignedPartner}</p>
                        )}
                      </div>
                    )}
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.badge}`}>
                      {statusInfo.text}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>Loyihalar topilmadi</p>
          </div>
        )}
      </div>

      {/* Project Detail Modal - View Only */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="p-5 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setViewMode('info')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    viewMode === 'info' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Ma'lumotlar
                </button>
                <button
                  onClick={() => setViewMode('history')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                    viewMode === 'history' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <History className="w-4 h-4" />
                  Tarix
                </button>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Project Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedProject.title}</h2>
                  <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {REGIONS.find(r => r.id === selectedProject.regionId)?.name}
                    </span>
                    <span>{selectedProject.category}</span>
                  </div>
                </div>
                <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${getStatusInfo(selectedProject.status).badge}`}>
                  {getStatusInfo(selectedProject.status).text}
                </span>
              </div>

              {viewMode === 'info' ? (
                <>
                  {/* Description */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-gray-700">{selectedProject.description}</p>
                  </div>

                  {/* Team & Date */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-500 flex items-center gap-2 mb-1">
                        <Users className="w-4 h-4" />
                        Jamoa
                      </p>
                      <p className="font-medium text-gray-900">
                        {teams.find(t => t.id === selectedProject.teamId)?.name || '-'}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-500 flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4" />
                        Yaratilgan
                      </p>
                      <p className="font-medium text-gray-900">
                        {new Date(selectedProject.createdAt).toLocaleDateString('uz-UZ')}
                      </p>
                    </div>
                  </div>

                  {/* Approval Info */}
                  {selectedProject.isApprovedByDirector && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                      <div className="flex items-center gap-2 text-green-700 mb-3">
                        <CheckCircle className="w-6 h-6" />
                        <span className="font-semibold text-lg">Maqullangan</span>
                      </div>
                      {selectedProject.approvalNotes && (
                        <p className="text-green-700 mb-4">{selectedProject.approvalNotes}</p>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-3 border-t border-green-200">
                        {selectedProject.assignedPartner && (
                          <div>
                            <p className="text-xs text-green-600 flex items-center gap-1">
                              <Building className="w-3 h-3" />
                              Hamkor
                            </p>
                            <p className="font-semibold text-green-800">{selectedProject.assignedPartner}</p>
                            {selectedProject.partnerType && (
                              <p className="text-xs text-green-600">
                                {PARTNER_TYPES[selectedProject.partnerType as keyof typeof PARTNER_TYPES]}
                              </p>
                            )}
                          </div>
                        )}
                        {selectedProject.allocatedBudget && (
                          <div>
                            <p className="text-xs text-green-600 flex items-center gap-1">
                              <Banknote className="w-3 h-3" />
                              Ajratilgan mablag'
                            </p>
                            <p className="font-semibold text-green-800">
                              {formatMoney(selectedProject.allocatedBudget)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Rejection Info */}
                  {selectedProject.status === 'rejected' && selectedProject.rejectionReason && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-5">
                      <div className="flex items-center gap-2 text-red-700 mb-3">
                        <XCircle className="w-6 h-6" />
                        <span className="font-semibold">Rad etilgan</span>
                      </div>
                      <p className="text-red-700">{selectedProject.rejectionReason}</p>
                    </div>
                  )}

                  {/* Revision Info */}
                  {selectedProject.status === 'revision' && selectedProject.revisionNotes && (
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-5">
                      <div className="flex items-center gap-2 text-orange-700 mb-3">
                        <AlertCircle className="w-6 h-6" />
                        <span className="font-semibold">Qayta ishlash kerak</span>
                      </div>
                      <p className="text-orange-700">{selectedProject.revisionNotes}</p>
                    </div>
                  )}
                </>
              ) : (
                /* History View */
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                  <div className="space-y-4">
                    {(selectedProject.history || []).map((item, idx) => {
                      const statusInfo = getStatusInfo(item.status);
                      const StatusIcon = statusInfo.icon;
                      return (
                        <div key={item.id} className="relative pl-10">
                          <div className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center ${
                            idx === (selectedProject.history?.length || 0) - 1 ? 'bg-blue-100' : 'bg-gray-100'
                          }`}>
                            <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
                          </div>
                          <div className="bg-gray-50 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-gray-900">{item.action}</span>
                              <span className="text-xs text-gray-500">
                                {new Date(item.date).toLocaleDateString('uz-UZ', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{item.description}</p>
                            <p className="text-xs text-gray-400 mt-2">{item.actor}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProjects;
