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

export const INVOICE_SUPPLIER = {
  legalName: "Once More Entertainments",
  address:
    "Park Plaza, 113 B Wing, Off Yari Road, Versova, Punch Marg. Andheri (West), Mumbai-400061",
  gstin: "27ADWPB0518R2ZZ",
};

export const INDIAN_STATES_AND_UTS = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
] as const;

export const PLAN = {
  code: "verified_listing",
  name: "VENUES LOCATION Verified Listing",
  amount: 3650,
  photoLimit: 20,
  currency: "INR",
  period: "12 months",
  features: [
    "Up to 20 photos per property across your account",
    "Verified venue listing with photos & video",
    "Unlimited enquiries and lead pipeline",
    "Owner dashboard with lead status tracking",
    "Featured placement eligibility",
  ],
};

export const PRO_MARKETING_PLAN = {
  code: "pro_marketing",
  name: "VENUES LOCATION Pro Marketing",
  amount: 36500,
  photoLimit: 60,
  currency: "INR",
  period: "12 months",
  features: [
    "Up to 60 photos per property across your account",
    "Everything in Premium",
    "Dedicated promotional support",
    "Social media promotion",
    "Reels and video promotion",
    "The Location Magazine promotion",
    "Content and campaign support",
  ],
};

export function planPaymentAmount(amount: number) {
  return Math.round(amount * 1.18);
}

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
