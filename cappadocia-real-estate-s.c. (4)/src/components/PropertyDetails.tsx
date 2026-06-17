import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Bed, 
  Bath, 
  Maximize, 
  Calendar, 
  MapPin, 
  Map,
  Send, 
  Check, 
  Compass,
  ChevronLeft,
  ChevronRight,
  Building,
  Layers
} from 'lucide-react';
import { Property, InquiryMessage, ContactButtonSettings } from '../types';

interface PropertyDetailsProps {
  property: Property;
  onBack: () => void;
  onInquire: (inquiry: Omit<InquiryMessage, 'id' | 'date' | 'status'>) => void;
  isDarkMode: boolean;
  allAmenities?: string[];
  contactButtonSettings?: ContactButtonSettings; // NEW
}

export default function PropertyDetails({ 
  property, 
  onBack, 
  onInquire, 
  isDarkMode, 
  allAmenities = [],
  contactButtonSettings = { action: 'both', linkUrl: '', linkLabel: 'Request Callback' } // default
}: PropertyDetailsProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeRoomName, setActiveRoomName] = useState(property.virtualTour.rooms[0]?.name || '');
  const [tourPanning, setTourPanning] = useState(0);
  const [isDraggingTour, setIsDraggingTour] = useState(false);
  const startDragX = useRef(0);
  const currentTourVal = useRef(0);

  // Inquiry form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState(`I am interested in ${property.title} in ${property.location}. Please provide pricing structures and digital milestones details.`);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Image slider navigation
  const allImages = [property.featuredImage, ...property.galleryImages];

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  // Virtual Tour Drag-to-Pan Handlers
  const handleTourMouseDown = (e: React.MouseEvent) => {
    setIsDraggingTour(true);
    startDragX.current = e.clientX;
    currentTourVal.current = tourPanning;
  };

  const handleTourMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingTour) return;
    const deltaX = e.clientX - startDragX.current;
    const newPan = (currentTourVal.current + deltaX * 0.5) % 360;
    setTourPanning(newPan);
  };

  const handleTourMouseUp = () => {
    setIsDraggingTour(false);
  };

  const handleTourTouchStart = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      setIsDraggingTour(true);
      startDragX.current = e.touches[0].clientX;
      currentTourVal.current = tourPanning;
    }
  };

  const handleTourTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingTour || !e.touches[0]) return;
    const deltaX = e.touches[0].clientX - startDragX.current;
    const newPan = (currentTourVal.current + deltaX * 0.5) % 360;
    setTourPanning(newPan);
  };

  const handleTourTouchEnd = () => {
    setIsDraggingTour(false);
  };

  const activeRoom = property.virtualTour.rooms.find(r => r.name === activeRoomName) || property.virtualTour.rooms[0];

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !phone) return;

    // Always send the inquiry message (if action includes send)
    if (contactButtonSettings.action === 'send_message' || contactButtonSettings.action === 'both') {
      onInquire({
        fullName,
        email,
        phone,
        propertyTitle: property.title,
        message,
      });
      setIsSubmitted(true);
      // Reset form after a short delay
      setTimeout(() => {
        setIsSubmitted(false);
        setFullName('');
        setEmail('');
        setPhone('');
      }, 4000);
    }

    // If action includes open_link, open the link after submission (or immediately if only open_link)
    if (contactButtonSettings.action === 'open_link' || contactButtonSettings.action === 'both') {
      if (contactButtonSettings.linkUrl) {
        // Open in new tab
        window.open(contactButtonSettings.linkUrl, '_blank', 'noreferrer');
      }
    }
  };

  // Determine button label
  const buttonLabel = contactButtonSettings.linkLabel || 'Request Callback';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      id="property-detail-view"
    >
      {/* Back Button to list */}
      <button 
        onClick={onBack}
        id="detail-back-button"
        className={`inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${'bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-black dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800'
        }`}
      >
        <ArrowLeft className="w-4 h-4 text-red-600" />
        Back to Listings
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Gallery, Specs, Tour */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Main Visual Carousel with Overlay */}
          <div className="relative aspect-video rounded-2xl overflow-hidden shadow-sm border border-zinc-200 dark:border-zinc-800  group" id="detail-carousel">
            <img 
              src={allImages[activeImageIndex]} 
              alt={property.title} 
              className="w-full h-full object-cover select-none transition-all duration-300 transform scale-100"
              referrerPolicy="no-referrer"
            />
            
            {allImages.length > 1 && (
              <>
                <button 
                  onClick={handlePrevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black dark:bg-zinc-50/40 text-white dark:text-zinc-100 hover:bg-black dark:bg-zinc-50/70 backdrop-blur-xs transition cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button 
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black dark:bg-zinc-50/40 text-white dark:text-zinc-100 hover:bg-black dark:bg-zinc-50/70 backdrop-blur-xs transition cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            <div className="absolute bottom-4 right-4 bg-black dark:bg-zinc-50/70 text-white dark:text-zinc-100 px-3 py-1 rounded-md text-xs font-mono font-medium">
              {activeImageIndex + 1} / {allImages.length}
            </div>

            <div className="absolute top-4 left-4 bg-red-600 text-white dark:text-zinc-100 text-xs tracking-wider uppercase font-bold px-3 py-1 rounded-md shadow-sm">
              {property.status}
            </div>
          </div>

          {/* Thumbnail Strip */}
          <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none select-none">
            {allImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`relative w-24 h-16 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer border-2 transition-all ${
                  idx === activeImageIndex ? 'border-blue-600 scale-95' : 'border-transparent hover:border-black dark:border-zinc-700/30'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </button>
            ))}
          </div>

          {/* Title and Base Specs */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-xs uppercase font-semibold tracking-widest ${'text-blue-700'}`}>
                    {property.type}
                  </span>
                </div>
                <h1 className={`text-2xl sm:text-3xl font-bold font-serif tracking-tight mt-1 ${'text-black dark:text-zinc-100'}`}>
                  {property.title}
                </h1>
                <div className="flex items-center gap-2 mt-2 text-zinc-600 dark:text-zinc-400">
                  <MapPin className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span className="text-sm font-medium">{property.location}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-zinc-500 dark:text-zinc-400 uppercase font-bold tracking-widest block">Investment Value</span>
                <span className="text-xl sm:text-3xl font-black font-mono text-red-600 block mt-1">
                  ETB {property.price.toLocaleString()}
                </span>
                <span className="text-xs text-zinc-600 dark:text-zinc-400 font-medium block">
                  ~{(property.price / 125).toLocaleString('en-US', { maximumFractionDigits: 0, style: 'currency', currency: 'USD' })} USD Equivalent
                </span>
              </div>
            </div>

            <div className={`grid grid-cols-2 gap-4 p-5 rounded-xl border ${ 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-800'
            }`}>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                  <Maximize className="w-4 h-4 text-black dark:text-zinc-100" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Total Area</span>
                </div>
                <p className="text-lg font-bold font-mono pl-6">{property.areaSqm} sqm</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                  <Calendar className="w-4 h-4 text-black dark:text-zinc-100" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Built Date</span>
                </div>
                <p className="text-lg font-bold font-mono pl-6">{property.yearBuilt}</p>
              </div>
            </div>
          </div>

          {/* Detailed Description */}
          <div className="space-y-3">
            <h3 className={`text-lg font-bold font-serif ${'text-black dark:text-zinc-100'}`}>
              Architectural Overview & Layout
            </h3>
            <p className={`text-sm leading-relaxed ${'text-zinc-700 dark:text-zinc-300'}`}>
              {property.description}
            </p>
            <div className="pt-2 flex flex-wrap gap-2">
              <span className={`text-xs font-mono px-2.5 py-1 rounded border ${'bg-zinc-200 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200'
              }`}>
                Construction: <strong className="text-red-600 font-bold">{property.constructionStatus || 'N/A'}</strong>
              </span>
              <span className={`text-xs font-mono px-2.5 py-1 rounded border ${'bg-zinc-200 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200'
              }`}>
                Floors: <strong className="font-bold">{property.floorsCount || 'N/A'}</strong>
              </span>
              <span className={`text-xs font-mono px-2.5 py-1 rounded border ${'bg-zinc-200 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200'
              }`}>
                Units: <strong className="font-bold">{property.unitsCount || 'N/A'}</strong>
              </span>
              <span className={`text-xs font-mono px-2.5 py-1 rounded border ${'bg-zinc-200 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200'
              }`}>
                Year: <strong>{property.yearBuilt}</strong>
              </span>
              <span className={`text-xs font-mono px-2.5 py-1 rounded border ${ 'bg-zinc-200 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200'
              }`}>
                Listing: <strong className="text-blue-600 font-bold">{property.availability}</strong>
              </span>
            </div>
          </div>

          {/* Overall Construction Progress */}
          <div className="space-y-4 pt-3 pb-2">
            <h3 className={`text-lg font-bold font-serif ${'text-black dark:text-zinc-100'}`}>
              Construction Progress
            </h3>
            <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
              <div className="flex justify-between text-xs font-mono font-semibold text-zinc-600 dark:text-zinc-400 mb-2">
                <span>Status: <strong className="text-red-600 dark:text-red-400 uppercase">{property.constructionStatus || 'N/A'}</strong></span>
                <span className="text-red-600 dark:text-red-400 font-bold">{property.completionPercentage ?? 0}%</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-600 dark:bg-red-500 rounded-full transition-all duration-500"
                  style={{ width: `${property.completionPercentage ?? 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* Detailed Rooms & Units Overview */}
          {(property.unitsInfo && property.unitsInfo.length > 0) && (
            <div className="space-y-6 pt-3 pb-2 border-t border-zinc-200 dark:border-zinc-800 mt-4">
              <h3 className={`text-lg font-bold font-serif ${'text-black dark:text-zinc-100'}`}>
                Detailed Units Overview
              </h3>
              
              {property.unitsInfo && property.unitsInfo.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">Available Unit Layouts</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {property.unitsInfo.map((unit) => (
                      <div key={unit.id} className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm relative overflow-hidden transition-all hover:border-red-600/30">
                        <h5 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-3">{unit.name}</h5>
                        <div className="grid grid-cols-3 gap-2 border-t border-zinc-100 dark:border-zinc-800 pt-3">
                          <div className="text-center">
                            <span className="text-[9px] uppercase tracking-wider text-zinc-500 block mb-1">Beds</span>
                            <span className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200 flex items-center justify-center gap-1"><Bed className="w-3 h-3 text-red-600"/>{unit.bedrooms}</span>
                          </div>
                          <div className="text-center border-l border-zinc-100 dark:border-zinc-800">
                            <span className="text-[9px] uppercase tracking-wider text-zinc-500 block mb-1">Baths</span>
                            <span className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200 flex items-center justify-center gap-1"><Bath className="w-3 h-3 text-red-600"/>{unit.bathrooms}</span>
                          </div>
                          <div className="text-center border-l border-zinc-100 dark:border-zinc-800">
                            <span className="text-[9px] uppercase tracking-wider text-zinc-500 block mb-1">Area</span>
                            <span className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200 flex items-center justify-center gap-1"><Maximize className="w-3 h-3 text-red-600"/>{unit.areaSqm}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {property.amenities && property.amenities.filter(a => allAmenities?.includes(a)).length > 0 && (
            <div className="space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#DC2626] font-mono block">
              Executive Services & Infrastructure
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {property.amenities.filter(a => allAmenities?.includes(a)).map((amenity, idx) => {
                return (
                  <div 
                    key={idx} 
                    className="flex items-center gap-3 p-3 rounded-xl border border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/20 text-zinc-900 dark:text-white transition-all duration-300 shadow-xs"
                  >
                    <div className="p-1 rounded-md bg-[#DC2626] text-white">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-semibold">
                      {amenity}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          )}

          {/* Google Maps Location */}
          <div className="p-6 rounded-2xl border space-y-4 bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-800" id="detail-verified-map-location">
            <div>
              <h3 className="text-sm tracking-wider uppercase font-extrabold flex items-center gap-2 text-red-600 dark:text-red-500">
                <Map className="w-4 h-4" />
                Google Maps Location
              </h3>
              <p className="text-xs text-zinc-700 dark:text-zinc-400 mt-1 leading-relaxed">
                Explore the exact location and surrounding prime neighborhood of <strong>{property.title}</strong> in <strong>{property.subCity}</strong>, Addis Ababa.
              </p>
            </div>
            <div className="w-full aspect-[21/9] sm:aspect-[21/7] rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-200 dark:bg-zinc-900 shadow-sm relative z-10">
              <iframe 
                className="absolute inset-0 w-full h-full border-0"
                src={
                  (() => {
                    let url = property.mapEmbedUrl;
                    if (!url) {
                      return `https://maps.google.com/maps?q=${encodeURIComponent(property.title + ", " + property.subCity + ", Addis Ababa")}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
                    }
                    if (url.includes('<iframe')) {
                      const match = url.match(/src="([^"]+)"/);
                      if (match) url = match[1];
                    }
                    if (url.includes('google.com/maps') && !url.includes('embed')) {
                      const qMatch = url.match(/q=([^&]+)/) || url.match(/place\/([^/]+)/);
                      if (qMatch) {
                        return `https://maps.google.com/maps?q=${qMatch[1]}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
                      }
                    }
                    if (!url.startsWith('http')) {
                      return `https://maps.google.com/maps?q=${encodeURIComponent(url + ", Addis Ababa")}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
                    }
                    return url;
                  })()
                } 
                title="Google Maps Location" 
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer"
              ></iframe>
            </div>
          </div>

          {/* Embedded Video Tour */}
          {property.videoTourUrl && (
            <div className={`p-6 rounded-2xl border space-y-4 ${'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-800'}`}>
              <div>
                <h3 className={`text-lg font-bold font-serif flex items-center gap-2 ${'text-black dark:text-zinc-100'}`}>
                  <Maximize className="w-5 h-5 text-red-600" />
                  Realistic Video Walkthrough
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Full 4K resolution remote property viewing video.
                </p>
              </div>
              <div className="w-full aspect-video rounded-xl overflow-hidden shadow-md">
                <iframe 
                  className="w-full h-full"
                  src={
                    property.videoTourUrl.includes('watch?v=') 
                      ? property.videoTourUrl.replace('watch?v=', 'embed/') 
                      : property.videoTourUrl
                  } 
                  title="Property Video Tour" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          )}

          {/* Interactive Virtual Staged 3D Tour */}
          {property.virtualTour && property.virtualTour.rooms.length > 0 && (
            <div className={`p-6 rounded-2xl border space-y-4 ${'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-800'
            }`} id="virtual-tour-module">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className={`text-lg font-bold font-serif flex items-center gap-2 ${'text-black dark:text-zinc-100'}`}>
                    <Compass className="w-5 h-5 text-red-600" />
                    Interactive Virtual Tour S.C.
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Staged 3D Panorama Environment. Click and drag or touch-pan inside the viewer.
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {property.virtualTour.rooms.map((room) => (
                    <button
                      key={room.name}
                      onClick={() => setActiveRoomName(room.name)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-md cursor-pointer transition ${
                        activeRoomName === room.name 
                          ? 'bg-red-600 text-white dark:text-zinc-100' 
                          : 'bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-black dark:text-zinc-100'
                      }`}
                    >
                      {room.name}
                    </button>
                  ))}
                </div>
              </div>

              <div 
                onMouseDown={handleTourMouseDown}
                onMouseMove={handleTourMouseMove}
                onMouseUp={handleTourMouseUp}
                onMouseLeave={handleTourMouseUp}
                onTouchStart={handleTourTouchStart}
                onTouchMove={handleTourTouchMove}
                onTouchEnd={handleTourTouchEnd}
                className="relative aspect-video rounded-xl overflow-hidden bg-black dark:bg-zinc-50 select-none cursor-grab active:cursor-grabbing border border-black dark:border-zinc-700/30"
              >
                <div 
                  className="absolute inset-0 w-[240%] h-full transition-transform duration-75 ease-out"
                  style={{ 
                    backgroundImage: `url(${activeRoom.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    transform: `translateX(${-25 + (tourPanning / 3.6)}%)` 
                  }}
                />

                <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/50 via-transparent to-black/30" />

                <div className="absolute top-4 left-4 bg-black dark:bg-zinc-50/75 backdrop-blur-xs text-white dark:text-zinc-100 px-3 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                  Viewing: {activeRoom.name}
                </div>

                <div className="absolute bottom-4 left-4 bg-black dark:bg-zinc-50/60 text-zinc-500 dark:text-zinc-400 px-3 py-1 rounded text-[10px] font-mono">
                   Drag side-to-side to inspect the layout structure
                </div>

                <AnimatePresence mode="popLayout">
                  {activeRoom.hotspots.map((hotspot, hIdx) => {
                    const basisX = hotspot.x + (tourPanning * 0.15);
                    const wrappedX = basisX < 5 ? 5 : basisX > 95 ? 95 : basisX;

                    return (
                      <motion.button
                        key={hIdx}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveRoomName(hotspot.targetRoom);
                        }}
                        style={{ left: `${wrappedX}%`, top: `${hotspot.y}%` }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-full bg-red-600/90 text-white dark:text-zinc-100 flex items-center justify-center border-4 border-white shadow-lg animate-bounce duration-1000">
                          <Compass className="w-4 h-4 animate-spin-slow" />
                        </div>
                        <div className="mt-1.5 opacity-90 scale-95 group-hover:opacity-100 group-hover:scale-100 bg-black dark:bg-zinc-50 text-white dark:text-zinc-100 text-[10px] sm:text-xs font-medium px-2 py-1 rounded shadow-sm border border-zinc-200 dark:border-zinc-800 max-w-40 text-center uppercase whitespace-pre-wrap transition">
                          {hotspot.text}
                        </div>
                      </motion.button>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Action Inquiry Form Side Panel */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
          <div className={`p-6 rounded-2xl border shadow-sm ${'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'
          }`}>
            <div className="border-b border-zinc-200 dark:border-zinc-800  pb-4 mb-4">
              <h3 className={`font-serif font-bold text-lg ${'text-black dark:text-zinc-100'}`}>
                Secure This Estate
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                 Cappadocia VIP concierge and sales managers will contact you within 2 hours.
              </p>
            </div>

            {isSubmitted && (contactButtonSettings.action === 'send_message' || contactButtonSettings.action === 'both') ? (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 text-center text-blue-500 text-xs font-medium space-y-2"
              >
                <div className="w-10 h-10 rounded-full bg-blue-500 text-white dark:text-zinc-100 flex items-center justify-center mx-auto">
                  <Check className="w-5 h-5" />
                </div>
                <p className="font-bold">Inquiry Logged Successfully</p>
                <p className="text-[11px] opacity-95 text-zinc-500 dark:text-zinc-400 font-normal">
                  Thank you, {fullName}. Your reference ID is CAP-{Math.floor(Math.random() * 90000 + 10000)}. Our Bole Sales Team will call your phone shortly.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Dawit Samuel"
                    className={`w-full px-3.5 py-2 text-xs rounded-lg border outline-hidden transition ${'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-black dark:text-zinc-100 focus:border-red-600'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. dawit@example.com"
                    className={`w-full px-3.5 py-2 text-xs rounded-lg border outline-hidden transition ${'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-black dark:text-zinc-100 focus:border-red-600'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                    Phone Contact (With Area Code) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +251 911 000000"
                    className={`w-full px-3.5 py-2 text-xs rounded-lg border outline-hidden transition ${'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-black dark:text-zinc-100 focus:border-red-600'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                    Custom Message
                  </label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className={`w-full px-3.5 py-2 text-xs rounded-lg border outline-hidden transition resize-none ${'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-black dark:text-zinc-100 focus:border-red-600'
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-xs font-bold uppercase tracking-wider bg-red-600 hover:bg-red-600 text-white dark:text-zinc-100 transition duration-200 cursor-pointer shadow-md select-none"
                >
                  <Send className="w-3.5 h-3.5" />
                  {buttonLabel}
                </button>
              </form>
            )}
          </div>

          <div className={`p-4 rounded-xl border flex gap-3 text-xs ${'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800'
          }`}>
            <span className="text-red-600 mt-0.5">•</span>
            <p>
              Note: This asset represents Cappadocia's premier line constructions. Investment contracts are secured through authorized ESCROW channels and fully compliant with regional finance laws.
            </p>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
