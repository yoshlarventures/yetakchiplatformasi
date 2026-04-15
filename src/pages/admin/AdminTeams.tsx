import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { REGIONS } from '../../data/regions';
import { Team } from '../../types';
import {
  Search,
  Eye,
  X,
  Users,
  MapPin,
  Phone,
  ChevronDown,
  FolderKanban,
} from 'lucide-react';

const AdminTeams: React.FC = () => {
  const { teams, projects } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  const filteredTeams = teams.filter((team) => {
    const matchesSearch = team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         team.members.some(m => m.fullName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRegion = regionFilter === 'all' || team.regionId === regionFilter;
    return matchesSearch && matchesRegion;
  });

  const getProjectByTeamId = (teamId: string) => {
    return projects.find(p => p.teamId === teamId);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Jamoalar</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Barcha hududlardagi jamoalar</p>
        </div>
        <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium self-start sm:self-auto">
          {filteredTeams.length} ta jamoa
        </span>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Jamoa yoki a'zo qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>

          <div className="relative">
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="input-field pr-10 appearance-none w-full sm:min-w-[200px]"
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

      {/* Teams Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Jamoa
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Hudud
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  A'zolar
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Loyiha
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Amallar
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTeams.map((team) => {
                const region = REGIONS.find(r => r.id === team.regionId);
                const project = getProjectByTeamId(team.id);
                return (
                  <tr key={team.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{team.name}</p>
                          <p className="text-sm text-gray-500">{team.members.length} a'zo</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{region?.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex -space-x-2">
                        {team.members.slice(0, 4).map((member) => (
                          <div
                            key={member.id}
                            className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full border-2 border-white flex items-center justify-center text-xs text-white font-medium"
                            title={member.fullName}
                          >
                            {member.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                        ))}
                        {team.members.length > 4 && (
                          <div className="w-8 h-8 bg-gray-200 rounded-full border-2 border-white flex items-center justify-center text-xs text-gray-600 font-medium">
                            +{team.members.length - 4}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {project ? (
                        <div>
                          <span className="text-sm text-gray-600 line-clamp-1">{project.title}</span>
                          {project.isApprovedByDirector && (
                            <span className="text-xs text-green-600 block">Maqullangan</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedTeam(team)}
                        className="text-blue-600 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredTeams.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Jamoalar topilmadi
          </div>
        )}
      </div>

      {/* Team Detail Modal */}
      {selectedTeam && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto animate-fadeIn">
            <div className="p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Jamoa tafsilotlari</h2>
              <button
                onClick={() => setSelectedTeam(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">
              {/* Team Info */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedTeam.name}</h3>
                  <p className="text-gray-500 flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {REGIONS.find(r => r.id === selectedTeam.regionId)?.name}
                  </p>
                </div>
              </div>

              {/* Project */}
              {(() => {
                const project = getProjectByTeamId(selectedTeam.id);
                if (project) {
                  return (
                    <div className="bg-blue-50 rounded-xl p-4">
                      <p className="text-sm text-blue-600 flex items-center gap-2 mb-2">
                        <FolderKanban className="w-4 h-4" /> Loyiha
                      </p>
                      <p className="font-medium text-blue-900">{project.title}</p>
                      <p className="text-sm text-blue-700 mt-1">{project.category}</p>
                      {project.description && (
                        <p className="text-sm text-blue-600 mt-2">{project.description}</p>
                      )}
                      {project.isApprovedByDirector && (
                        <div className="mt-3 pt-3 border-t border-blue-200">
                          <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded">
                            Maqullangan
                          </span>
                          {project.allocatedBudget && (
                            <span className="text-sm text-green-600 ml-2">
                              {(project.allocatedBudget / 1000000).toFixed(0)} mln so'm
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                }
                return (
                  <div className="bg-gray-50 rounded-xl p-4 text-center text-gray-500">
                    Loyiha hali qo'shilmagan
                  </div>
                );
              })()}

              {/* Members */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">
                  Jamoa a'zolari ({selectedTeam.members.length} kishi)
                </h4>
                <div className="space-y-3">
                  {selectedTeam.members.map((member, idx) => (
                    <div key={member.id} className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{member.fullName}</p>
                          {member.mahallaName && (
                            <p className="text-sm text-gray-500">{member.mahallaName}</p>
                          )}
                          <p className="text-xs text-gray-400">{member.districtName}</p>
                        </div>
                        {member.phone && (
                          <div className="text-right">
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <Phone className="w-4 h-4" />
                              {member.phone}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTeams;
