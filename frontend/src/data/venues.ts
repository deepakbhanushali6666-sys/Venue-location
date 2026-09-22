import hotel from "@/assets/cat-hotel.jpg";
import resort from "@/assets/cat-resort.jpg";
import farmhouse from "@/assets/cat-farmhouse.jpg";
import villa from "@/assets/cat-villa.jpg";
import banquet from "@/assets/cat-banquet.jpg";
import lawn from "@/assets/cat-lawn.jpg";
import studio from "@/assets/cat-studio.jpg";
import film from "@/assets/cat-film.jpg";

export type CategorySlug =
  | "hotels"
  | "resorts"
  | "farmhouses"
  | "villas"
  | "banquet-halls"
  | "lawns"
  | "studios"
  | "film-shooting-locations"
  | "restaurants"
  | "cafes"
  | "corporate-event-venues"
  | "wedding-venues";

export type Category = {
  slug: CategorySlug;
  name: string;
  image: string;
  blurb: string;
};

export const categories: Category[] = [
  { slug: "resorts", name: "Resorts", image: resort, blurb: "Beach, hill and destination resorts for weddings and shoots." },
  { slug: "hotels", name: "Hotels", image: hotel, blurb: "City and luxury hotels with banquet and rooftop spaces." },
  { slug: "farmhouses", name: "Farmhouses", image: farmhouse, blurb: "Private farmhouses with lawns, pools and open skies." },
  { slug: "banquet-halls", name: "Banquet Halls", image: banquet, blurb: "Air-conditioned halls for weddings and receptions." },
  { slug: "villas", name: "Villas", image: villa, blurb: "Modern and heritage villas for shoots and intimate events." },
  { slug: "studios", name: "Studios", image: studio, blurb: "Soundstages, chroma studios and equipped shoot floors." },
  { slug: "lawns", name: "Lawns", image: lawn, blurb: "Open-air lawns and garden venues for large gatherings." },
  { slug: "film-shooting-locations", name: "Film Shooting Locations", image: film, blurb: "Havelis, streets, industrial and period locations." },
  { slug: "restaurants", name: "Restaurants", image: hotel, blurb: "Private dining rooms and full-buyout restaurants." },
  { slug: "cafes", name: "Cafes", image: villa, blurb: "Character cafes for shoots, launches and meet-ups." },
  { slug: "corporate-event-venues", name: "Corporate Event Venues", image: banquet, blurb: "Conference halls, auditoriums and offsite venues." },
  { slug: "wedding-venues", name: "Wedding Venues", image: lawn, blurb: "Complete wedding destinations with stay and catering." },
];

export const categoryBySlug = (slug: string) => categories.find((c) => c.slug === slug);

// Flip to true to re-enable other states/cities across India.
const ENABLE_OTHER_STATES = false;

const MAHARASHTRA_CITIES = [
  "Mumbai",
  "Navi Mumbai",
  "Thane",
  "Kalyan",
  "Dombivli",
  "Bhiwandi",
  "Ulhasnagar",
  "Panvel",
  "Vasai-Virar",
  "Palghar",
  "Mira-Bhayandar",
  "Pune",
  "Pimpri-Chinchwad",
  "Lonavala",
  "Khandala",
  "Karjat",
  "Alibaug",
  "Raigad",
  "Nashik",
  "Igatpuri",
  "Trimbak",
  "Malegaon",
  "Shirdi",
  "Ahmednagar",
  "Aurangabad",
  "Jalna",
  "Beed",
  "Latur",
  "Nanded",
  "Parbhani",
  "Hingoli",
  "Osmanabad",
  "Nagpur",
  "Wardha",
  "Chandrapur",
  "Gadchiroli",
  "Bhandara",
  "Gondia",
  "Amravati",
  "Akola",
  "Yavatmal",
  "Washim",
  "Buldhana",
  "Kolhapur",
  "Sangli",
  "Miraj",
  "Ichalkaranji",
  "Satara",
  "Solapur",
  "Pandharpur",
  "Ratnagiri",
  "Sindhudurg",
  "Mahabaleshwar",
  "Panchgani",
  "Dhule",
  "Nandurbar",
  "Jalgaon",
];

const OTHER_STATES = ["Goa", "Rajasthan", "Karnataka", "Gujarat", "Delhi NCR"];
const OTHER_CITIES = ["Panjim", "Jaipur", "Udaipur", "Bengaluru", "Ahmedabad", "Delhi"];

export const states = ENABLE_OTHER_STATES ? ["Maharashtra", ...OTHER_STATES] : ["Maharashtra"];

export const cities = ENABLE_OTHER_STATES
  ? [...MAHARASHTRA_CITIES, ...OTHER_CITIES]
  : MAHARASHTRA_CITIES;

// Overall location/space types available for film & photo shoots.
export const locationTypes = [
  "Airports",
  "Apartments",
  "Arc Structure",
  "Auditorium",
  "Bank",
  "Bank Locker",
  "Banquets",
  "Bar & Restaurant",
  "Bridge",
  "Buildings",
  "Bungalows",
  "Cafe & Bar",
  "Canteen",
  "Car Garages",
  "Chawls",
  "Cinema Hall",
  "Clubs",
  "College",
  "Conference Room",
  "Container Yards",
  "Dance Studio",
  "Disco & Pub",
  "Factories",
  "Farm House",
  "Floors",
  "Glass Building",
  "Govt Building",
  "Govt Office",
  "Gym Changing Room",
  "Gymnasium",
  "Haveli",
  "Hospital",
  "Hotel",
  "Jail",
  "Joggers Park",
  "Junk Yard",
  "Kitchen",
  "Labs",
  "Library",
  "Malls",
  "Markets",
  "Mills",
  "Office",
  "Palace",
  "Parking Lot",
  "Petrol Pumps",
  "Ponds & Lakes",
  "Recording Studios",
  "Resort",
  "Restaurant",
  "Row Houses",
  "School",
  "Shops & Stores",
  "Stadium",
  "Studio Sets",
  "Supermarkets",
  "Swimming Pool",
  "Tennis Courts",
  "Villages",
].sort((a, b) => a.localeCompare(b));

export const eventTypes = [
  "Film Shoot",
  "Wedding",
  "Corporate",
  "Birthday",
  "Music Video",
  "Ad Film",
  "TV Serial",
  "Other",
];

export const budgetBands = [
  { label: "Under ₹50,000", min: 0, max: 50000 },
  { label: "₹50,000 – ₹1.5 Lakh", min: 50000, max: 150000 },
  { label: "₹1.5 – ₹5 Lakh", min: 150000, max: 500000 },
  { label: "₹5 Lakh+", min: 500000, max: Number.MAX_SAFE_INTEGER },
];

export const capacityBands = [
  { label: "Up to 100", min: 0, max: 100 },
  { label: "100 – 500", min: 100, max: 500 },
  { label: "500 – 1000", min: 500, max: 1000 },
  { label: "1000+", min: 1000, max: Number.MAX_SAFE_INTEGER },
];

export type Venue = {
  slug: string;
  name: string;
  category: CategorySlug;
  city: string;
  state: string;
  area: string;
  capacity: number;
  startingPrice: number;
  parking: string;
  rating: number;
  featured: boolean;
  suitableFor: string[];
  amenities: string[];
  description: string;
  images: string[];
  videoId: string;
  mapQuery: string;
};

export const venues: Venue[] = [
  {
    slug: "aravalli-crown-resort",
    name: "Aravalli Crown Resort",
    category: "resorts",
    city: "Udaipur",
    state: "Rajasthan",
    area: "Badi Lake Road",
    capacity: 1200,
    startingPrice: 450000,
    parking: "200 cars, valet available",
    rating: 4.9,
    featured: true,
    suitableFor: ["Wedding", "Film Shoot", "Corporate"],
    amenities: ["Infinity Pool", "Poolside Lawn", "120 Rooms", "In-house Catering", "Generator Backup", "Green Rooms"],
    description:
      "A palatial lakeside resort with an infinity pool, sweeping Aravalli views and heritage-style architecture. A long-standing favourite for destination weddings and period film shoots, with dedicated production support and unit parking.",
    images: [resort, banquet, lawn],
    videoId: "ScMzIvxBSi4",
    mapQuery: "Udaipur Rajasthan resort",
  },
  {
    slug: "marine-heights-banquet",
    name: "Marine Heights Grand Banquet",
    category: "banquet-halls",
    city: "Mumbai",
    state: "Maharashtra",
    area: "Andheri West",
    capacity: 700,
    startingPrice: 180000,
    parking: "80 cars, basement parking",
    rating: 4.7,
    featured: true,
    suitableFor: ["Wedding", "Corporate", "Birthday"],
    amenities: ["Crystal Chandeliers", "Central AC", "LED Wall", "Bridal Suite", "Multi-cuisine Kitchen", "Valet"],
    description:
      "A pillar-less banquet hall in the heart of Andheri with 22-ft ceilings, chandelier lighting and a fully equipped kitchen. Ideal for receptions, award nights and corporate conferences.",
    images: [banquet, hotel, villa],
    videoId: "ScMzIvxBSi4",
    mapQuery: "Andheri West Mumbai banquet hall",
  },
  {
    slug: "palmgrove-farmhouse",
    name: "Palmgrove Farmhouse",
    category: "farmhouses",
    city: "Alibaug",
    state: "Maharashtra",
    area: "Awas Beach Road",
    capacity: 350,
    startingPrice: 120000,
    parking: "40 cars on-site",
    rating: 4.8,
    featured: true,
    suitableFor: ["Film Shoot", "Music Video", "Birthday", "Wedding"],
    amenities: ["2 Acre Lawn", "Private Pool", "6 Bedrooms", "Bonfire Pit", "Power Backup", "Unit Parking"],
    description:
      "A coconut-fringed Alibaug farmhouse with a red-tile main house, two acres of lawn and a private pool. Regularly used for music videos, ad films and intimate destination weddings.",
    images: [farmhouse, lawn, villa],
    videoId: "ScMzIvxBSi4",
    mapQuery: "Alibaug Maharashtra farmhouse",
  },
  {
    slug: "studio-nine-soundstage",
    name: "Studio Nine Soundstage",
    category: "studios",
    city: "Mumbai",
    state: "Maharashtra",
    area: "Goregaon Film City Road",
    capacity: 150,
    startingPrice: 95000,
    parking: "Unit vans + 30 cars",
    rating: 4.6,
    featured: true,
    suitableFor: ["Film Shoot", "Ad Film", "TV Serial", "Music Video"],
    amenities: ["9000 sq ft Floor", "Chroma Wall", "Overhead Lighting Grid", "Make-up Rooms", "DG Backup", "Cafeteria"],
    description:
      "A 9000 sq ft soundstage with a full lighting grid, cyclorama and chroma wall, plus make-up rooms and production offices. Built for feature films, commercials and long-format TV shoots.",
    images: [studio, film, hotel],
    videoId: "ScMzIvxBSi4",
    mapQuery: "Goregaon Film City Mumbai studio",
  },
  {
    slug: "rajwada-haveli-location",
    name: "Rajwada Haveli Location",
    category: "film-shooting-locations",
    city: "Jaipur",
    state: "Rajasthan",
    area: "Old City",
    capacity: 200,
    startingPrice: 85000,
    parking: "Unit parking 100m away",
    rating: 4.8,
    featured: false,
    suitableFor: ["Film Shoot", "Ad Film", "Music Video"],
    amenities: ["Period Courtyard", "Stone Arches", "Terrace Access", "Night Shoot Permitted", "Generator Space"],
    description:
      "An authentic 19th-century haveli courtyard with carved sandstone pillars and layered arches — one of the most requested period locations for historical films and fashion campaigns.",
    images: [film, villa, resort],
    videoId: "ScMzIvxBSi4",
    mapQuery: "Old City Jaipur haveli",
  },
  {
    slug: "skyline-business-hotel",
    name: "Skyline Business Hotel",
    category: "hotels",
    city: "Bengaluru",
    state: "Karnataka",
    area: "Outer Ring Road",
    capacity: 500,
    startingPrice: 220000,
    parking: "150 cars, multi-level",
    rating: 4.5,
    featured: false,
    suitableFor: ["Corporate", "Wedding", "Film Shoot"],
    amenities: ["Conference Halls", "240 Rooms", "Rooftop Deck", "High-speed Wi-Fi", "AV Setup", "Airport Transfers"],
    description:
      "A glass-facade business hotel with three conference halls, a rooftop deck and 240 rooms — a practical base for corporate offsites, product launches and city shoots.",
    images: [hotel, banquet, villa],
    videoId: "ScMzIvxBSi4",
    mapQuery: "Outer Ring Road Bengaluru hotel",
  },
  {
    slug: "emerald-lawns",
    name: "Emerald Lawns & Marquee",
    category: "lawns",
    city: "Pune",
    state: "Maharashtra",
    area: "Baner",
    capacity: 1500,
    startingPrice: 160000,
    parking: "250 cars open parking",
    rating: 4.6,
    featured: true,
    suitableFor: ["Wedding", "Corporate", "Birthday"],
    amenities: ["3 Acre Lawn", "Marquee Tent", "String Lighting", "Bridal Room", "Outside Catering Allowed", "Power Backup"],
    description:
      "Three acres of manicured lawn with a permanent marquee, festoon lighting and space for 1500 guests. Outside caterers and decorators are welcome.",
    images: [lawn, farmhouse, banquet],
    videoId: "ScMzIvxBSi4",
    mapQuery: "Baner Pune lawn venue",
  },
  {
    slug: "casa-blanca-villa",
    name: "Casa Blanca Villa",
    category: "villas",
    city: "Lonavala",
    state: "Maharashtra",
    area: "Tungarli",
    capacity: 120,
    startingPrice: 75000,
    parking: "20 cars on-site",
    rating: 4.7,
    featured: false,
    suitableFor: ["Film Shoot", "Music Video", "Birthday"],
    amenities: ["Glass Facade", "Infinity Pool", "5 Bedrooms", "Open Lawn", "Modern Interiors", "24x7 Caretaker"],
    description:
      "A contemporary hillside villa with floor-to-ceiling glass, warm interiors and a lawn that photographs beautifully at blue hour. Popular for fashion shoots and private celebrations.",
    images: [villa, lawn, resort],
    videoId: "ScMzIvxBSi4",
    mapQuery: "Tungarli Lonavala villa",
  },
  {
    slug: "coastline-beach-resort",
    name: "Coastline Beach Resort",
    category: "resorts",
    city: "Panjim",
    state: "Goa",
    area: "Candolim",
    capacity: 800,
    startingPrice: 300000,
    parking: "120 cars",
    rating: 4.8,
    featured: false,
    suitableFor: ["Wedding", "Corporate", "Film Shoot"],
    amenities: ["Private Beach Access", "Poolside Deck", "90 Rooms", "Beach Shack Bar", "Sound Licence", "Spa"],
    description:
      "A beachfront Goan resort with direct sand access, a large pool deck and licensed late-night sound — built for beach weddings and coastal shoots.",
    images: [resort, villa, lawn],
    videoId: "ScMzIvxBSi4",
    mapQuery: "Candolim Goa beach resort",
  },
  {
    slug: "the-courtyard-cafe",
    name: "The Courtyard Cafe",
    category: "cafes",
    city: "Mumbai",
    state: "Maharashtra",
    area: "Bandra West",
    capacity: 80,
    startingPrice: 40000,
    parking: "Street parking",
    rating: 4.4,
    featured: false,
    suitableFor: ["Film Shoot", "Birthday", "Corporate"],
    amenities: ["Character Interiors", "Full Buyout", "Natural Light", "In-house Kitchen", "Wi-Fi"],
    description:
      "A light-filled Bandra cafe available for full buyout — a favourite for dialogue scenes, brand shoots and small launch events.",
    images: [villa, hotel, banquet],
    videoId: "ScMzIvxBSi4",
    mapQuery: "Bandra West Mumbai cafe",
  },
  {
    slug: "the-atrium-conference-centre",
    name: "The Atrium Conference Centre",
    category: "corporate-event-venues",
    city: "Delhi",
    state: "Delhi NCR",
    area: "Aerocity",
    capacity: 900,
    startingPrice: 260000,
    parking: "300 cars",
    rating: 4.6,
    featured: false,
    suitableFor: ["Corporate", "Film Shoot"],
    amenities: ["Auditorium", "Breakout Rooms", "Full AV Stack", "Live Streaming Setup", "Business Lounge", "Catering"],
    description:
      "A purpose-built conference centre in Aerocity with a 900-seat auditorium, breakout rooms and a complete AV and streaming stack.",
    images: [banquet, hotel, studio],
    videoId: "ScMzIvxBSi4",
    mapQuery: "Aerocity Delhi conference centre",
  },
  {
    slug: "heritage-wedding-gardens",
    name: "Heritage Wedding Gardens",
    category: "wedding-venues",
    city: "Ahmedabad",
    state: "Gujarat",
    area: "SG Highway",
    capacity: 2000,
    startingPrice: 380000,
    parking: "400 cars",
    rating: 4.7,
    featured: false,
    suitableFor: ["Wedding", "Birthday", "Corporate"],
    amenities: ["Two Lawns", "Indoor Hall", "40 Guest Rooms", "Mandap Setup", "In-house Decor", "Power Backup"],
    description:
      "A complete wedding destination with two lawns, an indoor hall for 800, guest rooms and in-house decor and catering teams.",
    images: [lawn, banquet, resort],
    videoId: "ScMzIvxBSi4",
    mapQuery: "SG Highway Ahmedabad wedding venue",
  },
];

export const venueBySlug = (slug: string) => venues.find((v) => v.slug === slug);

export const formatINR = (value: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

export const testimonials = [
  {
    name: "Rohan Mehta",
    role: "Line Producer, Feature Films",
    quote:
      "We scouted three period locations in under a week. VENUES LOCATION's team knew exactly which haveli would work for our night schedule — and had permissions sorted.",
  },
  {
    name: "Priya Nair",
    role: "Bride, Udaipur Wedding",
    quote:
      "They shortlisted five resorts inside our budget and arranged site visits on the same trip. We booked within ten days without any run-around.",
  },
  {
    name: "Ankit Shah",
    role: "Head of Events, IT Company",
    quote:
      "Our annual offsite for 600 people was locked in three days. Verified listings and a single point of contact made the whole thing painless.",
  },
];

export const CONTACT = {
  phone: "9768676666",
  phoneIntl: "919768676666",
  email: "info@venueslocation.com",
  site: "www.venueslocation.com",
  social: {
    facebook: "https://facebook.com/venueslocation",
    instagram: "https://instagram.com/venueslocation",
    twitter: "https://twitter.com/venueslocation",
    linkedin: "https://linkedin.com/company/venueslocation",
    youtube: "https://youtube.com/@venueslocation",
    pinterest: "https://pinterest.com/venueslocation",
  },
};
