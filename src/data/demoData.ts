import type { DeliveryPartner, Donation, Organization, Role } from '../../shared/types';

const now = Date.now();
const ago = (minutes: number) => new Date(now - minutes * 60_000).toISOString();
const after = (hours: number) => new Date(now + hours * 3_600_000).toISOString();
const timeLabel = (date: Date) => date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
const windowAt = (startMs: number, endMs: number) => { const start = new Date(startMs); const end = new Date(endMs); const day = start.toLocaleDateString([], { month: 'short', day: 'numeric' }); return `${day} · ${timeLabel(start)}–${timeLabel(end)}`; }

export const roleLabels: Record<Role, string> = {
  donor: 'Food donor',
  ngo: 'NGO / food bank',
  partner: 'Delivery partner',
  admin: 'FoodLoop admin',
};

export const rolePeople: Record<Role, { name: string; org: string; initials: string }> = {
  donor: { name: 'Aarav Mehta', org: 'Green Table Café', initials: 'AM' },
  ngo: { name: 'Priya Rao', org: 'Hope Kitchen', initials: 'PR' },
  partner: { name: 'Ravi Nair', org: 'Community courier', initials: 'RN' },
  admin: { name: 'Maya Shah', org: 'FoodLoop operations', initials: 'MS' },
};

export const organizations: Organization[] = [
  { id: 'org-hope', name: 'Hope Kitchen', role: 'ngo', area: 'Domlur', distanceKm: 2.4, capacity: 120, openUntil: '9:00 PM', specialties: ['Meals', 'Produce', 'Bakery'] },
  { id: 'org-seva', name: 'Seva Community Fridge', role: 'ngo', area: 'Indiranagar', distanceKm: 3.1, capacity: 80, openUntil: '8:30 PM', specialties: ['Produce', 'Dairy', 'Pantry'] },
  { id: 'org-neighbour', name: 'Neighbourhood Relief', role: 'ngo', area: 'Ulsoor', distanceKm: 4.8, capacity: 200, openUntil: '10:00 PM', specialties: ['Meals', 'Bakery', 'Pantry'] },
];

export const deliveryPartners: DeliveryPartner[] = [
  { id: 'p-ravi', name: 'Ravi Nair', area: 'Indiranagar', distanceKm: 0.7, capacity: 55, available: true, completedToday: 8, color: '#d9eb92' },
  { id: 'p-ananya', name: 'Ananya Das', area: 'Domlur', distanceKm: 1.2, capacity: 75, available: true, completedToday: 6, color: '#ffd6b1' },
  { id: 'p-kiran', name: 'Kiran S.', area: 'Ulsoor', distanceKm: 2.1, capacity: 90, available: true, completedToday: 5, color: '#cfdfec' },
  { id: 'p-dev', name: 'Dev Kumar', area: 'Indiranagar', distanceKm: 1.8, capacity: 35, available: false, completedToday: 4, color: '#e4d7f3' },
];

export const makeSampleDonations = (): Donation[] => [
  {
    id: 'FL-2418', foodName: 'Seasonal veg bowls', category: 'Meals', quantity: 24, unit: 'bowls', servings: 24,
    donorId: 'org-green-table', donorName: 'Green Table Café', ngoId: 'org-hope', ngoName: 'Hope Kitchen', partnerId: 'p-ravi', partnerName: 'Ravi Nair',
    area: 'Indiranagar → Domlur', pickupLocation: '100 Feet Road, Indiranagar', pickupWindow: windowAt(now + 10 * 60_000, now + 40 * 60_000), storage: 'Chilled at 4°C', foodSafetyNotes: 'Prepared today; covered and chilled after preparation.', allergens: ['Sesame'],
    preparedAt: ago(50), useBy: after(4.5), etaMinutes: 22, status: 'partner_assigned', createdAt: ago(68), assignmentHistory: [{ partnerId: 'p-ravi', partnerName: 'Ravi Nair', assignedAt: ago(18), outcome: 'active' }],
    events: [
      { id: 'e1', kind: 'listed', title: 'Donation listed', detail: '24 seasonal veg bowls · Green Table Café', at: ago(68) },
      { id: 'e2', kind: 'matched', title: 'Matched with Hope Kitchen', detail: '2.4 km away · capacity confirmed', at: ago(45) },
      { id: 'e3', kind: 'assigned', title: 'Ravi accepted the route', detail: 'Pickup window 6:15–6:45 PM', at: ago(18) },
    ],
  },
  {
    id: 'FL-2419', foodName: 'Fresh millet sandwich packs', category: 'Bakery', quantity: 18, unit: 'packs', servings: 36,
    donorId: 'org-sunrise', donorName: 'Sunrise Hostel Kitchen', area: 'Domlur → Ulsoor', pickupLocation: '12th Main, Domlur', pickupWindow: windowAt(now + 45 * 60_000, now + 90 * 60_000), storage: 'Ambient, covered', foodSafetyNotes: 'Prepared today; stored covered at ambient temperature.', allergens: ['Wheat', 'Dairy'],
    preparedAt: ago(35), useBy: after(3.2), etaMinutes: 28, status: 'listed', createdAt: ago(36), assignmentHistory: [],
    events: [{ id: 'e4', kind: 'listed', title: 'Donation listed', detail: '18 packs · ready for matching', at: ago(36) }],
  },
  {
    id: 'FL-2417', foodName: 'Garden lunch boxes', category: 'Meals', quantity: 32, unit: 'boxes', servings: 32,
    donorId: 'org-green-table', donorName: 'Green Table Café', ngoId: 'org-seva', ngoName: 'Seva Community Fridge', partnerId: 'p-ananya', partnerName: 'Ananya Das',
    area: 'Indiranagar → Indiranagar', pickupLocation: '12th Main, Indiranagar', pickupWindow: windowAt(now - 35 * 60_000, now - 5 * 60_000), storage: 'Chilled at 4°C', foodSafetyNotes: 'Prepared today; chilled and covered. Handoff is underway in this sample.', allergens: ['Peanuts'],
    preparedAt: ago(110), useBy: after(2.6), etaMinutes: 14, status: 'picked_up', createdAt: ago(125), deliveredQuantity: undefined,
    assignmentHistory: [{ partnerId: 'p-ananya', partnerName: 'Ananya Das', assignedAt: ago(75), outcome: 'active' }],
    events: [
      { id: 'e5', kind: 'listed', title: 'Donation listed', detail: '32 garden lunch boxes', at: ago(125) },
      { id: 'e6', kind: 'matched', title: 'Accepted by Seva Community Fridge', detail: '3.1 km · pickup window confirmed', at: ago(95) },
      { id: 'e7', kind: 'assigned', title: 'Ananya is on the way', detail: 'Pickup code ready · estimated 14 min', at: ago(75) },
      { id: 'e8', kind: 'picked_up', title: 'Pickup confirmed', detail: '32 boxes scanned at 6:02 PM', at: ago(11) },
    ],
  },
  {
    id: 'FL-2416', foodName: 'Seasonal fruit crate', category: 'Produce', quantity: 12, unit: 'crates', servings: 48,
    donorId: 'org-market', donorName: 'The Daily Market', ngoId: 'org-neighbour', ngoName: 'Neighbourhood Relief', partnerId: 'p-kiran', partnerName: 'Kiran S.',
    area: 'Ulsoor → Ulsoor', pickupLocation: 'Cambridge Road, Ulsoor', pickupWindow: windowAt(now - 260 * 60_000, now - 245 * 60_000), storage: 'Cool, dry place', foodSafetyNotes: 'Fresh whole fruit; kept in clean crates away from direct sun.', allergens: ['None known'],
    preparedAt: ago(210), useBy: after(20), etaMinutes: 0, status: 'delivered', createdAt: ago(260), deliveredQuantity: 12,
    assignmentHistory: [{ partnerId: 'p-kiran', partnerName: 'Kiran S.', assignedAt: ago(220), outcome: 'completed' }],
    events: [
      { id: 'e9', kind: 'listed', title: 'Donation listed', detail: '12 fresh fruit crates', at: ago(260) },
      { id: 'e10', kind: 'matched', title: 'Matched with Neighbourhood Relief', detail: 'Capacity confirmed', at: ago(240) },
      { id: 'e11', kind: 'assigned', title: 'Kiran accepted the route', detail: 'Pickup completed', at: ago(220) },
      { id: 'e12', kind: 'delivered', title: 'Handoff confirmed', detail: '12 crates received · demo code verified', at: ago(170) },
    ],
  },
  {
    id: 'FL-2415', foodName: 'Fresh bakery assortment', category: 'Bakery', quantity: 20, unit: 'boxes', servings: 60,
    donorId: 'org-bakehouse', donorName: 'Little Loaf Bakehouse', area: 'Domlur → Domlur', pickupLocation: 'Old Airport Road, Domlur', pickupWindow: windowAt(now + 90 * 60_000, now + 130 * 60_000), storage: 'Ambient, covered', foodSafetyNotes: 'Baked today; kept in covered boxes. Common allergens listed for recipient review.', allergens: ['Wheat', 'Egg', 'Dairy'],
    preparedAt: ago(25), useBy: after(7), etaMinutes: 18, status: 'listed', createdAt: ago(24), assignmentHistory: [],
    events: [{ id: 'e13', kind: 'listed', title: 'Donation listed', detail: '20 bakery boxes · best matched before close', at: ago(24) }],
  },
];

export const demoNotifications = [
  { id: 'n1', title: 'Pickup in motion', detail: 'Ravi is heading to Green Table Café.', time: '2 min ago', read: false, tone: 'green' as const },
  { id: 'n2', title: 'Use-by reminder', detail: `18 sandwich packs need a match before ${timeLabel(new Date(now + 3.2 * 3_600_000))}.`, time: '8 min ago', read: false, tone: 'amber' as const },
  { id: 'n3', title: 'Handoff complete', detail: 'Neighbourhood Relief received 12 fruit crates.', time: '1 hr ago', read: true, tone: 'green' as const },
];
