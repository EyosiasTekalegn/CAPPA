import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Building2,
  MessageSquare,
  Users,
  Settings,
  Plus,
  Trash2,
  Edit3,
  Check,
  AlertTriangle,
  Shield,
  X,
  FileText,
  UserCheck,
  Megaphone,
  Home,
  Star,
  Download,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts";
import {
  Property,
  Testimonial,
  Blog,
  PopupAd,
  InquiryMessage,
  AdminUser,
  Project,
  ActivityLog,
  UnitDetail,
} from "../types";
import {
  Briefcase,
  UploadCloud,
  ChevronDown,
  Tags,
  MapPin,
  RefreshCw,
} from "lucide-react";
import { ImageInput } from "./ImageInput";
// Add these lines near the top, after the existing imports
import { auth, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, updateDoc } from "firebase/firestore";

interface AdminPanelProps {
  loggedInUser: AdminUser | null;
  properties: Property[];
  setProperties: React.Dispatch<React.SetStateAction<Property[]>>;
  testimonials: Testimonial[];
  setTestimonials: React.Dispatch<React.SetStateAction<Testimonial[]>>;
  blogs: Blog[];
  setBlogs: React.Dispatch<React.SetStateAction<Blog[]>>;
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  popupAds: PopupAd[];
  setPopupAds: React.Dispatch<React.SetStateAction<PopupAd[]>>;
  messages: InquiryMessage[];
  setMessages: React.Dispatch<React.SetStateAction<InquiryMessage[]>>;
  users: AdminUser[];
  setUsers: React.Dispatch<React.SetStateAction<AdminUser[]>>;
  homeSettings: { 
    heroTitle: string; 
    heroSubtitle: string; 
    heroImage: string; 
    brandLogo?: string; 
    brandFavicon?: string; 
  };
  setHomeSettings: React.Dispatch<
    React.SetStateAction<{
      heroTitle: string;
      heroSubtitle: string;
      heroImage: string;
      brandLogo?: string;
      brandFavicon?: string;
    }>
  >;
  allLocations: string[];
  setAllLocations: React.Dispatch<React.SetStateAction<string[]>>;
  allTypes: string[];
  setAllTypes: React.Dispatch<React.SetStateAction<string[]>>;
  globalSocials?: {
    twitter: string;
    linkedin: string;
    telegram: string;
    tiktok: string;
    whatsapp: string;
    facebook: string;
    instagram: string;
  };
  setGlobalSocials?: React.Dispatch<
    React.SetStateAction<{
      twitter: string;
      linkedin: string;
      telegram: string;
      tiktok: string;
      whatsapp: string;
      facebook: string;
      instagram: string;
    }>
  >;
  contactInfo?: {
    phone: string;
    email: string;
    address?: string;
    hqAddress?: string;
    hotline?: string;
    diasporaHotline?: string;
  };
  setContactInfo?: React.Dispatch<
    React.SetStateAction<{
      phone: string;
      email: string;
      address?: string;
      hqAddress?: string;
      hotline?: string;
      diasporaHotline?: string;
    }>
  >;
  teamMembers?: any[];
  setTeamMembers?: React.Dispatch<React.SetStateAction<any[]>>;
  allAmenities: string[];
  setAllAmenities: React.Dispatch<React.SetStateAction<string[]>>;
  isDarkMode: boolean;
  activityLogs: ActivityLog[];
  logActivity: (type: ActivityLog["type"], message: string) => void;
  showAlert?: (title: string, message: string, callback?: () => void) => void;
  showConfirm?: (title: string, message: string, onConfirmAction: () => void, onCancelAction?: () => void) => void;
  restoreOriginalWebsiteContent?: () => Promise<void>;
  isRestoring?: boolean;
}

interface AdminCustomSelectProps {
  value: string;
  onChange: (value: any) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}

function AdminCustomSelect({
  value,
  onChange,
  options,
  placeholder = "Select an option",
}: AdminCustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const currentOption = options.find((opt) => opt.value === value);

  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-2.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition-all duration-200 flex justify-between items-center cursor-pointer text-left font-semibold"
      >
        <span className="truncate pr-2">{currentOption ? currentOption.label : placeholder}</span>
        <ChevronDown
          className={`w-4 h-4 ml-2 flex-shrink-0 transition-transform duration-200 text-zinc-400 ${isOpen ? "rotate-180 text-red-600" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="absolute left-0 right-0 mt-1.5 max-h-60 overflow-y-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 shadow-2xl z-50 py-1 divide-y divide-zinc-100 dark:divide-zinc-900"
            >
              {options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 text-xs text-left font-sans transition-colors duration-150 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-900 ${
                    value === opt.value
                      ? "bg-zinc-100 dark:bg-zinc-800 font-bold text-red-600 dark:text-red-500"
                      : "text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  <span className="truncate pr-2">{opt.label}</span>
                  {value === opt.value && (
                    <Check className="w-3.5 h-3.5 flex-shrink-0 text-red-600 dark:text-red-500" />
                  )}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AdminPanel({
  properties,
  setProperties,
  testimonials,
  setTestimonials,
  blogs,
  setBlogs,
  projects,
  setProjects,
  popupAds,
  setPopupAds,
  messages,
  setMessages,
  users,
  setUsers,
  homeSettings,
  setHomeSettings,
  allLocations,
  setAllLocations,
  allTypes,
  setAllTypes,
  globalSocials,
  setGlobalSocials,
  contactInfo,
  setContactInfo,
  teamMembers,
  setTeamMembers,
  allAmenities,
  setAllAmenities,
  isDarkMode,
  activityLogs,
  logActivity,
  loggedInUser,
  showAlert = (t, m, cb) => { alert(`${t}\n\n${m}`); if (cb) cb(); },
  showConfirm = (t, m, oC, oCa) => { if (confirm(`${t}\n\n${m}`)) { oC(); } else if (oCa) { oCa(); } },
  restoreOriginalWebsiteContent,
  isRestoring = false,
}: AdminPanelProps) {
  
  // Current logged-in role simulator (Owner is default)
const [activeAdminTab, setActiveAdminTab] = useState<
  | "dashboard"
  | "properties"
  | "home"
  | "testimonials"
  | "blogs"
  | "projects"
  | "ads"
  | "messages"
  | "users"
  | "catalogs"
>("dashboard");

  // Form states
  const [isAddingProperty, setIsAddingProperty] = useState(false);
  const [editingPropertyId, setEditingPropertyId] = useState<string | null>(
    null,
  );

  // Property fields state
  const [propTitle, setPropTitle] = useState("");
  const [propLocation, setPropLocation] = useState("");
  const [propSubCity, setPropSubCity] = useState("Bole");
  const [propType, setPropType] = useState("Luxury Villa");
  const [propPrice, setPropPrice] = useState(30000000);
  const [propBedrooms, setPropBedrooms] = useState(3);
  const [propBathrooms, setPropBathrooms] = useState(3);
  const [propArea, setPropArea] = useState(250);
  const [propUnitsInfo, setPropUnitsInfo] = useState<UnitDetail[]>([]);
  const [propFloorsCount, setPropFloorsCount] = useState(1);
  const [propUnitsCount, setPropUnitsCount] = useState(1);
  const [propConstructionStatus, setPropConstructionStatus] = useState<
    "Pre-selling" | "Excavation" | "Structure Work" | "Finishing Stage" | "Ready to Deliver"
  >("Ready to Deliver");
  const [propCompletionPercentage, setPropCompletionPercentage] = useState(100);
  const [propStatus, setPropStatus] = useState<"For Sale">("For Sale");
  const [propAvailability, setPropAvailability] = useState<
    "Available" | "Reserved" | "Sold"
  >("Available");
  const [propShowOnHomepage, setPropShowOnHomepage] = useState(true);
  const [propYear, setPropYear] = useState(2026);
  const [propImg, setPropImg] = useState(
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
  );
  const [propGallery, setPropGallery] = useState("");
  const [propAmenities, setPropAmenities] = useState<string[]>([]);
  const [propVideoTourUrl, setPropVideoTourUrl] = useState("");
  const [propMapEmbedUrl, setPropMapEmbedUrl] = useState("");
  const [propVirtualTourTitle, setPropVirtualTourTitle] = useState(
    "Virtual Environment Preview",
  );
  const [propVirtualTourRooms, setPropVirtualTourRooms] = useState<
    { name: string; image: string }[]
  >([]);
  const [propDescription, setPropDescription] = useState(
    "A newly updated estate built with top premium standards.",
  );

  // Message reply states
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyTextContent, setReplyTextContent] = useState("");

  // Blog states
  const [isAddingBlog, setIsAddingBlog] = useState(false);
  const [blogTitle, setBlogTitle] = useState("");
  const [blogExcerpt, setBlogExcerpt] = useState("");
  const [blogContent, setBlogContent] = useState("");
  const [blogCategory, setBlogCategory] = useState("Properties");
  const [blogAuthor, setBlogAuthor] = useState("Admin Office");
  const [blogImage, setBlogImage] = useState(
    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80",
  );

  // Testimonial states
  const [isAddingTestimonial, setIsAddingTestimonial] = useState(false);
  const [testClient, setTestClient] = useState("");
  const [testRating, setTestRating] = useState(5);
  const [testText, setTestText] = useState("");
  const [testPurchased, setTestPurchased] = useState("Executive Suite CMC");

  // Ads states
  const [isAddingAd, setIsAddingAd] = useState(false);
  const [adTitle, setAdTitle] = useState("");
  const [adContent, setAdContent] = useState("");
  const [adImg, setAdImg] = useState(
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80",
  );
  const [adCta, setAdCta] = useState("Inquire Now");
  const [adCtaLink, setAdCtaLink] = useState("properties");
  const [adFreq, setAdFreq] = useState<"always" | "once">("always");

  // Users states
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userFullName, setUserFullName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userRole, setUserRole] = useState<"Owner" | "Manager" | "Sales">(
    "Sales",
  );

  // Messages state
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState("");

  // Project states
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [projYear, setProjYear] = useState("");
  const [projTitle, setProjTitle] = useState("");
  const [projSubCity, setProjSubCity] = useState("Bole Subcity");
  const [projDescription, setProjDescription] = useState("");
  const [projAchievements, setProjAchievements] = useState("");
  
  // comma-separated strings
  const [projImage, setProjImage] = useState(
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
  );
  const [projSpecs, setProjSpecs] = useState(
    "14 Units / Multi-Bedroom Duplexes",
  );

  // Home Screen settings
  const [homeH1, setHomeH1] = useState(homeSettings.heroTitle);
  const [homeSub, setHomeSub] = useState(homeSettings.heroSubtitle);
  const [homeImgUrl, setHomeImgUrl] = useState(homeSettings.heroImage);
  const [brandLogo, setBrandLogo] = useState(homeSettings.brandLogo || "");
  const [brandFavicon, setBrandFavicon] = useState(homeSettings.brandFavicon || "");

  // Socials
  const [socTwitter, setSocTwitter] = useState(
    globalSocials?.twitter || "https://twitter.com",
  );
  const [socLinkedin, setSocLinkedin] = useState(
    globalSocials?.linkedin || "https://linkedin.com",
  );
  const [socTelegram, setSocTelegram] = useState(
    globalSocials?.telegram || "https://t.me",
  );
  const [socTiktok, setSocTiktok] = useState(
    globalSocials?.tiktok || "https://tiktok.com",
  );
  const [socWhatsapp, setSocWhatsapp] = useState(
    globalSocials?.whatsapp || "https://wa.me",
  );
  const [socFacebook, setSocFacebook] = useState(
    globalSocials?.facebook || "https://facebook.com",
  );
  const [socInstagram, setSocInstagram] = useState(
    globalSocials?.instagram || "https://instagram.com",
  );

  // Contact Info
  const [contactEmail, setContactEmail] = useState(contactInfo?.email || "info@cappadocia.com");
  const [contactPhone, setContactPhone] = useState(contactInfo?.phone || "+251 911 234567");
  const [contactAddress, setContactAddress] = useState(contactInfo?.address || "Bole Road, Behind Atlas Hotel, Addis Ababa, Ethiopia");
  const [contactHqAddress, setContactHqAddress] = useState(contactInfo?.hqAddress || "Cappadocia Towers, Bole, Block 12, VIP Lane,\nAddis Ababa, Ethiopia");
  const [contactHotline, setContactHotline] = useState(contactInfo?.hotline || "+251 911 385500 (Addis HQ)");
  const [contactDiasporaHotline, setContactDiasporaHotline] = useState(contactInfo?.diasporaHotline || "+1 (800) 490-CAP (Diaspora Hotline)");

  // Team Members local state
  const [localTeam, setLocalTeam] = useState<any[]>(teamMembers || []);

  // Synchronize local states with Firestore values when they load/change
  useEffect(() => {
    if (homeSettings) {
      setHomeH1(homeSettings.heroTitle || "");
      setHomeSub(homeSettings.heroSubtitle || "");
      setHomeImgUrl(homeSettings.heroImage || "");
      setBrandLogo(homeSettings.brandLogo || "");
      setBrandFavicon(homeSettings.brandFavicon || "");
    }
  }, [homeSettings]);

  useEffect(() => {
    if (globalSocials) {
      setSocTwitter(globalSocials.twitter || "");
      setSocLinkedin(globalSocials.linkedin || "");
      setSocTelegram(globalSocials.telegram || "");
      setSocTiktok(globalSocials.tiktok || "");
      setSocWhatsapp(globalSocials.whatsapp || "");
      setSocFacebook(globalSocials.facebook || "");
      setSocInstagram(globalSocials.instagram || "");
    }
  }, [globalSocials]);

  useEffect(() => {
    if (contactInfo) {
      setContactEmail(contactInfo.email || "");
      setContactPhone(contactInfo.phone || "");
      setContactAddress(contactInfo.address || "");
      setContactHqAddress(contactInfo.hqAddress || "");
      setContactHotline(contactInfo.hotline || "");
      setContactDiasporaHotline(contactInfo.diasporaHotline || "");
    }
  }, [contactInfo]);

  useEffect(() => {
    if (teamMembers) {
      setLocalTeam(teamMembers || []);
    }
  }, [teamMembers]);

  // Role Checker Helpers
  const canEditCore = currentRole === "Owner" || currentRole === "Manager";
  const isOwner = currentRole === "Owner";
  const isSales = currentRole === "Sales";

  // Role names descriptions
  const getRoleDesc = (r: typeof currentRole) => {
    switch (r) {
      case "Owner":
        return "Full Absolute Authority. Can edit all listings, popups, home layout components, and modify roles.";
      case "Manager":
        return "Elevated Operational Access. Can modify, add, or delete listings, blogs, and popup ads, but restricted from changing user accounts.";
      case "Sales":
        return "View-Only Permissions with customer message support. Cannot mutate layout variables or add inventory items.";
    }
  };

  // State mutator functions
  const handleSaveProperty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEditCore) return;

    if (editingPropertyId) {
      // Edit mode
      setProperties((prev) =>
        prev.map((p) =>
          p.id === editingPropertyId
            ? {
                ...p,
                title: propTitle,
                location: propLocation,
                subCity: propSubCity,
                type: propType,
                price: Number(propPrice),
                areaSqm: Number(propArea),
                bedrooms: Number(propBedrooms),
                bathrooms: Number(propBathrooms),
                unitsInfo: propUnitsInfo,
                floorsCount: Number(propFloorsCount),
                unitsCount: Number(propUnitsCount),
                constructionStatus: propConstructionStatus,
                completionPercentage: Number(propCompletionPercentage),
                status: propStatus,
                availability: propAvailability,
                showOnHomepage: propShowOnHomepage,
                featuredImage: propImg,
                galleryImages: propGallery.trim()
                  ? propGallery
                      .split("\n")
                      .map((s) => s.trim())
                      .filter(Boolean)
                  : [propImg],
                description: propDescription,
                yearBuilt: Number(propYear),
                amenities: propAmenities,
                videoTourUrl: propVideoTourUrl,
                mapEmbedUrl: propMapEmbedUrl,
                virtualTour: {
                  title: propVirtualTourTitle || "Virtual Environment Preview",
                  rooms: propVirtualTourRooms.map((r) => ({
                    name: r.name || "Room",
                    image: r.image || propImg,
                    hotspots: [],
                  })),
                },
              }
            : p,
        ),
      );
      setEditingPropertyId(null);
    } else {
      // Add mode
      const newP: Property = {
        id: `prop-${Math.floor(Math.random() * 90000 + 10000)}`,
        title: propTitle,
        location: propLocation,
        subCity: propSubCity,
        type: propType,
        price: Number(propPrice),
        areaSqm: Number(propArea),
        bedrooms: Number(propBedrooms),
        bathrooms: Number(propBathrooms),
        unitsInfo: propUnitsInfo,
        floorsCount: Number(propFloorsCount),
        unitsCount: Number(propUnitsCount),
        constructionStatus: propConstructionStatus,
        completionPercentage: Number(propCompletionPercentage),
        status: propStatus,
        availability: propAvailability,
        showOnHomepage: propShowOnHomepage,
        yearBuilt: Number(propYear),
        featuredImage: propImg,
        galleryImages: propGallery.trim()
          ? propGallery
              .split("\n")
              .map((s) => s.trim())
              .filter(Boolean)
          : [propImg],
        description: propDescription,
        amenities: propAmenities,
        videoTourUrl: propVideoTourUrl,
        mapEmbedUrl: propMapEmbedUrl,
        virtualTour: {
          title: propVirtualTourTitle || "Virtual Environment Preview",
          rooms:
            propVirtualTourRooms.length > 0
              ? propVirtualTourRooms.map((r) => ({
                  name: r.name || "Room",
                  image: r.image || propImg,
                  hotspots: [],
                }))
              : [
                  {
                    name: "Main Panorama",
                    image: propImg,
                    hotspots: [],
                  },
                ],
        },
      };
      setProperties((prev) => [newP, ...prev]);
      setIsAddingProperty(false);
    }
    resetPropForm();
  };

  const handleEditPropertyClick = (p: Property) => {
    if (!canEditCore) return;
    setEditingPropertyId(p.id);
    setPropTitle(p.title);
    setPropLocation(p.location);
    setPropSubCity(p.subCity);
    setPropType(p.type);
    setPropPrice(p.price);
    setPropArea(p.areaSqm);
    setPropBedrooms(p.bedrooms || 3);
    setPropBathrooms(p.bathrooms || 3);
    setPropUnitsInfo(p.unitsInfo || []);
    setPropFloorsCount(p.floorsCount || 1);
    setPropUnitsCount(p.unitsCount || 1);
    setPropConstructionStatus(p.constructionStatus || 'Ready to Deliver');
    setPropCompletionPercentage(p.completionPercentage ?? 100);
    setPropStatus(p.status);
    setPropAvailability(p.availability);
    setPropShowOnHomepage(p.showOnHomepage ?? true);
    setPropYear(p.yearBuilt);
    setPropImg(p.featuredImage);
    setPropGallery(p.galleryImages.join("\n"));
    setPropAmenities(p.amenities || []);
    setPropVideoTourUrl(p.videoTourUrl || "");
    setPropMapEmbedUrl(p.mapEmbedUrl || "");
    setPropVirtualTourTitle(
      p.virtualTour?.title || "Virtual Environment Preview",
    );
    setPropVirtualTourRooms(
      p.virtualTour?.rooms?.map((r) => ({ name: r.name, image: r.image })) ||
        [],
    );
    setPropDescription(p.description);
    setIsAddingProperty(true);
  };

  const handleDeleteProperty = (id: string) => {
    if (!canEditCore) return;
    showConfirm(
      "Confirm Property Deletion",
      "Are you absolutely sure you want to delete this listing asset? This is irreversible and cannot be undone.",
      () => {
        setProperties((prev) => prev.filter((p) => p.id !== id));
      }
    );
  };

  const resetPropForm = () => {
    setPropTitle("");
    setPropLocation("");
    setPropSubCity("Bole");
    setPropType(allTypes[0] || "Luxury Villa");
    setPropPrice(30000000);
    setPropBedrooms(3);
    setPropBathrooms(3);
    setPropArea(250);
    setPropUnitsInfo([]);
    setPropFloorsCount(1);
    setPropUnitsCount(1);
    setPropConstructionStatus("Ready to Deliver");
    setPropCompletionPercentage(100);
    setPropStatus("For Sale");
    setPropAvailability("Available");
    setPropShowOnHomepage(true);
    setPropYear(2026);
    setPropImg(
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    );
    setPropGallery("");
    setPropAmenities([]);
    setPropVideoTourUrl("");
    setPropMapEmbedUrl("");
    setPropVirtualTourTitle("Virtual Environment Preview");
    setPropVirtualTourRooms([]);
    setPropDescription(
      "A newly updated estate built with top premium standards.",
    );
    setEditingPropertyId(null);
  };

  // Blog Handlers
  const [isEditingBlogId, setIsEditingBlogId] = useState<string | null>(null); // To support edit/add in reset if ever needed

  const handleSaveBlog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEditCore) return;
    const newB: Blog = {
      id: `blog-${Math.floor(Math.random() * 90000 + 10000)}`,
      title: blogTitle,
      excerpt: blogExcerpt,
      content: blogContent,
      category: blogCategory,
      image: blogImage,
      date: new Date().toISOString().split("T")[0],
      author: blogAuthor,
    };
    setBlogs((prev) => [newB, ...prev]);
    setIsAddingBlog(false);
    setBlogTitle("");
    setBlogExcerpt("");
    setBlogContent("");
    setBlogCategory("Properties");
    setBlogAuthor("Admin Office");
    setBlogImage(
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80",
    );
  };

  const handleDeleteBlog = (id: string) => {
    if (!canEditCore) return;
    setBlogs((prev) => prev.filter((b) => b.id !== id));
  };

  // Testimonials Handlers
  const handleSaveTestimonial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEditCore) return;
    const newT: Testimonial = {
      id: `t-${Math.floor(Math.random() * 90000 + 10000)}`,
      clientName: testClient,
      rating: Number(testRating),
      testimony: testText,
      propertyPurchased: testPurchased,
    };
    setTestimonials((prev) => [...prev, newT]);
    setIsAddingTestimonial(false);
    setTestClient("");
    setTestText("");
    setTestPurchased("Executive Suite CMC");
  };

  const handleDeleteTestimonial = (id: string) => {
    if (!canEditCore) return;
    setTestimonials((prev) => prev.filter((t) => t.id !== id));
  };

  // Ads Handlers
  const handleSaveAd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEditCore) return;
    const newAd: PopupAd = {
      id: `pop-${Math.floor(Math.random() * 90000 + 10000)}`,
      title: adTitle,
      content: adContent,
      imageUrl: adImg,
      ctaText: adCta,
      ctaLink: adCtaLink,
      isActive: true,
      displayFrequency: adFreq,
    };
    setPopupAds((prev) => [newAd, ...prev]);
    setIsAddingAd(false);
    setAdTitle("");
    setAdContent("");
    setAdCtaLink("properties");
  };

  const toggleAdActiveState = (id: string) => {
    if (!canEditCore) return;
    setPopupAds((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isActive: !a.isActive } : a)),
    );
  };

  const handleDeleteAd = (id: string) => {
    if (!canEditCore) return;
    setPopupAds((prev) => prev.filter((a) => a.id !== id));
  };

  // Messages status log togglers
  const changeMessageStatus = (
    id: string,
    newStatus: "New" | "Replied" | "Closed",
  ) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m)),
    );
  };

  const handleDeleteMessage = (id: string) => {
    showConfirm(
      "Delete Inquiry Log",
      "Are you absolutely sure you want to delete this client contact message log? This is irreversible.",
      () => {
        setMessages((prev) => prev.filter((m) => m.id !== id));
      }
    );
  };

  // Home page layout parameters updates
  const handleUpdateHomeLayout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwner) return;
    setHomeSettings({
      heroTitle: homeH1,
      heroSubtitle: homeSub,
      heroImage: homeImgUrl,
      brandLogo: brandLogo,
      brandFavicon: brandFavicon,
    });
    if (setGlobalSocials) {
      setGlobalSocials({
        twitter: socTwitter,
        linkedin: socLinkedin,
        telegram: socTelegram,
        tiktok: socTiktok,
        whatsapp: socWhatsapp,
        facebook: socFacebook,
        instagram: socInstagram,
      });
    }
    if (setContactInfo) {
      setContactInfo({
        email: contactEmail,
        phone: contactPhone,
        address: contactAddress,
        hqAddress: contactHqAddress,
        hotline: contactHotline,
        diasporaHotline: contactDiasporaHotline
      });
    }
    if (setTeamMembers) {
      setTeamMembers(localTeam);
    }
    showAlert("Settings Saved", "The Home Screen display settings, hero statement, global social channels, contact information, and executive team roster have been permanently updated!");
  };

  // Admin users lists
  // Admin users lists (with Firebase Auth)
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwner) {
      showAlert("Permission Denied", "Only the Owner can add or edit admin users.");
      return;
    }

    try {
      if (editingUserId) {
        // Update existing user (Firestore only – password change via reset email)
        const userRef = doc(db, "users", editingUserId);
        await setDoc(
          userRef,
          {
            fullName: userFullName,
            email: userEmail,
            phone: userPhone,
            role: userRole,
          },
          { merge: true }
        );
        if (userPassword && userPassword.trim() !== "") {
          await sendPasswordResetEmail(auth, userEmail);
          showAlert("Password Reset Email Sent", `A password reset link has been sent to ${userEmail}.`);
        }
        showAlert("User Updated", "User information updated successfully.");
        logActivity("auth", `User ${userFullName} (${userEmail}) updated by ${loggedInUser?.fullName}`);
      } else {
        // Create new user: first create Auth account
        const userCredential = await createUserWithEmailAndPassword(auth, userEmail, userPassword);
        const uid = userCredential.user.uid;
        const newUser: AdminUser = {
          id: uid,
          fullName: userFullName,
          email: userEmail,
          phone: userPhone,
          role: userRole,
          isActive: true,
        };
        await setDoc(doc(db, "users", uid), newUser);
        setUsers((prev) => [...prev, newUser]);
        showAlert("User Created", `User ${userFullName} has been created. They can now log in.`);
        logActivity("auth", `New user created: ${userFullName} (${userEmail}) by ${loggedInUser?.fullName}`);
      }
      resetUserForm();
    } catch (err: any) {
      console.error("User save error:", err);
      let msg = err.message;
      if (err.code === "auth/email-already-in-use") msg = "Email already registered.";
      else if (err.code === "auth/weak-password") msg = "Password too weak. Use at least 6 characters.";
      showAlert("Error", msg);
    }
  };

  const handleEditUser = (user: AdminUser) => {
    if (!isOwner) return;
    setEditingUserId(user.id);
    setUserFullName(user.fullName);
    setUserEmail(user.email);
    setUserPhone(user.phone || "");
    setUserPassword(""); // do not populate password
    setUserRole(user.role);
    setIsAddingUser(true);
  };

  const handleToggleUserStatus = async (id: string) => {
    if (!isOwner) return;
    const user = users.find((u) => u.id === id);
    if (!user) return;
    const newStatus = !user.isActive;
    await setDoc(doc(db, "users", id), { isActive: newStatus }, { merge: true });
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, isActive: newStatus } : u)));
    logActivity("auth", `User ${user.fullName} ${newStatus ? "activated" : "deactivated"} by ${loggedInUser?.fullName}`);
    showAlert("Status Updated", `${user.fullName} is now ${newStatus ? "active" : "inactive"}.`);
  };

  const resetUserForm = () => {
    setIsAddingUser(false);
    setEditingUserId(null);
    setUserFullName("");
    setUserEmail("");
    setUserPhone("");
    setUserPassword("");
    setUserRole("Sales");
  };


  // Projects CRUD Handlers
  const handleSaveProjectLocal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEditCore) return;
    const parsedAchievements = projAchievements
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
      
    if (editingProjectId) {
      // Editing
      setProjects((prev) =>
        prev.map((p) =>
          p.id === editingProjectId
            ? {
                ...p,
                year: projYear,
                title: projTitle,
                subCity: projSubCity,
                description: projDescription,
                achievements:
                  parsedAchievements.length > 0
                    ? parsedAchievements
                    : p.achievements,
                image: projImage,
                specs: projSpecs,
              }
            : p,
        ),
      );
      setEditingProjectId(null);
    } else {
      // New
      const newP: Project = {
        id: `proj-${Math.floor(Math.random() * 90000 + 10000)}`,
        year: projYear || "2026",
        title: projTitle,
        subCity: projSubCity,
        description: projDescription,
        achievements:
          parsedAchievements.length > 0
            ? parsedAchievements
            : ["Successfully delivered and verified"],
        image: projImage,
        specs: projSpecs,
      };
      setProjects((prev) => [...prev, newP]);
      setIsAddingProject(false);
    }
    resetProjForm();
    showAlert("Project Saved", "The construction portfolio showcase has been saved successfully!");
  };

  const handleEditProjectClick = (p: Project) => {
    if (!canEditCore) return;
    setEditingProjectId(p.id);
    setProjYear(p.year);
    setProjTitle(p.title);
    setProjSubCity(p.subCity);
    setProjDescription(p.description);
    setProjAchievements(p.achievements.join(", "));
    setProjImage(p.image);
    setProjSpecs(p.specs);
    setIsAddingProject(true);
  };

  const handleDeleteProjectLocal = (id: string) => {
    if (!canEditCore) return;
    showConfirm(
      "Confirm Showcase Deletion",
      "Are you absolutely sure you want to delete this completed project showcase? This is irreversible and cannot be undone.",
      () => {
        setProjects((prev) => prev.filter((p) => p.id !== id));
      }
    );
  };

  const resetProjForm = () => {
    setEditingProjectId(null);
    setProjYear("");
    setProjTitle("");
    setProjSubCity("Bole Subcity");
    setProjDescription("");
    setProjAchievements("");
    setProjImage(
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
    );
    setProjSpecs("14 Units / Multi-Bedroom Duplexes");
  };

  return (
    <div
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      id="admin-panel-container"
    >
      {/* Banner / Header */}
      <div
        className={`p-6 rounded-2xl border mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${"bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-800"}`}
      >
        <div className="space-y-1">
          <h2
            className={`text-xl sm:text-2xl font-bold font-sans ${"text-black dark:text-zinc-100"}`}
          >
            Admin Portal
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 font-sans">
            Manage properties, messages, and configurations.
          </p>
        </div>
      </div>

      {/* Internal Navigation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Tab Links Column */}
        <div className="lg:col-span-3 flex flex-row lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
          {!isSales && (
            <button
              onClick={() => setActiveAdminTab("dashboard")}
              className={`text-xs font-semibold px-4 py-3 rounded-xl flex items-center gap-2.5 cursor-pointer flex-shrink-0 transition-all ${
                activeAdminTab === "dashboard"
                  ? "bg-zinc-100 dark:bg-zinc-800 text-blue-600 border border-zinc-200 dark:border-zinc-800 shadow-sm font-bold shadow-xs"
                  : "hover:bg-zinc-100 dark:hover:bg-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400"
              }`}
            >
              <Briefcase className="w-4 h-4" />
              Dashboard
            </button>
          )}

          <button
            onClick={() => setActiveAdminTab("properties")}
            className={`text-xs font-semibold px-4 py-3 rounded-xl flex items-center gap-2.5 cursor-pointer flex-shrink-0 transition-all ${
              activeAdminTab === "properties"
                ? "bg-zinc-100 dark:bg-zinc-800 text-blue-600 border border-zinc-200 dark:border-zinc-800 shadow-sm font-bold shadow-xs"
                : "hover:bg-zinc-100 dark:hover:bg-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400"
            }`}
          >
            <Building2 className="w-4 h-4" />
            Properties ({properties.length})
          </button>

          {!isSales && (
            <button
              onClick={() => setActiveAdminTab("home")}
              className={`text-xs font-semibold px-4 py-3 rounded-xl flex items-center gap-2.5 cursor-pointer flex-shrink-0 transition-all ${
                activeAdminTab === "home"
                  ? "bg-zinc-100 dark:bg-zinc-800 text-blue-600 border border-zinc-200 dark:border-zinc-800 shadow-sm font-bold shadow-xs"
                  : "hover:bg-zinc-100 dark:hover:bg-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400"
              }`}
            >
              <Home className="w-4 h-4" />
              Home Settings
            </button>
          )}

          {!isSales && (
            <button
              onClick={() => setActiveAdminTab("testimonials")}
              className={`text-xs font-semibold px-4 py-3 rounded-xl flex items-center gap-2.5 cursor-pointer flex-shrink-0 transition-all ${
                activeAdminTab === "testimonials"
                  ? "bg-zinc-100 dark:bg-zinc-800 text-blue-600 border border-zinc-200 dark:border-zinc-800 shadow-sm font-bold shadow-xs"
                  : "hover:bg-zinc-100 dark:hover:bg-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400"
              }`}
            >
              <Star className="w-4 h-4" />
              Testimonials ({testimonials.length})
            </button>
          )}

          <button
            onClick={() => setActiveAdminTab("blogs")}
            className={`text-xs font-semibold px-4 py-3 rounded-xl flex items-center gap-2.5 cursor-pointer flex-shrink-0 transition-all ${
              activeAdminTab === "blogs"
                ? "bg-zinc-100 dark:bg-zinc-800 text-blue-600 border border-zinc-200 dark:border-zinc-800 shadow-sm font-bold shadow-xs"
                : "hover:bg-zinc-100 dark:hover:bg-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400"
            }`}
          >
            <FileText className="w-4 h-4" />
            Blogs ({blogs.length})
          </button>

          {!isSales && (
            <button
              onClick={() => setActiveAdminTab("projects")}
              className={`text-xs font-semibold px-4 py-3 rounded-xl flex items-center gap-2.5 cursor-pointer flex-shrink-0 transition-all ${
                activeAdminTab === "projects"
                  ? "bg-zinc-100 dark:bg-zinc-800 text-blue-600 border border-zinc-200 dark:border-zinc-800 shadow-sm font-bold shadow-xs"
                  : "hover:bg-zinc-100 dark:hover:bg-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400"
              }`}
            >
              <Briefcase className="w-4 h-4" />
              Projects ({projects.length})
            </button>
          )}

          {!isSales && (
            <button
              onClick={() => setActiveAdminTab("ads")}
              className={`text-xs font-semibold px-4 py-3 rounded-xl flex items-center gap-2.5 cursor-pointer flex-shrink-0 transition-all ${
                activeAdminTab === "ads"
                  ? "bg-zinc-100 dark:bg-zinc-800 text-blue-600 border border-zinc-200 dark:border-zinc-800 shadow-sm font-bold shadow-xs"
                  : "hover:bg-zinc-100 dark:hover:bg-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400"
              }`}
            >
              <Megaphone className="w-4 h-4" />
              Pop-up Text ({popupAds.length})
            </button>
          )}

          <button
            onClick={() => setActiveAdminTab("messages")}
            className={`text-xs font-semibold px-4 py-3 rounded-xl flex items-center gap-2.5 cursor-pointer flex-shrink-0 transition-all ${
              activeAdminTab === "messages"
                ? "bg-zinc-100 dark:bg-zinc-800 text-blue-600 border border-zinc-200 dark:border-zinc-800 shadow-sm font-bold shadow-xs"
                : "hover:bg-zinc-100 dark:hover:bg-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Messages ({messages.length})
          </button>

          {isOwner && (
            <button
              onClick={() => setActiveAdminTab("users")}
              className={`text-xs font-semibold px-4 py-3 rounded-xl flex items-center gap-2.5 cursor-pointer flex-shrink-0 transition-all ${
                activeAdminTab === "users"
                  ? "bg-zinc-100 dark:bg-zinc-800 text-blue-600 border border-zinc-200 dark:border-zinc-800 shadow-sm font-bold shadow-xs"
                  : "hover:bg-zinc-100 dark:hover:bg-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400"
              }`}
            >
              <Users className="w-4 h-4" />
              Staff ({users.length})
            </button>
          )}

          {canEditCore && (
            <button
              onClick={() => setActiveAdminTab("catalogs")}
              className={`text-xs font-semibold px-4 py-3 rounded-xl flex items-center gap-2.5 cursor-pointer flex-shrink-0 transition-all ${
                activeAdminTab === "catalogs"
                  ? "bg-zinc-100 dark:bg-zinc-800 text-blue-600 border border-zinc-200 dark:border-zinc-800 shadow-sm font-bold shadow-xs"
                  : "hover:bg-zinc-100 dark:hover:bg-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400"
              }`}
            >
              <Tags className="w-4 h-4" />
              Catalogs
            </button>
          )}
        </div>

        {/* Dynamic Display Panel */}
        <div className="lg:col-span-9 space-y-6">
          {/* TAB 0: EXECUTIVE DASHBOARD */}
          {activeAdminTab === "dashboard" && !isSales && (
            <div
              className="space-y-6 animate-in fade-in duration-200"
              id="executive-dashboard-view"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                <div>
                  <h3
                    className={`font-sans font-extrabold text-2xl tracking-tight ${"text-black dark:text-zinc-100"}`}
                  >
                    Dashboard Overview
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 font-sans">
                    Real-time metrics, property distribution, and recent
                    activities.
                  </p>
                </div>
              </div>

              {/* STATS BENTO GRID MODULES */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* METRIC 1 */}
                <div
                  className={`p-5 rounded-2xl border transition-all ${"bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-black dark:text-zinc-100 shadow-sm"}`}
                >
                  <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2">
                    Total Properties
                  </p>
                  <p className="text-3xl font-bold font-sans tracking-tight">
                    {properties.length}
                  </p>
                </div>

                {/* METRIC 2 */}
                <div
                  className={`p-5 rounded-2xl border transition-all ${"bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-black dark:text-zinc-100 shadow-sm"}`}
                >
                  <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2">
                    Assets Sold
                  </p>
                  <p className="text-3xl font-bold font-sans tracking-tight text-black dark:text-zinc-100">
                    {properties.filter((p) => p.availability === "Sold").length}
                  </p>
                </div>

                {/* METRIC 3 */}
                <div
                  className={`p-5 rounded-2xl border transition-all ${"bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-black dark:text-zinc-100 shadow-sm"}`}
                >
                  <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2">
                    Reserved Assets
                  </p>
                  <p className="text-3xl font-bold font-sans tracking-tight text-black dark:text-zinc-100">
                    {
                       properties.filter((p) => p.availability === "Reserved")
                        .length
                    }
                  </p>
                </div>

                {/* METRIC 4 */}
                <div
                  className={`p-5 rounded-2xl border transition-all ${"bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-black dark:text-zinc-100 shadow-sm"}`}
                >
                  <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2">
                    Available Properties
                  </p>
                  <p className="text-3xl font-bold font-sans tracking-tight text-black dark:text-zinc-100">
                    {
                      properties.filter((p) => p.availability === "Available")
                        .length
                    }
                  </p>
                </div>
              </div>

              {/* CHARTS AND LOGS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pie Chart Panel */}
                <div
                  className={`p-6 rounded-2xl border flex flex-col ${"bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm"}`}
                >
                  <h4
                    className={`text-sm font-bold mb-6 font-sans ${"text-black dark:text-zinc-100"}`}
                  >
                    Property Status Distribution
                  </h4>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            {
                              name: "Available",
                              value: properties.filter(
                                (p) => p.availability === "Available",
                              ).length,
                            },
                            {
                              name: "Reserved",
                              value: properties.filter(
                                (p) => p.availability === "Reserved",
                              ).length,
                            },
                            {
                              name: "Sold",
                              value: properties.filter(
                                (p) => p.availability === "Sold",
                              ).length,
                            },
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          <Cell fill={"#2563eb"} />
                          <Cell fill={"#d97706"} />
                          <Cell fill={"#059669"} />
                        </Pie>
                        <RechartsTooltip
                          contentStyle={{
                            borderRadius: "8px",
                            border: "none",
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                            fontSize: "12px",
                            fontWeight: "bold",
                          }}
                          itemStyle={{ color: "#1e293b" }}
                        />
                        <Legend
                          verticalAlign="bottom"
                          height={36}
                          iconType="circle"
                          wrapperStyle={{ fontSize: "12px", fontWeight: "600" }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Recent Activities Panel */}
                <div
                  className={`p-6 rounded-2xl border flex flex-col ${"bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm"}`}
                >
                  <div className="flex justify-between items-center mb-6">
                    <h4
                      className={`text-sm font-bold font-sans ${"text-black dark:text-zinc-100"}`}
                    >
                      Recent Activities
                    </h4>
                    <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 py-1 px-2 rounded-md font-semibold tracking-wide uppercase">
                      Live Feed
                    </span>
                  </div>

                  <div className="space-y-4 overflow-y-auto max-h-[300px] pr-2 scrollbar-none">
                    {activityLogs.length > 0 ? (
                      activityLogs.slice(0, 15).map((log) => (
                        <div
                          key={log.id}
                          className="flex gap-3 items-start border-b border-zinc-200 dark:border-zinc-800 pb-3 last:border-0 last:pb-0"
                        >
                          <div
                            className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${
                              log.type === "auth"
                                ? "bg-blue-500"
                                : log.type === "message"
                                  ? "bg-red-600"
                                  : log.type === "property"
                                    ? "bg-blue-500"
                                    : "bg-zinc-200 dark:bg-zinc-800"
                            }`}
                          />
                          <div>
                            <p className="text-xs text-black dark:text-zinc-100 font-medium leading-relaxed font-sans shadow-none">
                              {log.message}
                            </p>
                            <span className="text-[10px] text-zinc-700 dark:text-zinc-300 mt-1 block">
                              {new Date(log.time).toLocaleString(undefined, {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 italic text-center py-4 font-sans">
                        No recent activities found.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: PROPERTIES MANAGEMENT */}
          {activeAdminTab === "properties" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3
                    className={`font-bold font-serif text-lg ${"text-black dark:text-zinc-100"}`}
                  >
                    Property Portfolios
                  </h3>
                  <p className="text-xs text-zinc-700 dark:text-zinc-300">
                    Total Available Stock: {properties.length} Active listings
                  </p>
                </div>
                {canEditCore && (
                  <button
                    onClick={() => {
                      resetPropForm();
                      setIsAddingProperty(!isAddingProperty);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-blue-600 hover:bg-blue-600 text-white dark:text-zinc-100 transition cursor-pointer"
                  >
                    {isAddingProperty ? (
                      <X className="w-4 h-4" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    {isAddingProperty ? "Cancel" : "Add New Asset"}
                  </button>
                )}
              </div>

              {/* Collapsible Form */}
              <AnimatePresence>
                {isAddingProperty && canEditCore && (
                  <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    onSubmit={handleSaveProperty}
                    className={`p-6 rounded-2xl border space-y-4 overflow-hidden ${"bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-800"}`}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-700 dark:text-zinc-300 mb-1">
                          Property Listing Title *
                        </label>
                        <input
                          type="text"
                          required
                          value={propTitle}
                          onChange={(e) => setPropTitle(e.target.value)}
                          placeholder="e.g. Presidential Penthouse Kazanchis"
                          className="w-full p-3 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition-all duration-200 appearance-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-700 dark:text-zinc-300 mb-1">
                          Select Location *
                        </label>
                        <AdminCustomSelect
                          value={propLocation}
                          onChange={(val) => {
                            setPropLocation(val);
                            setPropSubCity(val);
                          }}
                          placeholder="Select Location"
                          options={allLocations.map((loc) => ({
                            value: loc,
                            label: loc,
                          }))}
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-700 dark:text-zinc-300 mb-1">
                          Property Type *
                        </label>
                        <AdminCustomSelect
                          value={propType}
                          onChange={(val) => setPropType(val)}
                          placeholder="Select Property Type"
                          options={allTypes.map((type) => ({
                            value: type,
                            label: type,
                          }))}
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-700 dark:text-zinc-300 mb-1">
                          Base Listing Price (ETB) *
                        </label>
                        <input
                          type="number"
                          required
                          value={propPrice}
                          onChange={(e) => setPropPrice(Number(e.target.value))}
                          className="w-full p-3 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition-all duration-200 appearance-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-700 dark:text-zinc-300 mb-1">
                          Total Area Volume (sqm) *
                        </label>
                        <input
                          type="number"
                          required
                          value={propArea}
                          onChange={(e) => setPropArea(Number(e.target.value))}
                          className="w-full p-3 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition-all duration-200 appearance-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-700 dark:text-zinc-300 mb-1">
                          Bedrooms *
                        </label>
                        <input
                          type="number"
                          required
                          value={propBedrooms}
                          onChange={(e) =>
                            setPropBedrooms(Number(e.target.value))
                          }
                          className="w-full p-3 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition-all duration-200 appearance-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-700 dark:text-zinc-300 mb-1">
                          Bathrooms *
                        </label>
                        <input
                          type="number"
                          required
                          value={propBathrooms}
                          onChange={(e) =>
                            setPropBathrooms(Number(e.target.value))
                          }
                          className="w-full p-3 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition-all duration-200 appearance-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-700 dark:text-zinc-300 mb-1">
                          Construction Status *
                        </label>
                        <AdminCustomSelect
                          value={propConstructionStatus}
                          onChange={(val) => setPropConstructionStatus(val)}
                          placeholder="Select Status"
                          options={[
                            { value: "Pre-selling", label: "Pre-selling" },
                            { value: "Excavation", label: "Excavation" },
                            { value: "Structure Work", label: "Structure Work" },
                            { value: "Finishing Stage", label: "Finishing Stage" },
                            { value: "Ready to Deliver", label: "Ready to Deliver" },
                          ]}
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-700 dark:text-zinc-300 mb-1">
                          Completion Percentage ({propCompletionPercentage}%) *
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={propCompletionPercentage}
                          onChange={(e) => setPropCompletionPercentage(Number(e.target.value))}
                          className="w-full accent-red-600 mt-2 cursor-pointer h-2 bg-zinc-200 rounded-lg appearance-none dark:bg-zinc-800"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-700 dark:text-zinc-300 mb-1">
                          Floor Count *
                        </label>
                        <input
                          type="number"
                          required
                          value={propFloorsCount}
                          onChange={(e) => setPropFloorsCount(Number(e.target.value))}
                          placeholder="e.g. 15"
                          className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-red-600 outline-none transition cursor-text"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-700 dark:text-zinc-300 mb-1">
                          Total Units *
                        </label>
                        <input
                          type="number"
                          required
                          value={propUnitsCount}
                          onChange={(e) => setPropUnitsCount(Number(e.target.value))}
                          placeholder="e.g. 48"
                          className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-red-600 outline-none transition cursor-text"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-700 dark:text-zinc-300 mb-1">
                          Listing Availability Status *
                        </label>
                        <AdminCustomSelect
                          value={propAvailability}
                          onChange={(val) => setPropAvailability(val)}
                          placeholder="Select Availability"
                          options={[
                            { value: "Available", label: "Available" },
                            { value: "Reserved", label: "Reserved" },
                            { value: "Sold", label: "Sold" },
                          ]}
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-700 dark:text-zinc-300 mb-2">
                          Visibility Options
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3.5 rounded-xl select-none group focus-within:ring-2 focus-within:ring-red-600 focus-within:border-red-600">
                          <input
                            type="checkbox"
                            checked={propShowOnHomepage}
                            onChange={(e) =>
                              setPropShowOnHomepage(e.target.checked)
                            }
                            className="form-checkbox h-4 w-4 text-red-600 rounded cursor-pointer pointer-events-auto"
                          />
                          <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide group-hover:text-red-700 dark:group-hover:text-red-500 transition-colors">
                            Show Listing on Homepage Frontend
                          </span>
                        </label>
                        <p className="text-[10px] text-zinc-500 mt-1 pl-1">
                          If unchecked, this listing will only be visible in
                          Admin and direct links, great for hiding "Sold" properties from frontend.
                        </p>
                      </div>

                      <div className="sm:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 bg-zinc-50 dark:bg-zinc-900/40 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800/60">
                        <ImageInput
                          value={propImg}
                          onChange={(val) => setPropImg(val)}
                          label="Primary High-Resolution Image (Click or Drag)"
                        />
                        <ImageInput
                          value={propGallery}
                          onChange={(val) => setPropGallery(val)}
                          label="Additional Gallery Images (Click/Drag Multiple)"
                          multiline={true}
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-700 dark:text-zinc-300 mb-2">
                          Select Executive Services & Infrastructure
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 bg-zinc-50 dark:bg-zinc-900/40 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800/60 mb-4">
                          {allAmenities.map((amenity) => {
                            const isChecked = propAmenities.includes(amenity);
                            return (
                              <button
                                type="button"
                                key={amenity}
                                onClick={() => {
                                  if (isChecked) {
                                    setPropAmenities((prev) =>
                                      prev.filter((x) => x !== amenity),
                                    );
                                  } else {
                                    setPropAmenities((prev) => [
                                      ...prev,
                                      amenity,
                                    ]);
                                  }
                                }}
                                className={`p-2.5 rounded-lg border text-left text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
                                  isChecked
                                    ? "bg-red-50 dark:bg-red-950/20 border-red-505 text-[#DC2626] dark:text-red-400"
                                    : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                                }`}
                              >
                                <span
                                  className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[9px] ${
                                    isChecked
                                      ? "bg-[#DC2626] border-[#DC2626] text-white font-bold"
                                      : "border-zinc-300 dark:border-zinc-700 text-transparent"
                                  }`}
                                >
                                  ✓
                                </span>
                                {amenity}
                              </button>
                            );
                          })}
                          {allAmenities.length === 0 && (
                            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium col-span-full">
                              No active catalog amenities found. Add some in the
                              "Catalogs" tab.
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Room & Unit Arrays */}
                      <div className="sm:col-span-2 space-y-6 bg-zinc-50 dark:bg-zinc-900/40 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800/60 mt-2 mb-4">
                        
                        {/* Units Info Array */}
                        <div>
                          <h3 className="text-sm font-bold uppercase tracking-widest text-[#DC2626] dark:text-red-500 flex items-center justify-between">
                            <span>Available Units Details</span>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                setPropUnitsInfo([...propUnitsInfo, { id: `unit-${Date.now()}`, name: `Unit Type ${propUnitsInfo.length + 1}`, bedrooms: 2, bathrooms: 2, areaSqm: 80 }]);
                              }}
                              className="text-[10px] bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-950/60 px-2.5 py-1 rounded-lg uppercase tracking-wider transition font-extrabold cursor-pointer"
                            >
                              + Add Unit
                            </button>
                          </h3>
                          <div className="space-y-3 mt-4">
                            {propUnitsInfo.map((unit, idx) => (
                              <div key={unit.id} className="grid grid-cols-2 md:grid-cols-5 gap-3 bg-white dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 relative pt-8">
                                <button onClick={(e) => { e.preventDefault(); setPropUnitsInfo(propUnitsInfo.filter((_, i) => i !== idx)); }} className="absolute top-2 right-2 text-zinc-400 hover:text-red-600 outline-none transition cursor-pointer">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                                <div className="col-span-2">
                                  <label className="block text-[9px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Unit Name</label>
                                  <input type="text" value={unit.name} onChange={e => { const list = [...propUnitsInfo]; list[idx].name = e.target.value; setPropUnitsInfo(list); }} className="w-full p-2.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-[#F9F9FB] dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-red-600" />
                                </div>
                                <div>
                                  <label className="block text-[9px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Beds</label>
                                  <input type="number" value={unit.bedrooms} onChange={e => { const list = [...propUnitsInfo]; list[idx].bedrooms = Number(e.target.value); setPropUnitsInfo(list); }} className="w-full p-2.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-[#F9F9FB] dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-red-600" />
                                </div>
                                <div>
                                  <label className="block text-[9px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Baths</label>
                                  <input type="number" value={unit.bathrooms} onChange={e => { const list = [...propUnitsInfo]; list[idx].bathrooms = Number(e.target.value); setPropUnitsInfo(list); }} className="w-full p-2.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-[#F9F9FB] dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-red-600" />
                                </div>
                                <div>
                                  <label className="block text-[9px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Area (sqm)</label>
                                  <input type="number" value={unit.areaSqm} onChange={e => { const list = [...propUnitsInfo]; list[idx].areaSqm = Number(e.target.value); setPropUnitsInfo(list); }} className="w-full p-2.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-[#F9F9FB] dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-red-600" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-700 dark:text-zinc-300 mb-1">
                          Google Maps Place URL or Embed Link (Optional)
                        </label>
                        <input
                          type="text"
                          value={propMapEmbedUrl}
                          onChange={(e) => setPropMapEmbedUrl(e.target.value)}
                          placeholder="https://maps.google.com/?q=..."
                          className="w-full p-3 text-xs mb-4 font-semibold rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition-all duration-200"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-700 dark:text-zinc-300 mb-1">
                          Realistic Video Tour URL (Optional)
                        </label>
                        <input
                          type="text"
                          value={propVideoTourUrl}
                          onChange={(e) => setPropVideoTourUrl(e.target.value)}
                          placeholder="https://youtube.com/watch?v=..."
                          className="w-full p-3 text-xs mb-4 font-semibold rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition-all duration-200"
                        />
                      </div>

                      <div className="sm:col-span-2 grid grid-cols-1 gap-4 bg-zinc-50 dark:bg-zinc-900/40 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800/60 mt-2 mb-4">
                        <div className="">
                          <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-800 dark:text-zinc-200 flex items-center justify-between">
                            Interactive Virtual Tour (360)
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                setPropVirtualTourRooms([
                                  ...propVirtualTourRooms,
                                  { name: "New Room", image: "" },
                                ]);
                              }}
                              className="text-[10px] bg-red-100 hover:bg-red-200 text-red-700 px-2.5 py-1 rounded-lg uppercase tracking-wider transition"
                            >
                              + Add Room
                            </button>
                          </h3>
                          <p className="text-[10px] text-zinc-500 mt-1">
                            Configure the 360 viewer fallback if video tour
                            isn't supplied (Add multiple rooms/panoramas).
                          </p>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-700 dark:text-zinc-300 mb-1">
                            Global Virtual Tour Title
                          </label>
                          <input
                            type="text"
                            value={propVirtualTourTitle}
                            onChange={(e) =>
                              setPropVirtualTourTitle(e.target.value)
                            }
                            placeholder="e.g. Master Bedroom 360"
                            className="w-full p-3 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition-all duration-200"
                          />
                        </div>

                        <div className="space-y-4 mt-2">
                          {propVirtualTourRooms.map((room, idx) => (
                            <div
                              key={idx}
                              className="p-4 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 relative"
                            >
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  setPropVirtualTourRooms(
                                    propVirtualTourRooms.filter(
                                      (_, i) => i !== idx,
                                    ),
                                  );
                                }}
                                className="absolute top-2 right-2 text-zinc-400 hover:text-red-600 text-xs font-bold uppercase"
                              >
                                Remove
                              </button>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-700 dark:text-zinc-300 mb-1">
                                    Room Name
                                  </label>
                                  <input
                                    type="text"
                                    value={room.name}
                                    onChange={(e) => {
                                      const newR = [...propVirtualTourRooms];
                                      newR[idx].name = e.target.value;
                                      setPropVirtualTourRooms(newR);
                                    }}
                                    placeholder="e.g. Living Area"
                                    className="w-full p-3 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-red-600"
                                  />
                                </div>
                                <ImageInput
                                  value={room.image}
                                  onChange={(val) => {
                                    const newR = [...propVirtualTourRooms];
                                    newR[idx].image = val;
                                    setPropVirtualTourRooms(newR);
                                  }}
                                  label="360 Panorama URL"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-700 dark:text-zinc-300 mb-1">
                          Short Listing Description
                        </label>
                        <textarea
                          rows={3}
                          value={propDescription}
                          onChange={(e) => setPropDescription(e.target.value)}
                          className="w-full p-3 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition-all duration-200 appearance-none"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-2">
                      <button
                        type="button"
                        onClick={resetPropForm}
                        className="px-4 py-2 rounded text-xs font-semibold bg-zinc-200 dark:bg-zinc-800 text-black dark:text-zinc-100"
                      >
                        Reset fields
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded text-xs font-bold bg-blue-600 hover:bg-blue-600 text-white dark:text-zinc-100"
                      >
                        {editingPropertyId ? "Save Changes" : "Publish Asset"}
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Properties Grid Table */}
              <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
                <table className="w-full min-w-[650px] border-collapse text-left text-xs bg-white dark:bg-zinc-900">
                  <thead className="bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 uppercase font-bold tracking-wider">
                    <tr>
                      <th className="p-4">Property</th>
                      <th className="p-4">Location</th>
                      <th className="p-4">Price (ETB)</th>
                      <th className="p-4">Availability</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/10">
                    {properties.map((p) => (
                      <tr
                        key={p.id}
                        className="hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-black dark:text-zinc-100 :text-black dark:text-zinc-100 hover:font-bold transition"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.featuredImage}
                              alt={p.title}
                              className="w-12 h-8 rounded object-cover flex-shrink-0"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <p className="font-bold">{p.title}</p>
                              <p className="text-[10px] text-zinc-700 dark:text-zinc-300">
                                {p.type} • {p.areaSqm} sqm
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <p>{p.location}</p>
                          <p className="text-[10px] text-zinc-700 dark:text-zinc-300">
                            {p.subCity}
                          </p>
                        </td>
                        <td className="p-4 font-mono font-bold text-blue-500">
                          {p.price.toLocaleString()}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              p.availability === "Available"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-zinc-200 dark:bg-zinc-800 text-black dark:text-zinc-100"
                            }`}
                          >
                            {p.availability}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {canEditCore ? (
                              <>
                                <button
                                  onClick={() => handleEditPropertyClick(p)}
                                  className="p-1.5 rounded hover:bg-blue-100 :bg-blue-900 text-blue-600 transition"
                                  title="Edit parameters"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProperty(p.id)}
                                  className="p-1.5 rounded hover:bg-blue-100 :bg-blue-900 text-blue-600 transition"
                                  title="Delete Listing"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            ) : (
                              <span className="text-[10px] font-mono text-zinc-700 dark:text-zinc-300">
                                View Only
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: HOME SCREEN LAYOUT ENGINE */}
          {activeAdminTab === "home" && isOwner && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Premium Settings Form */}
              <form
                onSubmit={handleUpdateHomeLayout}
                className="lg:col-span-7 space-y-8 bg-transparent"
              >
                {/* Section 1: Hero Configurations */}
                <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-6">
                  <div className="flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
                    <div className="p-2 bg-red-50 dark:bg-red-950/30 rounded-lg text-red-600 dark:text-red-400">
                      <Home className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold font-serif text-lg text-zinc-900 dark:text-zinc-100">
                        Hero Branding & Canvas
                      </h3>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        Customize the main greeting statements, header assets, and fallback presentation images.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-widest text-[#DC2626] mb-1">
                        Primary Welcoming Headline
                      </label>
                      <input
                        type="text"
                        required
                        value={homeH1}
                        onChange={(e) => setHomeH1(e.target.value)}
                        className="w-full p-3 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-red-600 outline-none transition-all duration-200"
                        placeholder="e.g., Cappadocia S.C. Real Estate"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-widest text-[#DC2626] mb-1">
                        Sub-headline Paragraph
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={homeSub}
                        onChange={(e) => setHomeSub(e.target.value)}
                        className="w-full p-3 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-red-600 outline-none transition-all duration-200 resize-none"
                        placeholder="e.g., We construct state-of-the-art secure villas..."
                      />
                    </div>

                    <div>
                      <ImageInput
                        value={homeImgUrl}
                        onChange={setHomeImgUrl}
                        label="Hero Background Image"
                      />
                    </div>
                    <div>
                      <ImageInput
                        value={brandLogo}
                        onChange={setBrandLogo}
                        label="Brand Logo URL"
                      />
                    </div>
                    <div>
                      <ImageInput
                        value={brandFavicon}
                        onChange={setBrandFavicon}
                        label="Brand Favicon URL"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Contact Details */}
                <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-6">
                  <div className="flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
                    <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg text-blue-600">
                      <Settings className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold font-serif text-lg text-zinc-900 dark:text-zinc-100">
                        Location & Contacts
                      </h3>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        Operational contact numbers, support email routers, and corporate physical locations.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="w-full p-2.5 text-xs rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-red-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">
                        Phone Number (Short)
                      </label>
                      <input
                        type="text"
                        required
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className="w-full p-2.5 text-xs rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-red-600"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">
                        Brief Footer Address
                      </label>
                      <input
                        type="text"
                        required
                        value={contactAddress}
                        onChange={(e) => setContactAddress(e.target.value)}
                        className="w-full p-2.5 text-xs rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-red-600"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">
                        HQ Main Office Address
                      </label>
                      <textarea
                        required
                        value={contactHqAddress}
                        onChange={(e) => setContactHqAddress(e.target.value)}
                        rows={2}
                        className="w-full p-2.5 text-xs rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-red-600 resize-none"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">
                        Sales Hotline Support Desk
                      </label>
                      <input
                        type="text"
                        required
                        value={contactHotline}
                        onChange={(e) => setContactHotline(e.target.value)}
                        className="w-full p-2.5 text-xs rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-red-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Social Platform Links */}
                <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-6">
                  <div className="flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
                    <div className="p-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg text-emerald-600">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold font-serif text-lg text-zinc-900 dark:text-zinc-100">
                        Social Handles & Channels
                      </h3>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        Link paths pointing to official company social profiles rendered at the bottom section of Cappadocia.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1DA1F2] mb-1">
                        X / Twitter Link
                      </label>
                      <input
                        type="text"
                        value={socTwitter}
                        onChange={(e) => setSocTwitter(e.target.value)}
                        className="w-full p-2.5 text-xs rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-red-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-[#0A66C2] mb-1">
                        LinkedIn Profile
                      </label>
                      <input
                        type="text"
                        value={socLinkedin}
                        onChange={(e) => setSocLinkedin(e.target.value)}
                        className="w-full p-2.5 text-xs rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-red-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-[#0088CC] mb-1">
                        Telegram Group
                      </label>
                      <input
                        type="text"
                        value={socTelegram}
                        onChange={(e) => setSocTelegram(e.target.value)}
                        className="w-full p-2.5 text-xs rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-red-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-[#FE2C55] mb-1">
                        TikTok Channel
                      </label>
                      <input
                        type="text"
                        value={socTiktok}
                        onChange={(e) => setSocTiktok(e.target.value)}
                        className="w-full p-2.5 text-xs rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-red-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-[#25D366] mb-1">
                        WhatsApp Link
                      </label>
                      <input
                        type="text"
                        value={socWhatsapp}
                        onChange={(e) => setSocWhatsapp(e.target.value)}
                        className="w-full p-2.5 text-xs rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-red-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1877F2] mb-1">
                        Facebook Page
                      </label>
                      <input
                        type="text"
                        value={socFacebook}
                        onChange={(e) => setSocFacebook(e.target.value)}
                        className="w-full p-2.5 text-xs rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-red-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 4: Executive Board Roster */}
                <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-6">
                  <div className="flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
                    <div className="p-2 bg-violet-50 dark:bg-violet-950/30 rounded-lg text-violet-600">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold font-serif text-lg text-zinc-900 dark:text-zinc-100">
                        Executive Team Roster
                      </h3>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        Manage high-level executive cards visible on your brand's official About section.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {localTeam.map((member, index) => (
                      <div key={index} className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 space-y-5 relative transition-all duration-200 hover:border-zinc-300 dark:hover:border-zinc-700">
                        {/* Header bar with clear delete action */}
                        <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800/80 pb-3">
                          <span className="text-[11px] font-bold uppercase tracking-widest text-[#DC2626]">
                            Executive Staff #{index + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setLocalTeam(localTeam.filter((_, idx) => idx !== index));
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/30 dark:hover:bg-red-950/50 dark:text-red-400 rounded-lg transition-all duration-150 cursor-pointer border border-[#FCA5A5]/20 dark:border-[#991B1B]/20"
                            title="Remove Member"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove Member</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">
                              Full Name
                            </label>
                            <input
                              type="text"
                              value={member.name}
                              required
                              onChange={(e) => {
                                const updated = [...localTeam];
                                updated[index].name = e.target.value;
                                setLocalTeam(updated);
                              }}
                              className="w-full p-2.5 text-xs rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition"
                              placeholder="e.g., Eleni Gebre"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">
                              Job Title / Position
                            </label>
                            <input
                              type="text"
                              value={member.role}
                              required
                              onChange={(e) => {
                                const updated = [...localTeam];
                                updated[index].role = e.target.value;
                                setLocalTeam(updated);
                              }}
                              className="w-full p-2.5 text-xs rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition"
                              placeholder="e.g., Managing Director"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <ImageInput
                              value={member.img || ""}
                              onChange={(val) => {
                                const updated = [...localTeam];
                                updated[index].img = val;
                                setLocalTeam(updated);
                              }}
                              label="Profile Portrait Portrait (Choose Device Image or Drag & Drop)"
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => {
                        setLocalTeam([
                          ...localTeam,
                          {
                            name: "New Executive Staff",
                            role: "Director of Operations",
                            desc: "Brings extensive project management and infrastructure delivery background in municipal sectors.",
                            img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80"
                          }
                        ]);
                      }}
                      className="w-full py-2.5 border-2 border-dashed border-zinc-200 dark:border-zinc-800 hover:border-red-700 dark:hover:border-red-500 rounded-xl text-xs font-bold uppercase tracking-widest text-zinc-700 dark:text-zinc-400 hover:text-red-700 transition-all flex items-center justify-center gap-2 cursor-pointer bg-transparent"
                    >
                      <span>+ Add New Team Member</span>
                    </button>
                  </div>
                </div>

                {/* Submit button bar */}
                <div className="sticky bottom-4 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-md flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-red-600 text-white hover:bg-red-700 transition cursor-pointer shadow-lg shadow-red-600/20"
                  >
                    <Check className="w-4 h-4" />
                    Save Brand Configurations
                  </button>
                </div>
              </form>

              {/* Right Column: Live Interactive Device Mockup (Highly Polished) */}
              <div className="lg:col-span-4 sticky top-6 hidden lg:flex flex-col gap-6">
                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-lg overflow-hidden flex flex-col">
                  {/* Browser toolbar simulator */}
                  <div className="bg-zinc-100 dark:bg-zinc-900 px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-800/80 flex items-center gap-2 flex-shrink-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400 block"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 block"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 block"></span>
                    <div className="flex-1 max-w-xs mx-auto bg-white dark:bg-zinc-900/60 text-[9px] font-mono text-zinc-400 dark:text-zinc-500 rounded px-2.5 py-0.5 text-center truncate border border-zinc-200/50 dark:border-zinc-800/20">
                      https://cappadocia.com/home
                    </div>
                  </div>

                  {/* Dynamic simulated landing live container */}
                  <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto scrollbar-thin">
                    <div className="relative aspect-video rounded-xl overflow-hidden shadow-sm border border-zinc-200/50 dark:border-zinc-800">
                      <img
                        src={homeImgUrl || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80"}
                        alt="Background Thumbnail"
                        className="w-full h-full object-cover dark:brightness-85"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex flex-col justify-end p-3.5 text-white">
                        <span className="text-[7px] text-red-500 font-extrabold uppercase tracking-widest font-mono">
                          Live Active Banner
                        </span>
                        <h1 className="text-xs sm:text-sm font-serif font-bold tracking-tight line-clamp-1">
                          {homeH1}
                        </h1>
                        <p className="text-[8px] text-zinc-300 font-sans line-clamp-2 leading-relaxed mt-0.5">
                          {homeSub}
                        </p>
                      </div>
                    </div>

                    {/* Team Members Roster Live Preview */}
                    <div className="space-y-3 bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
                      <p className="text-[10px] font-extrabold text-[#DC2626] uppercase tracking-wider font-mono">
                        Active Roster ({localTeam.length})
                      </p>
                      <div className="grid grid-cols-2 gap-2.5">
                        {localTeam.slice(0, 4).map((member, i) => (
                          <div
                            key={i}
                            className="bg-white dark:bg-zinc-900 p-2 rounded-lg border border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 transition duration-200"
                          >
                            <div className="w-8 h-8 rounded-full overflow-hidden mx-auto bg-zinc-100 border border-zinc-200 dark:border-zinc-800">
                              <img
                                src={member.img}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                                alt={member.name}
                              />
                            </div>
                            <div className="text-center mt-1.5 leading-none">
                              <p className="text-[9px] font-bold text-zinc-900 dark:text-zinc-205 truncate">
                                {member.name}
                              </p>
                              <p className="text-[7px] text-zinc-700 dark:text-zinc-400 mt-0.5 truncate uppercase tracking-wider">
                                {member.role}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      {localTeam.length === 0 && (
                        <p className="text-[9px] text-zinc-500 text-center py-2">
                          No representatives added yet.
                        </p>
                      )}
                    </div>

                    {/* Contacts Deck Mockup */}
                    <div className="bg-zinc-50 dark:bg-zinc-950 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-1 text-[8px] text-zinc-600 dark:text-zinc-400 leading-normal">
                      <p className="text-[9px] font-bold text-zinc-900 dark:text-zinc-100 mb-1 font-serif">
                        Contact Info Preview
                      </p>
                      <p className="truncate">
                        ✉️ <span className="font-semibold text-zinc-800 dark:text-zinc-200">Email:</span> {contactEmail}
                      </p>
                      <p className="truncate">
                        📞 <span className="font-semibold text-zinc-800 dark:text-zinc-200">Phone:</span> {contactPhone}
                      </p>
                      <p className="truncate">
                        🏢 <span className="font-semibold text-zinc-800 dark:text-zinc-200">HQ:</span> {contactHqAddress}
                      </p>
                      <p className="truncate">
                        🔥 <span className="font-semibold text-zinc-800 dark:text-zinc-200">Hotline:</span> {contactHotline}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CLIENT TESTIMONIALS */}
          {activeAdminTab === "testimonials" && canEditCore && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3
                    className={`font-bold font-serif text-lg ${"text-black dark:text-zinc-100"}`}
                  >
                    Testimonial Feedback Grid
                  </h3>
                  <p className="text-xs text-zinc-700 dark:text-zinc-300">
                    Order is strictly set: Client name first, then rating stars,
                    then testimonial body text.
                  </p>
                </div>
                <button
                  onClick={() => setIsAddingTestimonial(!isAddingTestimonial)}
                  className="px-3 py-2 rounded text-xs font-bold bg-blue-600 text-white dark:text-zinc-100 hover:bg-blue-600 cursor-pointer"
                >
                  {isAddingTestimonial ? "Cancel" : "Add Client Review"}
                </button>
              </div>

              {isAddingTestimonial && (
                <form
                  onSubmit={handleSaveTestimonial}
                  className={`p-5 rounded-xl border space-y-4 ${"bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-800"}`}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                        Client Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={testClient}
                        onChange={(e) => setTestClient(e.target.value)}
                        placeholder="e.g. Dr. Alula Yusuf"
                        className="w-full p-3 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition-all duration-200 appearance-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                        Property Purchased *
                      </label>
                      <AdminCustomSelect
                        value={testPurchased}
                        onChange={(val) => setTestPurchased(val)}
                        placeholder="Select Property"
                        options={[
                          ...properties.map((p) => ({
                            value: p.title,
                            label: p.title,
                          })),
                        ]}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                        Star Assessment *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        required
                        value={testRating}
                        onChange={(e) => setTestRating(Number(e.target.value))}
                        className="w-full p-3 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition-all duration-200 appearance-none"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] uppercase font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                        Testimony Body *
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={testText}
                        onChange={(e) => setTestText(e.target.value)}
                        className="w-full p-3 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition-all duration-200 appearance-none"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded text-xs font-bold bg-blue-600 text-white dark:text-zinc-100"
                  >
                    Submit Client Testimonial
                  </button>
                </form>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {testimonials.map((t) => (
                  <div
                    key={t.id}
                    className={`p-4 rounded-xl border flex flex-col justify-between ${"bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"}`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-bold text-sm">{t.clientName}</p>
                          <p className="text-[10px] text-zinc-700 dark:text-zinc-300">
                            {t.propertyPurchased}
                          </p>
                        </div>
                      </div>

                      {/* Display Star Rating */}
                      <div className="flex gap-1 text-black dark:text-zinc-100">
                        {Array.from({ length: t.rating }).map((_, idx) => (
                          <Star
                            key={idx}
                            className="w-3.5 h-3.5 fill-current"
                          />
                        ))}
                      </div>

                      <p
                        className={`text-xs italic leading-relaxed ${"text-zinc-700 dark:text-zinc-300"}`}
                      >
                        {" "}
                        '{t.testimony}"
                      </p>
                    </div>

                    <div className="flex justify-end pt-3 border-t border-zinc-200 dark:border-zinc-800 mt-3">
                      <button
                        onClick={() => handleDeleteTestimonial(t.id)}
                        className="text-blue-500 hover:text-blue-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: ARTICLES & BLOG POSTS */}
          {activeAdminTab === "blogs" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3
                    className={`font-bold font-serif text-lg ${"text-black dark:text-zinc-100"}`}
                  >
                    Marketing & Corporate News Entries
                  </h3>
                  <p className="text-xs text-zinc-700 dark:text-zinc-300">
                    Deploy luxury real estate insights dynamically on Cappadocia
                    Blog.
                  </p>
                </div>
                {canEditCore && (
                  <button
                    onClick={() => setIsAddingBlog(!isAddingBlog)}
                    className="px-3.5 py-2 rounded-lg text-xs font-bold bg-blue-600 text-white dark:text-zinc-100 cursor-pointer"
                  >
                    {isAddingBlog ? "Cancel" : "Write New Post"}
                  </button>
                )}
              </div>

              {isAddingBlog && canEditCore && (
                <form
                  onSubmit={handleSaveBlog}
                  className={`p-5 rounded-xl border space-y-4 ${"bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-800"}`}
                >
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                        Blog Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={blogTitle}
                        onChange={(e) => setBlogTitle(e.target.value)}
                        placeholder="e.g. Modern Escrow Regulations"
                        className="w-full p-3 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition-all duration-200 appearance-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                        Short Excerpt *
                      </label>
                      <input
                        type="text"
                        required
                        value={blogExcerpt}
                        onChange={(e) => setBlogExcerpt(e.target.value)}
                        placeholder="Summary of article for landing view"
                        className="w-full p-3 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition-all duration-200 appearance-none"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                          Article Category *
                        </label>
                        <input
                          type="text"
                          required
                          value={blogCategory}
                          onChange={(e) => setBlogCategory(e.target.value)}
                          placeholder="Select or enter custom category"
                          list="blog-categories"
                          className="w-full p-3 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition-all duration-200"
                        />
                        <datalist id="blog-categories">
                          <option value="Properties" />
                          <option value="Investments" />
                          <option value="Technology" />
                          <option value="Lifestyle" />
                        </datalist>
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                          Written By / Author *
                        </label>
                        <input
                          type="text"
                          required
                          value={blogAuthor}
                          onChange={(e) => setBlogAuthor(e.target.value)}
                          placeholder="e.g. Admin Office, Yeabsira Tesfaye"
                          className="w-full p-3 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition-all duration-200"
                        />
                      </div>
                    </div>
                    <div>
                      <ImageInput
                        value={blogImage}
                        onChange={(val) => setBlogImage(val)}
                        label="Featured Banner Image (Click or Drag)"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                        Detailed Content Markup *
                      </label>
                      <textarea
                        rows={6}
                        required
                        value={blogContent}
                        onChange={(e) => setBlogContent(e.target.value)}
                        className="w-full p-3 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition-all duration-200 appearance-none"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 text-white dark:text-zinc-100 rounded text-xs font-bold"
                  >
                    Publish Article
                  </button>
                </form>
              )}

              <div className="space-y-3">
                {blogs.map((b) => (
                  <div
                    key={b.id}
                    className={`p-4 rounded-xl border flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between ${"bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"}`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={b.image}
                        alt=""
                        className="w-16 h-12 rounded object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold uppercase">
                          {b.category}
                        </span>
                        <h4 className="font-bold text-sm mt-1">{b.title}</h4>
                        <p className="text-[10px] text-zinc-700 dark:text-zinc-300">
                          {b.date} • Written by {b.author}
                        </p>
                      </div>
                    </div>

                    {canEditCore && (
                      <button
                        onClick={() => handleDeleteBlog(b.id)}
                        className="text-blue-500 hover:text-blue-700 text-xs font-bold cursor-pointer inline-flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4.5: PROJECTS SHOWCASE MANAGER */}
          {activeAdminTab === "projects" && !isSales && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3
                    className={`font-bold font-serif text-lg ${"text-black dark:text-zinc-100"}`}
                  >
                    Completed Projects Portfolio Manager
                  </h3>
                  <p className="text-xs text-zinc-700 dark:text-zinc-300">
                    Add or edit Cappadocia S.C.'s metropolitan landmarks
                    dynamically without touching a single line of code.
                  </p>
                </div>
                {canEditCore && (
                  <button
                    onClick={() => {
                      if (isAddingProject) {
                        resetProjForm();
                      }
                      setIsAddingProject(!isAddingProject);
                    }}
                    className="px-3.5 py-2 rounded-lg text-xs font-bold bg-red-600 text-white dark:text-zinc-100 cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    {isAddingProject ? "Cancel" : "Add New Project"}
                  </button>
                )}
              </div>

              {isAddingProject && canEditCore && (
                <form
                  onSubmit={handleSaveProjectLocal}
                  className={`p-6 rounded-2xl border transition-all space-y-4 ${"bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-black dark:text-zinc-100"}`}
                >
                  <h4
                    className={`font-sans font-extrabold uppercase tracking-tight text-sm pb-2 border-b leading-tight ${"border-zinc-200 dark:border-zinc-800 text-black dark:text-zinc-100"}`}
                  >
                    {editingProjectId
                      ? "✏️ Edit Project Showcase"
                      : "🚀 Add New Completed Landmark"}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                        Project Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={projTitle}
                        onChange={(e) => setProjTitle(e.target.value)}
                        placeholder="e.g. Cappadocia Sovereign Residency"
                        className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none transition ${"bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-black dark:text-zinc-100 focus:border-blue-500"}`}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                        Completion Year *
                      </label>
                      <input
                        type="text"
                        required
                        value={projYear}
                        onChange={(e) => setProjYear(e.target.value)}
                        placeholder="e.g. 2024"
                        className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none transition ${"bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-black dark:text-zinc-100 focus:border-blue-500"}`}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-700 dark:text-zinc-300 mb-1">
                        Location *
                      </label>
                      <AdminCustomSelect
                        value={projSubCity}
                        onChange={(val) => setProjSubCity(val)}
                        placeholder="Select Location"
                        options={allLocations.map((loc) => ({
                          value: loc,
                          label: loc,
                        }))}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                        Specs Summary *
                      </label>
                      <input
                        type="text"
                        required
                        value={projSpecs}
                        onChange={(e) => setProjSpecs(e.target.value)}
                        placeholder="e.g. 18 Executive Suites / Penthouses"
                        className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none transition ${"bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-black dark:text-zinc-100 focus:border-blue-500"}`}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <ImageInput
                        label="Featured Landmark Image *"
                        value={projImage}
                        onChange={setProjImage}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] uppercase font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                        Portfolio Description *
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={projDescription}
                        onChange={(e) => setProjDescription(e.target.value)}
                        placeholder="Write dynamic marketing or structural descriptions about this masterpiece..."
                        className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none transition ${"bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-black dark:text-zinc-100 focus:border-blue-500 font-semibold"}`}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] uppercase font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                        Highlights & Achievements (Comma-separated) *
                      </label>
                      <span className="text-[9px] text-zinc-700 dark:text-zinc-300 block mb-1">
                        Provide up to 3 short highlights separated by commas.
                      </span>
                      <input
                        type="text"
                        value={projAchievements}
                        onChange={(e) => setProjAchievements(e.target.value)}
                        placeholder="e.g. EU acoustic standard, Solar-diesel hybrid grid, 100% pre-sold"
                        className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none transition ${"bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-black dark:text-zinc-100 focus:border-blue-500"}`}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        resetProjForm();
                        setIsAddingProject(false);
                      }}
                      className={`px-4 py-2 rounded-lg text-xs font-bold border transition ${"border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 hover:border-black dark:border-zinc-700 bg-white dark:bg-zinc-900"}`}
                    >
                      Reset Form
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-lg text-xs font-bold bg-[#003B95] border border-[#003B95] hover:bg-[#002f75] text-black dark:text-zinc-100 cursor-pointer transition shadow-xs"
                    >
                      {editingProjectId
                        ? "Apply Permanent Changes"
                        : "Publish Completed Project"}
                    </button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 gap-4">
                {projects.map((proj) => (
                  <div
                    key={proj.id}
                    className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between ${"bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-black dark:text-zinc-100"}`}
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={proj.image}
                        alt=""
                        className="w-20 h-14 rounded-xl object-cover border border-zinc-200 dark:border-zinc-800"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-mono font-bold uppercase text-black dark:text-zinc-100 bg-blue-600 px-2.5 py-0.5 rounded-sm shadow-sm">
                            {proj.year}
                          </span>
                          <span
                            className={`text-[9px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-sm shadow-sm ${"bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"}`}
                          >
                            {proj.subCity}
                          </span>
                        </div>
                        <h4
                          className={`font-bold text-sm mt-1.5 ${"text-black dark:text-zinc-100"}`}
                        >
                          {proj.title}
                        </h4>
                        <p className="text-[10px] text-zinc-700 dark:text-zinc-300 truncate max-w-sm sm:max-w-md mt-0.5">
                          {proj.description}
                        </p>
                      </div>
                    </div>

                    {canEditCore && (
                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={() => handleEditProjectClick(proj)}
                          className="text-blue-600 hover:text-[#002f75] text-xs font-black cursor-pointer inline-flex items-center gap-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProjectLocal(proj.id)}
                          className="text-blue-600 hover:text-blue-800 text-xs font-black cursor-pointer inline-flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {projects.length === 0 && (
                  <div className="py-12 text-center text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                    <p className="text-xs font-bold font-mono">
                      No registered showcase projects database records.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: PUBLICITY POP-UP ADS */}
          {activeAdminTab === "ads" && canEditCore && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3
                    className={`font-bold font-serif text-lg ${"text-black dark:text-zinc-100"}`}
                  >
                    Manage Pop-Ups
                  </h3>
                  <p className="text-xs text-zinc-700 dark:text-zinc-300">
                    Manage pop-up ads for users.
                  </p>
                </div>
                <button
                  onClick={() => setIsAddingAd(!isAddingAd)}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-600 text-white dark:text-zinc-100 rounded-lg text-xs font-bold cursor-pointer"
                >
                  {isAddingAd ? "Cancel" : "Design New Campaign"}
                </button>
              </div>

              {isAddingAd && (
                <form
                  onSubmit={handleSaveAd}
                  className={`p-5 rounded-xl border space-y-4 ${"bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-800"}`}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                        Pop-Up Ad Title (Header Campaign) *
                      </label>
                      <input
                        type="text"
                        required
                        value={adTitle}
                        onChange={(e) => setAdTitle(e.target.value)}
                        placeholder="🎉 Mid-Year Escrow Discount!"
                        className="w-full p-3 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition-all duration-200 appearance-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                        CTA Action Button Label *
                      </label>
                      <input
                        type="text"
                        required
                        value={adCta}
                        onChange={(e) => setAdCta(e.target.value)}
                        placeholder="Claim Exclusive Spot"
                        className="w-full p-3 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition-all duration-200 appearance-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                        Display Frequency *
                      </label>
                      <AdminCustomSelect
                        value={adFreq}
                        onChange={(val) => setAdFreq(val)}
                        placeholder="Select Frequency"
                        options={[
                          { value: "always", label: "Always" },
                          { value: "once", label: "Once" },
                        ]}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                        Target Action Link *
                      </label>
                      <AdminCustomSelect
                        value={adCtaLink}
                        onChange={(val) => setAdCtaLink(val)}
                        placeholder="Select Navigation Target"
                        options={[
                          { value: "/", label: "Home Page" },
                          { value: "/contact", label: "Contact Us" },
                          { value: "/properties", label: "All Properties" },
                          ...properties.map((p) => ({
                            value: `/properties/${p.id}`,
                            label: `Property: ${p.title}`,
                          })),
                          { value: "/blogs", label: "All Blogs" },
                          ...blogs.map((b) => ({
                            value: `/blog/${b.id}`,
                            label: `Blog: ${b.title}`,
                          })),
                          { value: "/projects", label: "All Projects" },
                          ...projects.map((p) => ({
                            value: `/project/${p.id}`,
                            label: `Project: ${p.title}`,
                          })),
                        ]}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                        Image URL
                      </label>
                      <input
                        type="text"
                        required
                        value={adImg}
                        onChange={(e) => setAdImg(e.target.value)}
                        className="w-full p-3 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition-all duration-200 appearance-none"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] uppercase font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                        Ad Content Copy *
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={adContent}
                        onChange={(e) => setAdContent(e.target.value)}
                        placeholder="Highlight details of physical units and timing limits..."
                        className="w-full p-3 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition-all duration-200 appearance-none"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-600 text-white dark:text-zinc-100 rounded text-xs font-bold"
                  >
                    Save Pop-Up
                  </button>
                </form>
              )}

              <div className="space-y-3">
                {popupAds.map((ad) => (
                  <div
                    key={ad.id}
                    className={`p-4 rounded-xl border flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between ${"bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"}`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={ad.imageUrl}
                        alt=""
                        className="w-14 h-14 rounded object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <h4 className="font-bold text-sm">{ad.title}</h4>
                        <p
                          className={`text-xs mt-1 max-w-md ${"text-zinc-700 dark:text-zinc-300"}`}
                        >
                          {ad.content}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono ${ad.isActive ? "bg-blue-100 text-blue-800" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"}`}
                          >
                            {ad.isActive ? "ACTIVE POPUP" : "INACTIVE"}
                          </span>
                          <span className="text-[10px] text-zinc-700 dark:text-zinc-300">
                            Freq: {ad.displayFrequency}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => toggleAdActiveState(ad.id)}
                        className={`px-3 py-1.5 rounded text-xs font-semibold cursor-pointer ${
                          ad.isActive
                            ? "bg-zinc-200 dark:bg-zinc-800 text-black dark:text-zinc-100 hover:bg-black dark:bg-zinc-50/20"
                            : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                        }`}
                      >
                        {ad.isActive ? "Deactivate" : "Enable Ad"}
                      </button>
                      <button
                        onClick={() => handleDeleteAd(ad.id)}
                        className="p-1.5 rounded border border-blue-200 hover:bg-blue-50 text-blue-500 transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: LEAD INQUIRIES FOLDER */}
          {activeAdminTab === "messages" && (
            <div className="space-y-6">
              <div>
                <h3
                  className={`font-bold font-serif text-lg ${"text-black dark:text-zinc-100"}`}
                >
                  CRM Lead & Inquiry Records
                </h3>
                <p className="text-xs text-zinc-700 dark:text-zinc-300">
                  Direct client connection logging from Cappadocia public
                  contact forms.
                </p>
              </div>

              <div className="space-y-4">
                {(() => {
                  const sorted = [...messages].sort((a, b) => {
                    const parseIdTime = (id: string) => {
                      const parts = id.split("-");
                      if (parts.length > 1) {
                        const num = parseInt(parts[1], 10);
                        if (!isNaN(num) && num > 100000) {
                          return num;
                        }
                      }
                      return null;
                    };
                    
                    const timeA = parseIdTime(a.id);
                    const timeB = parseIdTime(b.id);
                    
                    if (timeA !== null && timeB !== null) {
                      return timeB - timeA;
                    }
                    
                    const dateA = new Date(a.date).getTime();
                    const dateB = new Date(b.date).getTime();
                    if (dateA !== dateB) {
                      return dateB - dateA;
                    }
                    
                    return b.id.localeCompare(a.id);
                  });

                  return sorted.map((m) => {
                    const initials = m.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .substring(0, 2)
                      .toUpperCase() || "C";

                    return (
                      <div
                        key={m.id}
                        className={`p-6 rounded-2xl border transition-shadow duration-200 hover:shadow-md ${
                          m.status === "New"
                            ? "border-l-4 border-l-[#003B95] bg-[#003B95]/5 dark:bg-[#003B95]/10 border-zinc-200 dark:border-zinc-800"
                            : "bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800/80 shadow-sm"
                        }`}
                      >
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                          <div className="flex items-start gap-3.5">
                            {/* Visual Avatar */}
                            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs bg-[#003B95]/10 text-[#003B95] dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200/30 dark:border-blue-900/30 shrink-0">
                              {initials}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                                  {m.fullName}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                    m.status === "New"
                                      ? "bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300"
                                      : m.status === "Replied"
                                        ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300"
                                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                                  }`}
                                >
                                  {m.status}
                                </span>
                              </div>
                              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-mono">
                                {m.email} <span className="text-zinc-300 dark:text-zinc-700 mx-1.5">•</span> {m.phone}
                              </p>
                              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5 font-mono">
                                Submitted: {m.date}
                              </p>
                            </div>
                          </div>

                          {/* State mutators */}
                          <div className="flex items-center gap-2 flex-wrap md:self-start">
                            <div className="flex bg-zinc-50 dark:bg-zinc-950/40 p-1 rounded-xl border border-zinc-100 dark:border-zinc-800/60">
                              {["New", "Replied", "Closed"].map((flag) => (
                                <button
                                  key={flag}
                                  onClick={() =>
                                    changeMessageStatus(m.id, flag as any)
                                  }
                                  className={`px-2.5 py-1 text-[9px] font-bold uppercase rounded-lg transition-all cursor-pointer ${m.status === flag ? "bg-[#003B95] text-white shadow-sm" : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"}`}
                                >
                                  {flag}
                                </button>
                              ))}
                            </div>
                            <button
                              onClick={() => handleDeleteMessage(m.id)}
                              className="p-1.5 rounded-xl hover:bg-red-50 hover:text-red-600 text-zinc-400 dark:text-zinc-500 dark:hover:bg-red-950/20 dark:hover:text-red-400 transition cursor-pointer"
                              title="Delete inquiry record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div
                          className="mt-4 p-4 rounded-xl text-xs leading-relaxed bg-zinc-50 dark:bg-zinc-950/40 text-zinc-800 dark:text-zinc-200 border border-zinc-100/50 dark:border-zinc-800/40"
                        >
                          {m.propertyTitle && (
                            <p className="font-bold text-xs text-[#003B95] dark:text-blue-400 mb-1.5 tracking-wide">
                              Related Property: {m.propertyTitle}
                            </p>
                          )}
                          <p className="italic text-zinc-700 dark:text-zinc-300">
                            "{m.message}"
                          </p>
                        </div>

                        {m.replyText && (
                          <div className="mt-4 pl-4 border-l-2 border-[#003B95]/40 dark:border-blue-500/30">
                            <div className="text-[10px] font-bold text-[#003B95] dark:text-blue-400 uppercase tracking-wider mb-1">
                              Cappadocia S.C. (Official Reply) — {m.replyDate}
                            </div>
                            <div
                              className="p-4 rounded-xl text-xs leading-relaxed bg-blue-50/20 dark:bg-blue-950/10 text-zinc-800 dark:text-zinc-200 border border-blue-100/20 dark:border-blue-900/10"
                            >
                              {m.replyText}
                            </div>
                          </div>
                        )}

                        {replyingTo === m.id ? (
                          <div className="mt-4 space-y-2">
                            <textarea
                              value={replyMessage}
                              onChange={(e) => setReplyMessage(e.target.value)}
                              placeholder="Type your reply to the client here..."
                              className="w-full p-3.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-1 focus:ring-[#003B95] focus:border-[#003B95] outline-none transition-all duration-200"
                              rows={3}
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setMessages((prev) =>
                                    prev.map((msg) =>
                                      msg.id === m.id
                                        ? {
                                            ...msg,
                                            status: "Replied",
                                            replyText: replyMessage,
                                            replyDate: new Date()
                                              .toISOString()
                                              .split("T")[0],
                                          }
                                        : msg,
                                    ),
                                  );
                                  setReplyingTo(null);
                                  setReplyMessage("");
                                  logActivity(
                                    "message",
                                    `Replied to inquiry from ${m.fullName}`,
                                  );
                                }}
                                className="bg-[#003B95] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#002f75] transition cursor-pointer"
                              >
                                Send Reply
                              </button>
                              <button
                                onClick={() => {
                                  setReplyingTo(null);
                                  setReplyMessage("");
                                }}
                                className="bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 px-4 py-2 rounded-xl text-xs font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setReplyingTo(m.id);
                              setReplyMessage("");
                            }}
                            className="mt-4 inline-flex items-center gap-1 text-[#003B95] dark:text-blue-400 text-xs font-bold uppercase tracking-wider hover:underline cursor-pointer"
                          >
                            Reply to Client
                          </button>
                        )}
                      </div>
                    );
                  });
                })()}

                {messages.length === 0 && (
                  <p className="text-center font-mono text-xs text-zinc-700 dark:text-zinc-300 py-12">
                    No corporate inquiries logged in this cycle.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 7: MANAGEMENT USERS */}
          {activeAdminTab === "users" && isOwner && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3
                    className={`font-bold font-serif text-lg ${"text-black dark:text-zinc-100"}`}
                  >
                    Management Group & Roles
                  </h3>
                  <p className="text-xs text-zinc-700 dark:text-zinc-300">
                    Configure corporate administrative authorizations. Owner
                    exclusive access.
                  </p>
                </div>
                <button
                  onClick={() => setIsAddingUser(!isAddingUser)}
                  className="px-3.5 py-2 rounded bg-blue-600 text-white dark:text-zinc-100 text-xs font-bold cursor-pointer"
                >
                  {isAddingUser ? "Cancel" : "Invite User"}
                </button>
              </div>

              {isAddingUser && (
                <form
                  onSubmit={handleSaveUser}
                  className={`p-5 rounded-xl border space-y-4 ${"bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-800"}`}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={userFullName}
                        onChange={(e) => setUserFullName(e.target.value)}
                        placeholder="Zelalem Worku"
                        className="w-full p-3 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition-all duration-200 appearance-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                        Work Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        placeholder="zelalem.w@cappadocia.com"
                        className="w-full p-3 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition-all duration-200 appearance-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={userPhone}
                        onChange={(e) => setUserPhone(e.target.value)}
                        placeholder="+251 911 234567"
                        className="w-full p-3 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition-all duration-200 appearance-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                        Login Password *
                      </label>
                      <input
                        type="text"
                        required
                        value={userPassword}
                        onChange={(e) => setUserPassword(e.target.value)}
                        placeholder="Secret123"
                        className="w-full p-3 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition-all duration-200 appearance-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                        Security Auths / Role *
                      </label>
                      <AdminCustomSelect
                        value={userRole}
                        onChange={(val) => setUserRole(val)}
                        placeholder="Select Role"
                        options={[
                          { value: "Owner", label: "Owner" },
                          { value: "Manager", label: "Manager" },
                          { value: "Sales", label: "Sales" },
                        ]}
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 text-white dark:text-zinc-100 rounded text-xs font-bold cursor-pointer hover:bg-blue-600"
                  >
                    {editingUserId ? "Save Changes" : "Save User"}
                  </button>
                </form>
              )}

              <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
                <table className="w-full min-w-[650px] border-collapse text-left text-xs bg-white dark:bg-zinc-900">
                  <thead className="bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 uppercase font-bold">
                    <tr>
                      <th className="p-4">Staff Name</th>
                      <th className="p-4">Email / Phone</th>
                      <th className="p-4">Role Permission</th>
                      <th className="p-4">Active State</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/10">
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td className="p-4 font-bold">{u.fullName}</td>
                        <td className="p-4 font-mono">
                          {u.email}
                          {u.phone && (
                            <div className="text-[10px] text-zinc-700 dark:text-zinc-300 mt-1">
                              {u.phone}
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                              u.role === "Owner"
                                ? "bg-blue-100 text-blue-800"
                                : u.role === "Manager"
                                  ? "bg-zinc-200 dark:bg-zinc-800 text-black dark:text-zinc-100"
                                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => handleToggleUserStatus(u.id)}
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold cursor-pointer transition-all ${
                              u.isActive
                                ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                                : "bg-red-100 text-red-800 hover:bg-red-200"
                            }`}
                          >
                            {u.isActive ? "Active" : "Deactivated"}
                          </button>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleEditUser(u)}
                            className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded text-[10px] font-bold transition-all cursor-pointer"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeAdminTab === "catalogs" && canEditCore && (
            <div
              className="space-y-6 animate-in fade-in duration-200"
              id="taxonomy-catalogs-view"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-4 border-zinc-200 dark:border-zinc-800">
                <div>
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">
                    Dynamic Catalog Management
                  </h2>
                  <p className="text-xs text-zinc-700 dark:text-zinc-300 mt-0.5">
                    Add, modify, and delete locations, property types, and
                    features. All modifications will sync to filters and setup
                    forms instantly.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Location catalog board */}
                <div className="bg-white dark:bg-zinc-950 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col h-[480px]">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-[#DC2626]" /> Locations
                  </h3>
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      placeholder="e.g. Kazanchis, CMC"
                      id="new-loc-input"
                      className="flex-1 p-2.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 font-semibold outline-none focus:ring-1 focus:ring-red-600"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const val = (
                            e.target as HTMLInputElement
                          ).value.trim();
                          if (val && !allLocations.includes(val)) {
                            setAllLocations([...allLocations, val]);
                            logActivity(
                              "system",
                              `Added dynamic location: "${val}"`,
                            );
                            (e.target as HTMLInputElement).value = "";
                          }
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        const inp = document.getElementById(
                          "new-loc-input",
                        ) as HTMLInputElement;
                        const val = inp?.value.trim();
                        if (val) {
                          if (!allLocations.includes(val)) {
                            setAllLocations([...allLocations, val]);
                            logActivity(
                              "system",
                              `Added dynamic location: "${val}"`,
                            );
                            inp.value = "";
                          }
                        }
                      }}
                      className="bg-[#DC2626] text-white px-3 py-2 text-xs font-bold rounded-lg hover:bg-red-700 transition cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-1.5 scrollbar-none pr-1">
                    {allLocations.map((item) => (
                      <div
                        key={item}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition"
                      >
                        <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                          {item}
                        </span>
                        <button
                          onClick={() => {
                            setAllLocations(
                              allLocations.filter((x) => x !== item),
                            );
                            logActivity(
                              "system",
                              `Deleted dynamic location: "${item}"`,
                            );
                          }}
                          className="text-zinc-500 hover:text-[#DC2626] dark:text-zinc-400 dark:hover:text-red-500 p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/30 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    {allLocations.length === 0 && (
                      <p className="text-[11px] text-zinc-700 dark:text-zinc-400 font-medium py-10 text-center">
                        No locations added yet.
                      </p>
                    )}
                  </div>
                </div>

                {/* Property Type catalog board */}
                <div className="bg-white dark:bg-zinc-950 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col h-[480px]">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 mb-3">
                    <Building2 className="w-4 h-4 text-[#DC2626]" /> Property
                    Types
                  </h3>
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      placeholder="e.g. Modern Penthouse"
                      id="new-type-input"
                      className="flex-1 p-2.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 font-semibold outline-none focus:ring-1 focus:ring-[#DC2626]"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const val = (
                            e.target as HTMLInputElement
                          ).value.trim();
                          if (val && !allTypes.includes(val)) {
                            setAllTypes([...allTypes, val]);
                            logActivity(
                              "system",
                              `Added dynamic property type: "${val}"`,
                            );
                            (e.target as HTMLInputElement).value = "";
                          }
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        const inp = document.getElementById(
                          "new-type-input",
                        ) as HTMLInputElement;
                        const val = inp?.value.trim();
                        if (val) {
                          if (!allTypes.includes(val)) {
                            setAllTypes([...allTypes, val]);
                            logActivity(
                              "system",
                              `Added dynamic property type: "${val}"`,
                            );
                            inp.value = "";
                          }
                        }
                      }}
                      className="bg-[#DC2626] text-white px-3 py-2 text-xs font-bold rounded-lg hover:bg-red-700 transition cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-1.5 scrollbar-none pr-1">
                    {allTypes.map((item) => (
                      <div
                        key={item}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition"
                      >
                        <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                          {item}
                        </span>
                        <button
                          onClick={() => {
                            setAllTypes(allTypes.filter((x) => x !== item));
                            logActivity(
                              "system",
                              `Deleted dynamic property type: "${item}"`,
                            );
                          }}
                          className="text-zinc-500 hover:text-[#DC2626] dark:text-zinc-400 dark:hover:text-red-500 p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/30 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    {allTypes.length === 0 && (
                      <p className="text-[11px] text-zinc-700 dark:text-zinc-400 font-medium py-10 text-center">
                        No property types added yet.
                      </p>
                    )}
                  </div>
                </div>

                {/* Amenities catalog board */}
                <div className="bg-white dark:bg-zinc-950 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col h-[480px]">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 mb-3">
                    <Star className="w-4 h-4 text-[#DC2626]" /> Executive Services & Infrastructure
                  </h3>
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      placeholder="e.g. High-Speed Gym, Spa"
                      id="new-amenity-input"
                      className="flex-1 p-2.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 font-semibold outline-none focus:ring-1 focus:ring-[#DC2626]"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const val = (
                            e.target as HTMLInputElement
                          ).value.trim();
                          if (val && !allAmenities.includes(val)) {
                            setAllAmenities([...allAmenities, val]);
                            logActivity(
                              "system",
                              `Added dynamic amenity: "${val}"`,
                            );
                            (e.target as HTMLInputElement).value = "";
                          }
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        const inp = document.getElementById(
                          "new-amenity-input",
                        ) as HTMLInputElement;
                        const val = inp?.value.trim();
                        if (val) {
                          if (!allAmenities.includes(val)) {
                            setAllAmenities([...allAmenities, val]);
                            logActivity(
                              "system",
                              `Added dynamic amenity: "${val}"`,
                            );
                            inp.value = "";
                          }
                        }
                      }}
                      className="bg-[#DC2626] text-white px-3 py-2 text-xs font-bold rounded-lg hover:bg-red-700 transition cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-1.5 scrollbar-none pr-1">
                    {allAmenities.map((item) => (
                      <div
                        key={item}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition"
                      >
                        <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-300">
                          {item}
                        </span>
                        <button
                          onClick={() => {
                            setAllAmenities(
                              allAmenities.filter((x) => x !== item),
                            );
                            logActivity(
                              "system",
                              `Deleted dynamic amenity: "${item}"`,
                            );
                          }}
                          className="text-zinc-600 hover:text-[#DC2626] dark:text-zinc-400 dark:hover:text-red-500 p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/30 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    {allAmenities.length === 0 && (
                      <p className="text-[11px] text-zinc-700 dark:text-zinc-400 font-medium py-10 text-center">
                        No amenities added yet.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
