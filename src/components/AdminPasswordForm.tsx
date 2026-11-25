'use client';

import React, { useState } from 'react';

export default function AdminPasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'err', text: 'Les deux nouveaux mots de passe ne correspondent pas.' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: 'err', text: data.error || 'Échec de la modification.' });
      } else {
        setMessage({ type: 'ok', text: data.message || 'Mot de passe modifié.' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch {
      setMessage({ type: 'err', text: 'Erreur réseau lors de la modification.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 max-w-md p-4 rounded-lg border border-zinc-800 bg-zinc-900">
      <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-200">
        Changer le mot de passe admin
      </h3>

      <input
        type="password"
        placeholder="Mot de passe actuel"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        required
        className="w-full px-3 py-2 rounded bg-zinc-950 border border-zinc-700 text-white text-sm"
      />

      <input
        type="password"
        placeholder="Nouveau mot de passe (min. 6 caractères)"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        required
        className="w-full px-3 py-2 rounded bg-zinc-950 border border-zinc-700 text-white text-sm"
      />

      <input
        type="password"
        placeholder="Confirmer le nouveau mot de passe"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
        className="w-full px-3 py-2 rounded bg-zinc-950 border border-zinc-700 text-white text-sm"
      />

      {message && (
        <p className={`text-xs ${message.type === 'ok' ? 'text-emerald-400' : 'text-red-400'}`}>
          {message.text}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 rounded bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white text-sm font-semibold"
      >
        {loading ? 'Enregistrement...' : 'Mettre à jour le mot de passe'}
      </button>
    </form>
  );
}
