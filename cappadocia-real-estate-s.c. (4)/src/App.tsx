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

  const contact = { ...contactInfo };

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
  const [homeSettings, setHomeSettings] = useState<{
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
  const [allLocations, setAllLocations] = useState<string[]>(() =>
    safelyParseJSON<string[]>('cap_all_locations', ['Bole', 'Kazanchis', 'CMC', 'Summit'])
  );
  const [allTypes, setAllTypes] = useState<string[]>(() =>
    safelyParseJSON<string[]>('cap_all_types', ['Luxury Villa', 'Modern Penthouse', 'Exclusive Apartment', 'Townhouse'])
  );
  const [allAmenities, setAllAmenities] = useState<string[]>(() =>
    safelyParseJSON<string[]>('cap_all_amenities', [])
  );

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
          try {
            handleFirestoreError(error, OperationType.WRITE, `${collectionName}/${item.id}`);
          } catch (e) {
            throw e;
          }
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
          try {
            handleFirestoreError(error, OperationType.DELETE, `${collectionName}/${item.id}`);
          } catch (e) {
            throw e;
          }
        }
      }
    }
  };

  // State state modifiers synced with Firestore
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

  // Live Firestore syncing
  useEffect(() => {
    const unsubProperties = onSnapshot(collection(db, 'properties'), (snapshot) => {
      const list: Property[] = [];
      snapshot.forEach((docSnap) => list.push(docSnap.data() as Property));
      if (list.length > 0) setPropertiesState(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'properties');
    });

    const unsubTestimonials = onSnapshot(collection(db, 'testimonials'), (snapshot) => {
      const list: Testimonial[] = [];
      snapshot.forEach((docSnap) => list.push(docSnap.data() as Testimonial));
      if (list.length > 0) setTestimonialsState(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'testimonials');
    });

    const unsubBlogs = onSnapshot(collection(db, 'blogs'), (snapshot) => {
      const list: Blog[] = [];
      snapshot.forEach((docSnap) => list.push(docSnap.data() as Blog));
      if (list.length > 0) setBlogsState(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'blogs');
    });

    const unsubProjects = onSnapshot(collection(db, 'projects'), (snapshot) => {
      const list: Project[] = [];
      snapshot.forEach((docSnap) => list.push(docSnap.data() as Project));
      if (list.length > 0) setProjectsState(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'projects');
    });

    const unsubMessages = onSnapshot(collection(db, 'messages'), (snapshot) => {
      const list: InquiryMessage[] = [];
      snapshot.forEach((docSnap) => list.push(docSnap.data() as InquiryMessage));
      if (list.length > 0) setMessagesState(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'messages');
    });

    const unsubPopupAds = onSnapshot(collection(db, 'popup_ads'), (snapshot) => {
      const list: PopupAd[] = [];
      snapshot.forEach((docSnap) => list.push(docSnap.data() as PopupAd));
      if (list.length > 0) setPopupAdsState(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'popup_ads');
    });

    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const list: AdminUser[] = [];
      snapshot.forEach((docSnap) => list.push(docSnap.data() as AdminUser));
      if (list.length > 0) setUsersState(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
    });

    const unsubSettings = onSnapshot(doc(db, 'settings', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.homeSettings) setHomeSettings(data.homeSettings);
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

  // Control core settings UI navigation paths
  const [activeTab, setActiveTab ] = useState<'home' | 'properties' | 'projects' | 'favorites' | 'about' | 'blog' | 'contact' | 'admin'>('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activePropertyId, setActivePropertyId] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => 
    safelyParseJSON<boolean>('cap_dark_mode', false)
  );

  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
        console.log('Successfully connected to Firebase Firestore');
      } catch (error) {
        console.error('Firebase server network verification status:', error);
      }
    }
    testConnection();
  }, []);

  useEffect(() => {
    if (window.location.pathname === '/admin') {
      setActiveTab('admin');
      window.history.replaceState({}, '', '/admin');
    }
  }, []);

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Global Context modal dialog architecture
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
            console.error(`Deleting doc failed:`, delErr);
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

      logActivity('system', 'System database restored to original Cappadocia Real Estate portfolio.');
      showAlert('System Restored Successfully', 'All properties and configurations have been cleanly restored.');
    } catch (err: any) {
      console.error('System restore error:', err);
      showAlert('Restore Failed', `An error occurred: ${err?.message || err}`);
    } finally {
      setIsRestoring(false);
    }
  };

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

  const [favorites, setFavorites] = useState<string[]>(() => 
    safelyParseJSON<string[]>('cap_favorites', [])
  );

  const [searchLocation, setSearchLocation] = useState('');
  const [searchType, setSearchType] = useState('');
  const [searchBedrooms, setSearchBedrooms] = useState('');

  const [locDropdownOpen, setLocDropdownOpen] = useState(false);
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [bedsDropdownOpen, setBedsDropdownOpen] = useState(false);
  const [loadMoreClicks, setLoadMoreClicks] = useState(0);
  const [latestExpanded, setLatestExpanded] = useState(false);

  const [currentActiveAd, setCurrentActiveAd] = useState<PopupAd | null>(null);
  const [adDismissed, setAdDismissed] = useState(false);

  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMsg, setContactMsg] = useState('');
  const [contactSuccess, setContactSuccess] = useState(false);
  const [viewingBlog, setViewingBlog] = useState<Blog | null>(null);

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => 
    safelyParseJSON<ActivityLog[]>('cap_activity_logs', [
      { id: 'act-1', time: new Date(Date.now() - 3600000 * 2).toISOString(), type: 'system', message: 'System initialized successfully under security coordinates.' },
      { id: 'act-2', time: new Date(Date.now() - 3600000 * 1.5).toISOString(), type: 'property', message: 'Verified Bole Premium Duplex structural specifications.' },
    ])
  );

  const logActivity = (type: ActivityLog['type'], message: string) => {
    const newLog: ActivityLog = {
      id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      time: new Date().toISOString(),
      type,
      message
    };
    setActivityLogs(prev => [newLog, ...prev].slice(0, 50));
  };

  // State synchronization engine targeting LocalStorage bindings
  useEffect(() => { localStorage.setItem('cap_activity_logs', JSON.stringify(activityLogs)); }, [activityLogs]);
  useEffect(() => { localStorage.setItem('cap_properties', JSON.stringify(properties)); }, [properties]);
  useEffect(() => { localStorage.setItem('cap_testimonials', JSON.stringify(testimonials)); }, [testimonials]);
  useEffect(() => { localStorage.setItem('cap_blogs', JSON.stringify(blogs)); }, [blogs]);
  useEffect(() => { localStorage.setItem('cap_popup_ads', JSON.stringify(popupAds)); }, [popupAds]);
  useEffect(() => { localStorage.setItem('cap_messages', JSON.stringify(messages)); }, [messages]);
  useEffect(() => { localStorage.setItem('cap_users', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('cap_projects', JSON.stringify(projects)); }, [projects]);
  useEffect(() => { localStorage.setItem('cap_favorites', JSON.stringify(favorites)); }, [favorites]);
  useEffect(() => { localStorage.setItem('cap_all_locations', JSON.stringify(allLocations)); }, [allLocations]);
  useEffect(() => { localStorage.setItem('cap_all_types', JSON.stringify(allTypes)); }, [allTypes]);
  useEffect(() => { localStorage.setItem('cap_all_amenities', JSON.stringify(allAmenities)); }, [allAmenities]);
  useEffect(() => { localStorage.setItem('cap_socials', JSON.stringify(globalSocials)); }, [globalSocials]);
  useEffect(() => { localStorage.setItem('cap_contact_info', JSON.stringify(contactInfo)); }, [contactInfo]);
  useEffect(() => { localStorage.setItem('cap_team_members', JSON.stringify(teamMembers)); }, [teamMembers]);

  useEffect(() => {
    localStorage.setItem('cap_dark_mode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('cap_home_settings', JSON.stringify(homeSettings));
    try {
      const faviconUrl = homeSettings.brandFavicon || "/favicon.png";
      const links = document.querySelectorAll("link[rel*='icon']");
      if (links && links.length > 0) {
        links.forEach((link: any) => { link.href = faviconUrl; });
      }
    } catch (e) {
      console.error('Error updating brand favicon Rel:', e);
    }
  }, [homeSettings]);

  // Activity Watchdog Engine (Admin auto-logout)
  useEffect(() => {
    if (!isLoggedIn) return;
    let timeoutId: NodeJS.Timeout;

    const logoutDueToInactivity = () => {
      setIsLoggedIn(false);
      logActivity('auth', 'Logged out automatically due to 30 minutes of administrative inactivity');
      showAlert('Session Timeout', 'Your administration workstation session has been closed after 30 minutes of inactive idle state.');
    };

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(logoutDueToInactivity, 30 * 60 * 1000);
    };

    resetTimer();
    const activityEvents = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'];
    activityEvents.forEach(evt => window.addEventListener(evt, resetTimer));

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      activityEvents.forEach(evt => window.removeEventListener(evt, resetTimer));
    };
  }, [isLoggedIn]);

  useEffect(() => {
    const tracking = () => { setScrolled(window.scrollY > 40); };
    window.addEventListener('scroll', tracking);
    return () => window.removeEventListener('scroll', tracking);
  }, []);

  useEffect(() => {
    const activeCampaign = popupAds.find(ad => ad.isActive);
    if (activeCampaign && !adDismissed && activeTab !== 'admin') {
      const timer = setTimeout(() => { setCurrentActiveAd(activeCampaign); }, 1200);
      return () => clearTimeout(timer);
    }
  }, [popupAds, adDismissed, activeTab]);

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
    logActivity('message', `Message received from ${contactName}`);
    setContactSuccess(true);
    setContactName('');
    setContactEmail('');
    setContactPhone('');
    setContactMsg('');
    showAlert("Message Sent", `Thank you! Your representative inquiry has been registered on our client deck.`);
    setTimeout(() => { setContactSuccess(false); }, 5000);
  };

  const handleCallbackInquiry = (inquiry: Omit<InquiryMessage, 'id' | 'date' | 'status'>) => {
    const id = `msg-${Date.now()}`;
    const fullLog: InquiryMessage = { ...inquiry, id, date: new Date().toISOString().split('T')[0], status: 'New' };
    setMessages(prev => [fullLog, ...prev]);
    logActivity('message', `Callback requested for "${inquiry.propertyTitle || 'Luxury Asset'}" by ${inquiry.fullName}`);
    showAlert("Callback Scheduled", `Thank you, ${inquiry.fullName}! A portfolio associate will reach out to you on ${inquiry.phone}.`);
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

  // High-Fidelity premium brand logo component layout
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
        <div className="flex items-center h-12 sm:h-14 md:h-16 lg:h-20 max-w-[280px] sm:max-w-[320px] md:max-w-[380px] py-1">
          <img 
            src={homeSettings.brandLogo || "/logo_full_tran.png"} 
            alt="Cappadocia Real Estate S.C."
            className="h-full w-auto object-contain transition-transform duration-300 group-hover:scale-[1.02]"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${isDarkMode ? "dark bg-zinc-950 text-zinc-50" : "bg-zinc-50 text-zinc-900"}`} id="application-root">
      
      {/* POP-UP MARKETING ADS CAMPAIGN PROMOS */}
      <AnimatePresence>
        {currentActiveAd && !adDismissed && activeTab !== 'admin' && (
          <motion.div 
            initial={{ opacity: 0, y: 40, scale: 0.92 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            exit={{ opacity: 0, y: 30, scale: 0.92 }} 
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            className="fixed bottom-6 right-6 z-50 max-w-sm w-full p-5 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 select-none" 
            id="marketing-popup-overlay"
          >
            <button 
              onClick={() => setAdDismissed(true)} 
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center border-2 border-white dark:border-zinc-900 shadow-md cursor-pointer hover:scale-110 transition-transform"
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
                {currentActiveAd.ctaLink && (
                  <button 
                    onClick={() => {
                      const link = currentActiveAd.ctaLink?.trim() || '/';
                      setAdDismissed(true);
                      if (link === '/') {
                        setActiveTab('home');
                      } else if (link.startsWith('/properties/')) {
                        setActivePropertyId(link.replace('/properties/', ''));
                        setActiveTab('properties');
                      } else {
                        setActiveTab('properties');
                      }
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }} 
                    className="mt-2 text-xs font-bold text-zinc-900 dark:text-white underline block cursor-pointer"
                  >
                    {currentActiveAd.ctaText || "Learn More"} →
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GLOBAL SCROLLING HEADER NAVIGATION MENU */}
      <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled ? 'bg-zinc-950/95 text-white border-b border-zinc-900 shadow-md backdrop-blur-md' : 'bg-transparent text-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <CappadociaLogo />
          
          <nav className="hidden lg:flex items-center gap-1">
            {Object.entries(tabLabels).map(([key, label]) => (
              <button
                key={key}
                onClick={() => { setActiveTab(key as any); setActivePropertyId(null); }}
                className={`px-4 py-2 text-xs font-semibold uppercase tracking-widest rounded-lg transition-colors cursor-pointer ${activeTab === key ? 'bg-white text-zinc-950 font-black' : 'hover:bg-white/10 text-zinc-300'}`}
              >
                {label}
              </button>
            ))}
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)} 
              className="p-2 ml-2 rounded-lg hover:bg-white/10 text-zinc-300 cursor-pointer"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </nav>

          <div className="flex lg:hidden items-center gap-3">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 text-zinc-300 hover:bg-white/10 rounded-lg">
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-zinc-300 hover:bg-white/10 rounded-lg">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE EXPANDABLE MENU OVERLAY */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }} 
            exit={{ opacity: 0, height: 0 }} 
            className="fixed top-20 left-0 right-0 z-30 bg-zinc-900 border-b border-zinc-800 text-white block lg:hidden overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {Object.entries(tabLabels).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => { setActiveTab(key as any); setActivePropertyId(null); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs uppercase tracking-wider font-bold block ${activeTab === key ? 'bg-white text-zinc-950' : 'text-zinc-300 hover:bg-zinc-800'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CORE DYNAMIC LAYOUT ENGINE ROUTER */}
      <main className="flex-grow pt-20">
        {activePropertyId ? (
          <PropertyDetails 
            id={activePropertyId} 
            setActivePropertyId={setActivePropertyId} 
            onInquiry={handleCallbackInquiry} 
          />
        ) : (
          <div>
            {/* TAB: HOME VIEW EXECUTION */}
            {activeTab === 'home' && (
              <div className="space-y-16 pb-20">
                {/* HERO DISTRICT BANNER */}
                <div className="relative h-[70vh] flex items-center justify-center overflow-hidden bg-zinc-950">
                  <img src={homeSettings.heroImage} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
                  <div className="relative max-w-4xl mx-auto px-4 text-center text-white space-y-6 mt-10">
                    <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-none">{homeSettings.heroTitle}</h1>
                    <p className="text-sm sm:text-lg text-zinc-200 max-w-2xl mx-auto font-medium leading-relaxed">{homeSettings.heroSubtitle}</p>
                    
                    {/* INLINE CORE FILTER WIDGET */}
                    <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10 shadow-2xl max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-4 gap-2 text-zinc-900">
                      <select value={searchLocation} onChange={(e)=>setSearchLocation(e.target.value)} className="bg-white dark:bg-zinc-900 dark:text-white px-3 py-3 rounded-xl text-xs font-semibold outline-none border-none">
                        <option value="">All Locations</option>
                        {allLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                      </select>
                      <select value={searchType} onChange={(e)=>setSearchType(e.target.value)} className="bg-white dark:bg-zinc-900 dark:text-white px-3 py-3 rounded-xl text-xs font-semibold outline-none border-none">
                        <option value="">All Asset Types</option>
                        {allTypes.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <select value={searchBedrooms} onChange={(e)=>setSearchBedrooms(e.target.value)} className="bg-white dark:bg-zinc-900 dark:text-white px-3 py-3 rounded-xl text-xs font-semibold outline-none border-none">
                        <option value="">Bedrooms</option>
                        <option value="1">1 Bed</option>
                        <option value="2">2 Beds</option>
                        <option value="3">3 Beds</option>
                        <option value="4">4 Beds</option>
                        <option value="5+">5+ Beds</option>
                      </select>
                      <button onClick={handleSearchAction} className="bg-white text-zinc-950 font-black uppercase text-xs tracking-widest rounded-xl hover:bg-zinc-100 transition-colors py-3 sm:py-0 cursor-pointer">
                        Search
                      </button>
                    </div>
                  </div>
                </div>

                {/* FEATURED ASSETS CAROUSEL/GRID SECTION */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                  <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
                    <div>
                      <span className="text-[10px] uppercase font-black tracking-widest text-zinc-400">Exclusive Portfolios</span>
                      <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Addis Ababa Premier Assets</h2>
                    </div>
                    {filteredProperties.length > 3 && (
                      <button onClick={handleLoadMoreLatest} className="text-xs font-bold uppercase tracking-wider flex items-center gap-1 underline cursor-pointer">
                        {latestExpanded ? "Show Specialized Views" : "Browse All Catalog Matrix"} <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {filteredProperties.slice(0, latestExpanded ? 9 : 3).map((p) => (
                      <div 
                        key={p.id} 
                        onClick={() => { setActivePropertyId(p.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-sm border border-zinc-200 dark:border-zinc-800 group cursor-pointer hover:shadow-lg transition-all"
                      >
                        <div className="relative h-64 overflow-hidden bg-zinc-200">
                          <img src={p.images?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c'} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          <button 
                            onClick={(e) => handleToggleFavorite(p.id, e)}
                            className="absolute top-4 right-4 w-9 h-9 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-full flex items-center justify-center text-zinc-900 dark:text-white"
                          >
                            <Heart className={`w-4 h-4 ${favorites.includes(p.id) ? 'fill-red-600 text-red-600' : ''}`} />
                          </button>
                          <div className="absolute bottom-4 left-4 bg-zinc-950/80 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                            {p.subCity}
                          </div>
                        </div>
                        <div className="p-5 space-y-4">
                          <div>
                            <h3 className="font-bold text-lg line-clamp-1 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">{p.title}</h3>
                            <p className="text-xs text-zinc-500 font-semibold">{p.type}</p>
                          </div>
                          <div className="flex justify-between items-center pt-2 border-t border-zinc-100 dark:border-zinc-800">
                            <span className="text-base font-black tracking-tight text-zinc-900 dark:text-white">{p.priceDisplay || `$${p.price?.toLocaleString()}`}</span>
                            <div className="flex gap-3 text-zinc-500 dark:text-zinc-400 text-xs font-medium">
                              <span className="flex items-center gap-1"><Bed className="w-3.5 h-3.5" /> {p.bedrooms}</span>
                              <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" /> {p.bathrooms}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: PROPERTIES VIEW ENGINE */}
            {activeTab === 'properties' && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
                <div>
                  <span className="text-[10px] uppercase font-black tracking-widest text-zinc-400">Complete Index</span>
                  <h1 className="text-3xl font-black tracking-tight">Luxury Properties Marketplace</h1>
                </div>

                {/* FILTER CONTROL DECK BAR */}
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase font-bold text-zinc-400">Sub-City Location</label>
                    <select value={searchLocation} onChange={(e)=>setSearchLocation(e.target.value)} className="bg-zinc-50 dark:bg-zinc-800 dark:text-white px-3 py-2.5 rounded-xl text-xs font-semibold outline-none border-none">
                      <option value="">All Territories</option>
                      {allLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase font-bold text-zinc-400">Asset Layout Classification</label>
                    <select value={searchType} onChange={(e)=>setSearchType(e.target.value)} className="bg-zinc-50 dark:bg-zinc-800 dark:text-white px-3 py-2.5 rounded-xl text-xs font-semibold outline-none border-none">
                      <option value="">All Categories</option>
                      {allTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase font-bold text-zinc-400">Bedrooms Configuration</label>
                    <select value={searchBedrooms} onChange={(e)=>setSearchBedrooms(e.target.value)} className="bg-zinc-50 dark:bg-zinc-800 dark:text-white px-3 py-2.5 rounded-xl text-xs font-semibold outline-none border-none">
                      <option value="">Any Layout</option>
                      <option value="1">1 Bedroom</option>
                      <option value="2">2 Bedrooms</option>
                      <option value="3">3 Bedrooms</option>
                      <option value="4">4 Bedrooms</option>
                      <option value="5+">5+ Platinum Chambers</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button onClick={handleClearFilters} className="w-full bg-zinc-100 dark:bg-zinc-800 dark:text-white text-zinc-900 font-bold uppercase text-xs py-3 rounded-xl hover:bg-zinc-200 transition-colors cursor-pointer">
                      Clear Filters
                    </button>
                  </div>
                </div>

                {/* PROPERTY MATRIX GENERATOR */}
                {filteredProperties.length === 0 ? (
                  <div className="text-center py-20 bg-zinc-100 dark:bg-zinc-900 rounded-2xl">
                    <p className="text-sm font-medium text-zinc-500">No ultra-luxury real estate matches your current filter coordinates.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {filteredProperties.map((p) => (
                      <div 
                        key={p.id}
                        onClick={() => { setActivePropertyId(p.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden group shadow-sm hover:shadow-md transition-all cursor-pointer"
                      >
                        <div className="relative h-56 bg-zinc-100 overflow-hidden">
                          <img src={p.images?.[0]} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          <div className="absolute top-3 left-3 bg-zinc-900/80 backdrop-blur-md text-white px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider">
                            {p.subCity}
                          </div>
                          <div className="absolute top-3 right-3 flex gap-1">
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleToggleCompare(p.id); }}
                              className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm backdrop-blur-md transition-colors ${comparePropertyIds.includes(p.id) ? 'bg-zinc-900 text-white' : 'bg-white/80 text-zinc-950'}`}
                            >
                              <Maximize className="w-3..5 h-3.5" />
                            </button>
                            <button 
                              onClick={(e) => handleToggleFavorite(p.id, e)}
                              className="w-8 h-8 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md flex items-center justify-center text-zinc-950 dark:text-white"
                            >
                              <Heart className={`w-3.5 h-3.5 ${favorites.includes(p.id) ? 'fill-red-600 text-red-600' : ''}`} />
                            </button>
                          </div>
                        </div>
                        <div className="p-5 space-y-3">
                          <h3 className="font-bold text-base line-clamp-1">{p.title}</h3>
                          <div className="flex justify-between items-center text-xs text-zinc-500 pt-1 border-t border-zinc-100 dark:border-zinc-800">
                            <span className="font-extrabold text-zinc-900 dark:text-white">{p.priceDisplay || `$${p.price?.toLocaleString()}`}</span>
                            <div className="flex gap-2">
                              <span>{p.bedrooms} Bds</span>
                              <span>{p.bathrooms} Ba</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: PROJECTS ARCHITECTURE CAPABILITIES */}
            {activeTab === 'projects' && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
                <div>
                  <span className="text-[10px] uppercase font-black tracking-widest text-zinc-400">Master Plans</span>
                  <h1 className="text-3xl font-black tracking-tight">Vanguard Real Estate High-Rises</h1>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {projectsState.map((proj) => (
                    <div key={proj.id} className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-sm border border-zinc-200 dark:border-zinc-800 grid grid-cols-1 md:grid-cols-12">
                      <div className="h-64 md:h-full md:col-span-5 bg-zinc-100">
                        <img src={proj.image || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00'} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="p-6 md:col-span-7 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <span className="text-[9px] uppercase bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-md font-bold tracking-wider text-zinc-500 inline-block">{proj.status}</span>
                          <h3 className="text-xl font-bold tracking-tight">{proj.title}</h3>
                          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-3">{proj.description}</p>
                        </div>
                        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex justify-between text-xs font-semibold text-zinc-400">
                          <span>Timeline: {proj.completionTimeline || "24-36 Months"}</span>
                          <span className="text-zinc-900 dark:text-white">{proj.location}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: ABOUT CORPORATE IDENTITY PROFILE */}
            {activeTab === 'about' && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                  <div className="lg:col-span-7 space-y-6">
                    <span className="text-[10px] uppercase font-black tracking-widest text-zinc-400">Corporate Vision</span>
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-none">We Build Your Dream Room by Room</h1>
                    <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                      Cappadocia Real Estate S.C. stands at the intersection of superior engineering and ultra-modern lifestyle ergonomics within Addis Ababa, Ethiopia. We specialize in developing high-end real estate matrices that answer the demands of global citizens, diaspora families, and discerning local professionals.
                    </p>
                  </div>
                  <div className="lg:col-span-5 h-80 bg-zinc-200 rounded-2xl overflow-hidden shadow-md">
                    <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80" alt="" className="w-full h-full object-cover" />
                  </div>
                </div>

                {/* EXECUTIVE DECK TEAM MANAGEMENT */}
                <div className="space-y-8">
                  <h2 className="text-2xl font-black tracking-tight text-center">Board of Directors & Management Deck</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                    {teamMembers.map((member: any, index: number) => (
                      <div key={index} className="bg-white dark:bg-zinc-900 p-4 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm text-center space-y-3">
                        <img src={member.img} alt="" className="w-20 h-20 rounded-full mx-auto object-cover border border-zinc-100" />
                        <div>
                          <h4 className="font-bold text-sm">{member.name}</h4>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">{member.role}</p>
                        </div>
                        <p className="text-xs text-zinc-500 leading-relaxed">{member.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: BLOG KNOWLEDGE NETWORK CARD GRID */}
            {activeTab === 'blog' && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
                <div>
                  <span className="text-[10px] uppercase font-black tracking-widest text-zinc-400">Insights & Briefs</span>
                  <h1 className="text-3xl font-black tracking-tight">Addis Real Estate Intel & Log</h1>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {blogsState.map((post) => (
                    <div 
                      key={post.id} 
                      onClick={() => setViewingBlog(post)}
                      className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden group shadow-sm hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="h-48 bg-zinc-100 overflow-hidden">
                        <img src={post.image || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750'} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      </div>
                      <div className="p-5 space-y-3">
                        <span className="text-[9px] uppercase font-bold text-zinc-400">{post.date}</span>
                        <h3 className="font-bold text-base group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors line-clamp-2">{post.title}</h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-3 leading-relaxed">{post.summary}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: FAVOURITES SELECTION OVERLAY */}
            {activeTab === 'favorites' && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
                <h1 className="text-3xl font-black tracking-tight">Your Favourites Deck</h1>
                {favorites.length === 0 ? (
                  <div className="text-center py-20 bg-zinc-100 dark:bg-zinc-900 rounded-2xl">
                    <p className="text-sm font-medium text-zinc-500">No real estate modules have been designated as favorites yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {properties.filter(p => favorites.includes(p.id)).map((p) => (
                      <div 
                        key={p.id} 
                        onClick={() => setActivePropertyId(p.id)}
                        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden group cursor-pointer shadow-sm"
                      >
                        <div className="h-48 bg-zinc-200 relative">
                          <img src={p.images?.[0]} alt="" className="w-full h-full object-cover" />
                          <button 
                            onClick={(e) => handleToggleFavorite(p.id, e)}
                            className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md text-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="p-4">
                          <h3 className="font-bold text-sm line-clamp-1">{p.title}</h3>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: CONTACT DISPATCH PORTAL */}
            {activeTab === 'contact' && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-5 space-y-6">
                  <h1 className="text-3xl font-black tracking-tight">Addis Ababa Representative Desk</h1>
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                    Schedule a private aggregate mapping view, escrow parameters walk-through, or coordinate a site development inspection run directly with a senior client consultant.
                  </p>
                  <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                    <div className="flex items-start gap-2"><MapPin className="w-4 h-4 text-zinc-900 dark:text-white shrink-0 mt-0.5" /> <span>{contact.hqAddress}</span></div>
                    <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-zinc-900 dark:text-white" /> <span>{contact.hotline}</span></div>
                    <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-zinc-900 dark:text-white" /> <span>{contact.email}</span></div>
                  </div>
                </div>

                <form onSubmit={handleContactSubmit} className="lg:col-span-7 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input type="text" placeholder="Full Name" value={contactName} onChange={(e)=>setContactName(e.target.value)} required className="w-full bg-zinc-50 dark:bg-zinc-800 dark:text-white px-4 py-3 rounded-xl text-xs font-semibold border-none outline-none" />
                    <input type="email" placeholder="Email Address" value={contactEmail} onChange={(e)=>setContactEmail(e.target.value)} required className="w-full bg-zinc-50 dark:bg-zinc-800 dark:text-white px-4 py-3 rounded-xl text-xs font-semibold border-none outline-none" />
                  </div>
                  <input type="tel" placeholder="Phone Number (e.g., +251...)" value={contactPhone} onChange={(e)=>setContactPhone(e.target.value)} required className="w-full bg-zinc-50 dark:bg-zinc-800 dark:text-white px-4 py-3 rounded-xl text-xs font-semibold border-none outline-none" />
                  <textarea placeholder="Your Message/Asset Inquiry Coordinates..." rows={4} value={contactMsg} onChange={(e)=>setContactMsg(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-800 dark:text-white px-4 py-3 rounded-xl text-xs font-semibold border-none outline-none resize-none"></textarea>
                  <button type="submit" className="w-full bg-zinc-950 dark:bg-white dark:text-zinc-950 text-white font-black uppercase text-xs tracking-widest py-3.5 rounded-xl cursor-pointer">
                    Dispatch Brief Inquiry
                  </button>
                </form>
              </div>
            )}

            {/* TAB: ADMINISTRATIVE MANAGEMENT CONSOLE ROUTER */}
            {activeTab === 'admin' && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {isLoggedIn ? (
                  <AdminPanel 
                    properties={properties}
                    setProperties={setProperties}
                    testimonials={testimonials}
                    setTestimonials={setTestimonials}
                    blogs={blogs}
                    setBlogs={setBlogs}
                    projects={projects}
                    setProjects={setProjects}
                    messages={messages}
                    setMessages={setMessages}
                    popupAds={popupAds}
                    setPopupAds={setPopupAds}
                    users={users}
                    setUsers={setUsers}
                    homeSettings={homeSettings}
                    setHomeSettings={setHomeSettings}
                    allLocations={allLocations}
                    setAllLocations={setAllLocations}
                    allTypes={allTypes}
                    setAllTypes={setAllTypes}
                    allAmenities={allAmenities}
                    setAllAmenities={setAllAmenities}
                    globalSocials={globalSocials}
                    setGlobalSocials={setGlobalSocials}
                    contactInfo={contactInfo}
                    setContactInfo={setContactInfo}
                    teamMembers={teamMembers}
                    setTeamMembers={setTeamMembers}
                    activityLogs={activityLogs}
                    logActivity={logActivity}
                    setIsLoggedIn={setIsLoggedIn}
                    onRestoreSystem={restoreOriginalWebsiteContent}
                    isRestoringSystem={isRestoring}
                  />
                ) : (
                  <Login setIsLoggedIn={setIsLoggedIn} />
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* RE-RENDERED DIALOG MODAL LAYOUT CONTAINER BINDINGS */}
      <CustomPopup 
        isOpen={dialog.isOpen}
        title={dialog.title}
        message={dialog.message}
        type={dialog.type}
        confirmText={dialog.confirmText}
        cancelText={dialog.cancelText}
        onConfirm={dialog.onConfirm}
        onCancel={dialog.onCancel}
      />

      {/* BLOG PRIVATE ARTICLE INTERSTITIAL OVERLAY */}
      <AnimatePresence>
        {viewingBlog && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-white dark:bg-zinc-900 rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-4 relative"
            >
              <button onClick={() => setViewingBlog(null)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
              <img src={viewingBlog.image} alt="" className="w-full h-64 object-cover rounded-2xl" />
              <div className="space-y-2">
                <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">{viewingBlog.date}</span>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight">{viewingBlog.title}</h2>
                <div className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium space-y-3 pt-2" dangerouslySetInnerHTML={{ __html: viewingBlog.content || viewingBlog.summary }} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SIDE-BY-SIDE PROPERTY COMPARISON DRAWER BAR */}
      <AnimatePresence>
        {comparePropertyIds.length > 0 && (
          <motion.div 
            initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-900 text-white border-t border-zinc-800 p-4 shadow-2xl"
          >
            <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold tracking-wider uppercase text-zinc-400">Compare Matrix ({comparePropertyIds.length}/3):</span>
                <div className="flex gap-2">
                  {comparePropertyIds.map(id => {
                    const found = properties.find(p => p.id === id);
                    return (
                      <span key={id} className="text-[10px] bg-zinc-800 px-2.5 py-1 rounded-md font-bold inline-flex items-center gap-1">
                        {found?.title || id}
                        <X className="w-3 h-3 text-red-500 cursor-pointer" onClick={() => handleToggleCompare(id)} />
                      </span>
                    );
                  })}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setComparePropertyIds([])} className="text-xs font-bold text-zinc-400 px-3 py-2 hover:text-white">Clear</button>
                <button 
                  onClick={() => {
                    if(comparePropertyIds.length < 2) {
                      showAlert('Selection Missing', 'Please select at least 2 properties to run comparisons.');
                      return;
                    }
                    setIsCompareModalOpen(true);
                  }}
                  className="bg-white text-zinc-950 px-4 py-2 text-xs font-black uppercase tracking-widest rounded-lg hover:bg-zinc-100"
                >
                  Analyze
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* METRIC ANALYSIS COMPARISON BOARD MODAL */}
      <AnimatePresence>
        {isCompareModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.96 }} animate={{ scale: 1 }} exit={{ scale: 0.96 }}
              className="bg-white dark:bg-zinc-900 rounded-3xl max-w-4xl w-full p-6 space-y-6 relative overflow-x-auto"
            >
              <button onClick={() => setIsCompareModalOpen(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
              <h2 className="text-xl font-black tracking-tight text-zinc-900 dark:text-white">Comparative Diagnostics Overview</h2>
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-bold uppercase tracking-wider">
                    <th className="py-3 px-2">Specifications Matrix</th>
                    {comparePropertyIds.map(id => <th key={id} className="py-3 px-2 text-zinc-900 dark:text-white font-black">{properties.find(p=>p.id===id)?.title}</th>)}
                  </tr>
                </thead>
                <tbody className="font-semibold divide-y divide-zinc-100 dark:divide-zinc-800 text-zinc-600 dark:text-zinc-400">
                  <tr><td className="py-3 px-2 font-bold text-zinc-400">Price Configuration</td>{comparePropertyIds.map(id => <td key={id} className="py-3 px-2 text-zinc-900 dark:text-white font-extrabold">{properties.find(p=>p.id===id)?.priceDisplay || `$${properties.find(p=>p.id===id)?.price?.toLocaleString()}`}</td>)}</tr>
                  <tr><td className="py-3 px-2 font-bold text-zinc-400">Sub-City Location</td>{comparePropertyIds.map(id => <td key={id} className="py-3 px-2">{properties.find(p=>p.id===id)?.subCity}</td>)}</tr>
                  <tr><td className="py-3 px-2 font-bold text-zinc-400">Asset Type Classification</td>{comparePropertyIds.map(id => <td key={id} className="py-3 px-2">{properties.find(p=>p.id===id)?.type}</td>)}</tr>
                  <tr><td className="py-3 px-2 font-bold text-zinc-400">Bedrooms Counter</td>{comparePropertyIds.map(id => <td key={id} className="py-3 px-2">{properties.find(p=>p.id===id)?.bedrooms} Chambers</td>)}</tr>
                  <tr><td className="py-3 px-2 font-bold text-zinc-400">Bathrooms Layout</td>{comparePropertyIds.map(id => <td key={id} className="py-3 px-2">{properties.find(p=>p.id===id)?.bathrooms} Units</td>)}</tr>
                </tbody>
              </table>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LIVE FOOTER INFRASTRUCTURE MATRIX */}
      {activeTab !== 'admin' && (
        <footer className={`mt-auto py-12 border-t text-xs transition-colors duration-300 ${isDarkMode ? "bg-zinc-950 border-zinc-900 text-zinc-400" : "bg-white border-zinc-200 text-zinc-500"}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-6 space-y-4">
                <CappadociaLogo />
                <p className="max-w-sm text-zinc-400 dark:text-zinc-500 leading-relaxed">
                  We design and construct premium living ecosystems, corporate assets, and residential high-rises across premier sub-city addresses in Addis Ababa.
                </p>
              </div>
              <div className="md:col-span-3 space-y-3">
                <h4 className="font-bold text-zinc-900 dark:text-white uppercase tracking-wider text-[10px]">Headquarters Deck</h4>
                <p className="leading-relaxed font-medium text-zinc-400">{contact.hqAddress}</p>
              </div>
              <div className="md:col-span-3 space-y-3">
                <h4 className="font-bold text-zinc-900 dark:text-white uppercase tracking-wider text-[10px]">Digital Operations</h4>
                <div className="flex gap-3 text-zinc-400">
                  <a href={globalSocials.telegram} target="_blank" rel="noreferrer" className="hover:text-zinc-600 dark:hover:text-white">Telegram</a>
                  <a href={globalSocials.instagram} target="_blank" rel="noreferrer" className="hover:text-zinc-600 dark:hover:text-white">Instagram</a>
                  <a href={globalSocials.whatsapp} target="_blank" rel="noreferrer" className="hover:text-zinc-600 dark:hover:text-white">WhatsApp</a>
                </div>
              </div>
            </div>
            <div className={`pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4 font-bold text-[10px] uppercase tracking-widest ${isDarkMode ? "border-zinc-900 text-zinc-600" : "border-zinc-200 text-zinc-400"}`}>
              <p>© {new Date().getFullYear()} Cappadocia Real Estate S.C. We build your dream.</p>
            </div>
          </div>
        </footer>
      )}

      {/* DYNAMIC FLOATING INTERACTIVE DROPDOWN DESK CONTACT CHANNELS */}
      {activeTab !== 'admin' && (
        <ContactDropdown 
          phone={contact.phone} 
          email={contact.email} 
          telegramUrl={globalSocials.telegram} 
          whatsappUrl={globalSocials.whatsapp} 
        />
      )}
    </div>
  );
}
