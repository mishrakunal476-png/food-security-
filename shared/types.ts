export type Role = 'donor' | 'ngo' | 'partner' | 'admin';
export type DonationStatus = 'listed' | 'matched' | 'partner_assigned' | 'picked_up' | 'delivered' | 'declined';
export type Category = 'Meals' | 'Produce' | 'Bakery' | 'Dairy' | 'Pantry';

export interface ActivityEvent {
  id: string;
  kind: 'listed' | 'matched' | 'assigned' | 'picked_up' | 'delivered' | 'failure' | 'reassigned' | 'note';
  title: string;
  detail: string;
  at: string;
}

export interface AssignmentRecord {
  partnerId: string;
  partnerName: string;
  assignedAt: string;
  outcome: 'active' | 'failed' | 'completed';
}

export interface Donation {
  id: string;
  foodName: string;
  category: Category;
  quantity: number;
  unit: string;
  servings: number;
  donorId: string;
  donorName: string;
  ngoId?: string;
  ngoName?: string;
  partnerId?: string;
  partnerName?: string;
  area: string;
  pickupLocation: string;
  pickupWindow: string;
  storage: string;
  foodSafetyNotes?: string;
  allergens: string[];
  preparedAt: string;
  useBy: string;
  etaMinutes: number;
  status: DonationStatus;
  createdAt: string;
  deliveredQuantity?: number;
  needsReassignment?: boolean;
  assignmentHistory: AssignmentRecord[];
  events: ActivityEvent[];
}

export interface Organization {
  id: string;
  name: string;
  role: Role;
  area: string;
  distanceKm: number;
  capacity: number;
  openUntil: string;
  specialties: Category[];
}

export interface DeliveryPartner {
  id: string;
  name: string;
  area: string;
  distanceKm: number;
  capacity: number;
  available: boolean;
  completedToday: number;
  color: string;
}

export interface DemoState {
  role: Role;
  donations: Donation[];
  notifications: { id: string; title: string; detail: string; time: string; read: boolean; tone: 'green' | 'amber' | 'coral' }[];
}

export interface FoodListingInput {
  foodName: string;
  category: Category;
  quantity: number;
  unit: string;
  servings: number;
  area: string;
  pickupLocation: string;
  pickupWindow: string;
  storage: string;
  foodSafetyNotes: string;
  allergens: string[];
  preparedAt: string;
  useBy: string;
}
