export const BUSINESS = {
  legalName: "VENUES LOCATION",
  tagline: "Venues & Film Shooting Locations",
  address: "Mumbai, Maharashtra, India",
  gstin: "",
  pan: "",
  email: "info@venueslocation.com",
  phone: "9768676666",
  website: "www.venueslocation.com",
};

export const PLAN = {
  name: "VENUES LOCATION Annual Listing Plan",
  amount: 3650,
  currency: "INR",
  period: "12 months",
  features: [
    "Verified venue listing with photos & video",
    "Unlimited enquiries and lead pipeline",
    "Owner dashboard with lead status tracking",
    "Featured placement eligibility",
    "GST invoice for every payment",
  ],
};

export const PAYMENT_DETAILS = {
  upiId: "omslocation@upi",
  upiName: "VENUES LOCATION",
  bankName: "—",
  accountName: "VENUES LOCATION",
  accountNumber: "—",
  ifsc: "—",
};

export function upiLink(amount: number, note: string) {
  const params = new URLSearchParams({
    pa: PAYMENT_DETAILS.upiId,
    pn: PAYMENT_DETAILS.upiName,
    am: String(amount),
    cu: "INR",
    tn: note,
  });
  return `upi://pay?${params.toString()}`;
}

export function formatINR(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}
