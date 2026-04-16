import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { REGIONS } from '../../data/regions';
import { HACKATHONS } from '../../data/mockData';
import { DonutChart, ChartLegend, ProgressBar } from '../../components/Charts/SimpleCharts';
import {
  FolderKanban,
  Users,
  CheckCircle,
  Clock,
  ArrowRight,
  Calendar,
  MapPin,
  Banknote,
  Plus,
  X,
  Target,
  Play,
  Trophy,
  TrendingUp,
} from 'lucide-react';

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const { getTeamsByRegion, getProjectsByRegion, getProjectByTeamId } = useData();
  const regionId = user?.regionId || '';
  const region = REGIONS.find(r => r.id === regionId);

  const [showHackathonModal, setShowHackathonModal] = useState(false);

  const regionProjects = getProjectsByRegion(regionId);
  const regionTeams = getTeamsByRegion(regionId);

  // Hakaton ma'lumotlarini real statistika bilan boyitish
  const baseHackathon = HACKATHONS.find(h => h.regionId === regionId);
  const regionHackathon = baseHackathon ? {
    ...baseHackathon,
    teamsCount: regionTeams.length,
    projectsCount: regionProjects.length,
    participantsCount: regionTeams.reduce((sum, t) => sum + t.members.length, 0),
  } : null;

  const approvedProjects = regionProjects.filter(p => p.isApprovedByDirector);
  const pendingProjects = regionProjects.filter(p => ['submitted', 'presented'].includes(p.status));
  const inProgressProjects = regionProjects.filter(p => p.status === 'in_progress');
  const completedProjects = regionProjects.filter(p => p.status === 'completed');
  const rejectedProjects = regionProjects.filter(p => p.status === 'rejected');
  const totalBudget = approvedProjects.reduce((sum, p) => sum + (p.allocatedBudget || 0), 0);

  // Loyiha statuslari uchun diagramma
  const statusChartData = [
    { label: 'Kutilmoqda', value: pendingProjects.length, color: '#f59e0b' },
    { label: 'Maqullangan', value: approvedProjects.length, color: '#10b981' },
    { label: 'Jarayonda', value: inProgressProjects.length, color: '#06b6d4' },
    { label: 'Yakunlangan', value: completedProjects.length, color: '#8b5cf6' },
    { label: 'Rad etilgan', value: rejectedProjects.length, color: '#ef4444' },
  ].filter(d => d.value > 0);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">Maqullangan</span>;
      case 'in_progress':
        return <span className="px-2 py-1 bg-cyan-100 text-cyan-700 rounded text-xs font-medium">Jarayonda</span>;
      case 'rejected':
        return <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">Rad etilgan</span>;
      case 'presented':
        return <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">Taqdimot</span>;
      case 'completed':
        return <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-medium">Yakunlangan</span>;
      default:
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">Yuborilgan</span>;
    }
  };

  const hackathonStatusConfig = {
    upcoming: { bg: 'from-amber-500 to-orange-600', icon: Target, label: 'Rejalashtirilgan' },
    ongoing: { bg: 'from-green-500 to-emerald-600', icon: Play, label: 'Jarayonda' },
    completed: { bg: 'from-blue-500 to-indigo-600', icon: Trophy, label: 'Yakunlangan' },
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{region?.name}</h1>
          <p className="text-gray-500 text-sm mt-1 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            {region?.districts.length} ta tuman/shahar
          </p>
        </div>
        {totalBudget > 0 && (
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 sm:px-5 sm:py-3 rounded-xl self-start sm:self-auto">
            <p className="text-xs opacity-90">Jami ajratilgan</p>
            <p className="text-lg sm:text-xl font-bold">
              {totalBudget >= 1000000000
                ? `${(totalBudget / 1000000000).toFixed(1)} mlrd so'm`
                : `${(totalBudget / 1000000).toFixed(0)} mln so'm`}
            </p>
          </div>
        )}
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FolderKanban className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{regionProjects.length}</p>
              <p className="text-xs text-gray-500">Jami loyihalar</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-green-200 bg-green-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-200 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-700">{approvedProjects.length}</p>
              <p className="text-xs text-green-600">Maqullangan</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-amber-200 bg-amber-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-200 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-700">{pendingProjects.length}</p>
              <p className="text-xs text-amber-600">Kutilmoqda</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-purple-200 bg-purple-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-200 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-700">{regionTeams.length}</p>
              <p className="text-xs text-purple-600">Jamoalar</p>
            </div>
          </div>
        </div>
      </div>

      {/* Hakaton Info Card */}
      {regionHackathon && (
        <div
          onClick={() => setShowHackathonModal(true)}
          className={`bg-gradient-to-r ${hackathonStatusConfig[regionHackathon.status].bg} text-white rounded-xl p-4 sm:p-6 cursor-pointer hover:shadow-lg transition-shadow`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Calendar className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h2 className="text-base sm:text-lg font-bold">Yoshlar Ventures</h2>
                  <span className="px-2 py-0.5 bg-white/20 rounded text-xs">
                    {hackathonStatusConfig[regionHackathon.status].label}
                  </span>
                </div>
                <p className="text-xs sm:text-sm opacity-90">
                  {formatDate(regionHackathon.startDate)} - {formatDate(regionHackathon.endDate)}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 sm:gap-6">
              <div className="text-center bg-white/10 rounded-lg py-2 px-3">
                <p className="text-xl sm:text-2xl font-bold">{regionHackathon.participantsCount}</p>
                <p className="text-[10px] sm:text-xs opacity-80">Ishtirok</p>
              </div>
              <div className="text-center bg-white/10 rounded-lg py-2 px-3">
                <p className="text-xl sm:text-2xl font-bold">{regionHackathon.teamsCount}</p>
                <p className="text-[10px] sm:text-xs opacity-80">Jamoa</p>
              </div>
              <div className="text-center bg-white/10 rounded-lg py-2 px-3">
                <p className="text-xl sm:text-2xl font-bold">{regionHackathon.projectsCount}</p>
                <p className="text-[10px] sm:text-xs opacity-80">Loyiha</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts and Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Status Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-sm sm:text-base">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            Loyiha holati
          </h3>
          {regionProjects.length > 0 ? (
            <div className="flex flex-col items-center gap-4">
              <DonutChart
                data={statusChartData}
                size={140}
                thickness={20}
                centerValue={regionProjects.length}
                centerLabel="Jami"
              />
              <ChartLegend items={statusChartData} showPercentage />
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <FolderKanban className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Hali loyihalar yo'q</p>
            </div>
          )}
        </div>

        {/* Progress Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
          <h3 className="font-semibold text-gray-900 mb-4 text-sm sm:text-base">Loyihalar jarayoni</h3>
          <div className="space-y-4">
            <ProgressBar
              label="Maqullangan"
              value={approvedProjects.length}
              max={regionProjects.length || 1}
              color="#10b981"
            />
            <ProgressBar
              label="Jarayonda"
              value={inProgressProjects.length}
              max={regionProjects.length || 1}
              color="#06b6d4"
            />
            <ProgressBar
              label="Yakunlangan"
              value={completedProjects.length}
              max={regionProjects.length || 1}
              color="#8b5cf6"
            />
            <ProgressBar
              label="Kutilmoqda"
              value={pendingProjects.length}
              max={regionProjects.length || 1}
              color="#f59e0b"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 md:col-span-2 lg:col-span-1">
          <h3 className="font-semibold text-gray-900 mb-4 text-sm sm:text-base">Tezkor amallar</h3>
          <div className="space-y-3">
            <Link
              to="/dashboard/teams"
              className="flex items-center gap-3 p-3 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors"
            >
              <div className="w-10 h-10 bg-purple-200 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Yangi jamoa</p>
                <p className="text-xs text-gray-500">Jamoa qo'shish</p>
              </div>
              <Plus className="w-5 h-5 text-purple-600" />
            </Link>
            <Link
              to="/dashboard/projects"
              className="flex items-center gap-3 p-3 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors"
            >
              <div className="w-10 h-10 bg-emerald-200 rounded-lg flex items-center justify-center">
                <FolderKanban className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Loyihalar</p>
                <p className="text-xs text-gray-500">Boshqarish</p>
              </div>
              <ArrowRight className="w-5 h-5 text-emerald-600" />
            </Link>
          </div>
        </div>
      </div>

      {/* Projects and Teams */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Projects */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 text-sm sm:text-base">Oxirgi loyihalar</h2>
            <Link
              to="/dashboard/projects"
              className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center gap-1"
            >
              Barchasi <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3 max-h-72 overflow-y-auto">
            {regionProjects.slice(0, 5).map((project) => (
              <div key={project.id} className="p-3 bg-gray-50 rounded-xl">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{project.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{project.category}</p>
                  </div>
                  {getStatusBadge(project.status)}
                </div>
                {project.isApprovedByDirector && project.allocatedBudget && (
                  <div className="mt-2 pt-2 border-t border-gray-200 flex items-center gap-3 text-xs">
                    <span className="text-green-600 flex items-center gap-1">
                      <Banknote className="w-3.5 h-3.5" />
                      {project.allocatedBudget >= 1000000000
                        ? `${(project.allocatedBudget / 1000000000).toFixed(1)} mlrd`
                        : `${(project.allocatedBudget / 1000000).toFixed(0)} mln`}
                    </span>
                    {project.assignedPartner && (
                      <span className="text-blue-600">{project.assignedPartner}</span>
                    )}
                  </div>
                )}
              </div>
            ))}
            {regionProjects.length === 0 && (
              <p className="text-center text-gray-400 py-8">Hali loyihalar yo'q</p>
            )}
          </div>
        </div>

        {/* Teams */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 text-sm sm:text-base">Jamoalar</h2>
            <Link
              to="/dashboard/teams"
              className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center gap-1"
            >
              Barchasi <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3 max-h-72 overflow-y-auto">
            {regionTeams.slice(0, 5).map((team) => {
              const project = getProjectByTeamId(team.id);
              return (
                <div key={team.id} className="p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{team.name}</p>
                        <p className="text-xs text-gray-500">{team.members.length} a'zo</p>
                      </div>
                    </div>
                    {project && (
                      <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                        Loyiha bor
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            {regionTeams.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-3">Hali jamoalar yo'q</p>
                <Link
                  to="/dashboard/teams"
                  className="text-emerald-600 hover:text-emerald-700 font-medium inline-flex items-center gap-2 text-sm"
                >
                  <Plus className="w-4 h-4" /> Jamoa qo'shish
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hackathon Detail Modal */}
      {showHackathonModal && regionHackathon && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto animate-fadeIn">
            <div className="p-5 border-b flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Hakaton tafsilotlari</h2>
              <button
                onClick={() => setShowHackathonModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{regionHackathon.name}</h3>
                <p className="text-gray-500 flex items-center gap-1 mt-1">
                  <MapPin className="w-4 h-4" />
                  {regionHackathon.location}
                </p>
                {regionHackathon.address && (
                  <p className="text-sm text-gray-400 mt-1">{regionHackathon.address}</p>
                )}
              </div>

              <div className={`rounded-xl p-4 bg-gradient-to-r ${hackathonStatusConfig[regionHackathon.status].bg} text-white`}>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5" />
                  <span className="font-medium">
                    {hackathonStatusConfig[regionHackathon.status].label}
                  </span>
                </div>
                <p className="text-sm opacity-90">
                  {formatDate(regionHackathon.startDate)} - {formatDate(regionHackathon.endDate)}
                </p>
              </div>

              {regionHackathon.description && (
                <p className="text-gray-600 text-sm">{regionHackathon.description}</p>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900">{regionHackathon.participantsCount}</p>
                  <p className="text-xs text-gray-500">Ishtirokchilar</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900">{regionHackathon.teamsCount}</p>
                  <p className="text-xs text-gray-500">Jamoalar</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900">{regionHackathon.projectsCount}</p>
                  <p className="text-xs text-gray-500">Loyihalar</p>
                </div>
              </div>

              {regionHackathon.status === 'completed' && regionHackathon.totalPrize && (
                <div className="bg-green-50 rounded-xl p-4">
                  <p className="text-sm text-green-700">
                    <strong>G'oliblar soni:</strong> {regionHackathon.winnersCount || 0}
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    <strong>Jami mukofot:</strong> {(regionHackathon.totalPrize / 1000000).toFixed(0)} mln so'm
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
