import { useState } from 'react';
import { ChevronDown, Headset, Leaf, LoaderCircle, Send, ShieldCheck, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { useDemo } from '../state/DemoProvider';

const demoReply = (text: string, role: string) => {
  const lower = text.toLowerCase();
  if (/safe|allergen|allergy|temperature/.test(lower)) return 'FoodLoop shows the donor-provided storage and allergen details so people can review them. This demo cannot certify food safety. If details are missing or concerning, pause the handoff and ask the donor or an admin to review.';
  if (/fail|late|backup|unavailable/.test(lower)) return 'Open the active delivery and choose “Simulate delivery failure.” FoodLoop will suggest an available backup partner; an authorized donor, NGO or admin can confirm reassignment. The previous assignment stays in activity history.';
  if (/accept|match|listing/.test(lower)) return role === 'ngo' ? 'Open Find food, review the servings, allergens, pickup window and use-by time, then accept or pass. Listings that cannot arrive before use-by are not recommended.' : 'You can review donation details and match status in Find food. NGO acceptance and delivery changes are recorded in the demo timeline.';
  if (/track|status|where/.test(lower)) return 'Open the donation card and select Track delivery to see the current step, ETA and activity timeline. Map markers and location are simulated in this demo.';
  return 'I can help with listings, acceptance, delivery status, delays and food-safety information. For account-specific support, contact a FoodLoop admin. This sample assistant cannot change a delivery or certify food as safe.';
};

type Message = { by: 'assistant' | 'user'; text: string };

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{ by: 'assistant', text: 'Hi, I’m Loop. I can help you find the next step—without changing a delivery for you.' }]);
  const { user } = useAuth();
  const { role, demoActive } = useDemo();

  const send = async (event: React.FormEvent) => {
    event.preventDefault();
    const question = text.trim();
    if (!question || busy) return;
    setMessages((previous) => [...previous, { by: 'user', text: question }]);
    setText('');
    setBusy(true);
    try {
      if (demoActive || !user) {
        await new Promise((resolve) => window.setTimeout(resolve, 450));
        setMessages((previous) => [...previous, { by: 'assistant', text: demoReply(question, role) }]);
      } else {
        const response = await fetch('/api/support/chat', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: question }) });
        const body = await response.json() as { answer?: string; error?: string };
        if (!response.ok || !body.answer) throw new Error(body.error || 'Support is temporarily unavailable.');
        setMessages((previous) => [...previous, { by: 'assistant', text: body.answer! }]);
      }
    } catch {
      setMessages((previous) => [...previous, { by: 'assistant', text: 'I could not reach support just now. Your question is still here—please try again or contact an admin.' }]);
    } finally { setBusy(false); }
  };

  return <>
    {open && <section className="chat-panel" aria-label="FoodLoop support chat">
      <header className="chat-header"><span className="chat-avatar"><Leaf size={18} /></span><div><strong>Loop support</strong><span>{demoActive || !user ? 'Demo assistant · sample data' : 'FoodLoop AI · role-aware'}</span></div><button className="chat-close" aria-label="Close support chat" onClick={() => setOpen(false)}><X size={18} /></button></header>
      <div className="chat-safety"><ShieldCheck size={14} /> Suggestions only · no delivery changes</div>
      <div className="chat-messages" aria-live="polite">{messages.map((message, index) => <p key={`${message.by}-${index}`} className={`chat-message chat-message--${message.by}`}>{message.text}</p>)}{busy && <p className="chat-message chat-message--assistant chat-thinking"><LoaderCircle size={15} className="spin" /> Checking the next step…</p>}</div>
      <form className="chat-form" onSubmit={(event) => void send(event)}><label htmlFor="support-question" className="sr-only">Ask FoodLoop support</label><input id="support-question" value={text} onChange={(event) => setText(event.target.value)} placeholder="Ask about a listing or delivery…" disabled={busy} /><button type="submit" aria-label="Send message" disabled={!text.trim() || busy}><Send size={16} /></button></form>
      <footer className="chat-footer">Never rely on AI to certify food safety. <Link to="/food-safety">Read guidance <ChevronDown size={12} /></Link></footer>
    </section>}
    <button className={`chat-launcher${open ? ' chat-launcher--open' : ''}`} aria-label={open ? 'Close support chat' : 'Open FoodLoop support'} onClick={() => setOpen((value) => !value)}>{open ? <X size={21} /> : <><Headset size={20} /><span className="chat-launcher-ping" /></>}</button>
  </>;
}
