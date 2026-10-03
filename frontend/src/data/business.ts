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
  code: "verified_listing",
  name: "VENUES LOCATION Verified Listing",
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

export const PRO_MARKETING_PLAN = {
  code: "pro_marketing",
  name: "VENUES LOCATION Pro Marketing",
  amount: 36500,
  currency: "INR",
  period: "12 months",
  features: [
    "Everything in Premium",
    "Dedicated promotional support",
    "Social media promotion",
    "Reels and video promotion",
    "The Location Magazine promotion",
    "Content and campaign support",
  ],
};

export const PAYMENT_DETAILS = {
  upiId: "oncemore@axisbank",
  upiName: "Once More Entertainment",
  bankName: "AXIS BANK LTD",
  branch: "Seven Bungalows, Andheri, Mumbai, Maharashtra 400053",
  accountName: "Once More Entertainment",
  accountNumber: "918020091713481",
  ifsc: "UTIBOO01154",
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
