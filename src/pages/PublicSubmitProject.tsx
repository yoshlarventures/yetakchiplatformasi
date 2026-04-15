import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { REGIONS } from '../data/regions';
import { PROJECT_CATEGORIES, ProjectAttachment } from '../types';
import { useData } from '../context/DataContext';
import FileUpload from '../components/FileUpload/FileUpload';
import {
  ArrowLeft,
  Users,
  FolderKanban,
  MapPin,
  User,
  Plus,
  Trash2,
  CheckCircle,
  Send,
  Loader2,
  FileText,
  Building,
  Paperclip,
} from 'lucide-react';

interface MemberInput {
  fullName: string;
  phone: string;
  districtId: string;
  districtName: string;
  mahallaName: string;
  isCustomDistrict?: boolean;
  customDistrictName?: string;
}

const PublicSubmitProject: React.FC = () => {
  const { addTeam, addProject } = useData();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form data
  const [regionId, setRegionId] = useState('');
  const [teamName, setTeamName] = useState('');
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectCategory, setProjectCategory] = useState('');
  const [projectAttachments, setProjectAttachments] = useState<ProjectAttachment[]>([]);
  const [members, setMembers] = useState<MemberInput[]>([
    { fullName: '', phone: '', districtId: '', districtName: '', mahallaName: '' }
  ]);

  const selectedRegion = REGIONS.find(r => r.id === regionId);

  const addMember = () => {
    if (members.length < 7) {
      setMembers([...members, { fullName: '', phone: '', districtId: '', districtName: '', mahallaName: '' }]);
    }
  };

  const removeMember = (index: number) => {
    if (members.length > 1) {
      setMembers(members.filter((_, i) => i !== index));
    }
  };

  const updateMember = (index: number, field: keyof MemberInput, value: string | boolean) => {
    const updated = [...members];
    updated[index] = { ...updated[index], [field]: value };

    if (field === 'districtId' && selectedRegion) {
      if (value === 'custom') {
        // Qo'lda kiritish tanlangan
        updated[index].isCustomDistrict = true;
        updated[index].districtName = '';
        updated[index].customDistrictName = '';
      } else {
        // Ro'yxatdan tanlangan
        updated[index].isCustomDistrict = false;
        const district = selectedRegion.districts.find(d => d.id === value);
        if (district) {
          updated[index].districtName = district.name;
        }
      }
    }

    // Qo'lda kiritilgan tuman nomini districtName ga ham yozish
    if (field === 'customDistrictName') {
      updated[index].districtName = value as string;
    }

    setMembers(updated);
  };

  const validateStep1 = () => {
    if (!regionId) return 'Viloyatni tanlang';
    if (!teamName.trim()) return 'Jamoa nomini kiriting';
    return null;
  };

  const validateStep2 = () => {
    const validMembers = members.filter(m => {
      if (!m.fullName.trim()) return false;
      if (m.isCustomDistrict) {
        return m.customDistrictName?.trim();
      }
      return m.districtId;
    });
    if (validMembers.length === 0) return 'Kamida bitta jamoa a\'zosini kiriting';
    return null;
  };

  const validateStep3 = () => {
    if (!projectTitle.trim()) return 'Loyiha nomini kiriting';
    if (!projectCategory) return 'Kategoriyani tanlang';
    if (!projectDescription.trim()) return 'Loyiha tavsifini kiriting';
    return null;
  };

  const handleNext = () => {
    let error = null;
    if (step === 1) error = validateStep1();
    if (step === 2) error = validateStep2();
    if (step === 3) error = validateStep3();

    if (error) {
      alert(error);
      return;
    }
    setStep(step + 1);
  };

  const handleSubmit = async () => {
    const error = validateStep3();
    if (error) {
      alert(error);
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      // Create team
      const validMembers = members.filter(m => {
        if (!m.fullName.trim()) return false;
        if (m.isCustomDistrict) return m.customDistrictName?.trim();
        return m.districtId;
      });
      const teamMembers = validMembers.map((m, idx) => ({
        id: `member-public-${Date.now()}-${idx}`,
        fullName: m.fullName,
        phone: m.phone,
        districtId: m.isCustomDistrict ? `custom-${Date.now()}-${idx}` : m.districtId,
        districtName: m.isCustomDistrict ? (m.customDistrictName || '') : m.districtName,
        mahallaId: `mahalla-public-${Date.now()}-${idx}`,
        mahallaName: m.mahallaName,
        isCustomDistrict: m.isCustomDistrict,
      }));

      const newTeam = addTeam({
        name: teamName,
        regionId,
        hackathonId: `hackathon-${regionId}`,
        members: teamMembers,
      });

      // Create project
      addProject({
        title: projectTitle,
        description: projectDescription,
        category: projectCategory,
        teamId: newTeam.id,
        regionId,
        hackathonId: `hackathon-${regionId}`,
        status: 'submitted',
        isApprovedByDirector: false,
        attachments: projectAttachments,
      });

      setIsSuccess(true);
    } catch (err) {
      alert('Xatolik yuz berdi. Qaytadan urinib ko\'ring.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center animate-fadeIn">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Loyiha yuborildi!</h1>
          <p className="text-gray-600 mb-6">
            Loyihangiz muvaffaqiyatli yuborildi. {selectedRegion?.name} viloyat yetakchisi tez orada ko'rib chiqadi.
          </p>
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm text-gray-500">Loyiha:</p>
            <p className="font-medium text-gray-900">{projectTitle}</p>
            <p className="text-sm text-gray-500 mt-2">Jamoa:</p>
            <p className="font-medium text-gray-900">{teamName}</p>
          </div>
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-2 w-full py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors"
          >
            Bosh sahifaga qaytish
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/login" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
            <span>Orqaga</span>
          </Link>
          <div className="flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-emerald-600" />
            <span className="font-semibold text-gray-900">Loyiha topshirish</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: 'Viloyat & Jamoa', icon: MapPin },
              { num: 2, label: 'Jamoa a\'zolari', icon: Users },
              { num: 3, label: 'Loyiha ma\'lumotlari', icon: FileText },
              { num: 4, label: 'Tasdiqlash', icon: CheckCircle },
            ].map((s, idx) => (
              <React.Fragment key={s.num}>
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all ${
                    step >= s.num
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step > s.num ? <CheckCircle className="w-6 h-6" /> : <s.icon className="w-5 h-5" />}
                  </div>
                  <span className={`text-xs mt-2 ${step >= s.num ? 'text-emerald-600 font-medium' : 'text-gray-500'}`}>
                    {s.label}
                  </span>
                </div>
                {idx < 3 && (
                  <div className={`flex-1 h-1 mx-2 rounded ${step > s.num ? 'bg-emerald-600' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Step 1: Region & Team */}
          {step === 1 && (
            <div className="p-6 space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Viloyat va Jamoa</h2>
                <p className="text-gray-500">Qaysi viloyatdan va qanday jamoa nomi bilan qatnashmoqchisiz?</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Viloyat / Hudud *
                </label>
                <select
                  value={regionId}
                  onChange={(e) => setRegionId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                >
                  <option value="">Tanlang...</option>
                  {REGIONS.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jamoa nomi *
                </label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Masalan: Innovatorlar, Yosh tadbirkorlar..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>

              {selectedRegion && (
                <div className="bg-blue-50 rounded-xl p-4 flex items-start gap-3">
                  <Building className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900">{selectedRegion.name}</p>
                    <p className="text-sm text-blue-600">{selectedRegion.districts.length} ta tuman/shahar</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Team Members */}
          {step === 2 && (
            <div className="p-6 space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Jamoa a'zolari</h2>
                <p className="text-gray-500">Jamoadagi mahalla yoshlar yetakchilarini kiriting (1-7 kishi)</p>
              </div>

              <div className="space-y-4">
                {members.map((member, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-600 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        A'zo {index + 1}
                      </span>
                      {members.length > 1 && (
                        <button
                          onClick={() => removeMember(index)}
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
                        onChange={(e) => updateMember(index, 'fullName', e.target.value)}
                        className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                      <input
                        type="tel"
                        placeholder="Telefon raqami"
                        value={member.phone}
                        onChange={(e) => updateMember(index, 'phone', e.target.value)}
                        className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                      <div className="space-y-2">
                        <select
                          value={member.isCustomDistrict ? 'custom' : member.districtId}
                          onChange={(e) => updateMember(index, 'districtId', e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                        >
                          <option value="">Tuman/shahar *</option>
                          {selectedRegion?.districts.map(d => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                          ))}
                          <option value="custom">✏️ Boshqa (qo'lda kiritish)</option>
                        </select>
                        {member.isCustomDistrict && (
                          <input
                            type="text"
                            placeholder="Tuman/shahar nomini kiriting *"
                            value={member.customDistrictName || ''}
                            onChange={(e) => updateMember(index, 'customDistrictName', e.target.value)}
                            className="w-full px-4 py-2.5 border border-amber-300 bg-amber-50 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                          />
                        )}
                      </div>
                      <input
                        type="text"
                        placeholder="Mahalla nomi"
                        value={member.mahallaName}
                        onChange={(e) => updateMember(index, 'mahallaName', e.target.value)}
                        className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {members.length < 7 && (
                <button
                  onClick={addMember}
                  className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-emerald-400 hover:text-emerald-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Yana a'zo qo'shish
                </button>
              )}
            </div>
          )}

          {/* Step 3: Project Details */}
          {step === 3 && (
            <div className="p-6 space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Loyiha ma'lumotlari</h2>
                <p className="text-gray-500">Loyihangiz haqida batafsil ma'lumot kiriting</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loyiha nomi *
                </label>
                <input
                  type="text"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="Loyihangiz nomini kiriting"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategoriya *
                </label>
                <select
                  value={projectCategory}
                  onChange={(e) => setProjectCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                >
                  <option value="">Tanlang...</option>
                  {PROJECT_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loyiha tavsifi *
                </label>
                <textarea
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="Loyihangiz haqida batafsil yozing: qanday muammoni hal qiladi, maqsadi nima, qanday natija kutilmoqda..."
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none"
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Paperclip className="w-4 h-4" />
                  Fayllar (ixtiyoriy)
                </label>
                <p className="text-sm text-gray-500 mb-3">
                  Prezentatsiya, hujjatlar yoki rasmlar yuklashingiz mumkin
                </p>
                <FileUpload
                  projectId={`public-${Date.now()}`}
                  attachments={projectAttachments}
                  onUploadComplete={(attachment) => {
                    setProjectAttachments(prev => [...prev, attachment]);
                  }}
                  onDelete={(attachmentId) => {
                    setProjectAttachments(prev => prev.filter(a => a.id !== attachmentId));
                  }}
                />
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {step === 4 && (
            <div className="p-6 space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Tasdiqlash</h2>
                <p className="text-gray-500">Ma'lumotlarni tekshiring va yuboring</p>
              </div>

              <div className="space-y-4">
                <div className="bg-blue-50 rounded-xl p-4">
                  <p className="text-xs text-blue-600 mb-1">Viloyat</p>
                  <p className="font-semibold text-blue-900">{selectedRegion?.name}</p>
                </div>

                <div className="bg-purple-50 rounded-xl p-4">
                  <p className="text-xs text-purple-600 mb-1">Jamoa</p>
                  <p className="font-semibold text-purple-900">{teamName}</p>
                  <div className="mt-2 space-y-2">
                    {members.filter(m => m.fullName).map((m, i) => (
                      <div key={i} className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded">
                        <span className="font-medium">{m.fullName}</span>
                        {m.districtName && (
                          <span className="text-purple-600 ml-1">
                            - {m.districtName}
                            {m.isCustomDistrict && (
                              <span className="text-amber-600 bg-amber-100 px-1 ml-1 rounded text-[10px]">qo'lda</span>
                            )}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-emerald-50 rounded-xl p-4">
                  <p className="text-xs text-emerald-600 mb-1">Loyiha</p>
                  <p className="font-semibold text-emerald-900">{projectTitle}</p>
                  <p className="text-sm text-emerald-700 mt-1">{projectCategory}</p>
                  <p className="text-sm text-emerald-600 mt-2 line-clamp-3">{projectDescription}</p>
                  {projectAttachments.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-emerald-200">
                      <p className="text-xs text-emerald-600 flex items-center gap-1">
                        <Paperclip className="w-3 h-3" />
                        {projectAttachments.length} ta fayl yuklangan
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-sm text-amber-800">
                  <strong>Eslatma:</strong> Loyihangiz yuborilgandan so'ng {selectedRegion?.name} viloyat yetakchisiga ko'rib chiqish uchun yuboriladi.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="p-6 bg-gray-50 border-t flex gap-3">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="flex-1 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Orqaga
              </button>
            )}
            {step < 4 ? (
              <button
                onClick={handleNext}
                className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors"
              >
                Davom etish
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-75"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Yuborilmoqda...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Yuborish
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PublicSubmitProject;
