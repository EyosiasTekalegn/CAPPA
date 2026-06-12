import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

// Read config
const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function runSync() {
  console.log('Fetching live data from Firestore: %s...', firebaseConfig.firestoreDatabaseId);

  try {
    // 1. Fetch collections
    const collectionsToFetch = ['properties', 'testimonials', 'blogs', 'projects', 'popup_ads', 'users', 'messages'];
    const dataDict: Record<string, any[]> = {};

    for (const colName of collectionsToFetch) {
      try {
        const querySnapshot = await getDocs(collection(db, colName));
        const list: any[] = [];
        querySnapshot.forEach((docSnap) => {
          list.push(docSnap.data());
        });
        console.log(`- Retrieved ${list.length} items from collection: ${colName}`);
        dataDict[colName] = list;
      } catch (err) {
        console.error(`- Failed to fetch collection ${colName}:`, err);
        dataDict[colName] = [];
      }
    }

    // 2. Fetch global settings
    let homeSettings = {
      heroTitle: 'Cappadocia S.C. Real Estate',
      heroSubtitle: 'We construct ultra-luxurious, state-of-the-art residential high-rises and secure family villas in Addis Ababa’s premier diplomatic districts.',
      heroImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=80',
      brandLogo: '',
      brandFavicon: ''
    };
    
    let contactInfo = {
      phone: '+251 911 234567',
      email: 'info@cappadocia.com',
      address: 'Bole Road, Behind Atlas Hotel, Addis Ababa, Ethiopia',
      hqAddress: 'Cappadocia Towers, Bole, Block 12, VIP Lane,\nAddis Ababa, Ethiopia',
      hotline: '+251 911 385500 (Addis HQ)',
      diasporaHotline: '+1 (800) 490-CAP (Diaspora Hotline)'
    };

    let globalSocials = {
      twitter: 'https://twitter.com',
      linkedin: 'https://linkedin.com',
      telegram: 'https://t.me',
      tiktok: 'https://tiktok.com',
      whatsapp: 'https://wa.me',
      facebook: 'https://facebook.com',
      instagram: 'https://instagram.com'
    };

    let teamMembers = [
      {
        name: 'Eleni Gebre',
        role: 'Managing Director',
        desc: 'Guides our corporate vision, diaspora partnerships, and corporate development goals.',
        img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80'
      },
      {
        name: 'Yohannes Tekle',
        role: 'Chief Architect',
        desc: 'Designs beautiful, comfortable, and modern living spaces tailored to metropolitan families.',
        img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80'
      },
      {
        name: 'Martha Kassa',
        role: 'Client Success Desk',
        desc: 'Guarantees transparent and smooth escrow, title deeds, and communication for overseas buyers.',
        img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80'
      },
      {
        name: 'Dawit Assefa',
        role: 'Lead Structural Engineer',
        desc: 'Oversees safety compliance, aggregate testing, and structurally sound tower execution.',
        img: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80'
      }
    ];

    try {
      const docSnap = await getDoc(doc(db, 'settings', 'global'));
      if (docSnap.exists()) {
        const d = docSnap.data();
        if (d.homeSettings) homeSettings = d.homeSettings;
        if (d.contactInfo) contactInfo = d.contactInfo;
        if (d.globalSocials) globalSocials = d.globalSocials;
        if (d.teamMembers) teamMembers = d.teamMembers;
        console.log(`- Retrieved global settings successfully!`);
      } else {
        console.log(`- No global settings document found, using default static guidelines.`);
      }
    } catch (err) {
      console.error(`- Failed to retrieve global settings from Firestore:`, err);
    }

    // 3. Fallback check: If database collection tables are completely empty, let's keep the existing default code.
    const isDbEmpty = Object.values(dataDict).every(arr => arr.length === 0);
    if (isDbEmpty) {
      console.log('Firestore is empty. Static data will not be overwritten to prevent blank pages.');
      return;
    }

    // 4. Build data.ts output
    const outputString = `import { Property, Testimonial, WhyChooseUsItem, AdminUser, Project, Blog, InquiryMessage, PopupAd } from './types';

export const WHY_CHOOSE_US: WhyChooseUsItem[] = [
  {
    id: 'quality',
    title: 'Top Quality Building',
    description: 'We build with the best materials from around the world to make sure your home is strong, safe, and beautiful.'
  },
  {
    id: 'investment',
    title: 'Safe Investment',
    description: 'Buying a home here is a smart choice. Our properties grow in value, making your money work for you.'
  },
  {
    id: 'location',
    title: 'Great Locations',
    description: 'Our homes are in the best, most popular, and safe areas of Addis Ababa, close to everything you need.'
  },
  {
    id: 'concierge',
    title: 'Help After You Buy',
    description: 'We are here for you even after you move in. We help with property management, smart home tips, and other needs.'
  }
];

export const TESTIMONIALS: Testimonial[] = ${JSON.stringify(dataDict.testimonials.length ? dataDict.testimonials : [], null, 2)};

export const PROPERTIES: Property[] = ${JSON.stringify(dataDict.properties.length ? dataDict.properties : [], null, 2)};

export const INITIAL_BLOG_POSTS = ${JSON.stringify(dataDict.blogs.length ? dataDict.blogs : [], null, 2)};

export const INITIAL_POPUP_ADS = ${JSON.stringify(dataDict.popup_ads.length ? dataDict.popup_ads : [], null, 2)};

export const INITIAL_INQUIRY_MESSAGES = ${JSON.stringify(dataDict.messages.length ? dataDict.messages : [], null, 2)};

export const INITIAL_ADMIN_USERS: AdminUser[] = ${JSON.stringify(dataDict.users.length ? dataDict.users : [], null, 2)};

export const INITIAL_PROJECTS = ${JSON.stringify(dataDict.projects.length ? dataDict.projects : [], null, 2)};
`;

    fs.writeFileSync(path.join(process.cwd(), 'src/data.ts'), outputString, 'utf8');
    console.log('Successfully updated src/data.ts with recent live Firestore data!');
  } catch (error) {
    console.error('Failed compiling database data.ts sync:', error);
  }
}

runSync().then(() => process.exit(0));
