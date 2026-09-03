// src/features/auth/LoginScreen.jsx
import React, { useState } from 'react';
import { ArrowRight, BarChart3, Check, Gamepad2, Layers3, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LegalModal from '../../components/LegalModal';

const FEATURES = [
  { icon: Layers3, title: 'Backlog organizado', text: 'Tudo que você quer jogar, sem perder o contexto.' },
  { icon: BarChart3, title: 'Progresso visível', text: 'Metas, histórico e estatísticas em um só lugar.' },
  { icon: Sparkles, title: 'Escolhas mais fáceis', text: 'Sugestões inteligentes para decidir o próximo jogo.' },
];

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [legalModal, setLegalModal] = useState(null);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#08060f] text-white">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute left-[-12rem] top-[-10rem] h-[30rem] w-[30rem] rounded-full bg-violet-600/20 blur-[120px]" />
        <div className="absolute bottom-[-16rem] right-[-10rem] h-[38rem] w-[38rem] rounded-full bg-indigo-500/15 blur-[140px]" />
        <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.7) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-6 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-violet-400/30 bg-violet-500/15 shadow-lg shadow-violet-950/40">
              <Gamepad2 className="h-6 w-6 text-violet-300" />
            </div>
            <div>
              <p className="text-lg font-black tracking-tight">XpLog</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-violet-300/70">Game backlog</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 text-xs text-slate-400 sm:flex">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            Seus dados sincronizados com segurança
          </div>
        </header>

        <section className="grid flex-1 items-center gap-12 py-14 lg:grid-cols-[1.08fr_.92fr] lg:py-20">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1.5 text-xs font-bold text-violet-200">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-300 shadow-[0_0_10px_#c4b5fd]" />
              Sua próxima aventura começa aqui
            </div>
            <h1 className="text-4xl font-black leading-[1.05] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
              Menos tempo escolhendo.{' '}
              <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-indigo-300 bg-clip-text text-transparent">Mais tempo jogando.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-400 sm:text-lg">
              Organize sua coleção, acompanhe conquistas e encontre o jogo certo para cada momento — sem transformar diversão em planilha.
            </p>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-300">
              {['Backlog em um só lugar', 'Estatísticas automáticas', 'Sugestões personalizadas'].map(item => (
                <span key={item} className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400/15"><Check className="h-3 w-3 text-emerald-300" /></span>
                  {item}
                </span>
              ))}
            </div>

            <button
              onClick={signIn}
              className="group mt-10 flex w-full items-center justify-center gap-3 rounded-2xl bg-white px-6 py-4 font-black text-slate-950 shadow-2xl shadow-violet-950/50 transition hover:-translate-y-0.5 hover:bg-violet-50 sm:w-auto"
            >
              <span className="grid h-6 w-6 place-items-center rounded-full bg-white text-sm font-black text-blue-600 shadow ring-1 ring-slate-200" aria-hidden="true">G</span>
              Continuar com Google
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <p className="mt-3 text-xs text-slate-600">Login rápido. Nada de senha extra para lembrar.</p>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-violet-500/20 to-indigo-500/5 blur-2xl" aria-hidden="true" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-7">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-300/70">Seu painel</p>
                  <p className="mt-1 text-xl font-black">Tudo sob controle</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-slate-400">24 jogos</div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                {[['Jogando', '3', 'bg-violet-400'], ['Na fila', '14', 'bg-fuchsia-400'], ['Zerados', '7', 'bg-emerald-400']].map(([label, value, color]) => (
                  <div key={label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className={`mb-3 h-1.5 w-8 rounded-full ${color}`} />
                    <p className="text-2xl font-black">{value}</p>
                    <p className="text-xs text-slate-500">{label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 space-y-3">
                {FEATURES.map(({ icon: Icon, title, text }) => (
                  <div key={title} className="flex items-start gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-400/10 text-violet-300"><Icon className="h-5 w-5" /></div>
                    <div>
                      <p className="text-sm font-bold text-slate-100">{title}</p>
                      <p className="mt-0.5 text-xs leading-5 text-slate-500">{text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Footer com Termos e Privacidade */}
        <footer className="mt-auto border-t border-white/5 py-6 text-center sm:text-left flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} XpLog. Todos os direitos reservados.
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setLegalModal('terms')}
              className="hover:text-slate-300 transition-colors underline"
            >
              Termos de Uso
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => setLegalModal('privacy')}
              className="hover:text-slate-300 transition-colors underline"
            >
              Política de Privacidade
            </button>
          </div>
        </footer>
      </div>

      {legalModal && (
        <LegalModal initialTab={legalModal} onClose={() => setLegalModal(null)} />
      )}
    </main>
  );
}
