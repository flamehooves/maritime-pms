import React from 'react';
import { Anchor, Shield, Globe, Wrench } from 'lucide-react';

// ── Zoho OAuth config ─────────────────────────────────────────────────────
const ZOHO_CLIENT_ID = '1000.S6PUMKDAQZBBI6IN0OUF9HOGY8UWKV';
const ZOHO_SCOPE     = 'ZohoCRM.modules.ALL,ZohoCRM.settings.ALL,ZohoCRM.users.READ';
const ZOHO_AUTH_URL  = 'https://accounts.zoho.in/oauth/v2/auth';

function getRedirectUri(): string {
  const { protocol, hostname, port } = window.location;
  const base = `${protocol}//${hostname}${port ? `:${port}` : ''}`;
  // On GitHub Pages the app lives under /maritime-pms/, locally at root
  const path = hostname === 'flamehooves.github.io' ? '/maritime-pms/redirect' : '/maritime-pms/redirect';
  return `${base}${path}`;
}

function buildZohoLoginUrl(): string {
  const params = new URLSearchParams({
    response_type: 'token',
    client_id:     ZOHO_CLIENT_ID,
    scope:         ZOHO_SCOPE,
    redirect_uri:  getRedirectUri(),
    access_type:   'office',
  });
  return `${ZOHO_AUTH_URL}?${params.toString()}`;
}

export function LoginPage() {
  const handleLogin = () => {
    window.location.href = buildZohoLoginUrl();
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #1e3a5f 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background decorative blobs */}
      <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'rgba(79,70,230,0.15)', filter: 'blur(80px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-15%', left: '-5%', width: 600, height: 600, borderRadius: '50%', background: 'rgba(99,102,241,0.12)', filter: 'blur(100px)', pointerEvents: 'none' }} />

      {/* Card */}
      <div style={{
        width: '100%',
        maxWidth: 420,
        background: 'rgba(255,255,255,0.07)',
        backdropFilter: 'blur(32px) saturate(180%)',
        WebkitBackdropFilter: 'blur(32px) saturate(180%)',
        borderRadius: 28,
        border: '1px solid rgba(255,255,255,0.15)',
        boxShadow: '0 24px 80px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
        padding: '48px 40px 40px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0,
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Logo */}
        <div style={{
          width: 64, height: 64, borderRadius: 18,
          background: 'linear-gradient(135deg, #4f46e6 0%, #3730a3 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(79,70,230,0.5), inset 0 1px 0 rgba(255,255,255,0.25)',
          marginBottom: 20,
        }}>
          <Anchor size={28} color="#fff" strokeWidth={2} />
        </div>

        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', marginBottom: 8, textAlign: 'center' }}>
          PalLite
        </h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginBottom: 36, lineHeight: 1.5 }}>
          Planned Maintenance System<br />Sign in with your Zoho account to continue
        </p>

        {/* Feature pills */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 36 }}>
          {[
            { icon: Shield, label: 'Secure OAuth' },
            { icon: Globe,  label: 'Fleet-wide' },
            { icon: Wrench, label: 'Maintenance' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '5px 12px', borderRadius: 20,
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 500,
            }}>
              <Icon size={12} />
              {label}
            </div>
          ))}
        </div>

        {/* Zoho Login Button */}
        <button
          onClick={handleLogin}
          style={{
            width: '100%',
            padding: '14px 24px',
            borderRadius: 14,
            border: 'none',
            cursor: 'pointer',
            background: 'linear-gradient(135deg, #4f46e6 0%, #3730a3 100%)',
            color: '#fff',
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: '-0.2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            boxShadow: '0 4px 20px rgba(79,70,230,0.5), inset 0 1px 0 rgba(255,255,255,0.2)',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
            (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 30px rgba(79,70,230,0.6), inset 0 1px 0 rgba(255,255,255,0.2)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
            (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(79,70,230,0.5), inset 0 1px 0 rgba(255,255,255,0.2)';
          }}
        >
          {/* Zoho Z logo */}
          <span style={{
            width: 22, height: 22, borderRadius: 6,
            background: 'rgba(255,255,255,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 900, letterSpacing: '-1px',
          }}>Z</span>
          Continue with Zoho
        </button>

        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 20, textAlign: 'center', lineHeight: 1.6 }}>
          By signing in you agree to your organisation's<br />
          access policies. Session expires after 1 hour.
        </p>
      </div>
    </div>
  );
}
