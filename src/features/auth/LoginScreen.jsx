// src/features/auth/LoginScreen.jsx
import React, { useState } from 'react';
import { ArrowRight, BarChart3, Check, Gamepad2, Globe, Layers3, ShieldCheck, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import LegalModal from '../../components/LegalModal';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [legalModal, setLegalModal] = useState(null);

  const features = [
    { icon: Layers3, title: t('landing.feat1_title'), text: t('landing.feat1_desc') },
    { icon: BarChart3, title: t('landing.feat2_title'), text: t('landing.feat2_desc') },
    { icon: Sparkles, title: t('landing.feat3_title'), text: t('landing.feat3_desc') },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#08060f] text-white">
      {/* Glows de Fundo Animados */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.18, 0.28, 0.18] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute left-[-12rem] top-[-10rem] h-[30rem] w-[30rem] rounded-full bg-violet-600/25 blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute bottom-[-16rem] right-[-10rem] h-[38rem] w-[38rem] rounded-full bg-indigo-500/20 blur-[140px]"
        />
        <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.7) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-6 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-violet-400/30 bg-violet-500/15 shadow-lg shadow-violet-950/40">
              <Gamepad2 className="h-6 w-6 text-violet-300" />
            </div>
            <div>
              <p className="text-lg font-black tracking-tight">XpLog</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-violet-300/70">Game backlog</p>
            </div>
          </motion.div>

          <div className="flex items-center gap-3">
            <motion.div
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="hidden items-center gap-2 text-xs text-slate-400 sm:flex"
            >
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              {t('landing.security_badge')}
            </motion.div>

            {/* Language Selector PT / EN */}
            <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1 backdrop-blur-md">
              <Globe className="h-3.5 w-3.5 text-violet-300 ml-1.5 hidden sm:block" />
              <button
                type="button"
                onClick={() => setLanguage('pt-BR')}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                  language === 'pt-BR'
                    ? 'bg-violet-600 text-white shadow-sm shadow-violet-900/50'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Português (Brasil)"
              >
                PT
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                  language === 'en'
                    ? 'bg-violet-600 text-white shadow-sm shadow-violet-900/50'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="English"
              >
                EN
              </button>
            </div>
          </div>
        </header>

        <section className="grid flex-1 items-center gap-12 py-14 lg:grid-cols-[1.08fr_.92fr] lg:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="max-w-2xl"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1.5 text-xs font-bold text-violet-200 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-300 shadow-[0_0_10px_#c4b5fd] animate-ping" />
              {t('landing.badge')}
            </div>
            <h1 className="text-4xl font-black leading-[1.05] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
              {t('landing.headline_1')}{' '}
              <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-indigo-300 bg-clip-text text-transparent">{t('landing.headline_grad')}</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-400 sm:text-lg">
              {t('landing.subtitle')}
            </p>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-300">
              {[t('landing.bullet1'), t('landing.bullet2'), t('landing.bullet3')].map((item, i) => (
                <motion.span
                  key={item}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1, duration: 0.4 }}
                  className="flex items-center gap-2"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400/15"><Check className="h-3 w-3 text-emerald-300" /></span>
                  {item}
                </motion.span>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.025, translateY: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={signIn}
              className="group relative overflow-hidden mt-10 flex w-full items-center justify-center gap-3 rounded-2xl bg-white px-6 py-4 font-black text-slate-950 shadow-2xl shadow-violet-950/50 transition-all sm:w-auto"
            >
              {/* Efeito de brilho / Shimmer sutil no hover */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-violet-200/40 to-transparent pointer-events-none" />
              <span className="grid h-6 w-6 place-items-center rounded-full bg-white text-sm font-black text-blue-600 shadow ring-1 ring-slate-200" aria-hidden="true">G</span>
              {t('landing.continue_google')}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 text-violet-700" />
            </motion.button>
            <p className="mt-3 text-xs text-slate-500">{t('landing.login_note')}</p>
          </motion.div>

          {/* Card do Painel com Levitação Sutil e Hover Interativo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
            transition={{
              opacity: { duration: 0.7, delay: 0.2 },
              scale: { duration: 0.7, delay: 0.2 },
              y: { duration: 5.5, repeat: Infinity, ease: 'easeInOut' }
            }}
            className="relative"
          >
            <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-violet-500/25 to-indigo-500/10 blur-2xl" aria-hidden="true" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-7">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-300/70">{t('landing.panel_title')}</p>
                  <p className="mt-1 text-xl font-black">{t('landing.panel_subtitle')}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-slate-400">{t('landing.panel_games_count')}</div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                {[[t('landing.status_playing'), '3', 'bg-violet-400'], [t('landing.status_queue'), '14', 'bg-fuchsia-400'], [t('landing.status_completed'), '7', 'bg-emerald-400']].map(([label, value, color]) => (
                  <motion.div
                    key={label}
                    whileHover={{ scale: 1.04, y: -2 }}
                    className="rounded-2xl border border-white/10 bg-black/20 p-4 transition-colors hover:border-violet-400/30"
                  >
                    <div className={`mb-3 h-1.5 w-8 rounded-full ${color}`} />
                    <p className="text-2xl font-black">{value}</p>
                    <p className="text-xs text-slate-400">{label}</p>
                  </motion.div>
                ))}
              </div>

              <div className="mt-5 space-y-3">
                {features.map(({ icon: Icon, title, text }) => (
                  <motion.div
                    key={title}
                    whileHover={{ x: 4 }}
                    className="flex items-start gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4 transition-all hover:bg-white/[0.06] hover:border-violet-400/20"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-400/10 text-violet-300"><Icon className="h-5 w-5" /></div>
                    <div>
                      <p className="text-sm font-bold text-slate-100">{title}</p>
                      <p className="mt-0.5 text-xs leading-5 text-slate-400">{text}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        {/* Footer com Termos e Privacidade */}
        <footer className="mt-auto border-t border-white/5 py-6 text-center sm:text-left flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            {t('landing.copyright', { year: new Date().getFullYear() })}
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setLegalModal('terms')}
              className="hover:text-slate-300 transition-colors underline"
            >
              {t('landing.terms')}
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => setLegalModal('privacy')}
              className="hover:text-slate-300 transition-colors underline"
            >
              {t('landing.privacy')}
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
