import { ArrowLeft, ArrowRight, Check, LockKeyhole, ShieldCheck, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Brand, DemoTag } from '../components/Brand';
import { Button } from '../components/ButtonLink';
import { useAuth } from '../auth/AuthProvider';
import { useDemo } from '../state/DemoProvider';
import type { Role } from '../../shared/types';

export function LoginPage({ register = false }: { register?: boolean }) {
  const { beginSignIn, error: authError } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const signIn = async () => {
    try { await beginSignIn(); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not start sign-in.'); }
  };
  const explore = () => navigate('/explore');
  return <div className="auth-page"><div className="auth-left"><Link to="/" aria-label="Back to FoodLoop"><Brand /></Link><div className="auth-story"><div className="eyebrow eyebrow--green">{register ? 'JOIN THE LOCAL LOOP' : 'GOOD FOOD, MOVING'} </div><h1>{register ? 'Make room for<br/><em>one more meal.</em>' : 'Keep good food<br/><em>in motion.</em>'}</h1><p>FoodLoop brings kitchens, food banks and local delivery partners together before surplus becomes waste.</p><div className="auth-check"><span><Check size={14} /></span> Clear allergens and use-by details</div><div className="auth-check"><span><Check size={14} /></span> A human-confirmed handoff</div><div className="auth-check"><span><Check size={14} /></span> Sample mode for your first look</div></div><div className="auth-bottom">A practical community loop. Not another food waste promise.</div></div>
    <div className="auth-right"><Link to="/" className="back-link"><ArrowLeft size={16} /> Back to home</Link><div className="auth-card"><DemoTag>SECURE ACCOUNT</DemoTag><h2>{register ? 'Create your account' : 'Welcome back'}</h2><p>Sign in securely with your Manus account. FoodLoop never asks for or stores your password.</p><Button className="auth-provider-button" onClick={() => void signIn()}><LockKeyhole size={17} /> Continue with Manus <ArrowRight size={16} /></Button>
      {(error || authError) && <div className="form-error" role="alert">{error || authError}</div>}
      <div className="auth-divider"><span>or</span></div><button className="demo-entry-button" onClick={explore}><span className="demo-entry-icon"><Sparkles size={18} /></span><span><strong>Explore demo mode</strong><small>Choose from 10 working screens—no sign-in.</small></span><ArrowRight size={16} /></button>
      <div className="auth-policy"><ShieldCheck size={16} /><span>Private details stay limited to people involved in an active donation.</span></div>
      <div className="auth-switch">{register ? <>Already have an account? <Link to="/login">Log in</Link></> : <>New to FoodLoop? <Link to="/register">Create an account</Link></>}</div>
      {!register && <Link to="/reset-password" className="forgot-link">Need help with your password?</Link>}
    </div><div className="auth-footnote">By continuing, you agree to our <Link to="/terms">Terms</Link> and <Link to="/privacy">Privacy notice</Link>.</div></div></div>;
}

export function ResetPasswordPage() {
  return <div className="reset-page"><Link to="/" aria-label="FoodLoop home"><Brand /></Link><div className="reset-card"><div className="reset-icon"><LockKeyhole size={23} /></div><span className="eyebrow eyebrow--green">ACCOUNT ACCESS</span><h1>Password help</h1><p>FoodLoop uses secure sign-in from your account provider and never stores your password. To reset it, continue to sign in and use the provider’s password-recovery option.</p><Link to="/login" className="button button--primary">Continue to sign in <ArrowRight size={16} /></Link><Link className="back-link reset-back" to="/">Back to FoodLoop</Link></div></div>;
}

export function OnboardingPage() {
  const { user } = useAuth();
  const { demoActive, role, setRole } = useDemo();
  const navigate = useNavigate();
  const [orgName, setOrgName] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role>(role);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (demoActive) { setRole(selectedRole); navigate('/dashboard'); return; }
    if (!user) { navigate('/login'); return; }
    try {
      const response = await fetch('/api/auth/onboarding', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role: selectedRole, organizationName: orgName }) });
      const body = await response.json() as { error?: string };
      if (!response.ok) throw new Error(body.error || 'Could not save onboarding.');
      setSaved(true);
      window.location.assign('/dashboard');
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not save onboarding.'); }
  };
  return <div className="onboarding-page"><Link to="/" aria-label="FoodLoop home"><Brand /></Link><form className="onboarding-card" onSubmit={(event) => void submit(event)}><span className="eyebrow eyebrow--green">LET'S GET YOUR LOOP STARTED</span><h1>Who are you here for?</h1><p>Choose the role you’ll use first. You can update your organization details later.</p><label className="field-label">Your role<select value={selectedRole} onChange={(event) => setSelectedRole(event.target.value as Role)}><option value="donor">Food donor</option><option value="ngo">NGO / food bank</option><option value="partner">Delivery partner</option>{demoActive && <option value="admin">Admin (demo only)</option>}</select></label><label className="field-label">Organization name<input value={orgName} onChange={(event) => setOrgName(event.target.value)} placeholder="e.g. Green Table Café" /></label>{!user && !demoActive && <div className="form-error">Sign in or enter demo mode before saving role details.</div>}{error && <div className="form-error">{error}</div>}{saved && <div className="form-success">Saved. Taking you to your workspace…</div>}<Button type="submit" className="wide-button">Continue <ArrowRight size={16} /></Button><p className="form-footnote">Admin is available only as a labeled sample role in demo mode.</p></form></div>;
}
