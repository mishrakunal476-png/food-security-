import { ArrowRight, ArrowUpRight, Clock3, Leaf, PackageCheck, Plus, RefreshCcw, ShieldAlert, Sparkles, Truck, Utensils } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button, ButtonLink } from '../components/ButtonLink';
import { MapPanel } from '../components/MapPanel';
import { StatusBadge, DemoTag } from '../components/Brand';
import { useDemo } from '../state/DemoProvider';
import { impactTotals, isExpiryUrgent } from '../services/workflow';
import { roleLabels } from '../data/demoData';

const greetings: Record<string, { lead: string; body: string; action: string }> = {
  donor: { lead: 'Make today’s extras count.', body: 'Your kitchen can turn a good meal into a good evening.', action: 'List surplus food' },
  ngo: { lead: 'Find a match that fits.', body: 'Fresh nearby donations, with the details you need to decide.', action: 'Browse donations' },
  partner: { lead: 'Keep a good route moving.', body: 'Clear pickups, short hops and confirmed handoffs.', action: 'Open delivery jobs' },
  admin: { lead: 'Keep every handoff on track.', body: 'A calm view of open listings, deliveries and the next exception.', action: 'View operations' },
};

export function DashboardPage() {
  const { role, actor, donations, demoActive, simulateFailure, confirmReassignment } = useDemo();
  const stats = impactTotals(donations);
  const assigned = donations.find((item) => item.id === 'FL-2418') ?? donations.find((item) => item.status === 'partner_assigned');
  const urgent = donations.filter((item) => ['listed', 'matched', 'partner_assigned'].includes(item.status) && isExpiryUrgent(item));
  const current = greetings[role];
  const activeCount = donations.filter((item) => ['matched', 'partner_assigned', 'picked_up'].includes(item.status)).length;
  const listingTarget = role === 'ngo' ? '/donations' : role === 'partner' ? '/jobs' : role === 'admin' ? '/admin' : '/donations/new';
  const nextAction = role === 'ngo' ? 'Browse donations' : role === 'partner' ? 'Open delivery jobs' : role === 'admin' ? 'View operations' : 'List surplus food';

  return <div className="dashboard-page">
    <section className="dashboard-hero"><div className="dashboard-hero-copy"><div className="eyebrow eyebrow--cream"><span className="pulse-dot pulse-dot--lime" /> YOUR LOOP IS MOVING <span className="hero-live-line" /></div><h2>{current.lead}</h2><p>{current.body}</p><div className="hero-cta-row"><ButtonLink to={listingTarget} className="button button--lime">{nextAction} <ArrowRight size={16} /></ButtonLink><Link to="/impact" className="hero-text-link">See today’s impact <ArrowUpRight size={15} /></Link></div></div><div className="dashboard-hero-art"><img src="/manus-storage/async-images/D7cTj6kzHUalwK2We09aR2/image-1.webp" alt="Fresh meals ready for a community handoff" /><div className="dashboard-art-tag"><Leaf size={14} /> GOOD FOOD, STILL IN TIME</div></div><div className="hero-cutout"><span>FOODLOOP</span><strong>01</strong></div></section>
    <div className="dashboard-meta"><span><span className="pulse-dot" /> Live demo workspace · <strong>{demoActive ? roleLabels[role] : actor.org}</strong></span><span>Updated just now <RefreshCcw size={13} /></span></div>
    <section className="stat-grid" aria-label="Community impact summary">
      <div className="stat-card stat-card--featured"><div className="stat-card-top"><span>MEALS RESCUED</span><span className="stat-icon"><Utensils size={16} /></span></div><strong>{(stats.meals + 286).toLocaleString()}</strong><div className="stat-foot"><span className="stat-trend">+12%</span><span>this week · illustrative</span><span className="sparkline"><i /><i /><i /><i /><i /><i /><i /></span></div></div>
      <div className="stat-card"><div className="stat-card-top"><span>ACTIVE HANDOFFS</span><span className="stat-icon stat-icon--sage"><Truck size={16} /></span></div><strong>{activeCount}</strong><div className="stat-foot"><span className="stat-muted-dot" />Across 3 nearby areas</div></div>
      <div className="stat-card"><div className="stat-card-top"><span>DELIVERED TODAY</span><span className="stat-icon stat-icon--peach"><PackageCheck size={16} /></span></div><strong>{stats.successful + 3}</strong><div className="stat-foot"><span className="stat-muted-dot" />Sample activity · demo</div></div>
      <div className="stat-card"><div className="stat-card-top"><span>TIME LEFT TO MATCH</span><span className="stat-icon stat-icon--yellow"><Clock3 size={16} /></span></div><strong>{urgent.length ? '01:42' : '04:18'}<small> hrs</small></strong><div className="stat-foot">Nearest use-by · estimate</div></div>
    </section>

    {urgent.length > 0 && <div className="expiry-alert"><span className="expiry-icon"><Clock3 size={17} /></span><div><strong>One listing could use a quick match.</strong><span>{urgent[0].foodName} · use-by in about 1 hr 42 min. ETA needs to stay inside that window.</span></div><Link to={`/donations/${urgent[0].id}`}>Review <ArrowRight size={14} /></Link></div>}

    <div className="dashboard-columns"><div className="dashboard-main-column"><MapPanel />
      <section className="recent-section card-surface"><div className="section-head"><div><span className="eyebrow">ON YOUR RADAR</span><h3>Recent donations</h3></div><ButtonLink to="/donations" className="text-link">View all <ArrowRight size={14} /></ButtonLink></div>
        <div className="recent-list">{donations.slice(0, 3).map((item) => <Link to={`/donations/${item.id}`} className="recent-row" key={item.id}><span className={`food-swatch food-swatch--${item.category.toLowerCase()}`}><Utensils size={17} /></span><div className="recent-copy"><strong>{item.foodName}</strong><span>{item.donorName} · {item.servings} servings</span></div><div className="recent-expiry"><span>{item.status === 'delivered' ? 'Handoff complete' : 'Use by'}</span><strong>{item.status === 'delivered' ? 'Today' : new Date(item.useBy).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</strong></div><StatusBadge status={item.status} /><ArrowRight size={15} className="recent-arrow" /></Link>)}</div>
      </section>
    </div><div className="dashboard-side-column">
      <section className="focus-card card-surface"><div className="focus-top"><span className="eyebrow">NEXT UP</span><span className="focus-urgent"><span /> PICKUP SOON</span></div><div className="focus-portion">24<span>PORTIONS</span></div><h3>Seasonal veg bowls</h3><div className="focus-meta"><span><Clock3 size={14} /> 6:15–6:45 PM</span><span><ArrowRight size={13} /> 2.4 km</span></div><div className="focus-route"><span className="route-dot route-dot--from" /><div><strong>Green Table Café</strong><span>100 Feet Road · Indiranagar</span></div></div><div className="focus-route"><span className="route-dot route-dot--to" /><div><strong>Hope Kitchen</strong><span>Domlur · receiving until 9:00 PM</span></div></div><div className="focus-footer"><span><Truck size={15} />{assigned?.partnerName ?? 'Partner to be confirmed'}</span><ButtonLink to={`/tracking/${assigned?.id ?? 'FL-2418'}`} className="button button--small button--primary">Track <ArrowRight size={14} /></ButtonLink></div></section>
      <section className="activity-card card-surface"><div className="section-head section-head--compact"><div><span className="eyebrow">THE LOOP SO FAR</span><h3>Activity</h3></div><Link to="/notifications" className="icon-button icon-button--small" aria-label="All activity"><ArrowUpRight size={15} /></Link></div><div className="activity-feed">{donations[0]?.events.slice(-3).reverse().map((item) => <div className="activity-item" key={item.id}><span className={`activity-marker activity-marker--${item.kind}`}><PackageCheck size={13} /></span><div><strong>{item.title}</strong><span>{item.detail}</span><small>{new Date(item.at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} · {demoActive ? 'demo event' : 'activity'}</small></div></div>)}</div></section>
      <section className="rescue-card"><div className="rescue-card-top"><span><Sparkles size={15} /> JUDGE-READY SCENARIO</span><DemoTag>SIMULATED</DemoTag></div><h3>What if a partner can’t make it?</h3><p>See how the loop finds a backup and keeps the original assignment in its history.</p>{assigned?.needsReassignment ? <Button onClick={() => confirmReassignment(assigned.id)} tone="secondary" className="wide-button">Confirm backup partner <ArrowRight size={15} /></Button> : <Button onClick={() => assigned && simulateFailure(assigned.id)} tone="secondary" className="wide-button" disabled={!assigned || role === 'partner'}><ShieldAlert size={15} /> Simulate delivery failure</Button>}{role === 'partner' && <small className="helper-line">Switch to donor, NGO or admin to authorize reassignment.</small>}</section>
      <Link to="/donations/new" className="quick-add"><span><Plus size={18} /></span><div><strong>Have surplus to share?</strong><small>Create a listing in under a minute.</small></div><ArrowRight size={16} /></Link>
    </div></div>
    <div className="disclaimer-line"><DemoTag>DEMO</DemoTag><span>Impact totals and map locations are illustrative sample data—not verified real-world results.</span></div>
  </div>;
}
