import React, { useState, useEffect } from 'react';
import { collection, doc, onSnapshot, setDoc, deleteDoc, getDocFromServer } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { 
  MapPin, 
  Map,
  Home, 
  Bed, 
  Bath, 
  Maximize, 
  Search, 
  Star, 
  Phone, 
  Mail, 
  ChevronRight, 
  ChevronDown,
  Check,
  Heart, 
  Lock, 
  Menu, 
  X, 
  ShieldCheck, 
  Award, 
  Clock, 
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Compass,
  ArrowBigUpDash,
  Sun,
  Moon,
  TrendingUp,
  Megaphone,
  User,
  ExternalLink,
  Instagram
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PROPERTIES, 
  WHY_CHOOSE_US, 
  TESTIMONIALS, 
  INITIAL_BLOG_POSTS, 
  INITIAL_POPUP_ADS, 
  INITIAL_INQUIRY_MESSAGES, 
  INITIAL_ADMIN_USERS,
  INITIAL_PROJECTS
} from './data';
import { Property, Testimonial, Blog, PopupAd, InquiryMessage, AdminUser, Project, ActivityLog } from './types';
import PropertyDetails from './components/PropertyDetails';
import AdminPanel from './components/AdminPanel';
import Login from './components/Login';
import CustomPopup from './components/CustomPopup';
import ContactDropdown from './components/ContactDropdown';

const tabLabels = {
  home: 'Home',
  about: 'About',
  properties: 'Properties',
  projects: 'Projects',
  blog: 'Blog',
  favorites: 'Favourites',
  contact: 'Contact',
  admin: 'Admin',
};

function safelyParseJSON<T>(key: string, defaultValue: T): T {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return defaultValue;
    return JSON.parse(saved);
  } catch (e) {
    console.error(`Error parsing localStorage key "${key}":`, e);
    return defaultValue;
  }
}

export default function App() {
  // Base React states
  const [propertiesState, setPropertiesState] = useState<Property[]>(() => 
    safelyParseJSON<Property[]>('cap_properties', PROPERTIES)
  );
  
  const [globalSocials, setGlobalSocials] = useState(() => 
    safelyParseJSON('cap_socials', {
        twitter: 'https://twitter.com',
        linkedin: 'https://linkedin.com',
        telegram: 'https://t.me',
        tiktok: 'https://tiktok.com',
        whatsapp: 'https://wa.me',
        facebook: 'https://facebook.com',
        instagram: 'https://instagram.com'
    })
  );

  const [contactInfo, setContactInfo] = useState(() => 
    safelyParseJSON('cap_contact_info', {
      phone: '+251 911 234567',
      email: 'info@cappadocia.com',
      address: 'Bole Road, Behind Atlas Hotel, Addis Ababa, Ethiopia',
      hqAddress: 'Cappadocia Towers, Bole, Block 12, VIP Lane,\nAddis Ababa, Ethiopia',
      hotline: '+251 911 385500 (Addis HQ)',
      diasporaHotline: '+1 (800) 490-CAP (Diaspora Hotline)'
    })
  );

  const [teamMembers, setTeamMembers] = useState(() => 
    safelyParseJSON('cap_team_members', [
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
    ])
  );

  const contact = {
    ...{
      phone: '+251 911 234567',
      email: 'info@cappadocia.com',
      address: 'Bole Road, Behind Atlas Hotel, Addis Ababa, Ethiopia',
      hqAddress: 'Cappadocia Towers, Bole, Block 12, VIP Lane,\nAddis Ababa, Ethiopia',
      hotline: '+251 911 385500 (Addis HQ)',
      diasporaHotline: '+1 (800) 490-CAP (Diaspora Hotline)'
    },
    ...contactInfo
  };

  const [testimonialsState, setTestimonialsState] = useState<Testimonial[]>(() => 
    safelyParseJSON<Testimonial[]>('cap_testimonials', TESTIMONIALS)
  );

  const [blogsState, setBlogsState] = useState<Blog[]>(() => 
    safelyParseJSON<Blog[]>('cap_blogs', INITIAL_BLOG_POSTS)
  );

  const [popupAdsState, setPopupAdsState] = useState<PopupAd[]>(() => 
    safelyParseJSON<PopupAd[]>('cap_popup_ads', INITIAL_POPUP_ADS as PopupAd[])
  );

  const [messagesState, setMessagesState] = useState<InquiryMessage[]>(() => 
    safelyParseJSON<InquiryMessage[]>('cap_messages', INITIAL_INQUIRY_MESSAGES as InquiryMessage[])
  );

  const [usersState, setUsersState] = useState<AdminUser[]>(() => 
    safelyParseJSON<AdminUser[]>('cap_users', INITIAL_ADMIN_USERS)
  );

  const [projectsState, setProjectsState] = useState<Project[]>(() => 
    safelyParseJSON<Project[]>('cap_projects', INITIAL_PROJECTS)
  );

  const [homeSettings, setHomeSettingsState] = useState<{
    heroTitle: string;
    heroSubtitle: string;
    heroImage: string;
    brandLogo?: string;
    brandFavicon?: string;
  }>(() => 
    safelyParseJSON('cap_home_settings', {
      heroTitle: 'Cappadocia S.C. Real Estate',
      heroSubtitle: 'We construct ultra-luxurious, state-of-the-art residential high-rises and secure family villas in Addis Ababa’s premier diplomatic districts.',
      heroImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=80',
      brandLogo: '',
      brandFavicon: ''
    })
  );

  const setHomeSettings = (action: React.SetStateAction<{
    heroTitle: string;
    heroSubtitle: string;
    heroImage: string;
    brandLogo?: string;
    brandFavicon?: string;
  }>) => {
    setHomeSettingsState((prev) => {
      const next = typeof action === 'function' ? action(prev) : action;
      syncSettingsToFirestore('homeSettings', next);
      return next;
    });
  };

  const [allLocations, setAllLocations] = useState<string[]>(() =>
    safelyParseJSON<string[]>('cap_all_locations', ['Bole', 'Kazanchis', 'CMC', 'Summit'])
  );

  const [allTypes, setAllTypes] = useState<string[]>(() =>
    safelyParseJSON<string[]>('cap_all_types', ['Luxury Villa', 'Modern Penthouse', 'Exclusive Apartment', 'Townhouse'])
  );

  const [allAmenities, setAllAmenities] = useState<string[]>(() =>
    safelyParseJSON<string[]>('cap_all_amenities', [])
  );

  const syncSettingsToFirestore = async (key: string, data: any) => {
    try {
      await setDoc(doc(db, 'settings', 'global'), { [key]: data }, { merge: true });
    } catch (error) {
      console.error(`Error saving ${key} setting to Firestore:`, error);
    }
  };

  // Firestore Sync Helper Function
  const syncCollectionToFirestore = async <T extends { id: string }>(
    collectionName: string,
    prev: T[],
    next: T[]
  ) => {
    for (const item of next) {
      const prevItem = prev.find((i) => i.id === item.id);
      if (!prevItem || JSON.stringify(prevItem) !== JSON.stringify(item)) {
        try {
          await setDoc(doc(db, collectionName, item.id), item);
        } catch (error) {
          console.error(`Error saving ${collectionName} item to Firestore:`, error);
          handleFirestoreError(error, OperationType.WRITE, `${collectionName}/${item.id}`);
        }
      }
    }
    for (const item of prev) {
      const stillExists = next.some((i) => i.id === item.id);
      if (!stillExists) {
        try {
          await deleteDoc(doc(db, collectionName, item.id));
        } catch (error) {
          console.error(`Error deleting ${collectionName} item from Firestore:`, error);
          handleFirestoreError(error, OperationType.DELETE, `${collectionName}/${item.id}`);
        }
      }
    }
  };

  const properties = propertiesState;
  const setProperties = (action: React.SetStateAction<Property[]>) => {
    setPropertiesState((prev) => {
      const next = typeof action === 'function' ? action(prev) : action;
      syncCollectionToFirestore<Property>('properties', prev, next);
      return next;
    });
  };

  const testimonials = testimonialsState;
  const setTestimonials = (action: React.SetStateAction<Testimonial[]>) => {
    setTestimonialsState((prev) => {
      const next = typeof action === 'function' ? action(prev) : action;
      syncCollectionToFirestore<Testimonial>('testimonials', prev, next);
      return next;
    });
  };

  const blogs = blogsState;
  const setBlogs = (action: React.SetStateAction<Blog[]>) => {
    setBlogsState((prev) => {
      const next = typeof action === 'function' ? action(prev) : action;
      syncCollectionToFirestore<Blog>('blogs', prev, next);
      return next;
    });
  };

  const projects = projectsState;
  const setProjects = (action: React.SetStateAction<Project[]>) => {
    setProjectsState((prev) => {
      const next = typeof action === 'function' ? action(prev) : action;
      syncCollectionToFirestore<Project>('projects', prev, next);
      return next;
    });
  };

  const messages = messagesState;
  const setMessages = (action: React.SetStateAction<InquiryMessage[]>) => {
    setMessagesState((prev) => {
      const next = typeof action === 'function' ? action(prev) : action;
      syncCollectionToFirestore<InquiryMessage>('messages', prev, next);
      return next;
    });
  };

  const popupAds = popupAdsState;
  const setPopupAds = (action: React.SetStateAction<PopupAd[]>) => {
    setPopupAdsState((prev) => {
      const next = typeof action === 'function' ? action(prev) : action;
      syncCollectionToFirestore<PopupAd>('popup_ads', prev, next);
      return next;
    });
  };

  const users = usersState;
  const setUsers = (action: React.SetStateAction<AdminUser[]>) => {
    setUsersState((prev) => {
      const next = typeof action === 'function' ? action(prev) : action;
      syncCollectionToFirestore<AdminUser>('users', prev, next);
      return next;
    });
  };

  // Listen live to Firestore collections
  useEffect(() => {
    const unsubProperties = onSnapshot(collection(db, 'properties'), (snapshot) => {
      const list: Property[] = [];
      snapshot.forEach((docSnap) => list.push(docSnap.data() as Property));
      setPropertiesState(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'properties');
    });

    const unsubTestimonials = onSnapshot(collection(db, 'testimonials'), (snapshot) => {
      const list: Testimonial[] = [];
      snapshot.forEach((docSnap) => list.push(docSnap.data() as Testimonial));
      setTestimonialsState(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'testimonials');
    });

    const unsubBlogs = onSnapshot(collection(db, 'blogs'), (snapshot) => {
      const list: Blog[] = [];
      snapshot.forEach((docSnap) => list.push(docSnap.data() as Blog));
      setBlogsState(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'blogs');
    });

    const unsubProjects = onSnapshot(collection(db, 'projects'), (snapshot) => {
      const list: Project[] = [];
      snapshot.forEach((docSnap) => list.push(docSnap.data() as Project));
      setProjectsState(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'projects');
    });

    const unsubMessages = onSnapshot(collection(db, 'messages'), (snapshot) => {
      const list: InquiryMessage[] = [];
      snapshot.forEach((docSnap) => list.push(docSnap.data() as InquiryMessage));
      setMessagesState(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'messages');
    });

    const unsubPopupAds = onSnapshot(collection(db, 'popup_ads'), (snapshot) => {
      const list: PopupAd[] = [];
      snapshot.forEach((docSnap) => list.push(docSnap.data() as PopupAd));
      setPopupAdsState(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'popup_ads');
    });

    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const list: AdminUser[] = [];
      snapshot.forEach((docSnap) => list.push(docSnap.data() as AdminUser));
      setUsersState(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
    });

    const unsubSettings = onSnapshot(doc(db, 'settings', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.homeSettings) setHomeSettingsState(data.homeSettings);
        if (data.contactInfo) setContactInfo(data.contactInfo);
        if (data.globalSocials) setGlobalSocials(data.globalSocials);
        if (data.teamMembers) setTeamMembers(data.teamMembers);
        if (data.allLocations) setAllLocations(data.allLocations);
        if (data.allTypes) setAllTypes(data.allTypes);
        if (data.allAmenities) setAllAmenities(data.allAmenities);
      }
    }, (error) => {
      console.error(error);
    });

    return () => {
      unsubProperties();
      unsubTestimonials();
      unsubBlogs();
      unsubProjects();
      unsubMessages();
      unsubPopupAds();
      unsubUsers();
      unsubSettings();
    };
  }, []);

  // Core UI Control States
  const [activeTab, setActiveTab] = useState<'home' | 'properties' | 'projects' | 'favorites' | 'about' | 'blog' | 'contact' | 'admin'>('home');
  const [loggedInUser, setLoggedInUser] = useState<AdminUser | null>(null);
  const [activePropertyId, setActivePropertyId] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => 
    safelyParseJSON<boolean>('cap_dark_mode', false)
  );

  // Routing for /admin
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/admin') {
      setActiveTab('admin');
    }
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      if (window.location.pathname === '/admin') {
        setActiveTab('admin');
      } else if (activeTab === 'admin') {
        setActiveTab('home');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [activeTab]);

  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
        console.log('Successfully connected to Firebase Firestore');
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error('Please check your Firebase configuration.');
        }
      }
    }
    testConnection();
  }, []);

  // Check URL pathname for admin route initially
  useEffect(() => {
    if (window.location.pathname === '/admin') {
      setActiveTab('admin');
      window.history.replaceState({}, '', '/admin');
    }
  }, []);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Custom dialog popup states and helper functions
  const [dialog, setDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'alert' | 'confirm';
    onConfirm: () => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'alert',
    onConfirm: () => {},
  });

  const showAlert = (title: string, message: string, callback?: () => void) => {
    setDialog({
      isOpen: true,
      title,
      message,
      type: 'alert',
      onConfirm: () => {
        setDialog(prev => ({ ...prev, isOpen: false }));
        if (callback) callback();
      },
      confirmText: 'Acknowledge'
    });
  };

  const showConfirm = (title: string, message: string, onConfirmAction: () => void, onCancelAction?: () => void) => {
    setDialog({
      isOpen: true,
      title,
      message,
      type: 'confirm',
      onConfirm: () => {
        setDialog(prev => ({ ...prev, isOpen: false }));
        onConfirmAction();
      },
      onCancel: () => {
        setDialog(prev => ({ ...prev, isOpen: false }));
        if (onCancelAction) onCancelAction();
      },
      confirmText: 'Yes, Proceed',
      cancelText: 'Cancel'
    });
  };

  const [isRestoring, setIsRestoring] = useState(false);

  const restoreOriginalWebsiteContent = async () => {
    setIsRestoring(true);
    try {
      const collectionsToReset = [
        { name: 'properties', defaults: PROPERTIES },
        { name: 'testimonials', defaults: TESTIMONIALS },
        { name: 'blogs', defaults: INITIAL_BLOG_POSTS },
        { name: 'projects', defaults: INITIAL_PROJECTS },
        { name: 'popup_ads', defaults: INITIAL_POPUP_ADS },
        { name: 'users', defaults: INITIAL_ADMIN_USERS },
        { name: 'messages', defaults: INITIAL_INQUIRY_MESSAGES }
      ];

      localStorage.removeItem('cap_properties');
      localStorage.removeItem('cap_testimonials');
      localStorage.removeItem('cap_blogs');
      localStorage.removeItem('cap_projects');
      localStorage.removeItem('cap_popup_ads');
      localStorage.removeItem('cap_users');
      localStorage.removeItem('cap_messages');
      localStorage.removeItem('cap_home_settings');

      for (const col of collectionsToReset) {
        let docsToDelete: string[] = [];
        if (col.name === 'properties') docsToDelete = propertiesState.map(x => x.id);
        else if (col.name === 'testimonials') docsToDelete = testimonialsState.map(x => x.id);
        else if (col.name === 'blogs') docsToDelete = blogsState.map(x => x.id);
        else if (col.name === 'projects') docsToDelete = projectsState.map(x => x.id);
        else if (col.name === 'popup_ads') docsToDelete = popupAdsState.map(x => x.id);
        else if (col.name === 'users') docsToDelete = usersState.map(x => x.id);
        else if (col.name === 'messages') docsToDelete = messagesState.map(x => x.id);

        for (const docId of docsToDelete) {
          try {
            await deleteDoc(doc(db, col.name, docId));
          } catch (delErr) {
            console.error(`Deleting doc ${docId} from ${col.name} failed:`, delErr);
          }
        }

        for (const item of col.defaults) {
          const itemWithId = { ...item } as any;
          if (!itemWithId.id) {
            itemWithId.id = `msg-${Math.floor(Math.random() * 90000 + 10000)}`;
          }
          await setDoc(doc(db, col.name, itemWithId.id), itemWithId);
        }
      }

      setHomeSettings({
        heroTitle: 'Cappadocia S.C. Real Estate',
        heroSubtitle: 'We construct ultra-luxurious, state-of-the-art residential high-rises and secure family villas in Addis Ababa’s premier diplomatic districts.',
        heroImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=80',
        brandLogo: '',
        brandFavicon: ''
      });

      logActivity('system', 'System database restored to original Cappadocia Real Estate S.C. luxury assets portfolio.');
      showAlert(
        'System Restored Successfully',
        'All properties, blogs, projects, testimonials, staff profiles, and inquiry messages have been cleanly restored to the original high-end Cappadocia Real Estate S.C. showcase content.'
      );
    } catch (err: any) {
      console.error('System restore error:', err);
      showAlert('Restore Failed', `An error occurred during system restoration: ${err?.message || err}`);
    } finally {
      setIsRestoring(false);
    }
  };

  // Compare states
  const [comparePropertyIds, setComparePropertyIds] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  const handleToggleCompare = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setComparePropertyIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        if (prev.length >= 3) {
          showAlert('Comparison Limit', 'You can select up to 3 properties to compare side-by-side.');
          return prev;
        }
        return [...prev, id];
      }
    });
  };

  // Favorites logic
  const [favorites, setFavorites] = useState<string[]>(() => 
    safelyParseJSON<string[]>('cap_favorites', [])
  );

  // Dynamic filter state
  const [searchLocation, setSearchLocation] = useState('');
  const [searchType, setSearchType] = useState('');
  const [searchBedrooms, setSearchBedrooms] = useState('');
  const [hoveredSubCity, setHoveredSubCity] = useState<string | null>(null);

  // Dropdown Open States and map toggles
  const [mapDrawerOpen, setMapDrawerOpen] = useState(false);
  const [locDropdownOpen, setLocDropdownOpen] = useState(false);
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [bedsDropdownOpen, setBedsDropdownOpen] = useState(false);

  // Load More logic (Latest Listing component on Home tab)
  const [loadMoreClicks, setLoadMoreClicks] = useState(0);
  const [latestExpanded, setLatestExpanded] = useState(false);

  // Active advertisement display controller
  const [currentActiveAd, setCurrentActiveAd] = useState<PopupAd | null>(null);
  const [adDismissed, setAdDismissed] = useState(false);

  // Contact page states
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMsg, setContactMsg] = useState('');
  const [contactSuccess, setContactSuccess] = useState(false);

  // Selected blog modal view
  const [viewingBlog, setViewingBlog] = useState<Blog | null>(null);

  // Dynamic Activity Logs State
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => 
    safelyParseJSON<ActivityLog[]>('cap_activity_logs', [
      { id: 'act-1', time: new Date(Date.now() - 3600000 * 2).toISOString(), type: 'system', message: 'System initialized successfully under security coordinates.' },
      { id: 'act-2', time: new Date(Date.now() - 3600000 * 1.5).toISOString(), type: 'property', message: 'Verified Bole Premium Duplex structural specifications.' },
      { id: 'act-3', time: new Date(Date.now() - 3600000 * 0.8).toISOString(), type: 'campaign', message: 'Active Pop-up Promo Campaign"Mid-Year Escrow Discount" updated.' },
    ])
  );

  const logActivity = (type: ActivityLog['type'], message: string) => {
    const newLog: ActivityLog = {
      id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      time: new Date().toISOString(),
      type,
      message
    };
    setActivityLogs(prev => {
      const updated = [newLog, ...prev].slice(0, 50);
      return updated;
    });
  };

  useEffect(() => {
    localStorage.setItem('cap_activity_logs', JSON.stringify(activityLogs));
  }, [activityLogs]);

  // Synchronize dynamic updates directly into localStorage
  useEffect(() => {
    localStorage.setItem('cap_properties', JSON.stringify(properties));
  }, [properties]);

  useEffect(() => {
    localStorage.setItem('cap_testimonials', JSON.stringify(testimonials));
  }, [testimonials]);

  useEffect(() => {
    localStorage.setItem('cap_blogs', JSON.stringify(blogs));
  }, [blogs]);

  useEffect(() => {
    localStorage.setItem('cap_popup_ads', JSON.stringify(popupAds));
  }, [popupAds]);

  useEffect(() => {
    localStorage.setItem('cap_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('cap_users', JSON.stringify(users));
  }, [users]);

  // Administrative Session Inactivity Auto-Logout
  useEffect(() => {
    if (!loggedInUser) return;

    let timeoutId: NodeJS.Timeout;

    const logoutDueToInactivity = () => {
      setLoggedInUser(null);
      logActivity('auth', 'Logged out automatically due to 30 minutes of administrative inactivity');
      showAlert('Session Timeout', 'Your administration session has been automatically closed after 30 minutes of inactive idle state.');
    };

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(logoutDueToInactivity, 30 * 60 * 1000);
    };

    resetTimer();

    const activityEvents = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'];
    
    activityEvents.forEach(evt => {
      window.addEventListener(evt, resetTimer);
    });

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      activityEvents.forEach(evt => {
        window.removeEventListener(evt, resetTimer);
      });
    };
  }, [loggedInUser]);

  useEffect(() => {
    localStorage.setItem('cap_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('cap_home_settings', JSON.stringify(homeSettings));
    try {
      const faviconUrl = homeSettings.brandFavicon || "/favicon.png";
      const links = document.querySelectorAll("link[rel*='icon']");
      if (links && links.length > 0) {
        links.forEach((link: any) => {
          link.href = faviconUrl;
        });
      }
    } catch (e) {
      console.error('Error updating brand favicon:', e);
    }
  }, [homeSettings]);

  useEffect(() => {
    localStorage.setItem('cap_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('cap_all_locations', JSON.stringify(allLocations));
  }, [allLocations]);

  useEffect(() => {
    localStorage.setItem('cap_all_types', JSON.stringify(allTypes));
  }, [allTypes]);

  useEffect(() => {
    localStorage.setItem('cap_all_amenities', JSON.stringify(allAmenities));
  }, [allAmenities]);

  useEffect(() => {
    localStorage.setItem('cap_socials', JSON.stringify(globalSocials));
  }, [globalSocials]);

  useEffect(() => {
    localStorage.setItem('cap_contact_info', JSON.stringify(contactInfo));
  }, [contactInfo]);

  useEffect(() => {
    localStorage.setItem('cap_dark_mode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('cap_team_members', JSON.stringify(teamMembers));
  }, [teamMembers]);

  // Transparents scrolling header tracker
  useEffect(() => {
    const tracking = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', tracking);
    return () => window.removeEventListener('scroll', tracking);
  }, []);

  // AUTOMATIC AD TRIGGERING CAPABILITIES
  useEffect(() => {
    const activeCampaign = popupAds.find(ad => ad.isActive);
    if (activeCampaign && !adDismissed && activeTab !== 'admin') {
      const timer = setTimeout(() => {
        setCurrentActiveAd(activeCampaign);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [popupAds, adDismissed, activeTab]);

  // Expand / Tab Navigation Handler for Load More
  const handleLoadMoreLatest = () => {
    if (loadMoreClicks === 0) {
      setLatestExpanded(true);
      setLoadMoreClicks(1);
    } else {
      setActiveTab('properties');
      setLatestExpanded(false);
      setLoadMoreClicks(0);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (favorites.includes(id)) {
      setFavorites(prev => prev.filter(f => f !== id));
    } else {
      setFavorites(prev => [...prev, id]);
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactPhone) return;

    const newInquiry: InquiryMessage = {
      id: `msg-${Date.now()}`,
      fullName: contactName,
      email: contactEmail,
      phone: contactPhone,
      message: contactMsg,
      date: new Date().toISOString().split('T')[0],
      status: 'New'
    };

    setMessages(prev => [newInquiry, ...prev]);
    logActivity('message', `Message received from ${contactName} (${contactPhone}): '${contactMsg.substring(0, 40)}${contactMsg.length > 40 ? '...' : ''}'`);
    setContactSuccess(true);
    setContactName('');
    setContactEmail('');
    setContactPhone('');
    setContactMsg('');

    showAlert(
      "Message Sent",
      `Thank you, ${contactName}! Your representative inquiry has been successfully registered on our Addis Ababa client deck.\n\nWe will contact you shortly.`
    );

    setTimeout(() => {
      setContactSuccess(false);
    }, 5000);
  };

  const handleCallbackInquiry = (inquiry: Omit<InquiryMessage, 'id' | 'date' | 'status'>) => {
    const id = `msg-${Date.now()}`;
    const fullLog: InquiryMessage = {
      ...inquiry,
      id,
      date: new Date().toISOString().split('T')[0],
      status: 'New'
    };
    
    setMessages(prev => [fullLog, ...prev]);
    
    logActivity('message', `Callback requested for "${inquiry.propertyTitle || 'Luxury Home'}" by ${inquiry.fullName} (${inquiry.phone})`);
    
    showAlert(
      "Callback Scheduled",
      `Thank you, ${inquiry.fullName}! A Cappadocia premium associate has registered your private callback request for "${inquiry.propertyTitle || 'Luxury Home'}".\n\nWe will reach out to you on ${inquiry.phone}.`
    );
  };

  const filteredProperties = properties.filter((p) => {
    const locMatch = searchLocation === '' || p.subCity.toLowerCase() === searchLocation.toLowerCase();
    const typeMatch = searchType === '' || p.type.toLowerCase() === searchType.toLowerCase();
    
    let bedMatch = true;
    if (searchBedrooms !== '') {
      if (searchBedrooms === '5+') {
        bedMatch = p.bedrooms >= 5;
      } else {
        bedMatch = p.bedrooms === Number(searchBedrooms);
      }
    }
    return locMatch && typeMatch && bedMatch;
  });

  const handleSearchAction = () => {
    setActiveTab('properties');
    setActivePropertyId(null);
  };

  const handleClearFilters = () => {
    setSearchLocation('');
    setSearchType('');
    setSearchBedrooms('');
  };

  const CappadociaLogo = ({ className = "" }: { className?: string }) => {
    return (
      <div 
        className={`flex items-center cursor-pointer group ${className}`} 
        onClick={() => {
          setActivePropertyId(null);
          setActiveTab('home');
          handleClearFilters();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      >
        <div className="transition-all duration-300 flex items-center justify-center p-1 sm:p-1.5 rounded-xl">
          <img 
            src={homeSettings.brandLogo || "/logo.png"} 
            alt="Cappadocia Real Estate Logo"
            className="h-14 sm:h-16 md:h-20 lg:h-24 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.02]"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${isDarkMode ? "dark bg-zinc-950 text-zinc-50" : "bg-zinc-50 text-zinc-900"}`} id="application-root">

      <AnimatePresence>
        {currentActiveAd && !adDismissed && activeTab !== 'admin' && (
          <motion.div 
            initial={{ opacity: 0, y: 40, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.92 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm sm:max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-black dark:border-zinc-700 p-4 sm:p-6 select-none"            
            id="marketing-popup-overlay"
          >
            <button
               onClick={() => setAdDismissed(true)}
               className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[#DC2626] text-white flex items-center justify-center border-2 border-white dark:border-zinc-900 shadow-md cursor-pointer hover:scale-110 transition-transform"
             >
               <X className="w-4 h-4" />
             </button>
             <div className="flex gap-4 items-start">
               {currentActiveAd.imageUrl && (
                 <img src={currentActiveAd.imageUrl} alt="" className="w-16 h-16 rounded-xl object-cover border border-zinc-200 dark:border-zinc-700 shadow-sm" referrerPolicy="no-referrer" />
               )}
               <div className="flex-1 space-y-1 mt-0.5">
                 <h4 className="font-bold text-sm tracking-tight leading-tight">{currentActiveAd.title}</h4>
                 <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">{currentActiveAd.content}</p>
                  <button 
                    onClick={() => {
                      let link = currentActiveAd.ctaLink;
                      if (link) {
                        link = link.trim();
                        if (link === '/') {
                           setActivePropertyId(null);
                           setActiveTab('home');
                           window.scrollTo({ top: 0, behavior: 'smooth' });
                        } else if (link.startsWith('/properties/')) {
                           const pId = link.replace('/properties/', '');
                           setActiveTab('properties');
                           setActivePropertyId(pId);
                           window.scrollTo({ top: 0, behavior: 'smooth' });
                        } else if (link.startsWith('/blogs')) {
                           setActivePropertyId(null);
                           setActiveTab('blog');
                           window.scrollTo({ top: 0, behavior: 'smooth' });
                        } else if (link.startsWith('/')) {
                           const tabName = link.replace('/', '').toLowerCase();
                           if (['home', 'about', 'properties', 'projects', 'blog', 'favorites', 'contact'].includes(tabName)) {
                             setActivePropertyId(null);
                             setActiveTab(tabName as any);
                             window.scrollTo({ top: 0, behavior: 'smooth' });
                           }
                        } else if (['home', 'about', 'properties', 'projects', 'blog', 'favorites', 'contact'].includes(link.toLowerCase())) {
                          setActivePropertyId(null);
                          setActiveTab(link.toLowerCase() as any);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        } else {
                          if (!link.startsWith('http://') && !link.startsWith('https://') && !link.includes('.')) {
                            link = 'https://' + link;
                          }
                          window.open(link, '_blank', 'noreferrer');
                        }
                      }
                      setAdDismissed(true);
                    }}
                    className="mt-2 inline-flex border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-zinc-100 hover:text-black dark:hover:bg-zinc-700 transition"
                  >
                   {currentActiveAd.ctaText}
                 </button>
               </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER SECTION */}
      <header className={`fixed top-0 left-0 right-0 z-[60] transition-colors duration-300 py-3 ${
        isDarkMode 
          ? 'bg-zinc-950/95 border-b border-zinc-800 shadow-sm backdrop-blur-md text-white'
          : 'bg-white/95 border-b border-black/5 shadow-sm backdrop-blur-md text-black'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          <CappadociaLogo />

          {/* Desktop Navigation - Admin button removed */}
          {activeTab !== 'admin' ? (
            <nav className="hidden lg:flex items-center gap-5 xl:gap-7">
              {(['home', 'about', 'properties', 'projects', 'blog', 'favorites', 'contact'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setActivePropertyId(null);
                    window.history.pushState({}, '', '/');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`text-[11px] font-bold uppercase tracking-widest transition cursor-pointer py-2 flex items-center gap-1.5 border-b-2 ${
                    activeTab === tab
                      ? 'text-[#DC2626] dark:text-red-500 border-[#DC2626] dark:border-red-500 font-extrabold'
                      : 'text-zinc-700 dark:text-zinc-400 hover:text-black dark:hover:text-white border-transparent'
                  }`}
                >
                  <span>{tabLabels[tab]}</span>
                  {tab === 'favorites' && favorites.length > 0 && (
                    <span className="inline-flex items-center justify-center bg-[#DC2626] text-white text-[9px] w-4.5 h-4.5 rounded-full font-bold font-mono leading-none">
                      {favorites.length}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          ) : (
            <nav className="hidden lg:flex items-center">
              <button
                onClick={() => {
                  setActiveTab('home');
                  setActivePropertyId(null);
                  setLoggedInUser(null);
                  window.history.pushState({}, '', '/');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="group inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 hover:bg-red-600 dark:hover:bg-red-600 hover:text-white dark:hover:text-white border border-zinc-200 dark:border-zinc-800/80 transition-all duration-300 shadow-sm cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 transform group-hover:-translate-x-1 transition-transform duration-200 text-red-600 dark:text-red-500 group-hover:text-white" />
                <span>Back to Website</span>
              </button>
            </nav>
          )}

          <div className="hidden lg:flex items-center gap-4">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-900/50 transition duration-200 cursor-pointer flex items-center justify-center shadow-xs"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2.5 rounded-lg border transition ${'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200'
              }`}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2.5 rounded-lg border transition ${'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-black dark:text-zinc-100'
              }`}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </header>

      {/* MOBILE NAV DRAWER - Admin button removed */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`fixed top-[70px] sm:top-[85px] left-0 right-0 z-[55] lg:hidden border-b-2 border-black dark:border-zinc-700 transition ${ 'bg-white dark:bg-zinc-900 border-black dark:border-zinc-700 text-black dark:text-zinc-100'
            }`}
            id="mobile-drawer-portal"
          >
            <div className="px-6 py-5 space-y-3.5 shadow-xl">
              {activeTab !== 'admin' ? (
                (['home', 'about', 'properties', 'projects', 'blog', 'favorites', 'contact'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveTab(tab);
                      setActivePropertyId(null);
                      window.history.pushState({}, '', '/');
                      setMobileMenuOpen(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`w-full text-left py-2 text-xs font-bold uppercase tracking-widest transition flex items-center justify-between ${
                      activeTab === tab 
                        ? 'text-[#DC2626] font-black' 
                        : 'text-black dark:text-zinc-100 hover:text-blue-600'
                    }`}
                  >
                    <span>{tabLabels[tab]}</span>
                    {tab === 'favorites' && favorites.length > 0 && (
                      <span className="inline-flex items-center justify-center bg-red-600 text-white dark:text-zinc-100 text-[9px] w-5 h-5 rounded-full font-bold font-mono">
                        {favorites.length}
                      </span>
                    )}
                  </button>
                ))
              ) : (
                <button
                  onClick={() => {
                    setActiveTab('home');
                    setActivePropertyId(null);
                    setLoggedInUser(null);
                    window.history.pushState({}, '', '/');
                    setMobileMenuOpen(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="group w-full py-3 px-4 rounded-xl text-left text-xs font-black uppercase tracking-widest transition-all duration-200 flex items-center justify-between bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 border border-zinc-200 dark:border-zinc-700 cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform duration-200 text-red-600 dark:text-red-500 group-hover:text-white" />
                    <span>Back to Website</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
                </button>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN DISPLAY SYSTEM */}
      <main className="flex-grow pt-[100px] sm:pt-[115px]" id="primary-main-block">

        <AnimatePresence mode="wait">
          
          {activePropertyId ? (
            <div key="detail-container">
              {(() => {
                const selectedProp = properties.find(p => p.id === activePropertyId);
                if (!selectedProp) return <p className="text-center p-12">Asset not found.</p>;
                return (
                  <PropertyDetails
                    property={selectedProp}
                    onBack={() => setActivePropertyId(null)}
                    onInquire={handleCallbackInquiry}
                    isDarkMode={isDarkMode}
                    allAmenities={allAmenities}
                  />
                );
              })()}
            </div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              
              {activeTab === 'home' && (
                <div className="space-y-16">
                  <section className="relative z-[35] min-h-[820px] lg:min-h-[880px] flex items-center justify-center overflow-visible pb-12" id="hero-banner-main">
                    <div className="absolute inset-0 z-0">
                      <img 
                        src={homeSettings.heroImage} 
                        alt="Cappadocia Royal Estates" 
                        className="w-full h-full object-cover transition duration-700 transform scale-100 placeholder-linear"
                        referrerPolicy="no-referrer"
                      />
                      <div className={`absolute inset-0 transition-all duration-300 ${
                        isDarkMode 
                          ? 'bg-gradient-to-r from-zinc-950 via-zinc-950/90 to-zinc-950/20' 
                          : 'bg-gradient-to-r from-white via-white/85 to-white/30'
                      }`} />
                    </div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-8">
                      <div className="lg:col-span-8 text-left space-y-6">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-red-600 text-white dark:text-white font-mono text-[10px] tracking-widest uppercase font-black font-semibold">
                          <Sparkles className="w-3.5 h-3.5" />
                          Premium Quality S.C. Certificate
                        </div>
                        <h1 className="text-4xl sm:text-6xl font-black font-serif tracking-tight leading-none text-zinc-900 dark:text-white">
                          {homeSettings.heroTitle}
                        </h1>
                        <p className="text-sm sm:text-lg max-w-xl leading-relaxed text-zinc-700 dark:text-zinc-300">
                          {homeSettings.heroSubtitle}
                        </p>
                        <div className="flex flex-wrap gap-3.5 pt-4">
                          <button
                            onClick={() => {
                              setActiveTab('properties');
                              window.scrollTo({ top: 600, behavior: 'smooth' });
                            }}
                            className="px-6 py-3.5 bg-red-600 hover:bg-red-600 text-white dark:text-zinc-100 text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg transition cursor-pointer"
                          >
                            Explore our properties
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="absolute bottom-6 left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 max-w-4xl w-full z-[45]">
                      <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-6 grid grid-cols-1 md:grid-cols-4 gap-4 products-selector text-zinc-900 dark:text-zinc-100">
                        
                        <div className="space-y-1.5 relative">
                          <label className="block text-[10px] uppercase font-bold text-zinc-600 dark:text-zinc-400 tracking-widest">
                            Location
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setLocDropdownOpen(!locDropdownOpen);
                              setTypeDropdownOpen(false);
                              setBedsDropdownOpen(false);
                            }}
                            className="w-full p-3 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition-all duration-200 flex justify-between items-center cursor-pointer text-left"
                          >
                            <span>{searchLocation ? searchLocation : 'All Locations'}</span>
                            <ChevronDown className={`w-4 h-4 ml-2 transition-transform duration-200 text-zinc-400 ${locDropdownOpen ? 'rotate-180 text-red-600' : ''}`} />
                          </button>
                          
                          <AnimatePresence>
                            {locDropdownOpen && (
                              <>
                                <div className="fixed inset-0 z-30" onClick={() => setLocDropdownOpen(false)} />
                                <motion.div
                                  initial={{ opacity: 0, y: -4 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -4 }}
                                  className="absolute left-0 right-0 mt-1.5 max-h-60 overflow-y-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 shadow-2xl z-50 py-1 divide-y divide-zinc-100 dark:divide-zinc-900"
                                >
                                  {[
                                    { val: '', label: 'All Locations' },
                                    ...allLocations.map((loc) => ({ val: loc, label: loc }))
                                  ].map((opt) => (
                                    <button
                                      key={opt.val}
                                      type="button"
                                      onClick={() => {
                                        setSearchLocation(opt.val);
                                        setLocDropdownOpen(false);
                                      }}
                                      className={`w-full px-4 py-2.5 text-xs text-left transition-colors duration-150 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-900 ${
                                        searchLocation === opt.val
                                          ? 'bg-zinc-100 dark:bg-zinc-800 font-bold text-red-600 dark:text-red-500'
                                          : 'text-zinc-700 dark:text-zinc-300'
                                      }`}
                                    >
                                      <span>{opt.label}</span>
                                      {searchLocation === opt.val && <Check className="w-3.5 h-3.5 text-red-600 dark:text-red-500" />}
                                    </button>
                                  ))}
                                </motion.div>
                              </>
                            )}
                          </AnimatePresence>
                        </div>

                        <div className="space-y-1.5 relative">
                          <label className="block text-[10px] uppercase font-bold text-zinc-600 dark:text-zinc-400 tracking-widest">
                            Property Type
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                               setTypeDropdownOpen(!typeDropdownOpen);
                               setLocDropdownOpen(false);
                               setBedsDropdownOpen(false);
                            }}
                            className="w-full p-3 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition-all duration-200 flex justify-between items-center cursor-pointer text-left"
                          >
                            <span>{searchType ? (searchType === 'Luxury Villa' ? 'Villa' : searchType === 'Modern Penthouse' ? 'Penthouse' : searchType === 'Exclusive Apartment' ? 'Apartment' : searchType) : 'All Property Types'}</span>
                            <ChevronDown className={`w-4 h-4 ml-2 transition-transform duration-200 text-zinc-400 ${typeDropdownOpen ? 'rotate-180 text-red-600' : ''}`} />
                          </button>
                          
                          <AnimatePresence>
                            {typeDropdownOpen && (
                              <>
                                <div className="fixed inset-0 z-40" onClick={() => setTypeDropdownOpen(false)} />
                                <motion.div
                                  initial={{ opacity: 0, y: -4 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -4 }}
                                  className="absolute left-0 right-0 mt-1.5 max-h-60 overflow-y-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 shadow-2xl z-50 py-1 divide-y divide-zinc-100 dark:divide-zinc-900"
                                >
                                  {[
                                    { val: '', label: 'All Property Types' },
                                    ...allTypes.map((t) => ({ val: t, label: t }))
                                  ].map((opt) => (
                                    <button
                                      key={opt.val}
                                      type="button"
                                      onClick={() => {
                                        setSearchType(opt.val);
                                        setTypeDropdownOpen(false);
                                      }}
                                      className={`w-full px-4 py-2.5 text-xs text-left transition-colors duration-150 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-900 ${
                                        searchType === opt.val
                                          ? 'bg-zinc-100 dark:bg-zinc-800 font-bold text-red-600 dark:text-red-500'
                                          : 'text-zinc-700 dark:text-zinc-300'
                                      }`}
                                    >
                                      <span>{opt.label}</span>
                                      {searchType === opt.val && <Check className="w-3.5 h-3.5 text-red-600 dark:text-red-500" />}
                                    </button>
                                  ))}
                                </motion.div>
                              </>
                            )}
                          </AnimatePresence>
                        </div>

                        <div className="space-y-1.5 relative">
                          <label className="block text-[10px] uppercase font-bold text-zinc-600 dark:text-zinc-400 tracking-widest">
                            Bedrooms
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setBedsDropdownOpen(!bedsDropdownOpen);
                              setLocDropdownOpen(false);
                              setTypeDropdownOpen(false);
                            }}
                            className="w-full p-3 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition-all duration-200 flex justify-between items-center cursor-pointer text-left"
                          >
                            <span>{searchBedrooms ? (searchBedrooms === '1' ? '1 Bedroom' : `${searchBedrooms} Bedrooms`) : 'All Bedrooms'}</span>
                            <ChevronDown className={`w-4 h-4 ml-2 transition-transform duration-200 text-zinc-400 ${bedsDropdownOpen ? 'rotate-180 text-red-700' : ''}`} />
                          </button>
                          
                          <AnimatePresence>
                            {bedsDropdownOpen && (
                              <>
                                <div className="fixed inset-0 z-40" onClick={() => setBedsDropdownOpen(false)} />
                                <motion.div
                                  initial={{ opacity: 0, y: -4 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -4 }}
                                  className="absolute left-0 right-0 mt-1.5 max-h-60 overflow-y-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 shadow-2xl z-50 py-1 divide-y divide-zinc-100 dark:divide-zinc-900"
                                >
                                  {[
                                    { val: '', label: 'All Bedrooms' },
                                    { val: '1', label: '1 Bedroom' },
                                    { val: '2', label: '2 Bedrooms' },
                                    { val: '3', label: '3 Bedrooms' },
                                    { val: '4', label: '4 Bedrooms' },
                                    { val: '5+', label: '5+ Bedrooms' },
                                  ].map((opt) => (
                                    <button
                                      key={opt.val}
                                      type="button"
                                      onClick={() => {
                                        setSearchBedrooms(opt.val);
                                        setBedsDropdownOpen(false);
                                      }}
                                      className={`w-full px-4 py-2.5 text-xs text-left transition-colors duration-150 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-900 ${
                                        searchBedrooms === opt.val
                                          ? 'bg-zinc-100 dark:bg-zinc-800 font-bold text-red-600 dark:text-red-500'
                                          : 'text-zinc-700 dark:text-zinc-300'
                                      }`}
                                    >
                                      <span>{opt.label}</span>
                                      {searchBedrooms === opt.val && <Check className="w-3.5 h-3.5 text-red-600 dark:text-red-500" />}
                                    </button>
                                  ))}
                                </motion.div>
                              </>
                            )}
                          </AnimatePresence>
                        </div>

                        <div className="pt-5 md:pt-4">
                          <button
                            onClick={() => {
                              setActiveTab('properties');
                              window.scrollTo({ top: 600, behavior: 'smooth' });
                            }}
                            className="w-full h-[46px] bg-[#003B95] text-white dark:text-zinc-100 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md hover:bg-[#002f75] transition flex items-center justify-center gap-2 cursor-pointer font-sans"
                          >
                            <Search className="w-4 h-4" />
                            Search
                          </button>
                        </div>

                      </div>
                    </div>

                  </section>

                  <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500" id="featured-vip-properties">
                    <div className="text-center max-w-2xl mx-auto space-y-2">
                      <span className="text-xs uppercase font-extrabold text-[#DC2626] font-mono tracking-widest block">LATEST PROPERTIES</span>
                      <h2 className="text-2xl sm:text-3xl font-serif font-black text-black dark:text-zinc-100">
                        Latest Listings
                      </h2>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">
                        Explore our recently listed premium offerings, built to the highest caliber in Addis Ababa's prime locations.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {properties.filter(p => p.showOnHomepage !== false).slice(0, latestExpanded ? 6 : 3).map((p) => {
                        const isFav = favorites.includes(p.id);
                        return (
                          <div
                            key={p.id}
                            onClick={() => {
                              setActivePropertyId(p.id);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 hover:border-red-600 dark:hover:border-red-500 transition duration-300 transform hover:-translate-y-1 cursor-pointer flex flex-col h-full bg-white dark:bg-zinc-900 group pb-2 hover:shadow-lg"
                          >
                            <div className="relative aspect-video overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                              <img src={p.featuredImage} alt={p.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" referrerPolicy="no-referrer" />
                              <div className="absolute top-3 left-3 bg-red-600 text-white dark:text-zinc-100 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded shadow-sm">
                                {p.status}
                              </div>
                              <button
                                onClick={(e) => handleToggleFavorite(p.id, e)}
                                className="absolute top-3 right-3 p-2 rounded-full cursor-pointer shadow-sm focus:outline-none bg-white dark:bg-zinc-900 text-black dark:text-zinc-100 hover:scale-110 transition duration-200"
                              >
                                <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-red-500 text-red-500 border-red-500' : ''}`} />
                              </button>
                              <div className="absolute bottom-3 left-3 flex gap-1 z-10">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleCompare(p.id);
                                  }}
                                  className={`px-2.5 py-1 rounded text-[9px] font-bold tracking-wider uppercase transition cursor-pointer border ${
                                    comparePropertyIds.includes(p.id)
                                      ? 'bg-red-600 border-red-600 text-white dark:text-zinc-100'
                                      : 'bg-white dark:bg-zinc-900 hover:bg-red-600 border-zinc-200 dark:border-zinc-800 text-black dark:text-zinc-100 hover:text-white dark:text-zinc-100'
                                  }`}
                                >
                                  {comparePropertyIds.includes(p.id) ? '✓ Compare' : '+ Compare'}
                                </button>
                              </div>
                              <span className="absolute bottom-3 right-3 px-2 py-1 text-[9px] font-bold rounded shadow-sm bg-white dark:bg-zinc-900 text-black dark:text-zinc-100">
                                {p.subCity}
                              </span>
                            </div>

                            <div className="p-5 space-y-4 flex-grow flex flex-col justify-between">
                              <div className="space-y-1.5">
                                <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 dark:text-zinc-400 font-mono block">{p.type}</span>
                                <h3 className="font-serif font-bold text-base leading-snug group-hover:text-red-600 dark:group-hover:text-red-500 transition text-black dark:text-zinc-100">{p.title}</h3>
                                <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 text-xs font-semibold">
                                  <MapPin className="w-3.5 h-3.5 text-red-600" />
                                  <span>{p.location}</span>
                                </div>
                              </div>

                              <div className="grid grid-cols-3 gap-2 py-3 border-y text-xs font-semibold font-sans border-zinc-100 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300">
                                <div className="flex items-center gap-1 justify-center">
                                  <Bed className="w-3.5 h-3.5 text-red-600" />
                                  <span className="font-mono">{p.bedrooms} Beds</span>
                                </div>
                                <div className="flex items-center gap-1 justify-center border-x border-zinc-100 dark:border-zinc-800">
                                  <Bath className="w-3.5 h-3.5 text-red-600" />
                                  <span className="font-mono">{p.bathrooms} Baths</span>
                                </div>
                                <div className="flex items-center gap-1 justify-center">
                                  <Maximize className="w-3.5 h-3.5 text-red-600" />
                                  <span className="font-mono">{p.areaSqm} sqm</span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between pt-1">
                                <span className="text-[9px] uppercase text-zinc-500 dark:text-zinc-400 font-mono tracking-widest font-extrabold">Price Base</span>
                                <span className="text-base font-bold font-mono text-red-600">
                                  ETB {p.price.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
                      <button
                        onClick={() => setLatestExpanded(!latestExpanded)}
                        className="px-6 py-3 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs font-bold uppercase tracking-widest rounded-xl transition cursor-pointer font-sans shadow-xs"
                      >
                        {latestExpanded ? 'Collapse Listings' : 'Load More Listings'}
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab('properties');
                          window.scrollTo({ top: 300, behavior: 'smooth' });
                        }}
                        className="px-6 py-3 bg-[#003B95] hover:bg-[#002f75] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition cursor-pointer font-sans shadow-md"
                      >
                        View All Properties
                      </button>
                    </div>
                  </section>

                  <section className="bg-zinc-100 dark:bg-zinc-900 py-20 border-y border-zinc-200 dark:border-zinc-800" id="homepage-pillars">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
                      <div className="text-center max-w-2xl mx-auto space-y-3">
                        <span className="text-xs uppercase font-extrabold text-[#DC2626] font-mono tracking-widest block">WHY CHOOSE US</span>
                        <h2 className="text-3xl sm:text-4xl font-serif font-black text-black dark:text-zinc-100">
                          Built for Your Future
                        </h2>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                          We believe in doing things the right way, ensuring your home is strong, safe, and a great choice.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {WHY_CHOOSE_US.map((item, idx) => {
                          const IconsMap = [ShieldCheck, TrendingUp, Compass, Award];
                          const IconComponent = IconsMap[idx % IconsMap.length] || Sparkles;
                          return (
                            <div key={item.id} className="group p-8 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-5 shadow-sm hover:shadow-xl hover:border-red-200 dark:hover:border-red-900 transition-all duration-300">
                              <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-900 text-[#DC2626] flex items-center justify-center group-hover:bg-[#DC2626] group-hover:text-white transition-colors duration-300">
                                <IconComponent className="w-7 h-7" />
                              </div>
                              <h3 className="font-serif font-bold text-lg text-zinc-900 dark:text-zinc-100">{item.title}</h3>
                              <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{item.description}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </section>

                  <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 animate-fade-in" id="homepage-buyer-feedback">
                    <div className="text-center max-w-2xl mx-auto space-y-2">
                      <span className="text-xs uppercase font-extrabold text-[#DC2626] font-mono tracking-widest block">CLIENT TESTIMONIALS</span>
                      <h2 className="text-2xl sm:text-3xl font-serif font-black text-black dark:text-zinc-100">
                        What Our Clients Say
                      </h2>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">
                        Read what families, elite diplomats, and institutional investors say about Cappadocia S.C. quality.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {testimonials.slice(0, 3).map((t) => (
                        <div key={t.id} className="p-6 md:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm flex flex-col justify-between space-y-4">
                          <div className="space-y-4">
                            <div className="flex gap-1">
                              {Array.from({ length: t.rating }).map((_, idy) => (
                                <Star key={idy} className="w-3.5 h-3.5 fill-current text-amber-500" />
                              ))}
                            </div>
                            <p className="text-xs leading-relaxed text-zinc-700 dark:text-zinc-300 italic font-medium font-serif">
                              "{t.testimony}"
                            </p>
                          </div>
                          <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 mt-4">
                            <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 tracking-tight">{t.clientName}</h4>
                            <p className="text-[9px] uppercase font-bold tracking-widest text-[#003B95] dark:text-red-500 mt-1">{t.propertyPurchased}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              )}

              {activeTab === 'properties' && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" id="property-catalog-view">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div className="max-w-2xl space-y-2 border-l-4 border-red-600 pl-4">
                      <span className="text-xs uppercase font-extrabold text-[#DC2626] tracking-widest block font-sans">Verified Inventory</span>
                      <h2 className={`text-3xl sm:text-4xl font-black font-serif leading-tight text-black dark:text-zinc-100`}>
                        Examine Bespoke Properties
                      </h2>
                      <p className={`text-xs text-zinc-600 dark:text-zinc-400`}>
                        Use our precise filtering logic below to discover residential and exclusive properties that match your specifications.
                      </p>
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl border bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 items-end mb-10 relative z-30">
                    
                    <div className="space-y-1.5 relative">
                      <label className="block text-[10px] uppercase font-bold text-zinc-600 dark:text-zinc-400 tracking-wider">
                        Location
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setLocDropdownOpen(!locDropdownOpen);
                          setTypeDropdownOpen(false);
                          setBedsDropdownOpen(false);
                        }}
                        className="w-full p-3 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition-all duration-200 flex justify-between items-center cursor-pointer text-left"
                      >
                        <span>{searchLocation ? searchLocation : 'All Locations'}</span>
                        <ChevronDown className={`w-4 h-4 ml-2 transition-transform duration-200 text-zinc-400 ${locDropdownOpen ? 'rotate-180 text-red-600' : ''}`} />
                      </button>
                      
                      <AnimatePresence>
                        {locDropdownOpen && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setLocDropdownOpen(false)} />
                            <motion.div
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -4 }}
                              className="absolute left-0 right-0 mt-1.5 max-h-60 overflow-y-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 shadow-2xl z-50 py-1 divide-y divide-zinc-100 dark:divide-zinc-900"
                            >
                              {[
                                { val: '', label: 'All Locations' },
                                ...allLocations.map((loc) => ({ val: loc, label: loc }))
                              ].map((opt) => (
                                <button
                                  key={opt.val}
                                  type="button"
                                  onClick={() => {
                                    setSearchLocation(opt.val);
                                    setLocDropdownOpen(false);
                                  }}
                                  className={`w-full px-4 py-2.5 text-xs text-left transition-colors duration-150 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-900 ${
                                    searchLocation === opt.val
                                      ? 'bg-zinc-100 dark:bg-zinc-800 font-bold text-red-600 dark:text-red-500'
                                      : 'text-zinc-700 dark:text-zinc-300'
                                  }`}
                                >
                                  <span>{opt.label}</span>
                                  {searchLocation === opt.val && <Check className="w-3.5 h-3.5 text-red-600 dark:text-red-500" />}
                                </button>
                              ))}
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="space-y-1.5 relative">
                      <label className="block text-[10px] uppercase font-bold text-zinc-600 dark:text-zinc-400 tracking-wider">
                        Property Architecture
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setTypeDropdownOpen(!typeDropdownOpen);
                          setLocDropdownOpen(false);
                          setBedsDropdownOpen(false);
                        }}
                        className="w-full p-3 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition-all duration-200 flex justify-between items-center cursor-pointer text-left"
                      >
                        <span>{searchType ? (searchType === 'Luxury Villa' ? 'Villa' : searchType === 'Modern Penthouse' ? 'Penthouse' : searchType === 'Exclusive Apartment' ? 'Apartment' : searchType) : 'All Property Types'}</span>
                        <ChevronDown className={`w-4 h-4 ml-2 transition-transform duration-200 text-zinc-400 ${typeDropdownOpen ? 'rotate-180 text-red-600' : ''}`} />
                      </button>
                      
                      <AnimatePresence>
                        {typeDropdownOpen && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setTypeDropdownOpen(false)} />
                            <motion.div
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -4 }}
                              className="absolute left-0 right-0 mt-1.5 max-h-60 overflow-y-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 shadow-2xl z-50 py-1 divide-y divide-zinc-100 dark:divide-zinc-900"
                            >
                              {[
                                { val: '', label: 'All Property Types' },
                                ...allTypes.map((t) => ({ val: t, label: t }))
                              ].map((opt) => (
                                <button
                                  key={opt.val}
                                  type="button"
                                  onClick={() => {
                                    setSearchType(opt.val);
                                    setTypeDropdownOpen(false);
                                  }}
                                  className={`w-full px-4 py-2.5 text-xs text-left transition-colors duration-150 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-900 ${
                                    searchType === opt.val
                                      ? 'bg-zinc-100 dark:bg-zinc-800 font-bold text-red-600 dark:text-red-500'
                                      : 'text-zinc-700 dark:text-zinc-300'
                                  }`}
                                >
                                  <span>{opt.label}</span>
                                  {searchType === opt.val && <Check className="w-3.5 h-3.5 text-red-600 dark:text-red-500" />}
                                </button>
                              ))}
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="space-y-1.5 relative">
                      <label className="block text-[10px] uppercase font-bold text-zinc-600 dark:text-zinc-400 tracking-wider">
                        Bedrooms
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setBedsDropdownOpen(!bedsDropdownOpen);
                          setLocDropdownOpen(false);
                          setTypeDropdownOpen(false);
                        }}
                        className="w-full p-3 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition-all duration-200 flex justify-between items-center cursor-pointer text-left"
                      >
                        <span>{searchBedrooms ? (searchBedrooms === '1' ? '1 Bedroom' : `${searchBedrooms} Bedrooms`) : 'All Bedrooms'}</span>
                        <ChevronDown className={`w-4 h-4 ml-2 transition-transform duration-200 text-zinc-400 ${bedsDropdownOpen ? 'rotate-180 text-red-600' : ''}`} />
                      </button>
                      
                      <AnimatePresence>
                        {bedsDropdownOpen && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setBedsDropdownOpen(false)} />
                            <motion.div
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -4 }}
                              className="absolute left-0 right-0 mt-1.5 max-h-60 overflow-y-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 shadow-2xl z-50 py-1 divide-y divide-zinc-100 dark:divide-zinc-900"
                            >
                              {[
                                { val: '', label: 'All Bedrooms' },
                                { val: '1', label: '1 Bedroom' },
                                { val: '2', label: '2 Bedrooms' },
                                { val: '3', label: '3 Bedrooms' },
                                { val: '4', label: '4 Bedrooms' },
                                { val: '5+', label: '5+ Bedrooms' },
                              ].map((opt) => (
                                <button
                                  key={opt.val}
                                  type="button"
                                  onClick={() => {
                                    setSearchBedrooms(opt.val);
                                    setBedsDropdownOpen(false);
                                  }}
                                  className={`w-full px-4 py-2.5 text-xs text-left transition-colors duration-150 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-900 ${
                                    searchBedrooms === opt.val
                                      ? 'bg-zinc-100 dark:bg-zinc-800 font-bold text-red-600 dark:text-red-500'
                                      : 'text-zinc-700 dark:text-zinc-300'
                                  }`}
                                >
                                  <span>{opt.label}</span>
                                  {searchBedrooms === opt.val && <Check className="w-3.5 h-3.5 text-red-600 dark:text-red-500" />}
                                </button>
                              ))}
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>

                    <div>
                      <button
                        onClick={handleClearFilters}
                        className="w-full h-[46px] rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer border border-[#DC2626] bg-transparent text-[#DC2626] hover:bg-[#DC2626] hover:text-white dark:hover:text-zinc-100 flex items-center justify-center gap-1.5 font-sans"
                      >
                        Clear Filters
                      </button>
                    </div>

                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredProperties.map((p) => {
                      const isFav = favorites.includes(p.id);
                      return (
                        <div
                          key={p.id}
                          onClick={() => {
                            setActivePropertyId(p.id);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className={`rounded-2xl overflow-hidden border transition duration-300 transform hover:-translate-y-1 cursor-pointer flex flex-col h-full group pb-2 ${ 'bg-white dark:bg-zinc-900 border-black dark:border-zinc-700 hover:border-red-600 hover:shadow-lg'
                          }`}
                        >
                          <div className="relative aspect-video overflow-hidden">
                            <img src={p.featuredImage} alt={p.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" referrerPolicy="no-referrer" />
                            <div className="absolute top-3 left-3 bg-red-600 text-white dark:text-zinc-100 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded shadow-sm">
                              {p.status}
                            </div>
                            <button
                              onClick={(e) => handleToggleFavorite(p.id, e)}
                              className={`absolute top-3 right-3 p-2 rounded-full transition cursor-pointer shadow-sm focus:outline-none ${'bg-white dark:bg-zinc-900 hover:bg-white dark:bg-zinc-900 text-black dark:text-zinc-100'
                              }`}
                            >
                              <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
                            </button>
                            <div className="absolute bottom-3 left-3 flex gap-1 z-10">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleCompare(p.id);
                                }}
                                className={`px-2.5 py-1 rounded text-[9px] font-bold tracking-wider uppercase transition cursor-pointer border ${
                                  comparePropertyIds.includes(p.id)
                                    ? 'bg-red-600 border-red-600 text-white dark:text-zinc-100'
                                    : 'bg-white dark:bg-zinc-900 hover:bg-red-600 border-zinc-200 dark:border-zinc-800 text-black dark:text-zinc-100 hover:text-white dark:text-zinc-100'
                                }`}
                              >
                                {comparePropertyIds.includes(p.id) ? '✓ Compare' : '+ Compare'}
                              </button>
                            </div>
                            <span className={`absolute bottom-3 right-3 px-2 py-1 text-[9px] font-bold rounded shadow-sm ${ 'bg-white dark:bg-zinc-900 text-black dark:text-zinc-100'
                            }`}>
                              {p.subCity}
                            </span>
                          </div>

                          <div className="p-5 space-y-4 flex-grow flex flex-col justify-between">
                            <div className="space-y-1.5">
                              <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 dark:text-zinc-400 font-mono block">{p.type}</span>
                              <h3 className={`font-serif font-bold text-base leading-snug group-hover:text-red-600 transition ${ 'text-black dark:text-zinc-100'
                              }`}>{p.title}</h3>
                              <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 text-xs font-semibold">
                                <MapPin className="w-3.5 h-3.5 text-red-600" />
                                <span>{p.location}</span>
                              </div>
                            </div>

                            <div className={`grid grid-cols-3 gap-2 py-3 border-y text-xs font-semibold font-sans ${'border-black dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                            }`}>
                              <div className="flex items-center gap-1 justify-center">
                                <Bed className="w-3.5 h-3.5 text-red-600" />
                                <span className="font-mono">{p.bedrooms} Beds</span>
                              </div>
                              <div className={`flex items-center gap-1 justify-center border-x ${ 'border-black dark:border-zinc-700'
                              }`}>
                                <Bath className="w-3.5 h-3.5 text-red-600" />
                                <span className="font-mono">{p.bathrooms} Baths</span>
                              </div>
                              <div className="flex items-center gap-1 justify-center">
                                <Maximize className="w-3.5 h-3.5 text-red-600" />
                                <span className="font-mono">{p.areaSqm} sqm</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-1">
                              <span className="text-[9px] uppercase text-zinc-500 dark:text-zinc-400 font-mono tracking-widest font-extrabold">Price Base</span>
                              <span className="text-base font-bold font-mono text-red-600">
                                ETB {p.price.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {filteredProperties.length === 0 && (
                      <div className="col-span-full py-16 text-center space-y-2 bg-zinc-100 dark:bg-zinc-800 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                        <p className="font-serif font-bold text-lg text-black dark:text-zinc-100">No matching estate inventory found.</p>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400">Try adjusting your locations filter parameters or resetting inputs.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'favorites' && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8" id="favorites-catalog-view">
                  <div className={`space-y-2 border-b pb-5 ${'border-black dark:border-zinc-700'}`}>
                    <span className="text-xs uppercase font-extrabold text-[#DC2626] tracking-widest block font-sans">Saved Portfolios</span>
                    <h1 className={`text-3xl sm:text-4xl font-black font-serif leading-tight ${'text-black dark:text-zinc-100'}`}>
                      Your Favorites Navbar S.C.
                    </h1>
                    <p className={`text-xs ${'text-zinc-600 dark:text-zinc-400'}`}>
                      Access and evaluate your securely bookmarked high-rise estates and luxury residences.
                    </p>
                  </div>

                  {favorites.length === 0 ? (
                    <div className="py-24 text-center space-y-4 bg-zinc-100 dark:bg-zinc-800  rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                      <Heart className="w-12 h-12 mx-auto text-red-600 animate-pulse" />
                      <div className="space-y-2">
                        <p className="font-serif font-bold text-lg text-black dark:text-zinc-100">Your saved properties list is currently empty.</p>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">Browse our metropolitan asset inventories, tap the bookmark heart icon or direct click comparison triggers to save listings here instantly.</p>
                      </div>
                      <button 
                        onClick={() => setActiveTab('properties')}
                        className="px-6 py-3 bg-[#003B95] text-white dark:text-zinc-100 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#002f75] transition cursor-pointer"
                      >
                        Explore Assets Now
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {properties.filter(p => favorites.includes(p.id)).map((p) => {
                        const isFav = favorites.includes(p.id);
                        return (
                          <div
                            key={p.id}
                            onClick={() => {
                              setActivePropertyId(p.id);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className={`rounded-2xl overflow-hidden border transition duration-300 transform hover:-translate-y-1 cursor-pointer flex flex-col h-full group pb-2 ${ 'bg-white dark:bg-zinc-900 border-black dark:border-zinc-700 hover:border-red-600 hover:shadow-lg'
                            }`}
                          >
                            <div className="relative aspect-video overflow-hidden">
                              <img src={p.featuredImage} alt={p.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" referrerPolicy="no-referrer" />
                              <div className="absolute top-3 left-3 bg-red-600 text-white dark:text-zinc-100 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded shadow-sm">
                                {p.status}
                              </div>
                              <button
                                onClick={(e) => handleToggleFavorite(p.id, e)}
                                className={`absolute top-3 right-3 p-2 rounded-full transition cursor-pointer shadow-sm focus:outline-none ${'bg-white dark:bg-zinc-900 hover:bg-white dark:bg-zinc-900 text-black dark:text-zinc-100'
                                }`}
                              >
                                <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
                              </button>
                              
                              <div className="absolute bottom-3 left-3 flex gap-1 z-10">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleCompare(p.id);
                                  }}
                                  className={`px-2.5 py-1 rounded text-[9px] font-bold tracking-wider uppercase transition cursor-pointer border ${
                                    comparePropertyIds.includes(p.id)
                                      ? 'bg-red-600 border-red-600 text-white dark:text-zinc-100'
                                      : 'bg-white dark:bg-zinc-900 hover:bg-red-600 border-zinc-200 dark:border-zinc-800 text-black dark:text-zinc-100 hover:text-white dark:text-zinc-100'
                                  }`}
                                >
                                  {comparePropertyIds.includes(p.id) ? '✓ Compare' : '+ Compare'}
                                </button>
                              </div>

                              <span className={`absolute bottom-3 right-3 px-2 py-1 text-[9px] font-bold rounded shadow-sm ${ 'bg-white dark:bg-zinc-900 text-black dark:text-zinc-100'
                              }`}>
                                {p.subCity}
                              </span>
                            </div>

                            <div className="p-5 space-y-4 flex-grow flex flex-col justify-between">
                              <div className="space-y-1.5">
                                <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 dark:text-zinc-400 font-mono block">
                                  {p.type}
                                </span>
                                <h3 className={`font-serif font-bold text-base leading-snug group-hover:text-red-600 transition ${ 'text-black dark:text-zinc-100'
                                }`}>
                                  {p.title}
                                </h3>
                                <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 text-xs font-semibold">
                                  <MapPin className="w-3.5 h-3.5 text-red-600" />
                                  <span>{p.location}</span>
                                </div>
                              </div>

                              <div className={`grid grid-cols-3 gap-2 py-3 border-y text-xs font-semibold font-sans ${'border-black dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                              }`}>
                                <div className="flex items-center gap-1 justify-center">
                                  <Bed className="w-3.5 h-3.5 text-red-600" />
                                  <span className="font-mono">{p.bedrooms} Beds</span>
                                </div>
                                <div className={`flex items-center gap-1 justify-center border-x ${ 'border-black dark:border-zinc-700'
                                }`}>
                                  <Bath className="w-3.5 h-3.5 text-red-600" />
                                  <span className="font-mono">{p.bathrooms} Baths</span>
                                </div>
                                <div className="flex items-center gap-1 justify-center">
                                  <Maximize className="w-3.5 h-3.5 text-red-600" />
                                  <span className="font-mono">{p.areaSqm} sqm</span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between pt-1">
                                <span className="text-[9px] uppercase text-zinc-500 dark:text-zinc-400 font-mono tracking-widest font-extrabold">Price Base</span>
                                <span className="text-base font-bold font-mono text-red-600">
                                  ETB {p.price.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'projects' && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12" id="projects-timeline-view">
                  <div className="space-y-3 select-none text-center max-w-3xl mx-auto">
                    <span className="text-[10px] tracking-widest uppercase font-extrabold text-[#DC2626] block font-mono">Masterwork Portfolio S.C.</span>
                    <h1 className={`text-3xl sm:text-4xl font-extrabold font-sans uppercase tracking-tight leading-none ${'text-black dark:text-zinc-100'}`}>
                      Showcasing Completed Projects <span className="text-[#DC2626]">Over the Years</span>
                    </h1>
                    <p className={`text-xs sm:text-sm max-w-xl mx-auto leading-relaxed ${'text-zinc-600 dark:text-zinc-400'}`}>
                      We take pride in our historical monuments of structural engineering. Inspect Cappadocia S.C.’s real metropolitan landmarks delivered successfully.
                    </p>
                    <div className="h-1 w-24 bg-red-600 mx-auto mt-4 rounded-full" />
                  </div>

                  <div className={`grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-y max-w-4xl mx-auto text-center transition-all ${'bg-white dark:bg-zinc-900 border-black dark:border-zinc-700'
                  }`}>
                    <div className="space-y-1">
                      <p className={`text-3xl font-sans font-black tracking-tight ${'text-black dark:text-zinc-100'}`}>2020</p>
                      <p className="text-[10px] text-red-600 font-extrabold uppercase tracking-wide">First Groundbreak</p>
                    </div>
                    <div className={`space-y-1 border-l ${'border-zinc-200 dark:border-zinc-800'}`}>
                      <p className="text-3xl font-sans font-black tracking-tight text-[#DC2626]">100%</p>
                      <p className={`text-[10px] font-extrabold uppercase tracking-wide ${'text-zinc-800 dark:text-zinc-200'}`}>Successful Delivery</p>
                    </div>
                    <div className={`space-y-1 border-l ${'border-zinc-200 dark:border-zinc-800'}`}>
                      <p className={`text-3xl font-sans font-black tracking-tight ${'text-black dark:text-zinc-100'}`}>150+</p>
                      <p className="text-[10px] text-red-600 font-extrabold uppercase tracking-wide">Elite Households</p>
                    </div>
                    <div className={`space-y-1 border-l ${'border-zinc-200 dark:border-zinc-800'}`}>
                      <p className="text-3xl font-sans font-black tracking-tight text-[#DC2626]">C-40</p>
                      <p className={`text-[10px] font-extrabold uppercase tracking-wide ${'text-zinc-800 dark:text-zinc-200'}`}>Concrete Grade Standard</p>
                    </div>
                  </div>

                  <div className="relative py-8 space-y-12">
                    <div className="absolute left-4 md:left-1/2 top-4 bottom-4 w-1 bg-black dark:bg-zinc-50 md:-translate-x-1/2" />

                    {projects.map((proj, idx) => {
                      const isLeft = idx % 2 === 0;
                      return (
                        <motion.div
                          initial={{ opacity: 0, y: 15 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          key={proj.title}
                          className="relative grid grid-cols-1 md:grid-cols-12 gap-8 items-center"
                        >
                          <div className="absolute left-4 md:left-1/2 top-0 -translate-y-1/2 md:-translate-x-1/2 z-10 w-9 h-9 rounded-full bg-black dark:bg-zinc-50 border-4 border-[#DC2626] flex items-center justify-center font-mono text-[10px] text-white dark:text-zinc-100 font-bold select-none cursor-default shadow-xs">
                            {proj.year.slice(2)}
                          </div>

                          <div className={`col-span-1 md:col-span-5 ${isLeft ? 'md:order-1' : 'md:order-3 md:text-right'} pl-12 md:pl-0`}>
                            <div className="space-y-3 bg-white dark:bg-zinc-900 p-6 rounded-2xl border-2 border-black dark:border-zinc-700 hover:shadow-lg transition duration-300">
                              <div className={`flex flex-wrap items-center gap-2 ${!isLeft && 'md:justify-end'}`}>
                                <span className="bg-red-600 text-white dark:text-zinc-100 font-black px-2.5 py-0.5 rounded text-[9px] tracking-widest uppercase">
                                  {proj.year} Completed
                                </span>
                                <span className="border-2 border-black dark:border-zinc-700 text-black dark:text-zinc-100 font-extrabold px-2 py-0.5 rounded text-[9px] uppercase tracking-widest bg-zinc-100 dark:bg-zinc-800">
                                  {proj.subCity}
                                </span>
                              </div>
                              <h3 className="text-xl font-serif font-black text-black dark:text-zinc-100 leading-tight">
                                {proj.title}
                              </h3>
                              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                {proj.description}
                              </p>
                              
                              <div className={`pt-2.5 border-t border-black dark:border-zinc-700 ${!isLeft && 'md:text-right'}`}>
                                <p className="text-[10px] font-mono font-extrabold text-blue-600 uppercase tracking-wider mb-1">Key Milestones:</p>
                                <ul className="text-[11px] text-zinc-700 dark:text-zinc-300 space-y-1 list-none font-medium">
                                  {proj.achievements.map((ach) => (
                                    <li key={ach} className="inline-flex items-center gap-1.5">
                                      <span className="text-[#DC2626] font-bold">✓</span>
                                      {ach}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>

                          <div className="hidden md:block md:col-span-2 md:order-2" />

                          <div className={`col-span-1 md:col-span-5 ${isLeft ? 'md:order-3' : 'md:order-1'} pl-12 md:pl-0`}>
                            <div className="group relative rounded-2xl overflow-hidden border-2 border-black dark:border-zinc-700 aspect-video shadow-md transition-all duration-300 transform hover:scale-102 bg-[#003B95]">
                              <img src={proj.image} alt={proj.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent pointer-events-none" />
                              <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between select-none">
                                <span className="text-white dark:text-zinc-100 text-[10px] font-bold font-mono px-2 py-1 rounded bg-black dark:bg-zinc-50/60 border border-white/20">
                                  {proj.specs}
                                </span>
                                <span className="text-[#DC2626] bg-white dark:bg-zinc-900 font-extrabold text-[10px] tracking-widest uppercase px-2 py-1 rounded-sm border border-black dark:border-zinc-700 leading-none font-sans">
                                  Diaspora Verified
                                </span>
                              </div>
                            </div>
                          </div>

                        </motion.div>
                      );
                    })}
                  </div>

                  <div className={`p-8 rounded-3xl border transition-all max-w-4xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden ${'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-800 text-black dark:text-zinc-100'
                  }`}>
                    <div className="space-y-1.5 max-w-xl">
                      <h4 className={`text-lg font-sans font-extrabold uppercase tracking-tight ${ 'text-black dark:text-zinc-100'
                      }`}>
                        High Construction Quality Standards
                      </h4>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400  leading-relaxed font-sans font-medium">
                        At Cappadocia S.C., we build all our properties to last. We use high-quality steel, modern foundations, background standby generators, extra water reserves, and clear legal paperwork so you can purchase your dream home with peace of mind.
                      </p>
                    </div>
                    <button 
                      onClick={() => { setActiveTab('contact'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      className="px-6 py-3 bg-red-600 hover:bg-red-600 text-white dark:text-zinc-100 font-extrabold text-xs uppercase tracking-widest rounded-xl shadow-md transition-all cursor-pointer whitespace-nowrap border border-red-600"
                    >
                      Contact Us Now
                    </button>
                  </div>

                </div>
              )}

              {activeTab === 'about' && (
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16" id="about-cappadocia-view">
                  
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    <div className="lg:col-span-6 space-y-6">
                      <span className="text-xs uppercase font-extrabold text-[#DC2626] font-mono tracking-widest block">Who We Are</span>
                      <h1 className={`text-4xl font-serif font-bold tracking-tight ${'text-black dark:text-zinc-100'}`}>
                         Cappadocia S.C.
                      </h1>
                      <p className={`text-sm leading-relaxed ${'text-zinc-700 dark:text-zinc-300'}`}>
                        Cappadocia Real Estate S.C. is a trusted property development company based in Addis Ababa, Ethiopia. We build modern, elegant, and secure homes for families, professionals, and our diaspora community.
                      </p>
                      <p className={`text-sm leading-relaxed ${'text-zinc-700 dark:text-zinc-300'}`}>
                        We believe that buying a home should be simple and secure. That is why all of our apartments and luxury villas are built under strict quality guidelines, with pre-verified land ownership deeds so you have peace of mind.
                      </p>

                      <div className="pt-2 flex gap-6">
                        <div>
                          <p className="text-3xl font-black font-serif text-[#DC2626]">18%</p>
                          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">Average Annual Gain</p>
                        </div>
                        <div className="border-l border-zinc-200 dark:border-zinc-800  pl-6">
                          <p className="text-3xl font-black font-serif text-[#DC2626]">100%</p>
                          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">Legal Verification</p>
                        </div>
                        <div className="border-l border-zinc-200 dark:border-zinc-800  pl-6">
                          <p className="text-3xl font-black font-serif text-[#DC2626]">150+</p>
                          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">Happy Homeowners</p>
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-6 relative aspect-video rounded-2xl overflow-hidden shadow-lg border border-zinc-200 dark:border-zinc-800">
                      <img 
                        src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80" 
                        alt="Cappadocia offices" 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>

                  <div className="space-y-8 pt-8 border-t border-black dark:border-zinc-700">
                    <div className="text-center max-w-2xl mx-auto space-y-2">
                      <span className="text-xs uppercase font-extrabold text-blue-600  font-mono tracking-widest block">Our Core Pillars</span>
                      <h2 className={`text-2xl sm:text-3xl font-serif font-bold ${'text-black dark:text-zinc-100'}`}>
                         Why People Choose Us
                      </h2>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">Simple standards that lead to building lasting developments across Addis Ababa.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className={`p-6 rounded-2xl border ${'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-800 text-black dark:text-zinc-100'}`}>
                        <div className="w-8 h-8 rounded-full bg-[#003B95] text-white dark:text-zinc-100 flex items-center justify-center font-bold text-xs mb-4">1</div>
                        <h3 className="font-bold text-sm mb-2">Verified Land Deeds</h3>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                          We do not build unless the property deed is verified, cleared, and certified. Your escrow deed is completely safe.
                        </p>
                      </div>

                      <div className={`p-6 rounded-2xl border ${'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-800 text-black dark:text-zinc-100'}`}>
                        <div className="w-8 h-8 rounded-full bg-[#003B95] text-white dark:text-zinc-100 flex items-center justify-center font-bold text-xs mb-4">2</div>
                        <h3 className="font-bold text-sm mb-2">High Build Quality</h3>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                          We employ certified engineers, source quality construction grade steel, and verify concrete aggregate mixtures.
                        </p>
                      </div>

                      <div className={`p-6 rounded-2xl border ${'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-800 text-black dark:text-zinc-100'}`}>
                        <div className="w-8 h-8 rounded-full bg-[#003B95] text-white dark:text-zinc-100 flex items-center justify-center font-bold text-xs mb-4">3</div>
                        <h3 className="font-bold text-sm mb-2">Customer First Desk</h3>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                          Whether you live in Addis Ababa or overseas, we provide transparent updates, direct camera logs, and secure escrow services.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8 pt-8 border-t border-black dark:border-zinc-700">
                    <div className="text-center max-w-2xl mx-auto space-y-2">
                      <span className="text-xs uppercase font-extrabold text-[#DC2626] font-mono tracking-widest block">Executive Team</span>
                      <h2 className={`text-2xl sm:text-3xl font-serif font-bold ${'text-black dark:text-zinc-100'}`}>
                         Meet Our Professionals
                      </h2>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">Dedicated specialists leading Cappadocia S.C. projects with absolute professional mastery.</p>
                    </div>

                    <div className="flex flex-wrap items-stretch justify-center gap-7">
                      {teamMembers.map((t: any) => (
                        <div 
                          key={t.name} 
                          className="w-full sm:w-[calc(50%-14px)] md:w-[calc(33.33%-19px)] lg:w-[calc(25%-21px)] min-w-[240px] max-w-[285px] rounded-3xl border overflow-hidden flex flex-col justify-between transition-all duration-350 hover:shadow-xl hover:scale-[1.02] hover:border-red-600 dark:hover:border-red-500 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 group"
                        >
                          <div className="aspect-[4/5] w-full overflow-hidden bg-zinc-200 dark:bg-zinc-900 relative">
                            <img 
                              src={t.img} 
                              alt={t.name} 
                              className="w-full h-full object-cover group-hover:scale-[1.04] transition-all duration-500" 
                              referrerPolicy="no-referrer" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </div>
                          <div className="p-5 flex-grow flex flex-col justify-between bg-zinc-50/30 dark:bg-zinc-900/30 border-t border-zinc-100 dark:border-zinc-800">
                            <div className="space-y-1">
                              <h4 className="font-serif font-extrabold text-base text-blue-600 dark:text-blue-400 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-200">{t.name}</h4>
                              <p className="text-[10px] font-extrabold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">{t.role}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-8 pt-8 border-t border-black dark:border-zinc-700">
                    <div className="text-center max-w-2xl mx-auto space-y-2">
                      <span className="text-xs uppercase font-extrabold text-[#DC2626] font-mono tracking-widest block">Client Experiences</span>
                      <h2 className={`text-2xl sm:text-3xl font-serif font-bold ${'text-black dark:text-zinc-100'}`}>
                         Verified Buyer Feedback
                      </h2>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">Read what families and institutional investors have to say about our delivery and build quality.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {testimonials.map((t) => (
                        <div key={t.id} className={`p-6 md:p-8 rounded-2xl border space-y-4 flex flex-col justify-between ${'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'}`}>
                          <div className="space-y-4">
                            <div className="flex gap-1">
                              {Array.from({ length: t.rating }).map((_, idx) => (
                                <Star key={idx} className="w-3.5 h-3.5 fill-current text-[#DC2626]" />
                              ))}
                            </div>
                            <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 italic font-medium font-serif">
                              "{t.testimony}"
                            </p>
                          </div>
                          <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4 mt-4">
                            <h4 className="font-bold text-sm text-black dark:text-zinc-100 font-sans tracking-tight">{t.clientName}</h4>
                            <p className="text-[10px] uppercase font-bold tracking-widest text-[#003B95] mt-1">{t.propertyPurchased}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {activeTab === 'blog' && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8" id="blog-posts-view">
                  
                  <div className="border-b border-zinc-100 dark:border-zinc-800  pb-5">
                    <span className="text-xs uppercase font-extrabold text-blue-600  tracking-wider">Knowledge Repository</span>
                    <h1 className={`text-3xl font-serif font-bold ${'text-black dark:text-zinc-100'}`}>
                      Cappadocia Real Estate Insights
                    </h1>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Explore architectural guides, foreign currency trends, and smart home manuals.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {blogs.map((b) => (
                      <div 
                        key={b.id} 
                        onClick={() => setViewingBlog(b)}
                        className={`rounded-2xl border overflow-hidden flex flex-col justify-between cursor-pointer transition hover:shadow-md ${'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'
                        }`}
                      >
                        <div>
                          <div className="relative aspect-video">
                            <img src={b.image} alt={b.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            <span className="absolute top-3 left-3 px-2 py-0.5 bg-red-600 text-white dark:text-zinc-100 text-[10px] font-bold uppercase rounded">
                              {b.category}
                            </span>
                          </div>

                          <div className="p-5 space-y-2">
                            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono block">{b.date} • Written by {b.author}</span>
                            <h3 className={`font-serif font-bold text-base leading-tight ${'text-black dark:text-zinc-100'}`}>
                              {b.title}
                            </h3>
                            <p className={`text-xs leading-relaxed ${'text-zinc-600 dark:text-zinc-400'}`}>
                              {b.excerpt}
                            </p>
                          </div>
                        </div>

                        <div className="p-5 pt-0 flex justify-end">
                          <span className="text-xs text-red-600 font-bold inline-flex items-center gap-1 hover:underline">
                            Read insights
                            <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <AnimatePresence>
                    {viewingBlog && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black dark:bg-zinc-50/70 backdrop-blur-xs"
                      >
                        <motion.div 
                          initial={{ y: 25, scale: 0.95 }}
                          animate={{ y: 0, scale: 1 }}
                          exit={{ y: 25, scale: 0.95 }}
                          className={`rounded-3xl border shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto ${'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-black dark:text-zinc-100'
                          }`}
                        >
                          <div className="relative h-60">
                            <img src={viewingBlog.image} alt={viewingBlog.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            <button 
                              onClick={() => setViewingBlog(null)}
                              className="absolute top-4 right-4 p-2 rounded-full bg-black dark:bg-zinc-50/75 text-white dark:text-zinc-100 hover:bg-black dark:bg-zinc-50 transition cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                            <div className="absolute bottom-4 left-6">
                              <span className="bg-red-600 text-white dark:text-zinc-100 font-bold px-2 py-0.5 rounded text-[10px] tracking-widest uppercase">
                                {viewingBlog.category}
                              </span>
                              <h2 className="text-white dark:text-zinc-100 font-serif font-bold text-xl sm:text-2xl mt-1">{viewingBlog.title}</h2>
                            </div>
                          </div>

                          <div className="p-6 space-y-4">
                            <div className="flex items-center justify-between border-b pb-3 border-black dark:border-zinc-700  text-xs">
                              <span className="text-zinc-500 dark:text-zinc-400 font-medium">Author: <strong>{viewingBlog.author}</strong></span>
                              <span className="text-zinc-500 dark:text-zinc-400 font-medium">{viewingBlog.date}</span>
                            </div>

                            <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                              {viewingBlog.content}
                            </p>

                            <button
                              onClick={() => setViewingBlog(null)}
                              className="w-full py-2.5 bg-red-600 text-white dark:text-zinc-100 text-xs font-bold rounded-lg hover:bg-red-600 transition"
                            >
                              Close Article
                            </button>
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              )}

              {activeTab === 'contact' && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12" id="contact-portal-view">
                  
                  <div className="border-b border-black dark:border-zinc-700  pb-5 max-w-2xl">
                    <span className="text-xs uppercase font-extrabold text-blue-600  tracking-wider">Get in Touch</span>
                    <h1 className={`text-3xl font-serif font-bold mt-1 ${'text-black dark:text-zinc-100'}`}>
                       Contact Our Sales Team
                    </h1>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                      Our support staff handles all inquiries, property viewings, floorplans availability, and flexible purchasing details.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    
                    <div className="lg:col-span-5 space-y-6">
                      <div className={`p-6 rounded-2xl border space-y-6 ${'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-800'
                      }`}>
                        <h3 className="font-serif font-bold text-lg">Cappadocia Headquarters</h3>
                        
                        <div className="space-y-4 text-xs font-medium">
                          
                          <div className="flex gap-3">
                            <MapPin className="w-5 h-5 text-red-600 flex-shrink-0" />
                            <div>
                              <p className="font-bold">Headquarters Address</p>
                              <p className="text-zinc-500 dark:text-zinc-400 font-normal mt-0.5 whitespace-pre-line">
                                {contact.hqAddress}
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <Phone className="w-5 h-5 text-red-600 flex-shrink-0" />
                            <div>
                              <p className="font-bold">Sales Hotline</p>
                              <p className="text-zinc-500 dark:text-zinc-400 font-normal mt-0.5">{contact.hotline}</p>
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <Mail className="w-5 h-5 text-red-600 flex-shrink-0" />
                            <div>
                              <p className="font-bold">Email Support Desk</p>
                              <p className="text-zinc-500 dark:text-zinc-400 font-normal mt-0.5">{contact.email}</p>
                            </div>
                          </div>

                        </div>
                      </div>

                      <div className="p-4 rounded-xl border border-dashed border-red-600/30 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400 flex gap-2">
                        <span className="text-red-600 font-bold">•</span>
                        <p>
                          Investors traveling from Europe or North America can schedule private chauffeured transfers from Bole International Airport directly through their sales agent.
                        </p>
                      </div>
                    </div>

                    <div className="lg:col-span-7">
                      <div className={`p-6 rounded-2xl border shadow-sm ${'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'
                      }`}>
                        
                        <div className="border-b pb-4 mb-4">
                          <h3 className="font-serif font-bold text-base">Send Us a Message</h3>
                          <p className="text-[11px] text-zinc-600 dark:text-zinc-400">Leave your contact details and our team will get back to you shortly.</p>
                        </div>

                        {contactSuccess ? (
                          <div className="bg-blue-500/15 border border-blue-500/30 text-blue-500 p-4 rounded-xl text-center text-xs space-y-2">
                            <ShieldCheck className="w-8 h-8 mx-auto text-blue-500" />
                            <p className="font-bold">Message Received!</p>
                            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-normal">
                              Excellent. Our Bole desk will contact you via your email or phone within 2 hours.
                            </p>
                          </div>
                        ) : (
                          <form onSubmit={handleContactSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-[11px] font-bold uppercase text-zinc-600 dark:text-zinc-400  mb-1">Your Full Name *</label>
                                <input
                                  type="text"
                                  required
                                  value={contactName}
                                  onChange={(e) => setContactName(e.target.value)}
                                  placeholder="e.g. Abebe Kebede"
                                  className="w-full p-3 text-xs rounded-xl border bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-red-600 focus:border-red-600 focus:outline-none transition-all duration-200"
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] font-bold uppercase text-zinc-600 dark:text-zinc-400  mb-1">Email Address *</label>
                                <input
                                  type="email"
                                  required
                                  value={contactEmail}
                                  onChange={(e) => setContactEmail(e.target.value)}
                                  placeholder="e.g. abebe@cappadocia.com"
                                  className="w-full p-3 text-xs rounded-xl border bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-red-600 focus:border-red-600 focus:outline-none transition-all duration-200"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold uppercase text-zinc-600 dark:text-zinc-400  mb-1">Phone Contact (With code) *</label>
                              <input
                                  type="tel"
                                  required
                                  value={contactPhone}
                                  onChange={(e) => setContactPhone(e.target.value)}
                                  placeholder="e.g. +251 911 223344"
                                  className="w-full p-3 text-xs rounded-xl border bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-red-600 focus:border-red-600 focus:outline-none transition-all duration-200"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold uppercase text-zinc-600 dark:text-zinc-400  mb-1">Inquiry / Investment Interest *</label>
                              <textarea
                                rows={4}
                                required
                                value={contactMsg}
                                onChange={(e) => setContactMsg(e.target.value)}
                                placeholder="Let us know what kind of apartment, budget, or location you are interested in..."
                                className="w-full p-3 text-xs rounded-xl border bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-red-600 focus:border-red-600 focus:outline-none transition-all duration-200"
                              />
                            </div>

                            <button
                              type="submit"
                              className="w-full py-3.5 bg-red-600 hover:bg-red-600 text-white dark:text-zinc-100 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer shadow-md hover:shadow-lg"
                            >
                              Send Message
                            </button>
                          </form>
                        )}

                      </div>
                    </div>

                  </div>
                </div>
              )}

              {activeTab === 'admin' && (
                loggedInUser ? (
                  <AdminPanel
                    properties={properties}
                    setProperties={setProperties}
                    testimonials={testimonials}
                    setTestimonials={setTestimonials}
                    blogs={blogs}
                    setBlogs={setBlogs}
                    projects={projects}
                    setProjects={setProjects}
                    contactInfo={contact}
                    setContactInfo={(action) => setContactInfo((prev: any) => { const next = typeof action === 'function' ? action(prev) : action; syncSettingsToFirestore('contactInfo', next); return next; })}
                    teamMembers={teamMembers}
                    setTeamMembers={(action) => setTeamMembers((prev: any) => { const next = typeof action === 'function' ? action(prev) : action; syncSettingsToFirestore('teamMembers', next); return next; })}
                    popupAds={popupAds}
                    setPopupAds={setPopupAds}
                    messages={messages}
                    setMessages={setMessages}
                    users={users}
                    setUsers={setUsers}
                    homeSettings={homeSettings}
                    setHomeSettings={(action) => setHomeSettings((prev: any) => { const next = typeof action === 'function' ? action(prev) : action; syncSettingsToFirestore('homeSettings', next); return next; })}
                    allLocations={allLocations}
                    setAllLocations={(action) => setAllLocations((prev: any) => { const next = typeof action === 'function' ? action(prev) : action; syncSettingsToFirestore('allLocations', next); return next; })}
                    allTypes={allTypes}
                    setAllTypes={(action) => setAllTypes((prev: any) => { const next = typeof action === 'function' ? action(prev) : action; syncSettingsToFirestore('allTypes', next); return next; })}
                    globalSocials={globalSocials}
                    setGlobalSocials={(action) => setGlobalSocials((prev: any) => { const next = typeof action === 'function' ? action(prev) : action; syncSettingsToFirestore('globalSocials', next); return next; })}
                    allAmenities={allAmenities}
                    setAllAmenities={(action) => setAllAmenities((prev: any) => { const next = typeof action === 'function' ? action(prev) : action; syncSettingsToFirestore('allAmenities', next); return next; })}
                    isDarkMode={isDarkMode}
                    activityLogs={activityLogs}
                    logActivity={logActivity}
                    showAlert={showAlert}
                    showConfirm={showConfirm}
                    restoreOriginalWebsiteContent={restoreOriginalWebsiteContent}
                    isRestoring={isRestoring}
                    loggedInUser={loggedInUser}
                  />
                ) : (
                  <Login onLogin={(user) => {
                    setLoggedInUser(user);
                    setActiveTab('admin');
                  }} />
                )
              )}

            </motion.div>
          )}

        </AnimatePresence>

      </main>

      {/* FLOATING COMPARE DOCK */}
      {comparePropertyIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-xl bg-black dark:bg-zinc-50 border border-black dark:border-zinc-700 shadow-2xl rounded-2xl p-4 text-white dark:text-zinc-100 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-3">
            <div className="bg-red-600 font-mono text-xs font-black px-2.5 py-1 rounded-lg">
              {comparePropertyIds.length} Selected
            </div>
            <div>
              <p className="text-xs font-bold leading-tight">Property Comparison S.C.</p>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">Select up to 3 models to analyze side-by-side</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCompareModalOpen(true)}
              className="px-4 py-2 bg-[#003B95] hover:bg-[#002f75] text-xs font-extrabold uppercase tracking-wider rounded-xl transition cursor-pointer"
            >
              Compare Now
            </button>
            <button
              onClick={() => setComparePropertyIds([])}
              className="p-2 bg-black dark:bg-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition text-zinc-500 dark:text-zinc-400 hover:text-white dark:text-zinc-100 cursor-pointer"
              title="Clear Comparison"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* COMPARE SIDE-BY-SIDE MODAL */}
      <AnimatePresence>
        {isCompareModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCompareModalOpen(false)}
              className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.94, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.94, y: 30, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-805 text-zinc-900 dark:text-zinc-100 flex flex-col z-10"
            >
              <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="text-[9px] uppercase font-black tracking-widest text-red-700 dark:text-red-500 font-mono block">Direct Side-By-Side Comparison</span>
                  <h2 className="font-serif font-black text-2xl tracking-tight">Analyze Property Indices</h2>
                </div>
                <button
                  onClick={() => setIsCompareModalOpen(false)}
                  className="p-2 rounded-xl transition hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-zinc-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-x-auto">
                {comparePropertyIds.length === 0 ? (
                  <div className="py-12 text-center text-zinc-700 dark:text-zinc-400">
                    <p className="font-serif font-bold text-lg">No assets selected for comparison.</p>
                    <p className="text-xs mt-1">Go back and select properties from our elite collection.</p>
                  </div>
                ) : (
                  <table className="w-full min-w-[650px] border-collapse text-left">
                    <thead>
                      <tr className="border-b border-zinc-200 dark:border-zinc-800">
                        <th className="py-4 text-[10px] uppercase font-black text-zinc-500 dark:text-zinc-400 font-mono tracking-wider w-1/4">Key Parameters</th>
                        {properties.filter(p => comparePropertyIds.includes(p.id)).slice(0, 3).map((p) => (
                          <th key={p.id} className="p-4 w-1/4">
                            <div className="space-y-2 relative group">
                              <button
                                onClick={() => setComparePropertyIds(comparePropertyIds.filter(id => id !== p.id))}
                                className="absolute -top-1 -right-1 p-1 bg-red-600 hover:bg-red-700 text-white dark:text-zinc-100 rounded-full transition cursor-pointer z-10 shadow-lg"
                                title="Remove"
                              >
                                <X className="w-3 h-3" />
                              </button>
                              <div className="aspect-video rounded-xl overflow-hidden bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800">
                                <img src={p.featuredImage} alt={p.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              </div>
                              <div>
                                <p className="text-[9px] uppercase tracking-wider text-red-700 dark:text-red-500 font-mono font-bold">{p.type}</p>
                                <p className="text-xs font-serif font-bold line-clamp-1 text-zinc-900 dark:text-zinc-100">{p.title}</p>
                                <p className="text-[10px] text-zinc-500 dark:text-zinc-500">{p.subCity}</p>
                              </div>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80 text-xs font-medium text-zinc-800 dark:text-zinc-200">
                      <tr>
                        <td className="py-4 text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider font-mono text-[9px]">Base Investment Price</td>
                        {properties.filter(p => comparePropertyIds.includes(p.id)).slice(0, 3).map((p) => (
                          <td key={p.id} className="p-4 font-bold font-mono text-red-700 dark:text-red-500 text-sm">
                            ETB {p.price.toLocaleString()}
                           </td>
                        ))}
                       </tr>
                      <tr>
                        <td className="py-4 text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider font-mono text-[9px]">Floor Area (Sqm)</td>
                        {properties.filter(p => comparePropertyIds.includes(p.id)).slice(0, 3).map((p) => (
                          <td key={p.id} className="p-4 font-mono font-bold">
                            {p.areaSqm} sqm
                           </td>
                        ))}
                       </tr>
                      <tr>
                        <td className="py-4 text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider font-mono text-[9px]">Bedrooms Config</td>
                        {properties.filter(p => comparePropertyIds.includes(p.id)).slice(0, 3).map((p) => (
                          <td key={p.id} className="p-4 font-mono">
                            {p.bedrooms} Bedrooms
                           </td>
                        ))}
                       </tr>
                      <tr>
                        <td className="py-4 text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider font-mono text-[9px]">Bathrooms count</td>
                        {properties.filter(p => comparePropertyIds.includes(p.id)).slice(0, 3).map((p) => (
                          <td key={p.id} className="p-4 font-mono">
                            {p.bathrooms} Bathrooms
                           </td>
                        ))}
                       </tr>
                      <tr>
                        <td className="py-4 text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider font-mono text-[9px]">Status Indicator</td>
                        {properties.filter(p => comparePropertyIds.includes(p.id)).slice(0, 3).map((p) => (
                          <td key={p.id} className="p-4">
                            <span className="bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-lg border border-red-100 dark:border-red-900/30">
                              {p.status}
                            </span>
                           </td>
                        ))}
                       </tr>
                      <tr>
                        <td className="py-4 text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider font-mono text-[9px]">Location Coordinate</td>
                        {properties.filter(p => comparePropertyIds.includes(p.id)).slice(0, 3).map((p) => (
                          <td key={p.id} className="p-4 text-[11px] text-zinc-700 dark:text-zinc-400">
                            {p.location}
                           </td>
                        ))}
                       </tr>
                      <tr>
                        <td className="py-4 text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider font-mono text-[9px]">Evaluation</td>
                        {properties.filter(p => comparePropertyIds.includes(p.id)).slice(0, 3).map((p) => (
                          <td key={p.id} className="p-4">
                            <button
                              onClick={() => {
                                setActivePropertyId(p.id);
                                setIsCompareModalOpen(false);
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }}
                              className="w-full py-2 bg-[#003B95] hover:bg-blue-800 text-white dark:text-zinc-100 text-[10px] font-black uppercase tracking-widest rounded-xl transition shadow-md shadow-blue-900/15 cursor-pointer text-center"
                            >
                              Inspect details
                            </button>
                           </td>
                        ))}
                       </tr>
                    </tbody>
                  </table>
                )}
              </div>

              <div className="p-5 bg-zinc-50 dark:bg-zinc-950/40 flex items-center justify-end border-t border-zinc-100 dark:border-zinc-800/80 rounded-b-3xl">
                <button
                  onClick={() => setIsCompareModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-800 dark:text-zinc-200 cursor-pointer"
                >
                  Close Comparison
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FOOTER COMPONENT */}
      {activeTab !== 'admin' && (
        <footer className={`py-12 sm:py-16 mt-12 sm:mt-16 border-t transition-colors duration-300 ${isDarkMode ? "border-zinc-900 bg-zinc-950 text-zinc-400" : "border-zinc-200 bg-white text-zinc-600"}`} id="primary-footer">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-left">
              <div className="space-y-4">
                <CappadociaLogo className="scale-90 origin-left mb-1" />
                <p className={`text-xs leading-relaxed max-w-sm ${isDarkMode ? "text-zinc-400" : "text-zinc-700"}`}>
                  Cappadocia Real Estate S.C. builds your architectural dreams into high-quality luxury realities in Addis Ababa’s premier urban subcities.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs uppercase font-extrabold text-[#DC2626] font-sans tracking-wide">
                  Navigation
                </h3>
                <ul className="grid grid-cols-2 sm:grid-cols-1 gap-x-4 gap-y-2 md:space-y-2">
                  {(['home', 'about', 'properties', 'projects', 'blog', 'favorites', 'contact'] as const).map(tab => (
                    <li key={tab}>
                      <button 
                        onClick={() => { setActiveTab(tab); setActivePropertyId(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
                        className={`text-xs font-semibold hover:text-[#DC2626] transition capitalize cursor-pointer flex items-center gap-1 bg-transparent border-none p-0 ${isDarkMode ? "text-zinc-300 hover:text-white" : "text-zinc-600 hover:text-black"}`}
                      >
                        <ChevronRight className="w-3.5 h-3.5 text-red-600" />
                        <span>{tabLabels[tab] || tab}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs uppercase font-extrabold text-[#DC2626] font-sans tracking-wide">
                  Get In Touch
                </h3>
                <ul className="space-y-2.5 text-xs">
                  <li className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                    <Phone className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
                    <a href={`tel:${contact.phone}`} className="font-sans font-semibold hover:text-red-500 transition-colors">
                      {contact.phone}
                    </a>
                  </li>
                  <li className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                    <Mail className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
                    <a href={`mailto:${contact.email}`} className="font-sans font-semibold hover:text-red-500 transition-colors break-all">
                      {contact.email}
                    </a>
                  </li>
                  <li className="flex items-start gap-2 text-zinc-700 dark:text-zinc-300">
                    <MapPin className="w-3.5 h-3.5 mt-0.5 text-red-600 flex-shrink-0" />
                    <span className="font-sans font-semibold">{contact.address}</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs uppercase font-extrabold text-[#DC2626] font-sans tracking-wide">
                  Follow Us
                </h3>
                <div className="flex gap-5.5 sm:gap-6.5 items-center flex-wrap pt-0.5">
                  {globalSocials?.telegram && (
                    <a href={globalSocials.telegram} target="_blank" rel="noopener noreferrer" title="Telegram" className="transition-transform duration-300 hover:scale-110 active:scale-95 block">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg" alt="Telegram" className="w-8 h-8 object-contain" referrerPolicy="no-referrer" />
                    </a>
                  )}
                  {globalSocials?.whatsapp && (
                    <a href={globalSocials.whatsapp} target="_blank" rel="noopener noreferrer" title="WhatsApp" className="transition-transform duration-300 hover:scale-110 active:scale-95 block">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" className="w-8 h-8 object-contain" referrerPolicy="no-referrer" />
                    </a>
                  )}
                  {globalSocials?.instagram && (
                    <a href={globalSocials.instagram} target="_blank" rel="noopener noreferrer" title="Instagram" className="transition-transform duration-300 hover:scale-110 active:scale-95 block">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg" alt="Instagram" className="w-8 h-8 object-contain" referrerPolicy="no-referrer" />
                    </a>
                  )}
                  {globalSocials?.facebook && (
                    <a href={globalSocials.facebook} target="_blank" rel="noopener noreferrer" title="Facebook" className="transition-transform duration-300 hover:scale-110 active:scale-95 block">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg" alt="Facebook" className="w-8 h-8 object-contain" referrerPolicy="no-referrer" />
                    </a>
                  )}
                  {globalSocials?.linkedin && (
                    <a href={globalSocials.linkedin} target="_blank" rel="noopener noreferrer" title="LinkedIn" className="transition-transform duration-300 hover:scale-110 active:scale-95 block">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/8/81/LinkedIn_icon.svg" alt="LinkedIn" className="w-8 h-8 object-contain" referrerPolicy="no-referrer" />
                    </a>
                  )}
                  {globalSocials?.tiktok && (
                    <a href={globalSocials.tiktok} target="_blank" rel="noopener noreferrer" title="TikTok" className="transition-transform duration-300 hover:scale-110 active:scale-95 block">
                      <img src="https://img.icons8.com/color/120/tiktok--v1.png" alt="TikTok" className="w-8 h-8 object-contain" referrerPolicy="no-referrer" />
                    </a>
                  )}
                  {globalSocials?.twitter && (
                    <a href={globalSocials.twitter} target="_blank" rel="noopener noreferrer" title="X / Twitter" className="transition-transform duration-300 hover:scale-110 active:scale-95 block">
                      <div className="w-8 h-8 flex items-center justify-center rounded-full bg-black text-white p-1.5 border border-zinc-800">
                        <svg className="w-full h-full flex-shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                      </div>
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className={`pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-semibold ${isDarkMode ? "border-zinc-900 text-zinc-400" : "border-zinc-300 text-zinc-500"}`}>
              <p>© {new Date().getFullYear()} Cappadocia Real Estate S.C. All rights reserved.</p>
              <div className="flex items-center gap-3">
                <p className="text-[9px] text-zinc-400 font-mono">v{import.meta.env.VITE_APP_VERSION || '1'}</p>
                <p className="flex items-center gap-1 text-zinc-500 font-sans font-black uppercase text-[9px] tracking-wider"></p>
              </div>
            </div>
          </div>
        </footer>
      )}

      {/* Floating Contact/WhatsApp Dropdown */}
      {activeTab !== 'admin' && (
        <ContactDropdown isDarkMode={isDarkMode} globalSocials={globalSocials} contactInfo={contact} />
      )}

      {/* Global Animated Custom Prompt / Dialog System */}
      <CustomPopup
        isOpen={dialog.isOpen}
        title={dialog.title}
        message={dialog.message}
        type={dialog.type}
        onConfirm={dialog.onConfirm}
        onCancel={dialog.onCancel}
        confirmText={dialog.confirmText}
        cancelText={dialog.cancelText}
      />

    </div>
  );
}
