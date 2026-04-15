import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { REGIONS } from '../../data/regions';
import { HACKATHONS } from '../../data/mockData';
import { HACKATHON_STATUS_NAMES } from '../../types';
import { DonutChart, ChartLegend, HorizontalBarChart, BarChart } from '../../components/Charts/SimpleCharts';
import {
  MapPin,
  FolderKanban,
  Users,
  CheckCircle,
  Clock,
  TrendingUp,
  ArrowRight,
  Banknote,
  Calendar,
  X,
  Play,
  Trophy,
  Target,
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { projects, teams } = useData();
  const [selectedHackathon, setSelectedHackathon] = useState<string | null>(null);

  const approvedProjects = projects.filter(p => p.isApprovedByDirector);
  const pendingProjects = projects.filter(p => p.status === 'submitted' || p.status === 'presented');
  const inProgressProjects = projects.filter(p => p.status === 'in_progress');
  const completedProjects = projects.filter(p => p.status === 'completed');
  const rejectedProjects = projects.filter(p => p.status === 'rejected');
  const totalBudget = approvedProjects.reduce((sum, p) => sum + (p.allocatedBudget || 0), 0);

  // Loyiha statuslari uchun diagramma
  const statusChartData = [
    { label: 'Kutilmoqda', value: pendingProjects.length, color: '#f59e0b' },
    { label: 'Maqullangan', value: approvedProjects.length, color: '#10b981' },
    { label: 'Jarayonda', value: inProgressProjects.length, color: '#06b6d4' },
    { label: 'Yakunlangan', value: completedProjects.length, color: '#8b5cf6' },
    { label: 'Rad etilgan', value: rejectedProjects.length, color: '#ef4444' },
  ];

  // Kategoriyalar bo'yicha diagramma
  const categoryData = Object.entries(
    projects.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map((item, idx) => ({
      label: item[0].length > 12 ? item[0].slice(0, 12) + '...' : item[0],
      value: item[1],
      color: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'][idx],
    }));

  // Viloyatlar bo'yicha statistika
  const regionStats = REGIONS.map(region => ({
    region,
    projectsCount: projects.filter(p => p.regionId === region.id).length,
    teamsCount: teams.filter(t => t.regionId === region.id).length,
    approvedCount: projects.filter(p => p.regionId === region.id && p.isApprovedByDirector).length,
    budget: projects
      .filter(p => p.regionId === region.id && p.allocatedBudget)
      .reduce((sum, p) => sum + (p.allocatedBudget || 0), 0),
  })).sort((a, b) => b.projectsCount - a.projectsCount);

  // Top 5 viloyat
  const topRegionsData = regionStats.slice(0, 5).map((item, idx) => ({
    label: item.region.name.length > 15 ? item.region.code : item.region.name,
    value: item.projectsCount,
    color: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#06b6d4'][idx],
  }));

  // Hakatonlarni real ma'lumotlar bilan boyitish
  const hackathonsWithRealData = HACKATHONS.map(h => ({
    ...h,
    teamsCount: teams.filter(t => t.regionId === h.regionId).length,
    projectsCount: projects.filter(p => p.regionId === h.regionId).length,
    participantsCount: teams.filter(t => t.regionId === h.regionId).reduce((sum, t) => sum + t.members.length, 0),
  }));

  const upcomingHackathons = hackathonsWithRealData.filter(h => h.status === 'upcoming');
  const ongoingHackathons = hackathonsWithRealData.filter(h => h.status === 'ongoing');
  const completedHackathons = hackathonsWithRealData.filter(h => h.status === 'completed');

  const selectedHackathonData = hackathonsWithRealData.find(h => h.id === selectedHackathon);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Monitoring paneli</h1>
          <p className="text-gray-500 mt-1">Yoshlar Ventures platformasi statistikasi</p>
        </div>
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Kuzatuv rejimi
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{REGIONS.length}</p>
              <p className="text-xs text-gray-500">Hududlar</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{teams.length}</p>
              <p className="text-xs text-gray-500">Jamoalar</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <FolderKanban className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
              <p className="text-xs text-gray-500">Loyihalar</p>
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
        <div className="bg-white rounded-xl p-4 border border-indigo-200 bg-indigo-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-200 rounded-lg flex items-center justify-center">
              <Banknote className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-indigo-700">{(totalBudget / 1000000).toFixed(0)}M</p>
              <p className="text-xs text-indigo-600">Byudjet</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Donut Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Loyiha statuslari</h3>
          <div className="flex items-center justify-center gap-6">
            <DonutChart
              data={statusChartData}
              size={140}
              thickness={20}
              centerValue={projects.length}
              centerLabel="Jami"
            />
            <ChartLegend items={statusChartData} />
          </div>
        </div>

        {/* Category Bar Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Kategoriyalar bo'yicha</h3>
          <BarChart data={categoryData} height={180} />
        </div>

        {/* Top Regions */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Top 5 viloyat</h3>
          <HorizontalBarChart data={topRegionsData} />
        </div>
      </div>

      {/* Hackathons Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            Hakatonlar
          </h2>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              Rejalashtirilgan: {upcomingHackathons.length}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              Jarayonda: {ongoingHackathons.length}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Yakunlangan: {completedHackathons.length}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {hackathonsWithRealData.slice(0, 8).map((hackathon) => {
            const region = REGIONS.find(r => r.id === hackathon.regionId);
            const statusColors = {
              upcoming: 'border-amber-200 bg-amber-50',
              ongoing: 'border-green-200 bg-green-50',
              completed: 'border-blue-200 bg-blue-50',
            };
            const statusIcons = {
              upcoming: <Target className="w-4 h-4 text-amber-600" />,
              ongoing: <Play className="w-4 h-4 text-green-600" />,
              completed: <Trophy className="w-4 h-4 text-blue-600" />,
            };

            return (
              <div
                key={hackathon.id}
                onClick={() => setSelectedHackathon(hackathon.id)}
                className={`rounded-xl border p-4 cursor-pointer hover:shadow-md transition-all ${statusColors[hackathon.status]}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-white">
                    {HACKATHON_STATUS_NAMES[hackathon.status]}
                  </span>
                  {statusIcons[hackathon.status]}
                </div>
                <h4 className="font-semibold text-gray-900 text-sm mb-1">{region?.name}</h4>
                <p className="text-xs text-gray-500 mb-3">
                  {formatDate(hackathon.startDate)} - {formatDate(hackathon.endDate)}
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white/60 rounded px-2 py-1">
                    <span className="text-gray-500">Ishtirokchilar:</span>
                    <span className="font-medium ml-1">{hackathon.participantsCount}</span>
                  </div>
                  <div className="bg-white/60 rounded px-2 py-1">
                    <span className="text-gray-500">Jamoalar:</span>
                    <span className="font-medium ml-1">{hackathon.teamsCount}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hududlar bo'yicha statistika */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Hududlar statistikasi</h2>
            <Link
              to="/admin/regions"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
            >
              Barchasi <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {regionStats.slice(0, 8).map((item, index) => (
              <div key={item.region.id} className="flex items-center gap-4">
                <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{item.region.name}</p>
                  <div className="flex gap-4 text-xs text-gray-500 mt-1">
                    <span>{item.projectsCount} loyiha</span>
                    <span>{item.teamsCount} jamoa</span>
                    <span className="text-green-600">{item.approvedCount} maqullangan</span>
                  </div>
                </div>
                <div className="w-20">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${(item.projectsCount / Math.max(...regionStats.map(r => r.projectsCount), 1)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* So'nggi maqullangan loyihalar */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Maqullangan loyihalar</h2>
            <Link
              to="/admin/projects"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
            >
              Barchasi <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {approvedProjects.slice(0, 6).map((project) => {
              const region = REGIONS.find(r => r.id === project.regionId);
              return (
                <div key={project.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-gray-900">{project.title}</p>
                      <p className="text-sm text-gray-500 mt-1">{region?.name}</p>
                    </div>
                    {project.allocatedBudget && (
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm font-medium whitespace-nowrap">
                        {(project.allocatedBudget / 1000000).toFixed(0)} mln
                      </span>
                    )}
                  </div>
                  {project.assignedPartner && (
                    <p className="text-xs text-blue-600 mt-2">
                      Hamkor: {project.assignedPartner}
                    </p>
                  )}
                </div>
              );
            })}
            {approvedProjects.length === 0 && (
              <p className="text-center text-gray-500 py-8">Hali maqullangan loyihalar yo'q</p>
            )}
          </div>
        </div>
      </div>

      {/* Hackathon Detail Modal */}
      {selectedHackathonData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full animate-fadeIn">
            <div className="p-5 border-b flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Hakaton tafsilotlari</h2>
              <button
                onClick={() => setSelectedHackathon(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedHackathonData.name}</h3>
                <p className="text-gray-500 flex items-center gap-1 mt-1">
                  <MapPin className="w-4 h-4" />
                  {selectedHackathonData.location}
                </p>
              </div>

              <div className={`rounded-xl p-4 ${
                selectedHackathonData.status === 'upcoming' ? 'bg-amber-50' :
                selectedHackathonData.status === 'ongoing' ? 'bg-green-50' : 'bg-blue-50'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5" />
                  <span className="font-medium">
                    {HACKATHON_STATUS_NAMES[selectedHackathonData.status]}
                  </span>
                </div>
                <p className="text-sm">
                  {formatDate(selectedHackathonData.startDate)} - {formatDate(selectedHackathonData.endDate)}
                </p>
              </div>

              {selectedHackathonData.description && (
                <p className="text-gray-600 text-sm">{selectedHackathonData.description}</p>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900">{selectedHackathonData.participantsCount}</p>
                  <p className="text-xs text-gray-500">Ishtirokchilar</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900">{selectedHackathonData.teamsCount}</p>
                  <p className="text-xs text-gray-500">Jamoalar</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900">{selectedHackathonData.projectsCount}</p>
                  <p className="text-xs text-gray-500">Loyihalar</p>
                </div>
              </div>

              {selectedHackathonData.status === 'completed' && (
                <div className="bg-green-50 rounded-xl p-4">
                  <p className="text-sm text-green-700">
                    <strong>G'oliblar soni:</strong> {selectedHackathonData.winnersCount || 0}
                  </p>
                  {selectedHackathonData.totalPrize && (
                    <p className="text-sm text-green-700 mt-1">
                      <strong>Jami mukofot:</strong> {(selectedHackathonData.totalPrize / 1000000).toFixed(0)} mln so'm
                    </p>
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

export default AdminDashboard;
