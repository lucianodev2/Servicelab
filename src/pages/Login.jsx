import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Printer, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email.trim()) {
      setError('Por favor, informe o email.');
      return;
    }
    if (!form.password) {
      setError('Por favor, informe a senha.');
      return;
    }

    setLoading(true);
    await new Promise(r => setTimeout(r, 700));

    const ok = login(form.email.trim(), form.password, remember);

    if (ok) {
      setSuccess(true);
      setTimeout(() => navigate('/'), 900);
    } else {
      setError('Email ou senha incorretos. Tente novamente.');
    }
    setLoading(false);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #1a237e 0%, #1e88e5 50%, #7b1fa2 100%)' }}
    >
      {/* Círculos decorativos de fundo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)' }}
        />
      </div>

      <div className="w-full max-w-md relative">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Faixa superior com gradiente */}
          <div
            className="h-2 w-full"
            style={{ background: 'linear-gradient(90deg, #1e88e5 0%, #7b1fa2 100%)' }}
          />

          <div className="px-8 py-8">
            {/* Logo + título */}
            <div className="flex flex-col items-center mb-8">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
                style={{ background: 'linear-gradient(135deg, #1e88e5 0%, #7b1fa2 100%)' }}
              >
                <Printer className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Service Lab</h1>
              <p className="text-sm text-gray-500 mt-1">Acesse sua conta para continuar</p>
            </div>

            {/* Mensagem de sucesso */}
            {success && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 mb-5 text-sm animate-pulse">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                Login realizado com sucesso! Redirecionando...
              </div>
            )}

            {/* Mensagem de erro */}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-5 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={set('email')}
                  placeholder="seu@email.com"
                  autoComplete="email"
                  disabled={loading || success}
                  className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all disabled:opacity-60"
                />
              </div>

              {/* Senha */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Senha
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={set('password')}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    disabled={loading || success}
                    className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 pr-11 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword
                      ? <EyeOff className="w-4 h-4" />
                      : <Eye className="w-4 h-4" />
                    }
                  </button>
                </div>
              </div>

              {/* Lembrar + Esqueceu */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={e => setRemember(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-sm text-gray-600">Lembrar-me</span>
                </label>
                <button
                  type="button"
                  className="text-sm font-medium text-blue-600 hover:text-purple-700 transition-colors"
                >
                  Esqueceu a senha?
                </button>
              </div>

              {/* Botão entrar */}
              <button
                type="submit"
                disabled={loading || success}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                style={{ background: 'linear-gradient(135deg, #1e88e5 0%, #7b1fa2 100%)' }}
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Entrando...' : success ? 'Redirecionando...' : 'Entrar'}
              </button>
            </form>

            {/* Divisor */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400">ou</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Criar conta */}
            <p className="text-center text-sm text-gray-500">
              Não tem uma conta?{' '}
              <button className="font-semibold text-blue-600 hover:text-purple-700 transition-colors">
                Criar conta
              </button>
            </p>
          </div>
        </div>

        {/* Rodapé do card */}
        <p className="text-center text-xs text-white/50 mt-6">
          © {new Date().getFullYear()} Service Lab. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
