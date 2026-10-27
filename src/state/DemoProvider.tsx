import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import type { DemoState, Donation, FoodListingInput, Role } from '../../shared/types';
import { demoNotifications, deliveryPartners, makeSampleDonations, organizations, rolePeople } from '../data/demoData';
import { recommendOrganizations, recommendPartners, validateListing } from '../services/workflow';
import { useAuth } from '../auth/AuthProvider';

const STORAGE_KEY = 'foodloop-demo-v1';
const MODE_KEY = 'foodloop-demo-active';
const initialState = (): DemoState => ({ role: 'donor', donations: makeSampleDonations(), notifications: demoNotifications });

function loadInitialState(): DemoState {
  if (typeof window === 'undefined') return initialState();
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved) as DemoState;
  } catch { /* private browsing storage failure should not block the demo */ }
  return initialState();
}

const stamp = () => new Date().toISOString();
const event = (kind: Donation['events'][number]['kind'], title: string, detail: string) => ({ id: `evt-${crypto.randomUUID()}`, kind, title, detail, at: stamp() });
type AppNotification = DemoState['notifications'][number];
type ContextValue = DemoState & {
  role: Role;
  demoActive: boolean;
  actor: { name: string; org: string; initials: string };
  loadingRecords: boolean;
  remoteError: string | null;
  setRole: (role: Role) => void;
  startDemo: (initialRole?: Role) => void;
  endDemo: () => void;
  createDonation: (input: FoodListingInput) => Promise<string | null>;
  acceptDonation: (id: string) => void;
  declineDonation: (id: string) => void;
  acceptRoute: (id: string) => void;
  declineRoute: (id: string) => void;
  assignSuggestedPartner: (id: string) => void;
  simulateFailure: (id: string) => void;
  markPickedUp: (id: string) => void;
  markDelivered: (id: string) => void;
  confirmReassignment: (id: string) => void;
  markNotificationsRead: () => void;
  resetDemo: () => void;
  refreshRemote: () => Promise<void>;
};
const DemoContext = createContext<ContextValue | null>(null);

export function DemoProvider({ children }: PropsWithChildren) {
  const { user } = useAuth();
  const [state, setState] = useState<DemoState>(loadInitialState);
  const [demoActive, setDemoActive] = useState(() => {
    try { return typeof window !== 'undefined' && window.localStorage.getItem(MODE_KEY) === 'true'; } catch { return false; }
  });
  const [remoteDonations, setRemoteDonations] = useState<Donation[]>([]);
  const [remoteNotifications, setRemoteNotifications] = useState<AppNotification[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [remoteError, setRemoteError] = useState<string | null>(null);

  const refreshRemote = useCallback(async () => {
    if (!user || demoActive) return;
    setLoadingRecords(true);
    try {
      const [donationResponse, noticeResponse] = await Promise.all([
        fetch('/api/donations', { credentials: 'include' }),
        fetch('/api/notifications', { credentials: 'include' }),
      ]);
      const donationBody = await donationResponse.json() as { donations?: Donation[]; error?: string };
      const noticeBody = await noticeResponse.json() as { notifications?: (Omit<AppNotification, 'time'> & { createdAt: string })[]; error?: string };
      if (!donationResponse.ok) throw new Error(donationBody.error || 'Could not load your donations.');
      if (!noticeResponse.ok) throw new Error(noticeBody.error || 'Could not load your notifications.');
      setRemoteDonations(donationBody.donations ?? []);
      setRemoteNotifications((noticeBody.notifications ?? []).map((item) => ({ ...item, time: new Date(item.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) })));
      setRemoteError(null);
    } catch (error) {
      setRemoteError(error instanceof Error ? error.message : 'Could not load your FoodLoop records. Try refreshing.');
    } finally { setLoadingRecords(false); }
  }, [user, demoActive]);

  useEffect(() => {
    if (user && !demoActive) { void refreshRemote(); }
    else { setRemoteDonations([]); setRemoteNotifications([]); setRemoteError(null); setLoadingRecords(false); }
  }, [user, demoActive, refreshRemote]);
  useEffect(() => { try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* browser-only fallback */ } }, [state]);
  useEffect(() => { try { window.localStorage.setItem(MODE_KEY, String(demoActive)); } catch { /* browser-only fallback */ } }, [demoActive]);

  const role: Role = demoActive ? state.role : user?.role ?? state.role;
  const actor = demoActive ? rolePeople[state.role] : {
    name: user?.name ?? 'FoodLoop member', org: user?.organizationName ?? 'Your organization',
    initials: user?.name?.split(' ').map((part) => part[0]).slice(0, 2).join('') ?? 'FM',
  };
  const donations = demoActive ? state.donations : remoteDonations;
  const notifications = demoActive ? state.notifications : remoteNotifications;

  const apiAction = useCallback(async (id: string, action: string) => {
    try {
      const response = await fetch(`/api/donations/${encodeURIComponent(id)}/actions`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }) });
      const body = await response.json() as { error?: string };
      if (!response.ok) throw new Error(body.error || 'That action was not completed.');
      await refreshRemote();
    } catch (error) {
      setRemoteError(error instanceof Error ? error.message : 'That action could not be completed. Please retry.');
    }
  }, [refreshRemote]);

  const api = useMemo<ContextValue>(() => ({
    ...state, role, actor, donations, notifications, demoActive, loadingRecords, remoteError,
    setRole: (nextRole) => { if (demoActive) setState((previous) => ({ ...previous, role: nextRole })); },
    startDemo: (initialRole) => {
      setRemoteError(null);
      if (initialRole) setState((previous) => ({ ...previous, role: initialRole }));
      setDemoActive(true);
    },
    endDemo: () => { setDemoActive(false); setState(initialState()); },
    refreshRemote,
    createDonation: async (input) => {
      const errors = validateListing(input);
      if (errors.length) return errors[0];
      if (demoActive) {
        const created: Donation = {
          ...input, id: `FL-${Math.floor(2400 + Math.random() * 5800)}`,
          donorId: 'demo-donor', donorName: actor.org, status: 'listed', etaMinutes: 22,
          createdAt: stamp(), assignmentHistory: [],
          events: [event('listed', 'Donation listed', `${input.quantity} ${input.unit} · ${actor.org}`)],
        };
        setState((previous) => ({ ...previous, donations: [created, ...previous.donations] }));
        return null;
      }
      if (!user) return 'Sign in or enter demo mode to publish a listing.';
      try {
        const response = await fetch('/api/donations', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...input, preparedAt: new Date(input.preparedAt).toISOString(), useBy: new Date(input.useBy).toISOString() }) });
        const body = await response.json() as { error?: string };
        if (!response.ok) return body.error || 'Could not publish the listing.';
        await refreshRemote();
        return null;
      } catch { return 'The FoodLoop service is unavailable. Your listing was not saved; retry when connected.'; }
    },
    acceptDonation: (id) => {
      if (!demoActive) { void apiAction(id, 'accept'); return; }
      if (state.role !== 'ngo') return;
      const candidate = donations.find((item) => item.id === id && item.status === 'listed');
      const organization = organizations.find((item) => item.name === actor.org);
      if (!candidate || !organization || !recommendOrganizations(candidate, [organization]).length) return;
      setState((previous) => ({
        ...previous,
        donations: previous.donations.map((item) => item.id !== id || item.status !== 'listed' ? item : { ...item, status: 'matched', ngoId: 'demo-ngo', ngoName: actor.org, events: [...item.events, event('matched', `Matched with ${actor.org}`, 'Capacity and pickup window confirmed.')] }),
        notifications: [{ id: `n-${Date.now()}`, title: 'A donation was accepted', detail: `${actor.org} is preparing a pickup.`, time: 'Just now', read: false, tone: 'green' }, ...previous.notifications],
      }));
    },
    declineDonation: (id) => {
      if (!demoActive) { void apiAction(id, 'decline'); return; }
      if (state.role !== 'ngo') return;
      setState((previous) => ({ ...previous, donations: previous.donations.map((item) => item.id !== id || item.status !== 'listed' ? item : { ...item, status: 'declined', events: [...item.events, event('note', `${actor.org} passed on this donation`, 'The listing remains in activity history.')] }) }));
    },
    acceptRoute: (id) => {
      if (!demoActive) { void apiAction(id, 'accept_route'); return; }
      if (state.role !== 'partner') return;
      const partnerId = deliveryPartners.find((partner) => partner.name === actor.name)?.id ?? `demo-${state.role}`;
      setState((previous) => ({
        ...previous,
        donations: previous.donations.map((item) => item.id !== id || item.status !== 'matched' || item.needsReassignment ? item : {
          ...item, status: 'partner_assigned', partnerId, partnerName: actor.name, needsReassignment: false,
          assignmentHistory: [...item.assignmentHistory, { partnerId, partnerName: actor.name, assignedAt: stamp(), outcome: 'active' }],
          events: [...item.events, event('assigned', `${actor.name} accepted the route`, `${item.etaMinutes} min estimated · simulated route.`)],
        }),
      }));
    },
    declineRoute: (id) => {
      if (!demoActive) { void apiAction(id, 'partner_decline'); return; }
      if (state.role !== 'partner') return;
      setState((previous) => ({
        ...previous,
        donations: previous.donations.map((item) => item.id !== id || item.status !== 'partner_assigned' || item.partnerName !== actor.name ? item : {
          ...item, status: 'matched', partnerId: undefined, partnerName: undefined, needsReassignment: true,
          assignmentHistory: item.assignmentHistory.map((entry) => entry.outcome === 'active' ? { ...entry, outcome: 'failed' } : entry),
          events: [...item.events, event('failure', `${actor.name} declined the route`, 'The NGO and donor need another sample partner.')],
        }),
        notifications: [{ id: `n-${Date.now()}`, title: 'Partner declined this route', detail: `A backup is needed for ${donations.find((item) => item.id === id)?.foodName ?? 'this donation'}.`, time: 'Just now', read: false, tone: 'coral' }, ...previous.notifications],
      }));
    },
    assignSuggestedPartner: (id) => {
      if (!demoActive) { void apiAction(id, role === 'partner' ? 'accept_route' : 'assign'); return; }
      setState((previous) => ({ ...previous, donations: previous.donations.map((item) => {
        if (item.id !== id || !['matched', 'partner_assigned'].includes(item.status)) return item;
        const partner = state.role === 'partner' ? deliveryPartners.find((candidate) => candidate.id === 'p-ravi') : recommendPartners(item, deliveryPartners)[0];
        if (!partner) return item;
        const partnerName = state.role === 'partner' ? actor.name : partner.name;
        return {
          ...item, status: 'partner_assigned', partnerId: partner.id, partnerName, needsReassignment: false,
          assignmentHistory: [...item.assignmentHistory, { partnerId: partner.id, partnerName, assignedAt: stamp(), outcome: 'active' }],
          events: [...item.events, event(item.needsReassignment ? 'reassigned' : 'assigned', `${partnerName} assigned`, `${partner.distanceKm.toFixed(1)} km away · ${state.role === 'partner' ? 'partner accepted the route' : item.needsReassignment ? 'backup suggestion confirmed' : 'suggested by availability, distance and capacity'}.`)],
        };
      }) }));
    },
    simulateFailure: (id) => {
      if (!demoActive) { void apiAction(id, 'simulate_failure'); return; }
      if (state.role === 'partner' || !['donor', 'ngo', 'admin'].includes(state.role)) return;
      setState((previous) => ({
        ...previous,
        donations: previous.donations.map((item) => item.id !== id || !['matched', 'partner_assigned'].includes(item.status) ? item : {
          ...item, status: 'matched', needsReassignment: true, partnerId: undefined, partnerName: undefined,
          assignmentHistory: item.assignmentHistory.map((assignment) => assignment.outcome === 'active' ? { ...assignment, outcome: 'failed' } : assignment),
          events: [...item.events, event('failure', 'Partner unavailable · backup needed', 'The donor, NGO and admin are notified. Previous assignment kept in history.')],
        }),
        notifications: [{ id: `n-${Date.now()}`, title: 'Delivery needs a backup', detail: 'A partner is unavailable; confirm the next suitable partner.', time: 'Just now', read: false, tone: 'coral' }, ...previous.notifications],
      }));
    },
    markPickedUp: (id) => {
      if (!demoActive) { void apiAction(id, 'pickup'); return; }
      if (!['partner', 'admin'].includes(state.role)) return;
      setState((previous) => ({ ...previous, donations: previous.donations.map((item) => item.id !== id || item.status !== 'partner_assigned' ? item : { ...item, status: 'picked_up', events: [...item.events, event('picked_up', 'Pickup confirmed', `${item.quantity} ${item.unit} · demo handoff code verified.`)] }) }));
    },
    markDelivered: (id) => {
      if (!demoActive) { void apiAction(id, 'deliver'); return; }
      if (!['partner', 'admin'].includes(state.role)) return;
      setState((previous) => ({
        ...previous,
        donations: previous.donations.map((item) => item.id !== id || item.status !== 'picked_up' ? item : { ...item, status: 'delivered', deliveredQuantity: item.quantity, events: [...item.events, event('delivered', 'Handoff confirmed', `${item.quantity} ${item.unit} received · demo code verified.`)], assignmentHistory: item.assignmentHistory.map((assignment) => assignment.outcome === 'active' ? { ...assignment, outcome: 'completed' } : assignment) }),
        notifications: [{ id: `n-${Date.now()}`, title: 'Handoff confirmed', detail: 'Food reached its community partner.', time: 'Just now', read: false, tone: 'green' }, ...previous.notifications],
      }));
    },
    confirmReassignment: (id) => {
      if (!demoActive) { void apiAction(id, 'confirm_reassignment'); return; }
      if (state.role === 'partner') return;
      setState((previous) => {
        const donation = previous.donations.find((item) => item.id === id);
        if (!donation?.needsReassignment) return previous;
        const partner = recommendPartners(donation, deliveryPartners)[0];
        if (!partner) return previous;
        return { ...previous, donations: previous.donations.map((item) => item.id !== id ? item : {
          ...item, status: 'partner_assigned', partnerId: partner.id, partnerName: partner.name, needsReassignment: false,
          assignmentHistory: [...item.assignmentHistory, { partnerId: partner.id, partnerName: partner.name, assignedAt: stamp(), outcome: 'active' }],
          events: [...item.events, event('reassigned', `Reassigned to ${partner.name}`, 'Authorized demo confirmation · prior assignment preserved.')],
        }) };
      });
    },
    markNotificationsRead: () => {
      if (!demoActive) {
        void fetch('/api/notifications/read', { method: 'POST', credentials: 'include' }).then((response) => { if (!response.ok) throw new Error('Could not update notifications.'); return refreshRemote(); }).catch(() => setRemoteError('Could not update notifications. Please retry.'));
        return;
      }
      setState((previous) => ({ ...previous, notifications: previous.notifications.map((item) => ({ ...item, read: true })) }));
    },
    resetDemo: () => setState(initialState()),
  }), [state, role, actor, donations, notifications, demoActive, loadingRecords, remoteError, user, apiAction, refreshRemote]);

  return <DemoContext.Provider value={api}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) throw new Error('useDemo must be used within DemoProvider');
  return context;
}
