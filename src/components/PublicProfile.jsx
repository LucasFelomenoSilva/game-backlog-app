// src/components/PublicProfile.jsx — Widget de perfil público compartilhável
import React, { useEffect, useState, useRef } from "react";
import {
  Share2,
  Copy,
  Check,
  ExternalLink,
  Gamepad2,
  Star,
  Trophy,
  Clock,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { toPublicGames } from "../services/gameService";
import { toast } from "react-hot-toast";

function PublicWidget({ profile, currentGame, stats, username }) {
  const siteUrl = `${window.location.origin}/u/${username}`;

  return (
    <div
      style={{
        width: "320px",
        background: "linear-gradient(135deg, #1e1e2e, #181825)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "16px",
        padding: "16px",
        fontFamily: "system-ui, sans-serif",
        color: "#cdd6f4",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "12px",
        }}
      >
        {profile?.photoBase64 || profile?.photoURL ? (
          <img
            src={profile.photoBase64 || profile.photoURL}
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              objectFit: "cover",
              border: "2px solid rgba(137,180,250,0.3)",
            }}
            alt=""
          />
        ) : (
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #89b4fa, #cba6f7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              fontWeight: "900",
              color: "white",
            }}
          >
            {profile?.displayName?.charAt(0)}
          </div>
        )}
        <div>
          <div style={{ fontWeight: 900, fontSize: "15px" }}>
            {profile?.displayName}
          </div>
          <a
            href={siteUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              fontSize: "11px",
              color: "#89b4fa",
              textDecoration: "none",
            }}
          >
            xplog.online/u/{username}
          </a>
        </div>
        <div
          style={{
            marginLeft: "auto",
            background: "rgba(137,180,250,0.1)",
            border: "1px solid rgba(137,180,250,0.2)",
            borderRadius: "8px",
            padding: "4px 8px",
            fontSize: "10px",
            fontWeight: 700,
            color: "#89b4fa",
          }}
        >
          Nível {profile?.level || 1}
        </div>
      </div>

      {currentGame && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "12px",
            padding: "10px",
            marginBottom: "12px",
          }}
        >
          <div style={{ fontSize: "18px" }}>🎮</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: "9px",
                fontWeight: 700,
                color: "#a6adc8",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: "2px",
              }}
            >
              Jogando agora
            </div>
            <div
              style={{
                fontSize: "13px",
                fontWeight: 700,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {currentGame.nome}
            </div>
            <div style={{ fontSize: "10px", color: "#6c7086" }}>
              {currentGame.platform}
            </div>
          </div>
          {(currentGame.imageUrl || currentGame.imageBase64) && (
            <img
              src={currentGame.imageUrl || currentGame.imageBase64}
              referrerPolicy="no-referrer"
              style={{
                width: "32px",
                height: "42px",
                borderRadius: "6px",
                objectFit: "cover",
                flexShrink: 0,
              }}
              alt=""
            />
          )}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "8px",
        }}
      >
        {[
          { icon: "✅", value: stats.zerados, label: "Zerados" },
          { icon: "🏆", value: stats.platinas, label: "Platinas" },
          { icon: "⭐", value: stats.avgRating, label: "Nota média" },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "10px",
              padding: "8px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "12px" }}>{s.icon}</div>
            <div style={{ fontSize: "16px", fontWeight: 900 }}>{s.value}</div>
            <div style={{ fontSize: "9px", color: "#6c7086" }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PublicProfile({ currentUser, gamesData }) {
  const { theme: V } = useTheme();
  const { t } = useLanguage();
  const [username, setUsername] = useState("");
  const [savedUsername, setSavedUsername] = useState("");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showWidget, setShowWidget] = useState(false);

  const saveTimeoutRef = useRef(null);

  // Auto-sincronização automática em segundo plano ao abrir
  useEffect(() => {
    if (!currentUser?.uid) return;
    getDoc(doc(db, "publicProfiles", currentUser.uid)).then((snap) => {
      if (snap.exists()) {
        const currentData = snap.data();
        const savedSlug = currentData.username || "";
        setSavedUsername(savedSlug);
        setUsername(savedSlug);

        // Atualiza fotos e capas automaticamente em background
        if (Array.isArray(gamesData) && gamesData.length > 0) {
          setDoc(doc(db, "publicProfiles", currentUser.uid), {
            username: savedSlug,
            displayName: currentUser.displayName || "Gamer",
            photoURL: currentUser.photoBase64 || currentUser.photoURL || currentData.photoURL || "",
            level: currentUser.level || 1,
            uid: currentUser.uid,
            gamesData: toPublicGames(gamesData),
            updatedAt: serverTimestamp(),
          }, { merge: true }).catch(() => {});
        }
      }
    });
  }, [currentUser?.uid, gamesData]);

  const stats = {
    zerados: (gamesData || []).filter((g) => g.status === "zerados").length,
    platinas: (gamesData || []).filter((g) => g.status === "zerados" && g.isPlatinum).length,
    avgRating: (() => {
      const r = (gamesData || []).filter((g) => g.status === "zerados" && g.rating > 0);
      return r.length
        ? (r.reduce((s, g) => s + parseFloat(g.rating), 0) / r.length).toFixed(1)
        : "—";
    })(),
  };

  const currentGame = (gamesData || []).find((g) => g.status === "playing" || g.status === "jogando") || null;

  const saveProfileAuto = async (slugToSave) => {
    const slug = (slugToSave || username).trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
    if (slug.length < 3 || slug === savedUsername) return;

    setSaving(true);
    try {
      const duplicateQuery = query(
        collection(db, "publicProfiles"),
        where("username", "==", slug),
      );
      const duplicateSnapshot = await getDocs(duplicateQuery);
      const belongsToAnotherUser = duplicateSnapshot.docs.some(
        (profileDoc) => profileDoc.id !== currentUser.uid,
      );

      if (belongsToAnotherUser) {
        toast.error(t('profile.username_taken'));
        return;
      }

      await setDoc(doc(db, "publicProfiles", currentUser.uid), {
        username: slug,
        displayName: currentUser.displayName || "Gamer",
        photoURL: currentUser.photoBase64 || currentUser.photoURL || "",
        level: currentUser.level || 1,
        uid: currentUser.uid,
        gamesData: toPublicGames(gamesData),
        updatedAt: serverTimestamp(),
      }, { merge: true });
      setSavedUsername(slug);
    } catch (error) {
      console.error("Erro ao salvar perfil público automaticamente:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleUsernameChange = (newVal) => {
    setUsername(newVal);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    const slug = newVal.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
    if (slug.length < 3) return;

    saveTimeoutRef.current = setTimeout(() => {
      saveProfileAuto(slug);
    }, 700);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(
      `${window.location.origin}/u/${savedUsername}`,
    );
    setCopied(true);
    toast.success(t('profile.copied'));
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="rounded-3xl overflow-hidden"
      style={{ background: V.card, border: `1px solid ${V.border}` }}
    >
      <div
        className="px-5 py-4 flex items-center gap-3"
        style={{ borderBottom: `1px solid ${V.border}` }}
      >
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: V.grad }}
        >
          <ExternalLink className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-black" style={{ color: V.text }}>
            {t('profile.public_title')}
          </p>
          <p className="text-xs" style={{ color: V.muted }}>
            {t('profile.public_subtitle')}
          </p>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div>
          <label
            className="text-xs font-bold mb-1.5 block"
            style={{ color: V.muted }}
          >
            {t('profile.your_username')}
          </label>
          <div
            className="w-full flex items-center rounded-xl overflow-hidden"
            style={{ background: V.faint, border: `1px solid ${V.border}` }}
          >
            <span
              className="pl-3 pr-1 text-xs font-bold"
              style={{ color: V.low }}
            >
              xplog.online/u/
            </span>
            <input
              value={username}
              onChange={(e) => handleUsernameChange(e.target.value)}
              placeholder="seunome"
              className="flex-1 py-2.5 pr-3 text-sm outline-none"
              style={{
                background: "transparent",
                color: V.text,
                fontSize: 14,
              }}
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between">
            {saving ? (
              <span className="text-xs font-bold text-purple-400">
                {t('profile.saving')}
              </span>
            ) : savedUsername ? (
              <span className="text-xs font-bold text-emerald-400">
                ✓ {t('profile.auto_saved')}
              </span>
            ) : null}
          </div>
        </div>

        {savedUsername && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <button
                onClick={copyLink}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all"
                style={{
                  background: V.faint,
                  border: `1px solid ${V.border}`,
                  color: V.muted,
                }}
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                {copied ? t('profile.copied') : t('profile.copy_link')}
              </button>
              <button
                onClick={() => setShowWidget((s) => !s)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all"
                style={{
                  background: showWidget ? `${V.primary}20` : V.faint,
                  border: `1px solid ${showWidget ? V.primary : V.border}`,
                  color: showWidget ? V.primary : V.muted,
                }}
              >
                <Share2 className="w-4 h-4" />
                {t('profile.view_widget')}
              </button>
            </div>

            {showWidget && (
              <div className="flex justify-center pt-2">
                <PublicWidget
                  profile={currentUser}
                  currentGame={currentGame}
                  stats={stats}
                  username={savedUsername}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
