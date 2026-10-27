import { ArrowLeft, ArrowRight, Bell, CircleHelp, HandHeart, LayoutDashboard, Leaf, MapPin, PackageCheck, PackagePlus, Route, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import type { Role } from '../../shared/types';
import { Brand } from '../components/Brand';
import { roleLabels } from '../data/demoData';
import { useDemo } from '../state/DemoProvider';

type ScreenChoice = {
  title: string;
  description: string;
  to: string;
  role: Role;
  icon: typeof LayoutDashboard;
};

const screenChoices: ScreenChoice[] = [
  { title: 'Overview dashboard', description: 'See today’s food loop and quick actions.', to: '/dashboard', role: 'donor', icon: LayoutDashboard },
  { title: 'Browse donations', description: 'Review food that needs a nearby home.', to: '/donations', role: 'ngo', icon: HandHeart },
  { title: 'List surplus food', description: 'Create a listing with safety details.', to: '/donations/new', role: 'donor', icon: PackagePlus },
  { title: 'Donation details', description: 'Inspect a sample listing and match.', to: '/donations/FL-2419', role: 'ngo', icon: PackageCheck },
  { title: 'Delivery jobs', description: 'Choose an available sample route.', to: '/jobs', role: 'partner', icon: Route },
  { title: 'Live tracking', description: 'Follow pickup through handoff.', to: '/tracking/FL-2418', role: 'partner', icon: MapPin },
  { title: 'Community impact', description: 'View estimated meals and outcomes.', to: '/impact', role: 'donor', icon: Leaf },
  { title: 'Notifications', description: 'Review activity and use-by reminders.', to: '/notifications', role: 'donor', icon: Bell },
  { title: 'Help & support', description: 'Ask the assistant or find guidance.', to: '/support', role: 'donor', icon: CircleHelp },
  { title: 'Operations admin', description: 'Explore the clearly labeled sample admin view.', to: '/admin', role: 'admin', icon: ShieldCheck },
];

export function ExplorePage() {
  const { startDemo } = useDemo();
  const navigate = useNavigate();

  const openScreen = (choice: ScreenChoice) => {
    startDemo(choice.role);
    navigate(choice.to);
  };

  return (
    <main className="explore-page">
      <div className="explore-shell">
        <header className="explore-header">
          <Link to="/" aria-label="FoodLoop home"><Brand /></Link>
          <Link to="/" className="explore-back"><ArrowLeft size={15} /> Back to home</Link>
        </header>

        <section className="explore-hero" aria-labelledby="explore-title">
          <div className="explore-orbit explore-orbit--one" />
          <div className="explore-orbit explore-orbit--two" />
          <span className="eyebrow eyebrow--green"><span className="pulse-dot" /> INTERACTIVE FOODLOOP DEMO</span>
          <h1 id="explore-title">Choose a page.<br /><em>See the loop.</em></h1>
          <p>These are separate, working screens—not just a poster. Choose any feature to open it with sample data; no account needed.</p>
          <div className="explore-hint"><ShieldCheck size={15} /> Demo records are separate from real accounts. Admin, maps and delivery updates are simulated.</div>
        </section>

        <section className="explore-choice-section" aria-labelledby="explore-choices-heading">
          <div className="explore-choice-heading">
            <div><span className="eyebrow">10 PLACES TO START</span><h2 id="explore-choices-heading">Pick what you want to try</h2></div>
            <span className="explore-count">01 — 10</span>
          </div>
          <div className="explore-grid">
            {screenChoices.map(({ title, description, to, role, icon: Icon }, index) => (
              <button
                className="explore-tile"
                key={to}
                type="button"
                aria-label={`Open ${title} as ${roleLabels[role]}`}
                onClick={() => openScreen(screenChoices[index])}
              >
                <span className="explore-tile-top"><span className="explore-tile-icon"><Icon size={19} /></span><span className="explore-tile-number">{String(index + 1).padStart(2, '0')}</span><ArrowRight className="explore-tile-arrow" size={16} /></span>
                <span className="explore-tile-copy"><strong>{title}</strong><small>{description}</small></span>
                <span className="explore-role">Opens as {roleLabels[role]} <ArrowRight size={12} /></span>
              </button>
            ))}
          </div>
        </section>

        <footer className="explore-footer"><Brand small /><span>Keep good food in the loop.</span><Link to="/food-safety">Food safety <ArrowRight size={12} /></Link></footer>
      </div>
    </main>
  );
}
