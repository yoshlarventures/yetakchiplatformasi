import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { REGIONS } from '../data/regions';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  Users,
  BookOpen,
  CheckCircle,
  FolderKanban,
  Send,
  Eye,
  Presentation,
  Clock,
  ArrowRight,
  Lightbulb,
  Target,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const region = REGIONS.find(r => r.id === user?.regionId);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  const isAdmin = user?.role === 'admin';

  // Admin uchun instruksiyalar
  const adminInstructions = [
    {
      title: 'Bosh sahifa - Dashboard',
      icon: Eye,
      color: 'indigo',
      description: 'Barcha viloyatlar bo\'yicha umumiy statistikani ko\'ring',
      details: [
        'Jami loyihalar, jamoalar va ishtirokchilar sonini kuzating',
        'Viloyatlar bo\'yicha diagrammalarni tahlil qiling',
        'Hakatonlar holati va sanalarini tekshiring',
        'Eng faol viloyatlarni aniqlang',
      ],
    },
    {
      title: 'Viloyatlar',
      icon: MapPin,
      color: 'blue',
      description: 'Har bir viloyat haqida batafsil ma\'lumot',
      details: [
        'Viloyat yetakchilari va ularning kontaktlarini ko\'ring',
        'Viloyatdagi jamoalar va loyihalar sonini tekshiring',
        'Ajratilgan byudjetni kuzating',
      ],
    },
    {
      title: 'Loyihalar (Kuzatuv)',
      icon: FolderKanban,
      color: 'emerald',
      description: 'Barcha loyihalarni faqat ko\'rish rejimida kuzating',
      details: [
        'Loyihalar statusini kuzating (Yuborilgan, Taqdimot, Maqullangan...)',
        'Qaysi loyihaga qancha byudjet ajratilganini ko\'ring',
        'Loyiha tarixini va o\'zgarishlarni kuzating',
        'Eslatma: Admin faqat kuzatuvchi sifatida ishlaydi',
      ],
    },
    {
      title: 'Jamoalar',
      icon: Users,
      color: 'purple',
      description: 'Barcha jamoalar haqida ma\'lumot',
      details: [
        'Jamoa a\'zolari va ularning ma\'lumotlarini ko\'ring',
        'Qaysi jamoaning loyihasi borligini tekshiring',
        'Jamoalar statistikasini tahlil qiling',
      ],
    },
  ];

  // Viloyat yetakchisi uchun instruksiyalar
  const leaderInstructions = [
    {
      title: '1. Jamoalar yaratish',
      icon: Users,
      color: 'purple',
      description: 'Avval hakatonda ishtirok etadigan jamoalarni ro\'yxatdan o\'tkazing',
      details: [
        '"Jamoalar" bo\'limiga o\'ting',
        '"Yangi jamoa" tugmasini bosing',
        'Jamoa nomini kiriting',
        'Jamoa a\'zolarini qo\'shing (1-7 kishi)',
        'Har bir a\'zo uchun tuman va mahalla ma\'lumotlarini kiriting',
        'Saqlash tugmasini bosing',
      ],
    },
    {
      title: '2. Loyiha topshirish',
      icon: FolderKanban,
      color: 'emerald',
      description: 'Jamoalar uchun loyihalarni tizimga kiriting',
      details: [
        '"Jamoalar" bo\'limida jamoani tanlang',
        '"Loyiha qo\'shish" tugmasini bosing',
        'Loyiha nomini, kategoriyasini va tavsifini kiriting',
        'Saqlash tugmasini bosing',
        'Loyiha "Qoralama" statusida saqlanadi',
      ],
    },
    {
      title: '3. Ko\'rib chiqishga yuborish',
      icon: Send,
      color: 'blue',
      description: 'Loyihani rasmiy ko\'rib chiqish uchun yuboring',
      details: [
        '"Loyihalar" bo\'limiga o\'ting',
        'Qoralama statusidagi loyihani tanlang',
        '"Yuborish" tugmasini bosing',
        'Loyiha "Yuborilgan" statusiga o\'tadi',
        'Endi Admin tomonidan ko\'rib chiqiladi',
      ],
    },
    {
      title: '4. Taqdimot qilish',
      icon: Presentation,
      color: 'amber',
      description: 'Loyihani Direktorga taqdimot qiling',
      details: [
        'Admin loyihani ko\'rib chiqqandan keyin',
        'Direktorga taqdimot qilish imkoniyati paydo bo\'ladi',
        '"Taqdimot qilish" tugmasini bosing',
        'Loyiha "Taqdimot qilindi" statusiga o\'tadi',
      ],
    },
    {
      title: '5. Natijalarni kuzatish',
      icon: CheckCircle,
      color: 'green',
      description: 'Loyiha holati va byudjet ajratilishini kuzating',
      details: [
        'Direktor loyihani maqullasa - byudjet ajratiladi',
        'Rad etilsa - sababi ko\'rsatiladi',
        'Qayta ishlash kerak bo\'lsa - izohlar beriladi',
        'Maqullangan loyihalar "Jarayonda" statusiga o\'tadi',
        'Yakunlanganda "Yakunlangan" deb belgilanadi',
      ],
    },
  ];

  const instructions = isAdmin ? adminInstructions : leaderInstructions;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className={`h-20 sm:h-24 ${isAdmin ? 'bg-gradient-to-r from-indigo-500 to-purple-600' : 'bg-gradient-to-r from-emerald-500 to-teal-600'}`} />
        <div className="px-4 sm:px-6 pb-5 sm:pb-6">
          <div className="flex items-end gap-3 sm:gap-4 -mt-8 sm:-mt-10">
            <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg ${isAdmin ? 'bg-indigo-600' : 'bg-emerald-600'}`}>
              {isAdmin ? (
                <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              ) : (
                <User className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              )}
            </div>
            <div className="pb-1 sm:pb-2">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">{user?.fullName}</h1>
              <p className={`text-sm ${isAdmin ? 'text-indigo-600' : 'text-emerald-600'}`}>
                {isAdmin ? 'Administrator' : 'Viloyat Yetakchisi'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mt-5 sm:mt-6">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm font-medium text-gray-900">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <Phone className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Telefon</p>
                <p className="text-sm font-medium text-gray-900">{user?.phone}</p>
              </div>
            </div>
            {region && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Viloyat</p>
                  <p className="text-sm font-medium text-gray-900">{region.name}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isAdmin ? 'bg-indigo-100' : 'bg-emerald-100'}`}>
            <BookOpen className={`w-5 h-5 ${isAdmin ? 'text-indigo-600' : 'text-emerald-600'}`} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {isAdmin ? 'Tizimdan foydalanish yo\'riqnomasi' : 'Bosqichma-bosqich yo\'riqnoma'}
            </h2>
            <p className="text-sm text-gray-500">
              {isAdmin ? 'Admin sifatida qanday ishlash kerak' : 'Loyihalarni qanday boshqarish kerak'}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {instructions.map((step, index) => {
            const StepIcon = step.icon;
            const isExpanded = expandedStep === index;
            const colorClasses = {
              indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600', border: 'border-indigo-200' },
              blue: { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200' },
              emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600', border: 'border-emerald-200' },
              purple: { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-200' },
              amber: { bg: 'bg-amber-100', text: 'text-amber-600', border: 'border-amber-200' },
              green: { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-200' },
            };
            const colors = colorClasses[step.color as keyof typeof colorClasses];

            return (
              <div
                key={index}
                className={`border rounded-xl overflow-hidden transition-all ${isExpanded ? colors.border : 'border-gray-200'}`}
              >
                <button
                  onClick={() => setExpandedStep(isExpanded ? null : index)}
                  className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colors.bg}`}>
                    <StepIcon className={`w-5 h-5 ${colors.text}`} />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-gray-900">{step.title}</h3>
                    <p className="text-sm text-gray-500">{step.description}</p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 animate-fadeIn">
                    <div className="ml-4 sm:ml-14 space-y-2">
                      {step.details.map((detail, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <ArrowRight className={`w-4 h-4 mt-0.5 flex-shrink-0 ${colors.text}`} />
                          <p className="text-sm text-gray-600">{detail}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tips */}
      <div className={`rounded-2xl p-4 sm:p-6 ${isAdmin ? 'bg-indigo-50 border border-indigo-200' : 'bg-emerald-50 border border-emerald-200'}`}>
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isAdmin ? 'bg-indigo-200' : 'bg-emerald-200'}`}>
            <Lightbulb className={`w-5 h-5 ${isAdmin ? 'text-indigo-600' : 'text-emerald-600'}`} />
          </div>
          <div>
            <h3 className={`font-semibold mb-2 ${isAdmin ? 'text-indigo-900' : 'text-emerald-900'}`}>
              Foydali maslahatlar
            </h3>
            {isAdmin ? (
              <ul className="text-sm text-indigo-800 space-y-1">
                <li>• Dashboard orqali umumiy statistikani muntazam kuzatib boring</li>
                <li>• Viloyatlar bo'yicha taqqoslash uchun diagrammalardan foydalaning</li>
                <li>• Loyihalar tarixini ko'rib chiqish uchun loyiha kartasini bosing</li>
                <li>• Eng muvaffaqiyatli viloyatlar tajribasini boshqalarga ulashing</li>
              </ul>
            ) : (
              <ul className="text-sm text-emerald-800 space-y-1">
                <li>• Jamoalarni to'liq ma'lumotlar bilan ro'yxatdan o'tkazing</li>
                <li>• Loyiha tavsifini batafsil yozing - bu maqullash jarayoniga yordam beradi</li>
                <li>• Loyihani yuborishdan oldin barcha ma'lumotlarni tekshiring</li>
                <li>• Rad etilgan loyihalarning sabablarini o'qib, qayta ishlab yuboring</li>
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats for Leaders */}
      {!isAdmin && (
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
            <Target className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">5</p>
            <p className="text-xs text-gray-500">Bosqichlar</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
            <Clock className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">3-5</p>
            <p className="text-xs text-gray-500">Kun (ko'rib chiqish)</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">100%</p>
            <p className="text-xs text-gray-500">Shaffoflik</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
