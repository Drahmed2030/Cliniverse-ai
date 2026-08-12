"use client";

import { useEffect, useState } from "react";

/**
 * Global Settings sheet — render from page.tsx root only.
 * Do NOT embed inside LifeScreen / tab components.
 *
 * Path: app/components/SettingsSheet.tsx
 * No template literals in styles.
 * No backdropFilter.
 * Plain white surface until structure is stable.
 */

const T = {
  teal: "#0D9488",
  tealD: "#0F766E",
  white: "#FFFFFF",
  bg: "#F8FAFC",
  text: "#0F172A",
  sub: "#475569",
  muted: "#94A3B8",
  border: "#E2E8F0",
  red: "#DC2626",
  amber: "#F59E0B",
};

// Existing app keys — do not invent new ones
const KEY_NAME = "cliniverse_user_name";
const KEY_ONBOARDING = "onboarding_completed";
const KEY_USER_TYPE = "afia_user_type";
const KEY_AUTH = "auth_completed";
const KEY_THEME = "cliniverse_theme"; // optional; safe additive for appearance only

interface Props {
  open: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  /** Optional: parent can react after sign-out before reload */
  onSignOut?: () => void;
  isPro?: boolean;
}

export default function SettingsSheet({
  open,
  onClose,
  onUpgrade,
  onSignOut,
  isPro,
}: Props) {
  const [name, setName] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [savedMsg, setSavedMsg] = useState("");

  useEffect(
    function () {
      if (!open) return;
      try {
        var n = localStorage.getItem(KEY_NAME) || "";
        setName(n);
        var th = localStorage.getItem(KEY_THEME);
        if (th === "dark" || th === "light") {
          setTheme(th);
          applyTheme(th);
        } else {
          var prefersDark =
            typeof window !== "undefined" &&
            window.matchMedia &&
            window.matchMedia("(prefers-color-scheme: dark)").matches;
          setTheme(prefersDark ? "dark" : "light");
        }
      } catch (e) {}
      setSavedMsg("");
    },
    [open]
  );

  if (!open) return null;

  function applyTheme(mode: "light" | "dark") {
    try {
      var root = document.documentElement;
      if (mode === "dark") {
        root.classList.add("dark");
        root.setAttribute("data-theme", "dark");
        document.body.style.background = "#0B1220";
        document.body.style.color = "#F8FAFC";
      } else {
        root.classList.remove("dark");
        root.setAttribute("data-theme", "light");
        document.body.style.background = "";
        document.body.style.color = "";
      }
      localStorage.setItem(KEY_THEME, mode);
    } catch (e) {}
  }

  function toggleTheme() {
    var next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
    setSavedMsg(next === "dark" ? "Dark mode on" : "Light mode on");
  }

  function saveName() {
    var v = (name || "").trim();
    try {
      if (v) localStorage.setItem(KEY_NAME, v);
      else localStorage.removeItem(KEY_NAME);
      setSavedMsg("Name saved");
    } catch (e) {
      setSavedMsg("Could not save name");
    }
  }

  function resetProgress() {
    var ok = window.confirm(
      "Reset onboarding and local progress? You will return to the start flow."
    );
    if (!ok) return;
    try {
      // Clear known keys only — safer than localStorage.clear()
      localStorage.removeItem(KEY_ONBOARDING);
      localStorage.removeItem(KEY_USER_TYPE);
      localStorage.removeItem(KEY_AUTH);
      localStorage.removeItem(KEY_NAME);
      // keep theme preference
    } catch (e) {}
    window.location.reload();
  }

  function signOut() {
    var ok = window.confirm("Sign out and clear auth state?");
    if (!ok) return;
    try {
      localStorage.removeItem(KEY_AUTH);
      // keep onboarding so user is not forced through all slides again
    } catch (e) {}
    if (onSignOut) onSignOut();
    window.location.reload();
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 120,
        background: "rgba(15,23,42,0.45)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
    >
      <div
        onClick={function (e) {
          e.stopPropagation();
        }}
        style={{
          width: "100%",
          maxWidth: 480,
          maxHeight: "88dvh",
          overflowY: "auto",
          background: T.white,
          borderRadius: "24px 24px 0 0",
          padding: "12px 18px 28px",
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 4, marginBottom: 8 }}>
          <div
            style={{
              width: 40,
              height: 4,
              borderRadius: 99,
              background: T.border,
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 800, color: T.text }}>Settings</div>
          <button
            onClick={onClose}
            style={{
              border: "1px solid " + T.border,
              background: T.bg,
              borderRadius: 99,
              padding: "8px 12px",
              fontSize: 12,
              fontWeight: 700,
              color: T.sub,
            }}
          >
            Close
          </button>
        </div>

        {savedMsg ? (
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: T.tealD,
              marginBottom: 12,
            }}
          >
            {savedMsg}
          </div>
        ) : null}

        {/* Profile name */}
        <Section title="Profile">
          <div style={{ fontSize: 12, color: T.muted, marginBottom: 6 }}>Display name</div>
          <input
            value={name}
            onChange={function (e) {
              setName(e.target.value);
            }}
            placeholder="Your name"
            style={{
              width: "100%",
              boxSizing: "border-box",
              border: "1px solid " + T.border,
              borderRadius: 12,
              padding: "12px 12px",
              fontSize: 14,
              color: T.text,
              background: T.bg,
              outline: "none",
              marginBottom: 8,
            }}
          />
          <RowButton label="Save name" onClick={saveName} />
        </Section>

        {/* Appearance */}
        <Section title="Appearance">
          <RowButton
            label={theme === "dark" ? "Switch to Light mode" : "Switch to Dark mode"}
            onClick={toggleTheme}
          />
        </Section>

        {/* Subscription */}
        <Section title="Subscription">
          {isPro ? (
            <div
              style={{
                border: "1px solid " + T.border,
                borderRadius: 14,
                padding: "12px 14px",
                fontSize: 13,
                fontWeight: 700,
                color: T.tealD,
                background: "rgba(13,148,136,0.08)",
              }}
            >
              PRO active
            </div>
          ) : (
            <RowButton label="Upgrade to PRO" onClick={onUpgrade} primary />
          )}
        </Section>

        {/* Data */}
        <Section title="Data">
          <RowButton label="Reset progress" onClick={resetProgress} danger />
          <div style={{ height: 8 }} />
          <RowButton label="Sign out" onClick={signOut} />
        </Section>

        <div
          style={{
            marginTop: 18,
            fontSize: 11,
            color: T.muted,
            textAlign: "center",
            lineHeight: 1.4,
          }}
        >
          Cliniverse · Practice safely · No real patient data
        </div>
      </div>
    </div>
  );
}

function Section(props: { title: string; children: any }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 800,
          color: T.muted,
          letterSpacing: 0.6,
          textTransform: "uppercase",
          marginBottom: 8,
        }}
      >
        {props.title}
      </div>
      {props.children}
    </div>
  );
}

function RowButton(props: {
  label: string;
  onClick: () => void;
  primary?: boolean;
  danger?: boolean;
}) {
  var bg = T.bg;
  var color = T.text;
  var border = "1px solid " + T.border;
  if (props.primary) {
    bg = T.tealD;
    color = T.white;
    border = "none";
  }
  if (props.danger) {
    bg = "#FEF2F2";
    color = T.red;
    border = "1px solid #FECACA";
  }
  return (
    <button
      onClick={props.onClick}
      style={{
        width: "100%",
        textAlign: "left",
        border: border,
        background: bg,
        color: color,
        borderRadius: 14,
        padding: "13px 14px",
        fontSize: 14,
        fontWeight: 700,
      }}
    >
      {props.label}
    </button>
  );
}
