import { ArrowUpRight, Check, Clock3, PackageCheck, Route, Sparkles } from 'lucide-react';
import type { DonationStatus } from '../../shared/types';

export function Brand({ small = false }: { small?: boolean }) {
  return <span className={`brand-lockup${small ? ' brand-lockup--small' : ''}`}>
    <img src="/brand-mark.svg" alt="" className="brand-symbol" />
    <span>food<span>loop</span></span>
  </span>;
}

const statusCopy: Record<DonationStatus, { label: string; icon: typeof Check }> = {
  listed: { label: 'Listed', icon: Clock3 },
  matched: { label: 'Matched', icon: Check },
  partner_assigned: { label: 'Partner assigned', icon: Route },
  picked_up: { label: 'Picked up', icon: PackageCheck },
  delivered: { label: 'Delivered', icon: Check },
  declined: { label: 'Passed on', icon: ArrowUpRight },
};

export function StatusBadge({ status }: { status: DonationStatus }) {
  const item = statusCopy[status];
  const Icon = item.icon;
  return <span className={`status-badge status-${status}`}><Icon size={13} strokeWidth={2.4} />{item.label}</span>;
}

export function DemoTag({ children = 'DEMO MODE' }: { children?: string }) {
  return <span className="demo-tag"><Sparkles size={12} />{children}</span>;
}
