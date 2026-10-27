import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Bell, CircleHelp, HandHeart, LayoutDashboard, Leaf, LogOut, Menu, PackagePlus, Route, Settings2, ShieldCheck } from 'lucide-react';
import { Brand, DemoTag } from './Brand';
import { useDemo } from '../state/DemoProvider';
import { roleLabels } from '../data/demoData';
import { useAuth } from '../auth/AuthProvider';
import { ButtonLink } from './ButtonLink';

const navItems = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/donations', label: 'Find food', icon: HandHeart },
  { to: '/donations/new', label: 'List surplus', icon: PackagePlus, donorOnly: true },
  { to: '/jobs', label: 'Delivery jobs', icon: Route },
  { to: '/impact', label: 'Our impact', icon: Leaf },
  { to: '/admin', label: 'Operations', icon: ShieldCheck, adminOnly: true },
  { to: '/support', label: 'Help & support', icon: CircleHelp },
];

const titles: Record<string, string> = {
  '/dashboard': 'Good food, going places', '/donations': 'Find a good match', '/donations/new': 'List your surplus',
  '/jobs': 'Delivery board', '/impact': 'A little goes a long way', '/admin': 'Community operations',
  '/support': 'How can we help?', '/notifications': 'Your notifications', '/profile': 'Your organization',
};

export function AppLayout() {
  const { role, actor, setRole, demoActive, endDemo, notifications, remoteError, refreshRemote } = useDemo();
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const title = titles[location.pathname] ?? (location.pathname.startsWith('/tracking') ? 'Delivery tracking' : location.pathname.startsWith('/donations/') ? 'Donation details' : 'FoodLoop');
  const activeRole = demoActive ? role : user?.role ?? role;
  const person = demoActive ? actor : { name: user?.name ?? 'Member', org: user?.organizationName ?? 'FoodLoop member', initials: user?.name?.split(' ').map((n) => n[0]).slice(0, 2).join('') ?? 'FM' };

  const nav = <>
    <div className="sidebar-brand"><Brand /></div>
    <div className="workspace-label">YOUR WORKSPACE</div>
    <nav className="primary-nav" aria-label="Main navigation">
      {navItems.filter((item) => (!item.donorOnly || activeRole === 'donor') && (!item.adminOnly || activeRole === 'admin') && (item.to !== '/jobs' || ['partner', 'admin'].includes(activeRole))).map(({ to, label, icon: Icon }) => (
        <NavLink key={to} to={to} onClick={() => setMobileOpen(false)} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          <Icon size={18} strokeWidth={1.9} /><span>{label}</span>{to === '/notifications' && <span className="nav-dot" />}
        </NavLink>
      ))}
    </nav>
    <div className="sidebar-bottom">
      <div className="sidebar-impact"><span className="impact-leaf"><Leaf size={17} /></span><div><strong>Every plate matters.</strong><span>Small loops. Big change.</span></div></div>
      <NavLink className="nav-link nav-link--quiet" to="/profile"><Settings2 size={18} /><span>Settings</span></NavLink>
      {demoActive ? <button className="nav-link nav-link--quiet nav-button" onClick={endDemo}><LogOut size={18} /><span>Leave demo</span></button> : <button className="nav-link nav-link--quiet nav-button" onClick={() => void signOut()}><LogOut size={18} /><span>Sign out</span></button>}
      <div className="profile-mini"><div className="avatar avatar--dark">{person.initials}</div><div className="profile-mini-copy"><strong>{person.name}</strong><span>{person.org}</span></div><span className="online-dot" title="Available" /></div>
    </div>
  </>;

  return <div className="app-shell">
    <aside className="sidebar">{nav}</aside>
    {mobileOpen && <div className="mobile-sidebar-backdrop" onClick={() => setMobileOpen(false)}><aside className="mobile-sidebar" onClick={(event) => event.stopPropagation()}>{nav}</aside></div>}
    <div className="app-main">
      <header className="topbar">
        <button className="icon-button mobile-menu" aria-label="Open navigation" onClick={() => setMobileOpen(true)}><Menu size={20} /></button>
        <div className="topbar-title"><span className="eyebrow">TUESDAY, 27 OCTOBER</span><h1>{title}</h1></div>
        <div className="topbar-actions">
          {demoActive && <DemoTag />}
          {demoActive && <label className="role-select-wrap"><span className="sr-only">Demo role</span><select className="role-select" value={role} onChange={(event) => setRole(event.target.value as typeof role)}>{Object.entries(roleLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>}
          <NavLink to="/notifications" className="icon-button notification-button" aria-label="Notifications"><Bell size={18} /><span className="notification-count">{notifications.filter((item) => !item.read).length}</span></NavLink>
          <div className="topbar-avatar" title={person.name}>{person.initials}</div>
        </div>
      </header>
      {remoteError && !demoActive && <div className="remote-error-banner" role="alert"><span>{remoteError}</span><button onClick={() => void refreshRemote()}>Retry</button></div>}
      {!user && !demoActive && <div className="demo-banner"><span><strong>You're viewing a preview.</strong> Explore with sample data—no account needed.</span><ButtonLink to="/" className="banner-link">Enter demo <Leaf size={14} /></ButtonLink></div>}
      <main className="page-content"><Outlet /></main>
    </div>
  </div>;
}
