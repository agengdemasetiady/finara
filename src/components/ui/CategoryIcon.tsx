'use client';

import React from 'react';
import {
  Wallet,
  Coins,
  HandCoins,
  Storefront,
  Cookie,
  ForkKnife,
  House,
  Lightning,
  Bus,
  Scooter,
  Truck,
  BookOpen,
  GraduationCap,
  GameController,
  DeviceMobile,
  PiggyBank,
  Package,
  GearSix,
  Users,
  ShoppingBag,
  FirstAidKit,
  Gift,
  Coffee,
  CreditCard,
  Receipt,
  DotsThreeCircle,
} from '@phosphor-icons/react';

export const AVAILABLE_ICONS: Array<{ name: string; label: string }> = [
  { name: 'ForkKnife', label: 'Makan' },
  { name: 'Cookie', label: 'Jajan' },
  { name: 'Coffee', label: 'Minuman' },
  { name: 'House', label: 'Kos / Rumah' },
  { name: 'Lightning', label: 'Listrik & Air' },
  { name: 'Bus', label: 'Transport' },
  { name: 'Scooter', label: 'Motor' },
  { name: 'Truck', label: 'Pengiriman' },
  { name: 'Wallet', label: 'Uang Saku' },
  { name: 'Coins', label: 'Pemasukan' },
  { name: 'HandCoins', label: 'Kiriman' },
  { name: 'Storefront', label: 'Penjualan' },
  { name: 'Package', label: 'Bahan Baku' },
  { name: 'GearSix', label: 'Operasional' },
  { name: 'Users', label: 'Gaji / Upah' },
  { name: 'BookOpen', label: 'Buku & Alat Tulis' },
  { name: 'GraduationCap', label: 'Kuliah' },
  { name: 'GameController', label: 'Hiburan' },
  { name: 'DeviceMobile', label: 'Langganan' },
  { name: 'PiggyBank', label: 'Tabungan' },
  { name: 'ShoppingBag', label: 'Belanja' },
  { name: 'FirstAidKit', label: 'Kesehatan' },
  { name: 'Gift', label: 'Hadiah' },
  { name: 'Receipt', label: 'Tagihan' },
  { name: 'CreditCard', label: 'Cicilan' },
  { name: 'DotsThreeCircle', label: 'Lainnya' },
];

export const AVAILABLE_COLORS: string[] = [
  '#0B5C46',
  '#059669',
  '#2563EB',
  '#0891B2',
  '#7C3AED',
  '#DB2777',
  '#EA580C',
  '#D97706',
  '#CA8A04',
  '#4B5563',
];

export function renderPhosphorIcon(name: string | null | undefined, size = 20) {
  switch (name) {
    case 'Wallet':
      return <Wallet size={size} weight="duotone" />;
    case 'Coins':
      return <Coins size={size} weight="duotone" />;
    case 'HandCoins':
      return <HandCoins size={size} weight="duotone" />;
    case 'Storefront':
      return <Storefront size={size} weight="duotone" />;
    case 'Cookie':
      return <Cookie size={size} weight="duotone" />;
    case 'ForkKnife':
      return <ForkKnife size={size} weight="duotone" />;
    case 'Coffee':
      return <Coffee size={size} weight="duotone" />;
    case 'House':
      return <House size={size} weight="duotone" />;
    case 'Lightning':
      return <Lightning size={size} weight="duotone" />;
    case 'Bus':
      return <Bus size={size} weight="duotone" />;
    case 'Scooter':
      return <Scooter size={size} weight="duotone" />;
    case 'Truck':
      return <Truck size={size} weight="duotone" />;
    case 'BookOpen':
      return <BookOpen size={size} weight="duotone" />;
    case 'GraduationCap':
      return <GraduationCap size={size} weight="duotone" />;
    case 'GameController':
      return <GameController size={size} weight="duotone" />;
    case 'DeviceMobile':
      return <DeviceMobile size={size} weight="duotone" />;
    case 'PiggyBank':
      return <PiggyBank size={size} weight="duotone" />;
    case 'Package':
      return <Package size={size} weight="duotone" />;
    case 'GearSix':
      return <GearSix size={size} weight="duotone" />;
    case 'Users':
      return <Users size={size} weight="duotone" />;
    case 'ShoppingBag':
      return <ShoppingBag size={size} weight="duotone" />;
    case 'FirstAidKit':
      return <FirstAidKit size={size} weight="duotone" />;
    case 'Gift':
      return <Gift size={size} weight="duotone" />;
    case 'Receipt':
      return <Receipt size={size} weight="duotone" />;
    case 'CreditCard':
      return <CreditCard size={size} weight="duotone" />;
    default:
      return <DotsThreeCircle size={size} weight="duotone" />;
  }
}

export function CategoryIconChip({
  ikon,
  warna,
  size = 40,
}: {
  ikon?: string | null;
  warna?: string | null;
  size?: number;
}) {
  const bg = warna || '#0B5C46';
  return (
    <span
      className="inline-flex items-center justify-center rounded-full shrink-0"
      style={{
        width: size,
        height: size,
        backgroundColor: `${bg}1A`,
        color: bg,
      }}
      aria-hidden="true"
    >
      {renderPhosphorIcon(ikon, Math.round(size * 0.52))}
    </span>
  );
}
