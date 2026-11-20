'use client';

import React from 'react';
import { ubahStatusAktifAkun } from '@/lib/actions/admin';
import { useToast } from '@/components/ui/ToastProvider';
import { formatTanggal, getLabelProfil } from '@/lib/format';
import type { Akun } from '@/lib/types/database';

export function AdminPenggunaClient({ users }: { users: Akun[] }) {
  const { showToast } = useToast();

  async function handleToggle(id: string, nextAktif: boolean) {
    const res = await ubahStatusAktifAkun(id, nextAktif);
    showToast(res.message, res.ok ? 'success' : 'error');
  }

  return (
    <div className="fn-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr
              className="border-b text-xs font-semibold uppercase"
              style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--muted)' }}
            >
              <th className="py-3.5 px-4">Nama &amp; Email</th>
              <th className="py-3.5 px-4">Profil</th>
              <th className="py-3.5 px-4">Terdaftar</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {users.map((u) => (
              <tr key={u.id}>
                <td className="py-3.5 px-4">
                  <p className="font-semibold">{u.nama || '-'}</p>
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>
                    {u.email}
                  </p>
                </td>
                <td className="py-3.5 px-4 text-xs font-medium">{getLabelProfil(u.profil)}</td>
                <td className="py-3.5 px-4 text-xs" style={{ color: 'var(--muted)' }}>
                  {formatTanggal(u.dibuat_pada)}
                </td>
                <td className="py-3.5 px-4">
                  <span
                    className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{
                      backgroundColor: u.aktif
                        ? 'var(--primary-soft)'
                        : 'color-mix(in srgb, var(--danger) 12%, transparent)',
                      color: u.aktif ? 'var(--primary)' : 'var(--danger)',
                    }}
                  >
                    {u.aktif ? 'Aktif' : 'Nonaktif'}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  {u.peran === 'pengguna' && (
                    <button
                      type="button"
                      onClick={() => handleToggle(u.id, !u.aktif)}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold border cursor-pointer"
                      style={{ borderColor: 'var(--border-strong)' }}
                    >
                      {u.aktif ? 'Nonaktifkan' : 'Aktifkan'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
