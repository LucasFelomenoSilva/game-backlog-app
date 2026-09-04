// src/components/LegalModal.jsx
import React, { useState } from 'react';
import { X, ShieldCheck, FileText, Lock, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export default function LegalModal({ initialTab = 'terms', onClose }) {
  const { theme: V } = useTheme();
  const { language, t } = useLanguage();
  const [tab, setTab] = useState(initialTab); // 'terms' | 'privacy'

  return (
    <div
      className="fixed inset-0 z-[400] flex items-center justify-center p-3 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)' }}
    >
      <div
        className="w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        style={{
          background: V.card,
          border: `1px solid ${V.border}`,
          boxShadow: `0 0 60px ${V.glow}`,
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: `1px solid ${V.border}` }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: V.grad, boxShadow: `0 4px 16px ${V.glow}` }}
            >
              {tab === 'terms' ? (
                <FileText className="w-5 h-5 text-white" />
              ) : (
                <Lock className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h2 className="text-base font-black" style={{ color: V.text }}>
                {tab === 'terms' ? t('settings.terms') : t('settings.privacy')}
              </h2>
              <p className="text-xs" style={{ color: V.muted }}>
                {language === 'en' ? 'Transparency and security on XpLog' : 'Transparência e segurança no XpLog'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl transition-all hover:opacity-70"
            style={{ background: V.faint, border: `1px solid ${V.border}` }}
          >
            <X className="w-4 h-4" style={{ color: V.muted }} />
          </button>
        </div>

        {/* Tab switchers */}
        <div
          className="flex border-b px-6 pt-3 gap-3 flex-shrink-0"
          style={{ borderColor: V.border, background: V.faint }}
        >
          <button
            onClick={() => setTab('terms')}
            className="pb-3 text-sm font-bold transition-all relative"
            style={{ color: tab === 'terms' ? V.primary : V.muted }}
          >
            {t('settings.terms')}
            {tab === 'terms' && (
              <div
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                style={{ background: V.primary }}
              />
            )}
          </button>
          <button
            onClick={() => setTab('privacy')}
            className="pb-3 text-sm font-bold transition-all relative"
            style={{ color: tab === 'privacy' ? V.primary : V.muted }}
          >
            {t('settings.privacy')}
            {tab === 'privacy' && (
              <div
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                style={{ background: V.primary }}
              />
            )}
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm leading-relaxed" style={{ color: V.soft }}>
          {tab === 'terms' ? (
            <div className="space-y-4">
              <div
                className="p-4 rounded-2xl flex items-start gap-3"
                style={{ background: `${V.primary}15`, border: `1px solid ${V.primary}35` }}
              >
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: V.primary }} />
                <p className="text-xs" style={{ color: V.text }}>
                  Bem-vindo ao <strong>XpLog</strong> (xplog.online). Ao utilizar nosso aplicativo, você concorda com os presentes Termos de Uso.
                </p>
              </div>

              <div>
                <h3 className="text-base font-bold mb-1" style={{ color: V.text }}>
                  1. Objeto do Serviço
                </h3>
                <p>
                  O XpLog é uma plataforma voltada para organização, catalogação pessoal de jogos, histórico de partidas, estimativas de tempo de jogo e interação social entre jogadores.
                </p>
              </div>

              <div>
                <h3 className="text-base font-bold mb-1" style={{ color: V.text }}>
                  2. Cadastro e Acesso
                </h3>
                <p>
                  O acesso às funções completas requer login seguro via autenticação Google Firebase. Você é responsável por manter a confidencialidade de sua conta e por todas as atividades nela realizadas.
                </p>
              </div>

              <div>
                <h3 className="text-base font-bold mb-1" style={{ color: V.text }}>
                  3. Catálogo de Jogos e Direitos de Terceiros
                </h3>
                <p>
                  Metadados, capas e descrições de jogos são consultados a partir da API pública do IGDB (propriedade da Twitch Interactive, Inc. / Amazon). As marcas, nomes e imagens de jogos pertencem aos seus respectivos desenvolvedores e publicadoras. O XpLog não reivindica propriedade intelectual sobre os ativos de terceiros.
                </p>
              </div>

              <div>
                <h3 className="text-base font-bold mb-1" style={{ color: V.text }}>
                  4. Conduta do Usuário
                </h3>
                <p>
                  É vedado o uso da plataforma para disseminação de discurso de ódio, assédio nos recursos sociais/chat, tentativas de sobrecarga da API ou violação da integridade de dados de outros usuários.
                </p>
              </div>

              <div>
                <h3 className="text-base font-bold mb-1" style={{ color: V.text }}>
                  5. Disponibilidade e Alterações
                </h3>
                <p>
                  O serviço é mantido continuamente na nuvem, mas poderá sofrer manutenções preventivas ou evoluções nas regras de negócio. Atualizações nos termos serão publicadas nesta página.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div
                className="p-4 rounded-2xl flex items-start gap-3"
                style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)' }}
              >
                <ShieldCheck className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-400" />
                <p className="text-xs" style={{ color: V.text }}>
                  Sua privacidade é prioridade absoluta. O XpLog cumpre integralmente as diretrizes da <strong>LGPD (Lei Geral de Proteção de Dados - Lei nº 13.709/2018)</strong>.
                </p>
              </div>

              <div>
                <h3 className="text-base font-bold mb-1" style={{ color: V.text }}>
                  1. Dados que Coletamos
                </h3>
                <ul className="list-disc pl-5 space-y-1 text-xs">
                  <li><strong>Identificação Básica:</strong> Nome, foto de perfil pública e e-mail fornecidos pelo provedor Google na autenticação.</li>
                  <li><strong>Dados de Uso e Jogos:</strong> Títulos adicionados ao seu backlog, status (jogando, na fila, instalados, zerados), notas, histórico e tempo de jogo.</li>
                  <li><strong>Perfil Público (Opcional):</strong> Caso escolha criar um username público (`/u/username`), apenas as capas, títulos e estatísticas públicas serão visíveis para visitantes.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-base font-bold mb-1" style={{ color: V.text }}>
                  2. Como Utilizamos seus Dados
                </h3>
                <p>
                  Seus dados são utilizados exclusivamente para sincronizar seu backlog em tempo real entre seus dispositivos e permitir o funcionamento dos recursos que você ativar. <strong>Nunca vendemos, alugamos ou comercializamos seus dados com terceiros ou anunciantes.</strong>
                </p>
              </div>

              <div>
                <h3 className="text-base font-bold mb-1" style={{ color: V.text }}>
                  3. Armazenamento Seguro
                </h3>
                <p>
                  Suas informações são armazenadas nos servidores de alta segurança do Google Cloud Firestore, com criptografia HTTPS/TLS em trânsito e controle estrito de permissões por usuário (Security Rules).
                </p>
              </div>

              <div>
                <h3 className="text-base font-bold mb-1" style={{ color: V.text }}>
                  4. Seus Direitos (LGPD)
                </h3>
                <p>
                  Você tem direito a solicitar acesso aos seus dados, correção de inconsistências ou a exclusão definitiva de sua conta e todos os jogos vinculados a qualquer momento através do aplicativo.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="p-4 flex items-center justify-between flex-shrink-0 border-t"
          style={{ borderColor: V.border, background: V.card }}
        >
          <span className="text-[11px]" style={{ color: V.muted }}>
            XpLog © 2026 · xplog.online
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-opacity hover:opacity-90"
            style={{ background: V.grad }}
          >
            {t('action.close')}
          </button>
        </div>
      </div>
    </div>
  );
}
