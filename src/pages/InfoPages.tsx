import { ArrowLeft, ArrowRight, Check, Clock3, FileText, HelpCircle, Leaf, ShieldCheck, Thermometer } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Brand, DemoTag } from '../components/Brand';
import { ButtonLink } from '../components/ButtonLink';

export function HelpPage() {
  return <div className="page-stack"><section className="page-intro"><div><span className="eyebrow">A CLEARER WAY TO SHARE</span><h2>Help center.</h2><p>Find the next step for your role and your handoff.</p></div><DemoTag>PROTOTYPE</DemoTag></section><div className="help-card-grid"><Link to="/donations" className="help-topic-card"><span><Leaf size={19} /></span><strong>Browse & accept food</strong><small>Review servings, storage, allergens and use-by time.</small><ArrowRight size={15} /></Link><Link to="/jobs" className="help-topic-card"><span><Clock3 size={19} /></span><strong>Delivery & tracking</strong><small>Follow status changes, ETA and handoff confirmation.</small><ArrowRight size={15} /></Link><Link to="/food-safety" className="help-topic-card"><span><Thermometer size={19} /></span><strong>Food safety notes</strong><small>Read the practical limits and review responsibilities.</small><ArrowRight size={15} /></Link><Link to="/support" className="help-topic-card"><span><HelpCircle size={19} /></span><strong>Ask Loop or admin</strong><small>Get help without making a delivery change in chat.</small><ArrowRight size={15} /></Link></div><section className="help-guide card-surface"><span className="eyebrow">DEMO WALKTHROUGH</span><h3>From listing to handoff</h3><ol><li>Enter demo mode as Food donor and create a listing with clear storage and expiry details.</li><li>Switch to NGO / food bank to review the listing and accept it.</li><li>Assign a delivery partner, or switch to Delivery partner to accept a route.</li><li>Open the detail page and simulate a delivery failure; confirm the backup partner as an authorized demo role.</li><li>Advance pickup and delivery steps to see the activity timeline update.</li></ol><ButtonLink to="/dashboard" className="button button--secondary button--small">Go to demo workspace <ArrowRight size={14} /></ButtonLink></section></div>;
}

const content = {
  'food-safety': { eyebrow: 'DONOR-PROVIDED INFORMATION', title: 'Food safety stays human.', intro: 'FoodLoop is a coordination tool, not a food-safety authority. Donors provide preparation, storage, allergen and use-by information. Recipients must review it and follow their own applicable procedures.', sections: [
    ['Share the details you know', 'Include preparation time, storage conditions, known allergens and a realistic use-by time. Missing or concerning information should be flagged for review before pickup.'],
    ['Keep the time window honest', 'The prototype avoids recommending routes whose estimated arrival is after the stated use-by time. Estimates and route calculations are demo simulations, not a safety guarantee.'],
    ['Do not treat AI as certification', 'AI can explain the information shown in a listing, but it cannot certify that food is safe. Ask the donor or an authorized human reviewer when details are unclear.'],
    ['Confirm the handoff', 'The demo’s pickup and delivery codes are simulated. A real deployment needs a verified handoff process and applicable local procedures.'],
  ] },
  privacy: { eyebrow: 'YOUR DETAILS, USED WITH CARE', title: 'Privacy in the loop.', intro: 'FoodLoop is designed to show private contact and precise pickup information only to users involved in an active donation or delivery. This hackathon prototype uses sample data for its demo mode.', sections: [
    ['Demo records are samples', 'Demo role switching, route maps, notifications and handoff events use illustrative local sample data. They do not represent real organizations or people.'],
    ['Limit who sees active details', 'A production system should enforce role and donation-level authorization on the server before revealing contact or precise location data.'],
    ['AI support', 'Signed-in support questions are sent to the configured server-side AI service. Do not enter sensitive personal information. Demo chat uses local sample guidance.'],
    ['No outbound notifications', 'This prototype does not send external email, SMS or push messages. Demo alerts remain in the browser session.'],
  ] },
  terms: { eyebrow: 'CLEAR EXPECTATIONS', title: 'Terms of this demo.', intro: 'FoodLoop is an early product prototype for a hackathon. It demonstrates coordination flows; it is not a live food donation, courier, payment or safety service.', sections: [
    ['Illustrative data', 'Sample users, organizations, donations, quantities, impact totals, areas and times are for demonstration only. Estimates are not verified outcomes.'],
    ['Simulated integrations', 'Mapping, ETA, delivery tracking, OTP/photo confirmation, messaging and failure reassignment are simulated unless a real integration is explicitly configured.'],
    ['Human decisions', 'Food safety, acceptance and handoff decisions remain with the involved people and organizations. The AI assistant offers information only and does not perform consequential actions.'],
    ['Future deployment', 'A production rollout needs verified identity, authorization, privacy and retention policies, vetted food-safety procedures, real transport/notification integrations and organizer/organization approval.'],
  ] },
} as const;

type LegalType = keyof typeof content;
export function LegalPage({ type }: { type: LegalType }) {
  const page = content[type];
  return <div className="page-stack legal-page"><div className="back-row"><ButtonLink to="/help" className="back-link"><ArrowLeft size={15} /> Help center</ButtonLink><DemoTag>PROTOTYPE</DemoTag></div><header className="legal-header"><span className="legal-icon">{type === 'food-safety' ? <Thermometer size={22} /> : type === 'privacy' ? <ShieldCheck size={22} /> : <FileText size={22} />}</span><span className="eyebrow">{page.eyebrow}</span><h2>{page.title}</h2><p>{page.intro}</p></header><div className="legal-sections">{page.sections.map(([title, body], index) => <section key={title}><span className="legal-section-number">0{index + 1}</span><div><h3>{title}</h3><p>{body}</p></div><Check size={17} /></section>)}</div><div className="legal-next"><span><Brand small /></span><span>Questions? <Link to="/support">Ask support</Link></span></div></div>;
}

export function NotFoundPage() {
  return <main className="not-found"><Link to="/"><Brand /></Link><span className="not-found-number">404</span><h1>This page stepped<br /><em>out of the loop.</em></h1><p>Let’s get you back to the good stuff.</p><ButtonLink to="/" className="button button--primary"><ArrowLeft size={15} /> Back to FoodLoop</ButtonLink></main>;
}
