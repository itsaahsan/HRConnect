import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, Shield, Users, BarChart3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { loginSchema } from '../utils/validators';
import toast from 'react-hot-toast';

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: { email: string; password: string }) => {
    setLoading(true);
    try {
      await login(data.email, data.password);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      toast.success('Welcome back!');
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'manager') navigate('/manager/dashboard');
      else navigate('/employee/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#0F172A' }}>
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden flex-col justify-between p-12"
        style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1a1f4e 50%, #0F172A 100%)' }}>
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.3), transparent 70%)' }} />
          <div className="absolute bottom-20 -right-20 w-80 h-80 rounded-full opacity-15"
            style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.3), transparent 70%)' }} />
          <div className="absolute inset-0 opacity-[0.02]"
            style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-11 h-11 rounded-xl overflow-hidden shadow-lg">
              <img src="/change-management.png" alt="HRConnect" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">HRConnect</h1>
              <p className="text-blue-400/40 text-[10px] uppercase tracking-[0.2em]">Management System</p>
            </div>
          </div>

          <h2 className="text-5xl font-black text-white leading-[1.1] mb-6 tracking-tight">
            Connecting<br />
            <span className="bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">People,</span><br />
            <span className="bg-gradient-to-r from-slate-300 to-slate-200 bg-clip-text text-transparent">Powering Business</span>
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed max-w-md">
            Enterprise-grade employee management platform for modern organizations.
          </p>
        </div>

        <div className="relative z-10 space-y-4">
          {[
            { icon: Shield, title: 'Enterprise Security', desc: 'JWT auth with role-based access control' },
            { icon: Users, title: 'Employee Management', desc: 'Full CRUD with search, filter & pagination' },
            { icon: BarChart3, title: 'Real-time Analytics', desc: 'Dashboard charts and CSV exports' }
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.1)' }}>
                <item.icon className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200">{item.title}</p>
                <p className="text-xs text-slate-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel - Login */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            <div className="w-10 h-10 rounded-xl overflow-hidden">
              <img src="/change-management.png" alt="HRConnect" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-xl font-bold text-white">HRConnect</h1>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
            <p className="text-slate-500 text-sm">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                <input {...register('email')} type="email"
                  className="input-field pl-10" placeholder="you@company.com" />
              </div>
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                <input {...register('password')} type={showPassword ? 'text' : 'password'}
                  className="input-field pl-10 pr-10" placeholder="Enter your password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-600 bg-transparent text-blue-500 focus:ring-blue-500" />
                <span className="text-sm text-slate-500 group-hover:text-slate-400 transition-colors">Remember me</span>
              </label>
              <button type="button" className="text-sm text-slate-500 hover:text-blue-400 transition-colors">
                Forgot password?
              </button>
            </div>

            <button type="submit" disabled={loading}
              className="w-full btn-primary justify-center py-3 mt-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Sign In <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-8 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <p className="text-[10px] font-bold text-blue-400/60 uppercase tracking-widest mb-3">Demo Credentials</p>
            <div className="space-y-1.5">
              {[
                { role: 'Admin', email: 'admin@hrconnect.com', pass: 'Admin1234' },
                { role: 'Manager', email: 'manager@hrconnect.com', pass: 'Manager1234' },
                { role: 'Employee', email: 'employee@hrconnect.com', pass: 'Employee1234' }
              ].map(c => (
                <div key={c.role} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                  <div className="w-6 h-6 rounded flex items-center justify-center text-[9px] font-bold" style={{ background: 'rgba(59,130,246,0.1)', color: '#60A5FA' }}>
                    {c.role[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono text-slate-400 truncate">{c.email}</p>
                  </div>
                  <span className="text-[10px] font-mono text-slate-600">{c.pass}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
