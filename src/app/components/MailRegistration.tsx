'use client';

import { FormEvent, useState } from 'react';

export default function MailRegistration() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp' | 'done'>('email');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  async function sendOtp(event: FormEvent) {
    event.preventDefault();
    setBusy(true); setStatus('');
    try {
      const response = await fetch('/mail/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || '送信に失敗しました。');
      setStep('otp');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : '送信に失敗しました。');
    } finally { setBusy(false); }
  }

  async function verifyOtp(event: FormEvent) {
    event.preventDefault();
    setBusy(true); setStatus('');
    try {
      const response = await fetch('/mail/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.ok) throw new Error(data.error || '認証に失敗しました。');
      setStep('done');
      setStatus(data.status === 'dup' ? 'このアドレスは既に登録されています。' : 'メール登録が完了しました！明日からお届けします。');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : '認証に失敗しました。');
    } finally { setBusy(false); }
  }

  return (
    <section className="mail-box">
      <h1>📮 はとあげメール登録</h1>
      {step === 'email' && (
        <form onSubmit={sendOtp} className="mail-form">
          <p>メールアドレスを入力してください。</p>
          <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@gmail.com" />
          <button type="submit" className="btn" disabled={busy}>{busy ? '送信中…' : '認証コードを送信'}</button>
        </form>
      )}
      {step === 'otp' && (
        <form onSubmit={verifyOtp} className="mail-form">
          <p>{email} に届いた6桁の認証コードを入力してください。</p>
          <input inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="123456" />
          <button type="submit" className="btn" disabled={busy}>{busy ? '確認中…' : '確認'}</button>
        </form>
      )}
      {step === 'done' && <p role="status">{status}</p>}
      {step !== 'done' && status && <p role="alert" className="mail-error">{status}</p>}
    </section>
  );
}
