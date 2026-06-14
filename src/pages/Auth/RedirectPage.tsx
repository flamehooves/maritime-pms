import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Anchor, CheckCircle, AlertCircle, Loader } from 'lucide-react';

export function RedirectPage() {
  const { saveToken, saveUser } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus]     = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const hash      = window.location.hash.substring(1);
    const params    = new URLSearchParams(hash);
    const accessToken = params.get('access_token');
    const apiDomain   = params.get('api_domain') ?? 'https://www.zohoapis.com';
    const error       = params.get('error');
    const errorDesc   = params.get('error_description');

    if (error) { setErrorMsg(errorDesc || error); setStatus('error'); return; }

    const token = accessToken ?? new URLSearchParams(window.location.search).get('access_token');
    if (!token) { setErrorMsg('No access token received. Please try again.'); setStatus('error'); return; }

    saveToken(token, apiDomain);

    // Fetch current Zoho CRM user
    fetch(`${apiDomain}/crm/v3/users?type=CurrentUser`, {
      headers: { Authorization: `Zoho-oauthtoken ${token}` },
    })
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(data => {
        const raw = data?.users?.[0] ?? {};
        saveUser({
          id:          String(raw.id ?? ''),
          full_name:   raw.full_name ?? raw.name ?? 'User',
          email:       raw.email ?? '',
          role:        raw.role?.name ?? '',
          profile:     raw.profile?.name ?? '',
          profile_pic: raw.profile_pic ?? '',
          ...raw,
        });
      })
      .catch(() => {/* non-fatal */})
      .finally(() => {
        setStatus('success');
        setTimeout(() => navigate('/', { replace: true }), 1200);
      });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #1e3a5f 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div style={{
        width: '100%', maxWidth: 380,
        background: 'rgba(255,255,255,0.08)',
        backdropFilter: 'blur(32px) saturate(180%)',
        WebkitBackdropFilter: 'blur(32px) saturate(180%)',
        borderRadius: 24, border: '1px solid rgba(255,255,255,0.15)',
        boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
        padding: '48px 36px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
      }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg,#4f46e6,#3730a3)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(79,70,230,0.5)', marginBottom: 24 }}>
          <Anchor size={24} color="#fff" strokeWidth={2} />
        </div>

        {status === 'loading' && (
          <>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <Loader size={32} color="rgba(255,255,255,0.6)" style={{ animation: 'spin 1s linear infinite', marginBottom: 16 }} />
            <p style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Signing you in…</p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>Verifying your Zoho credentials</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle size={40} color="#34d399" style={{ marginBottom: 16 }} />
            <p style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Login successful!</p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>Redirecting to PalLite…</p>
          </>
        )}

        {status === 'error' && (
          <>
            <AlertCircle size={40} color="#f87171" style={{ marginBottom: 16 }} />
            <p style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Login failed</p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 24, lineHeight: 1.6 }}>{errorMsg}</p>
            <button
              onClick={() => window.location.href = '/maritime-pms/login'}
              style={{ padding: '10px 24px', borderRadius: 12, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#4f46e6,#3730a3)', color: '#fff', fontSize: 13, fontWeight: 600 }}
            >Try Again</button>
          </>
        )}
      </div>
    </div>
  );
}
