import { ArrowDownRight, ArrowRight, Clock3, HandHeart, Leaf, MapPin, PackageCheck, ShieldCheck, Sparkles, Truck, UsersRound } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Brand } from '../components/Brand';
import { ButtonLink, Button } from '../components/ButtonLink';
import { useDemo } from '../state/DemoProvider';
import { useAuth } from '../auth/AuthProvider';

export function LandingPage() {
  const { startDemo } = useDemo();
  const { user, beginSignIn, error: authError } = useAuth();
  const navigate = useNavigate();
  const explore = () => { startDemo(); navigate('/dashboard'); };
  const signIn = async () => {
    try { await beginSignIn(); } catch (error) { window.alert(error instanceof Error ? error.message : 'Sign-in could not start.'); }
  };

  return <div className="landing-page">
    <header className="landing-nav"><Link to="/" aria-label="FoodLoop home"><Brand /></Link><nav><a href="#how-it-works">How it works</a><a href="#why-foodloop">Why FoodLoop</a><Link to="/help">Help</Link></nav><div className="landing-nav-actions">{user ? <ButtonLink to="/dashboard" className="button button--primary">Open workspace <ArrowRight size={16} /></ButtonLink> : <><Link to="/login" className="nav-signin">Log in</Link><Button onClick={() => void signIn()} tone="secondary" size="small">Sign in <ArrowRight size={15} /></Button></>}</div></header>
    <main>
      <section className="hero-section">
        <div className="hero-copy">
          <div className="eyebrow eyebrow--green"><span className="pulse-dot" /> A LOCAL LOOP FOR GOOD FOOD</div>
          <h1>Good food<br />still has <em>time.</em></h1>
          <p className="hero-lead">FoodLoop gets fresh surplus from kitchens to nearby communities—before the day is done.</p>
          <div className="hero-actions"><Button onClick={explore}>Explore demo <ArrowRight size={16} /></Button><Link to="/register" className="button-link hero-register">Create an account <ArrowDownRight size={16} /></Link></div>
          <div className="hero-note"><ShieldCheck size={15} /> Demo data is clearly labeled and separate from real accounts.</div>
          {authError && <p className="inline-note">{authError}</p>}
          <div className="hero-proof"><div className="avatar-stack"><span>G</span><span>H</span><span>S</span><span>+</span></div><span>One nearby match can change someone's evening.</span></div>
        </div>
        <div className="hero-visual">
          <div className="hero-orbit hero-orbit--one" /><div className="hero-orbit hero-orbit--two" />
          <img className="hero-art" src="/manus-storage/async-images/D7cTj6kzHUalwK2We09aR2/image-1.webp" alt="Freshly prepared meal boxes ready for a nearby community delivery" />
          <div className="floating-note floating-note--fresh"><span className="fresh-icon"><Leaf size={17} /></span><div><strong>Fresh & ready</strong><span>Pickup window · 6:15 PM</span></div><span className="floating-check"><PackageCheck size={15} /></span></div>
          <div className="floating-note floating-note--route"><span className="route-icon"><MapPin size={17} /></span><div><strong>2.4 km away</strong><span>Hope Kitchen · Domlur</span></div></div>
          <div className="hero-corner-tag"><span>MEALS, NOT WASTE</span><span>01 / 04</span></div>
        </div>
        <div className="hero-bottom-label"><span>GOOD FOOD, KEPT IN MOTION</span><span>SCROLL TO FOLLOW THE LOOP <ArrowDownRight size={13} /></span></div>
      </section>

      <section className="proof-strip" id="why-foodloop"><div><span className="proof-icon"><Clock3 size={17} /></span><p><strong>Beat the clock</strong><span>Match nearby, before use-by.</span></p></div><div><span className="proof-icon"><UsersRound size={17} /></span><p><strong>One shared route</strong><span>Donor, NGO and courier in sync.</span></p></div><div><span className="proof-icon"><Leaf size={17} /></span><p><strong>Impact that counts</strong><span>Clear estimates, not big claims.</span></p></div></section>

      <section className="how-section" id="how-it-works"><div className="section-intro"><span className="eyebrow">THE LOOP, IN THREE MOVES</span><h2>From extra to<br /><em>extraordinary.</em></h2><p>A simple handoff keeps good food close to the people who need it.</p></div>
        <div className="steps-row"><article className="step-card step-card--light"><div className="step-top"><span>01</span><span className="step-icon"><HandHeart size={19} /></span></div><h3>Share what's fresh</h3><p>A kitchen lists surplus, with clear portions, allergens and a use-by time.</p><div className="step-line"><span /></div><small>DONOR · 30 SECONDS</small></article><article className="step-card step-card--tint"><div className="step-top"><span>02</span><span className="step-icon"><UsersRound size={19} /></span></div><h3>Find a nearby home</h3><p>A food bank checks the details and accepts a match that fits its capacity.</p><div className="step-line"><span /></div><small>COMMUNITY · RIGHT FIT</small></article><article className="step-card step-card--dark"><div className="step-top"><span>03</span><span className="step-icon"><Truck size={19} /></span></div><h3>Keep it moving</h3><p>A local partner picks up, follows the route and confirms the handoff.</p><div className="step-line"><span /></div><small>COURIER · ON THE WAY</small></article></div>
        <div className="demo-callout"><div className="demo-callout-mark"><Sparkles size={20} /></div><div><strong>Take a look around, no account needed.</strong><span>Try donor, NGO, courier or admin using sample data.</span></div><Button onClick={explore} tone="secondary" size="small">Enter demo <ArrowRight size={15} /></Button></div>
      </section>
      <section className="landing-footer"><Brand small /><p>Keep good food in the loop.</p><div><Link to="/food-safety">Food safety</Link><Link to="/privacy">Privacy</Link><Link to="/terms">Terms</Link></div><span>DEMO ESTIMATES ARE ILLUSTRATIVE</span></section>
    </main>
  </div>;
}
