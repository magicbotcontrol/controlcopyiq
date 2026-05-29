import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  KeyRound, 
  Mail, 
  User, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  Phone,
  Send
} from 'lucide-react';
import { UserAuth, AccessLevel } from '../types';
import { ControlCopyDB } from '../lib/db';

interface AuthProps {
  onLoginSuccess: (auth: UserAuth) => void;
}

export default function Auth({ onLoginSuccess }: AuthProps) {
  const [screen, setScreen] = useState<'login' | 'register' | 'recover'>('login');
  
  // Login Form States
  const [email, setEmail] = useState('alineevangelista1994@gmail.com');
  const [password, setPassword] = useState('••••••••');
  const [accessLevel, setAccessLevel] = useState<AccessLevel>('Admin');

  // Register Form States
  const [regNome, setRegNome] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regLevel, setRegLevel] = useState<AccessLevel>('Admin');

  // Recovery Form States
  const [recEmail, setRecEmail] = useState('');

  // Status Alerts
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setAlertMsg({ type: 'error', text: 'Por favor preencha seu e-mail cadastrado.' });
      return;
    }

    // Authenticate and save
    const authData: UserAuth = {
      email,
      nome: email === 'alineevangelista1994@gmail.com' ? 'Aline Evangelista' : 'Usuário Conectado',
      level: accessLevel
    };

    ControlCopyDB.saveAuth(authData);
    ControlCopyDB.addLog('Login Realizado', `Sessão iniciada como ${authData.level}: ${authData.nome}`);
    onLoginSuccess(authData);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regNome || !regEmail) {
      setAlertMsg({ type: 'error', text: 'Preencha todos os campos obrigatórios.' });
      return;
    }

    const authData: UserAuth = {
      email: regEmail,
      nome: regNome,
      level: regLevel
    };

    ControlCopyDB.saveAuth(authData);
    ControlCopyDB.addLog('Cadastro Administrativo', `Novo operador registrado e logado: ${regNome}`);
    
    setAlertMsg({ type: 'success', text: 'Registro administrativa concluído com sucesso!' });
    setTimeout(() => {
      onLoginSuccess(authData);
    }, 1500);
  };

  const handleRecover = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recEmail) {
      setAlertMsg({ type: 'error', text: 'Preencha o e-mail de recuperação.' });
      return;
    }

    setAlertMsg({ 
      type: 'success', 
      text: `Instruções de redefinição de credenciais enviadas para ${recEmail} com sucesso!` 
    });
    
    setTimeout(() => {
      setScreen('login');
      setAlertMsg(null);
    }, 4500);
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      {/* Background soft blobs for fintech aesthetics */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-[#FF5500]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#FF5500]/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white border border-zinc-150 rounded-3xl overflow-hidden shadow-2xl p-6 md:p-8 space-y-6 relative"
      >
        {/* App Logo Header */}
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 bg-[#FF5500] text-black rounded-2xl flex items-center justify-center mx-auto font-black text-xl shadow-lg shadow-[#FF5500]/25">
            CCI
          </div>
          <h2 className="text-xl font-extrabold text-zinc-900 tracking-tight">
            Control<span className="text-[#FF5500]">Copy</span>IQ
          </h2>
          <p className="text-xs text-zinc-400 font-medium">Plataforma SaaS de Gestão de Clientes e Repasses</p>
        </div>

        {alertMsg && (
          <div className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            alertMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-red-50 text-red-800 border border-red-100'
          }`}>
            {alertMsg.type === 'success' ? <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" /> : <AlertCircle className="w-4.5 h-4.5 text-red-600" />}
            <span>{alertMsg.text}</span>
          </div>
        )}

        {/* 1. LOGIN SCREEN */}
        {screen === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4 text-xs font-semibold text-zinc-700">
            <div>
              <label className="block mb-1">E-mail Administrativo *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:border-[#FF5500]"
                  placeholder="E.g. aline@controlcopy.com"
                />
              </div>
            </div>

            <div>
              <label className="block mb-1">Senha de Acesso</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:border-[#FF5500]"
                />
              </div>
            </div>

            {/* Simulated selector of roles to easily test Admin, Operator and Financial scopes */}
            <div className="p-3 bg-zinc-50 border border-zinc-150 rounded-2xl">
              <span className="text-[10px] font-bold text-zinc-400 font-mono block uppercase tracking-wider mb-2">Simular Cargo para Testes:</span>
              <div className="grid grid-cols-3 gap-1.5">
                {(['Admin', 'Operador', 'Financeiro'] as AccessLevel[]).map(level => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setAccessLevel(level)}
                    className={`py-2 px-1 rounded-xl font-bold font-mono text-[9px] border transition-all ${
                      accessLevel === level 
                        ? 'bg-zinc-950 text-[#FF5500] border-zinc-850 shadow' 
                        : 'bg-white text-zinc-500 hover:text-zinc-800'
                    }`}
                  >
                    {level.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center text-[11px] pt-1">
              <button 
                type="button" 
                onClick={() => { setScreen('recover'); setAlertMsg(null); }}
                className="text-zinc-500 hover:text-[#FF5500] transition"
              >
                Esqueceu sua senha?
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#FF5500] hover:bg-[#FF4500] text-black rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1 shadow-md shadow-[#FF5500]/15 cursor-pointer"
            >
              Acessar Painel Control Copy
              <ArrowRight className="w-4 h-4 text-black stroke-[3px]" />
            </button>

            <div className="text-center pt-2">
              <p className="text-[11px] text-zinc-400 font-medium">
                Novo por aqui?{' '}
                <button 
                  type="button" 
                  onClick={() => { setScreen('register'); setAlertMsg(null); }}
                  className="text-zinc-950 font-bold hover:underline"
                >
                  Cadastre sua plataforma SaaS
                </button>
              </p>
            </div>
          </form>
        )}

        {/* 2. REGISTER SCREEN */}
        {screen === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4 text-xs font-semibold text-zinc-700">
            <div>
              <label className="block mb-1">Nome Completo *</label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  required
                  value={regNome}
                  onChange={(e) => setRegNome(e.target.value)}
                  placeholder="E.g. Aline Evangelista"
                  className="w-full pl-9 pr-3 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block mb-1">E-mail Corporativo *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-3.5" />
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="aline@corporativo.com"
                  className="w-full pl-9 pr-3 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block mb-1">Selecione seu Nível Operacional Inicial</label>
              <select
                value={regLevel}
                onChange={(e) => setRegLevel(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none font-sans font-bold text-zinc-700"
              >
                <option value="Admin">Admin (Acesso Total)</option>
                <option value="Operador">Operador (Apenas Banca)</option>
                <option value="Financeiro">Financeiro (Apenas Contabilidade)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-zinc-950 hover:bg-zinc-900 text-[#FF5500] rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1 shadow-md"
            >
              Criar Conta e Conectar
              <ArrowRight className="w-4 h-4 stroke-[3px]" />
            </button>

            <div className="text-center pt-2">
              <button 
                type="button" 
                onClick={() => { setScreen('login'); setAlertMsg(null); }}
                className="text-[11px] text-zinc-500 hover:text-zinc-900 font-bold"
              >
                &larr; Voltar para Login
              </button>
            </div>
          </form>
        )}

        {/* 3. RECOVER PASSWORD SCREEN */}
        {screen === 'recover' && (
          <form onSubmit={handleRecover} className="space-y-4 text-xs font-semibold text-zinc-700">
            <p className="text-xs text-zinc-400 mb-2 leading-relaxed font-normal">Digite o seu e-mail cadastrado. Nós enviaremos um link seguro para alteração imediata da sua senha administrativa.</p>
            
            <div>
              <label className="block mb-1">E-mail Cadastrado *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-3.5" />
                <input
                  type="email"
                  required
                  value={recEmail}
                  onChange={(e) => setRecEmail(e.target.value)}
                  placeholder="aline@controlcopy.com"
                  className="w-full pl-9 pr-3 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-zinc-950 hover:bg-zinc-900 text-[#FF5500] rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1 shadow-md"
            >
              Enviar Link de Redefinição
            </button>

            <div className="text-center pt-2">
              <button 
                type="button" 
                onClick={() => { setScreen('login'); setAlertMsg(null); }}
                className="text-[11px] text-zinc-500 hover:text-zinc-900 font-bold"
              >
                &larr; Voltar para Login
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
