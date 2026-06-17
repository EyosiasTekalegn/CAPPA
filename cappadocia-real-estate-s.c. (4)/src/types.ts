export type ConstructionStatus = 'Pre-selling' | 'Excavation' | 'Structure Work' | 'Finishing Stage' | 'Ready to Deliver';

export interface UnitDetail {
  id: string;
  name: string;
  bedrooms: number;
  bathrooms: number;
  areaSqm: number;
}

export interface Property {
  id: string;
  title: string;
  location: string;
  subCity: string;
  type: string;
  price: number;
  areaSqm: number;
  unitsInfo?: UnitDetail[];
  floorsCount: number;
  unitsCount: number;
  constructionStatus: ConstructionStatus;
  completionPercentage: number;
  status: 'For Sale';
  availability: 'Available' | 'Reserved' | 'Sold';
  showOnHomepage?: boolean;
  yearBuilt: number;
  bedrooms?: number;
  bathrooms?: number;
  featuredImage: string;
  galleryImages: string[];
  description: string;
  amenities: string[];
  videoTourUrl?: string;
  mapEmbedUrl?: string;
  virtualTour: {
    title: string;
    rooms: {
      name: string;
      image: string;
      hotspots: { text: string; targetRoom: string; x: number; y: number }[];
    }[];
  };
}

export interface Testimonial {
  id: string;
  clientName: string;
  rating: number;
  testimony: string;
  propertyPurchased: string;
  image?: string; // NEW: client photo or testimonial image
}

export interface WhyChooseUsItem {
  id: string;
  title: string;
  description: string;
}

export interface Blog {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  image: string;
  date: string;
  author: string;
}

export interface PopupAd {
  id: string;
  title: string;
  content: string;
  imageUrl: string;
  ctaText: string;
  ctaLink: string;
  isActive: boolean;
  displayFrequency: 'always' | 'once';
}

export interface InquiryMessage {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  propertyTitle?: string;
  message: string;
  date: string;
  status: 'New' | 'Replied' | 'Closed';
  replyText?: string;
  replyDate?: string;
}

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  password?: string;
  role: 'Owner' | 'Manager' | 'Sales';
  isActive: boolean;
}

export interface Project {
  id: string;
  year: string;
  title: string;
  subCity: string;
  description: string;
  achievements: string[];
  image: string;
  specs: string;
}

export interface ActivityLog {
  id: string;
  time: string;
  type: 'auth' | 'message' | 'property' | 'project' | 'campaign' | 'system' | 'blog' | 'testimonial';
  message: string;
}

// NEW: Contact Button Settings
export interface ContactButtonSettings {
  action: 'send_message' | 'open_link' | 'both';
  linkUrl: string;
  linkLabel: string; // button text
}
