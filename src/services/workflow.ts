import type { DeliveryPartner, Donation, DonationStatus, FoodListingInput, Organization } from '../../shared/types';

export function hoursUntil(expiry: string, now = Date.now()): number {
  return (new Date(expiry).getTime() - now) / 3_600_000;
}

export function isExpiryUrgent(donation: Donation, now = Date.now()): boolean {
  const remaining = hoursUntil(donation.useBy, now);
  return remaining >= 0 && remaining <= 2;
}

export function canRecommendDelivery(donation: Donation, now = Date.now()): boolean {
  const arrival = now + donation.etaMinutes * 60_000;
  return new Date(donation.useBy).getTime() > arrival;
}

export function recommendOrganizations(donation: Donation, orgs: Organization[], now = Date.now()): Organization[] {
  if (!canRecommendDelivery(donation, now)) return [];
  return orgs
    .filter((org) => org.capacity >= donation.servings && org.specialties.includes(donation.category) && org.distanceKm <= 8)
    .sort((a, b) => a.distanceKm - b.distanceKm || a.capacity - b.capacity);
}

export function recommendPartners(donation: Donation, partners: DeliveryPartner[]): DeliveryPartner[] {
  const alreadyAssigned = new Set(donation.assignmentHistory.map((item) => item.partnerId));
  return partners
    .filter((partner) => partner.available && partner.capacity >= donation.servings && !alreadyAssigned.has(partner.id))
    .sort((a, b) => a.distanceKm - b.distanceKm || a.completedToday - b.completedToday);
}

export function nextStatus(current: DonationStatus, next: DonationStatus): boolean {
  const allowed: Record<DonationStatus, DonationStatus[]> = {
    listed: ['matched', 'declined'],
    matched: ['partner_assigned', 'declined'],
    partner_assigned: ['picked_up', 'matched'],
    picked_up: ['delivered'],
    delivered: [],
    declined: [],
  };
  return allowed[current].includes(next);
}

export function validateListing(input: FoodListingInput, now = Date.now()): string[] {
  const errors: string[] = [];
  if (!input.foodName.trim()) errors.push('Add a food name.');
  if (input.quantity <= 0) errors.push('Quantity must be greater than zero.');
  if (input.servings <= 0) errors.push('Estimated servings must be greater than zero.');
  if (!input.pickupLocation.trim()) errors.push('Add a pickup location.');
  if (!input.pickupWindow.trim()) errors.push('Add a pickup window.');
  if (!input.storage.trim()) errors.push('Describe storage conditions.');
  if (!input.foodSafetyNotes.trim()) errors.push('Add food-safety notes or state that no additional concerns are known.');
  if (!input.allergens.some((allergen) => allergen.trim())) errors.push('List any known allergens or enter “None known”.');
  const preparedAt = new Date(input.preparedAt).getTime();
  const useBy = new Date(input.useBy).getTime();
  if (!input.preparedAt || !Number.isFinite(preparedAt)) errors.push('Add a valid preparation time.');
  else if (preparedAt > now) errors.push('Preparation time cannot be in the future.');
  if (!input.useBy || !Number.isFinite(useBy) || useBy <= now) errors.push('Use-by time must be in the future.');
  else if (Number.isFinite(preparedAt) && useBy <= preparedAt) errors.push('Use-by time must be after preparation.');
  if (!input.area.trim()) errors.push('Add the pickup and destination area.');
  return errors;
}

export function impactTotals(donations: Donation[]) {
  const delivered = donations.filter((donation) => donation.status === 'delivered');
  const meals = delivered.reduce((total, donation) => {
    const deliveredUnits = Math.max(0, Math.min(donation.quantity, donation.deliveredQuantity ?? donation.quantity));
    const servingFraction = donation.quantity > 0 ? deliveredUnits / donation.quantity : 0;
    return total + Math.round(donation.servings * servingFraction);
  }, 0);
  const successful = delivered.length;
  return {
    meals,
    successful,
    kilograms: Math.round(meals * 0.45),
    successRate: donations.length ? Math.round((successful / donations.length) * 100) : 0,
  };
}
