import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { REGIONS } from '../../data/regions';
import { HACKATHONS } from '../../data/mockData';
import {
  Search,
  MapPin,
  FolderKanban,
  Users,
  CheckCircle,
  ChevronRight,
  X,
  Calendar,
  Banknote,
} from 'lucide-react';

const AdminRegions: React.FC = () => {
  const { projects, teams } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);

  const filteredRegions = REGIONS.filter((region) =>
    region.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedRegion = REGIONS.find(r => r.id === selectedRegionId);
  const regionProjects = selectedRegionId ? projects.filter(p => p.regionId === selectedRegionId) : [];
  const regionTeams = selectedRegionId ? teams.filter(t => t.regionId === selectedRegionId) : [];

  // Hakaton ma'lumotlarini real statistika bilan boyitish
  const baseHackathon = selectedRegionId ? HACKATHONS.find(h => h.regionId === selectedRegionId) : null;
  const regionHackathon = baseHackathon ? {
    ...baseHackathon,
    teamsCount: regionTeams.length,
    projectsCount: regionProjects.length,
    participantsCount: regionTeams.reduce((sum, t) => sum + t.members.length, 0),
  } : null;

  const getRegionStats = (regionId: string) => {
    const regionProjects = projects.filter(p => p.regionId === regionId);
    const regionTeams = teams.filter(t => t.regionId === regionId);
    const approved = regionProjects.filter(p => p.isApprovedByDirector);
    const totalBudget = approved.reduce((sum, p) => sum + (p.allocatedBudget || 0), 0);

    return {
      projectsCount: regionProjects.length,
      teamsCount: regionTeams.length,
      approvedCount: approved.length,
      totalBudget,
    };
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hududlar</h1>
          <p className="text-gray-600 mt-1">O'zbekiston viloyatlari va Qoraqalpog'iston</p>
        </div>
        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
          {REGIONS.length} ta hudud
        </span>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Hududlarni qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Regions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRegions.map((region) => {
          const stats = getRegionStats(region.id);
          return (
            <div
              key={region.id}
              onClick={() => setSelectedRegionId(region.id)}
              className="card hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{region.name}</h3>
                    <p className="text-sm text-gray-500">{region.districts.length} tuman/shahar</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-gray-900">{stats.projectsCount}</p>
                  <p className="text-xs text-gray-500">Loyihalar</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-gray-900">{stats.teamsCount}</p>
                  <p className="text-xs text-gray-500">Jamoalar</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-green-600">{stats.approvedCount}</p>
                  <p className="text-xs text-green-600">Maqullangan</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-blue-600">
                    {stats.totalBudget > 0 ? `${(stats.totalBudget / 1000000).toFixed(0)}M` : '-'}
                  </p>
                  <p className="text-xs text-blue-600">Byudjet</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Region Detail Modal */}
      {selectedRegion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-fadeIn">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedRegion.name}</h2>
                  <p className="text-gray-500">{selectedRegion.districts.length} tuman/shahar</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRegionId(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Hackathon Info */}
              {regionHackathon && (
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl p-6">
                  <h3 className="font-semibold flex items-center gap-2 mb-4">
                    <Calendar className="w-5 h-5" /> Yoshlar Ventures Hakatoni
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white/20 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold">{regionHackathon.participantsCount}</p>
                      <p className="text-sm opacity-80">Ishtirokchilar</p>
                    </div>
                    <div className="bg-white/20 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold">{regionHackathon.teamsCount}</p>
                      <p className="text-sm opacity-80">Jamoalar</p>
                    </div>
                    <div className="bg-white/20 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold">{regionHackathon.projectsCount}</p>
                      <p className="text-sm opacity-80">Loyihalar</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <FolderKanban className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{regionProjects.length}</p>
                  <p className="text-sm text-gray-500">Loyihalar</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <Users className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{regionTeams.length}</p>
                  <p className="text-sm text-gray-500">Jamoalar</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-600">
                    {regionProjects.filter(p => p.isApprovedByDirector).length}
                  </p>
                  <p className="text-sm text-green-600">Maqullangan</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <Banknote className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-600">
                    {(regionProjects.filter(p => p.isApprovedByDirector).reduce((s, p) => s + (p.allocatedBudget || 0), 0) / 1000000).toFixed(0)}M
                  </p>
                  <p className="text-sm text-blue-600">Byudjet</p>
                </div>
              </div>

              {/* Districts */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Tumanlar va shaharlar</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {selectedRegion.districts.map((district) => {
                    const districtTeams = regionTeams.filter(t =>
                      t.members.some(m => m.districtId === district.id)
                    );
                    return (
                      <div key={district.id} className="bg-gray-50 rounded-lg p-3">
                        <p className="font-medium text-gray-900 text-sm">{district.name}</p>
                        <p className="text-xs text-gray-500 mt-1">{districtTeams.length} jamoa</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Projects */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Loyihalar</h3>
                {regionProjects.length > 0 ? (
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {regionProjects.map((project) => (
                      <div key={project.id} className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{project.title}</p>
                          <p className="text-sm text-gray-500">{project.category}</p>
                        </div>
                        <div className="text-right">
                          {project.isApprovedByDirector ? (
                            <span className="badge badge-success">Maqullangan</span>
                          ) : (
                            <span className="badge badge-gray">{project.status}</span>
                          )}
                          {project.allocatedBudget && (
                            <p className="text-sm text-green-600 mt-1">
                              {(project.allocatedBudget / 1000000).toFixed(0)} mln
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
                    Hali loyihalar yo'q
                  </div>
                )}
              </div>

              {/* Teams */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Jamoalar</h3>
                {regionTeams.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {regionTeams.slice(0, 6).map((team) => (
                      <div key={team.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{team.name}</p>
                            <p className="text-sm text-gray-500">{team.members.length} a'zo</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
                    Hali jamoalar yo'q
                  </div>
                )}
                {regionTeams.length > 6 && (
                  <p className="text-center text-gray-500 text-sm mt-3">
                    va yana {regionTeams.length - 6} ta jamoa...
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRegions;
