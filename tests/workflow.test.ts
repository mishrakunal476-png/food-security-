import { describe, expect, it } from 'vitest';
import type { DeliveryPartner, Donation, FoodListingInput, Organization } from '../shared/types';
import { canRecommendDelivery, impactTotals, nextStatus, recommendOrganizations, recommendPartners, validateListing } from '../src/services/workflow';
import { getSafetyConcernFlags } from '../shared/safety';

const now = Date.parse('2026-10-27T12:00:00.000Z');
const donation: Donation = {
  id: 'T-1', foodName: 'Garden bowls', category: 'Meals', quantity: 20, unit: 'bowls', servings: 20,
  donorId: 'donor-1', donorName: 'Green Table', ngoId: 'ngo-1', ngoName: 'Hope Kitchen',
  area: 'Indiranagar → Domlur', pickupLocation: 'Sample street', pickupWindow: '6–7 PM', storage: 'Chilled at 4°C', foodSafetyNotes: 'Prepared today; covered after cooling.', allergens: ['Sesame'],
  preparedAt: '2026-10-27T11:00:00.000Z', useBy: '2026-10-27T18:00:00.000Z', etaMinutes: 30, status: 'partner_assigned', createdAt: '2026-10-27T11:00:00.000Z',
  assignmentHistory: [{ partnerId: 'p-1', partnerName: 'Ravi', assignedAt: '2026-10-27T11:30:00.000Z', outcome: 'failed' }], events: [],
};
const input: FoodListingInput = {
  foodName: 'Garden bowls', category: 'Meals', quantity: 20, unit: 'bowls', servings: 20,
  area: 'Indiranagar → Domlur', pickupLocation: 'Sample street', pickupWindow: '6–7 PM', storage: 'Chilled at 4°C', foodSafetyNotes: 'No additional concerns known.',
  allergens: ['Sesame'], preparedAt: '2026-10-27T11:00:00.000Z', useBy: '2026-10-27T18:00:00.000Z',
};

describe('FoodLoop workflow rules', () => {
  it('flags incomplete and expired listings', () => {
    expect(validateListing({ ...input, foodName: '', storage: '' }, now)).toContain('Add a food name.');
    expect(validateListing({ ...input, foodSafetyNotes: '   ' }, now)).toContain('Add food-safety notes or state that no additional concerns are known.');
    expect(validateListing({ ...input, allergens: [] }, now)).toContain('List any known allergens or enter “None known”.');
    expect(validateListing({ ...input, useBy: '2026-10-27T11:30:00.000Z' }, now)).toContain('Use-by time must be in the future.');
    expect(validateListing({ ...input, preparedAt: '2026-10-27T12:30:00.000Z' }, now)).toContain('Preparation time cannot be in the future.');
    expect(validateListing({ ...input, preparedAt: '2026-10-27T12:00:00.000Z', useBy: '2026-10-27T11:55:00.000Z' }, Date.parse('2026-10-27T11:00:00.000Z'))).toContain('Use-by time must be after preparation.');
  });

  it('flags possible food-safety phrases for human review without certifying safety', () => {
    expect(getSafetyConcernFlags('Left unrefrigerated overnight.', 'Ambient storage')).toContain('left unrefrigerated');
    expect(getSafetyConcernFlags('Prepared today; covered and chilled.', 'Chilled at 4°C')).toEqual([]);
  });

  it('does not recommend a route that arrives after use-by', () => {
    expect(canRecommendDelivery({ ...donation, useBy: '2026-10-27T12:20:00.000Z', etaMinutes: 30 }, now)).toBe(false);
    expect(canRecommendDelivery({ ...donation, useBy: '2026-10-27T12:45:00.000Z', etaMinutes: 30 }, now)).toBe(true);
  });

  it('matches NGOs by food type, capacity and distance', () => {
    const orgs: Organization[] = [
      { id: 'far', name: 'Far food bank', role: 'ngo', area: 'Far', distanceKm: 9, capacity: 100, openUntil: '9 PM', specialties: ['Meals'] },
      { id: 'near', name: 'Nearby kitchen', role: 'ngo', area: 'Near', distanceKm: 2, capacity: 30, openUntil: '9 PM', specialties: ['Meals'] },
      { id: 'small', name: 'Small kitchen', role: 'ngo', area: 'Near', distanceKm: 1, capacity: 10, openUntil: '9 PM', specialties: ['Meals'] },
    ];
    expect(recommendOrganizations(donation, orgs, now).map((org) => org.id)).toEqual(['near']);
  });

  it('suggests a capable new partner and retains prior assignments', () => {
    const partners: DeliveryPartner[] = [
      { id: 'p-1', name: 'Unavailable previous', area: 'Near', distanceKm: 0.5, capacity: 80, available: true, completedToday: 5, color: '#fff' },
      { id: 'p-2', name: 'Backup', area: 'Near', distanceKm: 1.2, capacity: 40, available: true, completedToday: 2, color: '#fff' },
      { id: 'p-3', name: 'Too small', area: 'Near', distanceKm: 0.3, capacity: 12, available: true, completedToday: 2, color: '#fff' },
    ];
    expect(recommendPartners(donation, partners).map((partner) => partner.id)).toEqual(['p-2']);
    expect(donation.assignmentHistory[0]?.outcome).toBe('failed');
  });

  it('permits only the expected delivery progression', () => {
    expect(nextStatus('listed', 'matched')).toBe(true);
    expect(nextStatus('partner_assigned', 'picked_up')).toBe(true);
    expect(nextStatus('picked_up', 'delivered')).toBe(true);
    expect(nextStatus('listed', 'delivered')).toBe(false);
  });

  it('labels impact as estimates at the product layer and counts delivered sample food', () => {
    const totals = impactTotals([{ ...donation, status: 'delivered', deliveredQuantity: 17 }]);
    expect(totals).toEqual({ meals: 17, successful: 1, kilograms: 8, successRate: 100 });
    expect(impactTotals([{ ...donation, quantity: 12, servings: 48, status: 'delivered', deliveredQuantity: 12 }]).meals).toBe(48);
  });
});
