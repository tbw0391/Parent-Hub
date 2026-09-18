import { Newspaper, BarChart3, HeartHandshake, BookOpen, CalendarDays, Users, ShieldCheck, Smartphone, Gamepad2 } from 'lucide-react';
import type { Role } from './database.types';

type NavItem = {
  href: string;
  label: string;
  icon: typeof Newspaper;
  color: string;
  minRole?: Role;
};

export const NAV: NavItem[] = [
  { href: '/articles', label: 'Articles', icon: Newspaper, color: '#e11d48' },
  { href: '/polls', label: 'Polls', icon: BarChart3, color: '#2563eb' },
  { href: '/prayer-praise', label: 'Prayer & Praise', icon: HeartHandshake, color: '#7c3aed' },
  { href: '/lessons', label: 'Lessons', icon: BookOpen, color: '#059669' },
  { href: '/schedule', label: 'Schedule', icon: CalendarDays, color: '#ea580c' },
  { href: '/parents', label: 'Parents', icon: Users, color: '#db2777' },
  { href: '/technology', label: 'Technology', icon: Smartphone, color: '#0d9488' },
  { href: '/apps', label: 'Apps', icon: Gamepad2, color: '#65a30d' },
  { href: '/admin', label: 'Admin Tools', icon: ShieldCheck, color: '#475569', minRole: 'admin' },
];

export const CHAT_COLOR = '#0891b2';
