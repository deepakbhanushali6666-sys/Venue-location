export const PAID_LISTING_PLANS = {
  verified_listing: { amount: 3650, name: "VENUES LOCATION Verified Listing", photoLimit: 20 },
  pro_marketing: { amount: 36500, name: "VENUES LOCATION Pro Marketing", photoLimit: 60 },
} as const;

export function subscriptionPhotoLimit(
  subscription: { status: string; amount: number; expires_on: string | null } | null,
  today = new Date().toISOString().slice(0, 10),
) {
  if (!subscription || subscription.status !== "active" ||
    (subscription.expires_on !== null && subscription.expires_on < today)) return 10;
  if (subscription.amount === PAID_LISTING_PLANS.pro_marketing.amount) return 60;
  if (subscription.amount === PAID_LISTING_PLANS.verified_listing.amount) return 20;
  return 10;
}
