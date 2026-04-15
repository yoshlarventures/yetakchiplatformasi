import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Users, Shield, Eye, EyeOff, Loader2, FolderKanban, ArrowRight, Sparkles } from 'lucide-react';

type LoginType = 'admin' | 'regional';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [loginType, setLoginType] = useState<LoginType | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const success = await login(email, password);
    if (success) {
      navigate(loginType === 'admin' ? '/admin' : '/dashboard');
    } else {
      setError('Email yoki parol noto\'g\'ri');
    }
  };

  const handleBack = () => {
    setLoginType(null);
    setEmail('');
    setPassword('');
    setError('');
  };

  // Login turi tanlash ekrani
  if (!loginType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="w-full max-w-lg animate-fadeIn">
          {/* Logo va sarlavha */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-2xl mb-4 shadow-lg">
              <Users className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Yoshlar Yetakchilari</h1>
            <p className="text-gray-600 mt-2">Yoshlar Ishlari Agentligi Platformasi</p>
          </div>

          {/* Loyiha qo'shish - bosh tugma */}
          <Link
            to="/submit-project"
            className="block w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-2xl p-6 mb-6 transition-all duration-300 shadow-lg hover:shadow-xl group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                  <FolderKanban className="w-7 h-7 text-white" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold">Loyiha qo'shish</h3>
                    <Sparkles className="w-4 h-4 text-yellow-300" />
                  </div>
                  <p className="text-sm text-white/80">Yangi loyiha topshirish uchun bosing</p>
                </div>
              </div>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gradient-to-br from-blue-50 via-white to-indigo-50 text-gray-500">
                yoki tizimga kiring
              </span>
            </div>
          </div>

          {/* Login turi tanlash */}
          <div className="space-y-4">
            <button
              onClick={() => setLoginType('admin')}
              className="w-full bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-indigo-400 rounded-xl p-5 transition-all duration-200 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                  <Shield className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-gray-900">Admin Panel</h3>
                  <p className="text-sm text-gray-500">Kuzatuv tizimiga kirish</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setLoginType('regional')}
              className="w-full bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-emerald-400 rounded-xl p-5 transition-all duration-200 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                  <Users className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-gray-900">Viloyat Yetakchisi</h3>
                  <p className="text-sm text-gray-500">Loyihalarni boshqarish</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Login formasi
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fadeIn">
        {/* Header */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 shadow-lg ${
            loginType === 'admin' ? 'bg-indigo-600' : 'bg-emerald-600'
          }`}>
            {loginType === 'admin' ? (
              <Shield className="w-10 h-10 text-white" />
            ) : (
              <Users className="w-10 h-10 text-white" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {loginType === 'admin' ? 'Admin Panel' : 'Viloyat Yetakchisi'}
          </h1>
          <p className="text-gray-600 mt-2">Tizimga kirish</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm border border-red-200">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="email@yoshlar.uz"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parol
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none pr-12"
                  placeholder="Parolingizni kiriting"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-xl text-white font-medium flex items-center justify-center gap-2 transition-all duration-200 ${
                loginType === 'admin'
                  ? 'bg-indigo-600 hover:bg-indigo-700'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              } ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Kirish...
                </>
              ) : (
                'Kirish'
              )}
            </button>
          </form>

          <button
            onClick={handleBack}
            className="w-full mt-4 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            Orqaga qaytish
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
