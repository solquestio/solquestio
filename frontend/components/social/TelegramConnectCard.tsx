import React, { useState } from 'react';
import Script from 'next/script';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}

interface TelegramConnectCardProps {
  userId: string;
  connectedTelegram?: TelegramUser;
}

const TelegramConnectCard: React.FC<TelegramConnectCardProps> = ({ userId, connectedTelegram }) => {
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(connectedTelegram || null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTelegramAuth = async (user: TelegramUser & { hash: string }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/social/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramData: user, userId }),
      });
      const data = await response.json();
      if (data.success) {
        setTelegramUser(user);
      } else {
        setError(data.error || 'Failed to connect Telegram');
      }
    } catch (err) {
      setError('Failed to connect Telegram');
    }
    setLoading(false);
  };

  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', minWidth: 260, minHeight: 120, textAlign: 'center' }}>
      <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Telegram</h3>
      <p style={{ color: '#444', fontSize: 14, marginBottom: 16 }}>
        Connect your Telegram account to verify your profile.
      </p>
      {telegramUser ? (
        <div>
          <div style={{ fontWeight: 600, color: '#0088cc', marginBottom: 8 }}>
            Connected: @{telegramUser.username || telegramUser.first_name}
          </div>
        </div>
      ) : (
        <>
          <Script
            src="https://telegram.org/js/telegram-widget.js?7"
            strategy="lazyOnload"
          />
          <div id="telegram-login-widget" style={{ display: 'inline-block' }}></div>
          <button
            disabled={loading}
            style={{ background: '#0088cc', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 600, fontSize: 16, cursor: 'pointer', marginTop: 8 }}
            onClick={() => {
              // @ts-ignore
              window.TelegramLoginWidget = {
                dataOnauth: handleTelegramAuth,
              };
              const script = document.createElement('script');
              script.src = `https://telegram.org/js/telegram-widget.js?7`;
              script.setAttribute('data-telegram-login', process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || '');
              script.setAttribute('data-size', 'large');
              script.setAttribute('data-userpic', 'false');
              script.setAttribute('data-request-access', 'write');
              script.setAttribute('data-onauth', 'TelegramLoginWidget.dataOnauth(user)');
              document.getElementById('telegram-login-widget')?.appendChild(script);
            }}
          >
            {loading ? 'Connecting...' : 'Connect Telegram'}
          </button>
        </>
      )}
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
    </div>
  );
};

export default TelegramConnectCard; 