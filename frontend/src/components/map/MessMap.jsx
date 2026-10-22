"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useMessMate } from "@/context/MessMateContext";
import { 
  getGoogleMapsDirectionsUrl, 
  calculateDistanceKm 
} from "@/lib/location";
import { 
  Star, 
  MapPin, 
  Navigation, 
  Compass, 
  Layers, 
  ExternalLink, 
  Loader2,
  CheckCircle2,
  Car
} from "lucide-react";

// Helper component that can use Leaflet's useMap hook to pan/fly
function MapController({ selectedMess, userLocation, triggerRecenter, MapComponents }) {
  const { useMap } = MapComponents;
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    if (selectedMess && selectedMess.latitude && selectedMess.longitude) {
      map.flyTo([selectedMess.latitude, selectedMess.longitude], 15, {
        animate: true,
        duration: 1.2
      });
    }
  }, [selectedMess, map]);

  useEffect(() => {
    if (!map) return;
    if (triggerRecenter) {
      if (userLocation && userLocation.lat && userLocation.lng) {
        map.flyTo([userLocation.lat, userLocation.lng], 14, {
          animate: true,
          duration: 1
        });
      }
    }
  }, [triggerRecenter, map, userLocation]);

  return null;
}

export default function MessMap({ messes = [], selectedMessId = null, onSelectMess = () => {} }) {
  const { 
    userLocation, 
    detectUserLocation, 
    isDetectingLocation, 
    googleMapsApiKey,
    showToast 
  } = useMessMate();

  const [mounted, setMounted] = useState(false);
  const [MapComponents, setMapComponents] = useState(null);
  const [LInstance, setLInstance] = useState(null);
  const [mapStyle, setMapStyle] = useState("streets"); // "streets" | "satellite" | "voyager"
  const [recenterCount, setRecenterCount] = useState(0);

  useEffect(() => {
    // Dynamically load react-leaflet and leaflet on client side only
    Promise.all([
      import("react-leaflet"),
      import("leaflet")
    ]).then(([ReactLeaflet, L]) => {
      // Fix default marker icon issue by defining clean SVG icons
      delete L.Icon.Default.prototype._getIconUrl;

      setLInstance(L);
      setMapComponents({
        MapContainer: ReactLeaflet.MapContainer,
        TileLayer: ReactLeaflet.TileLayer,
        Marker: ReactLeaflet.Marker,
        Popup: ReactLeaflet.Popup,
        useMap: ReactLeaflet.useMap,
      });
      setMounted(true);
    });
  }, []);

  // Create crisp SVG DivIcons for Leaflet (100% immune to missing image/404 bugs)
  const createMessPin = (mess, isSelected = false) => {
    if (!LInstance) return null;

    let color = "#059669"; // Emerald for pure veg
    let badgeText = "Veg";
    if (mess.diet_type === "jain") {
      color = "#d97706"; // Amber
      badgeText = "Jain";
    } else if (mess.diet_type === "both") {
      color = "#1e293b"; // Slate / Navy
      badgeText = "All";
    }

    const pinSize = isSelected ? 44 : 36;
    const pulseHtml = isSelected
      ? `<span class="absolute -inset-2 rounded-full animate-ping opacity-60" style="background-color: ${color};"></span>`
      : "";

    const html = `
      <div class="relative flex flex-col items-center group cursor-pointer" style="width: ${pinSize}px; height: ${pinSize + 16}px;">
        ${pulseHtml}
        <div class="relative flex items-center justify-center rounded-2xl shadow-xl transition-transform duration-300 group-hover:scale-110"
             style="background-color: ${color}; width: ${pinSize}px; height: ${pinSize}px; border: 2.5px solid #ffffff; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);">
          <svg xmlns="http://www.w3.org/2000/svg" width="${isSelected ? 22 : 18}" height="${isSelected ? 22 : 18}" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
        <div class="px-1.5 py-0.5 rounded-full text-[9px] font-black text-white shadow-md -mt-1 z-10 uppercase tracking-tighter"
             style="background-color: #0f172a; border: 1px solid rgba(255,255,255,0.4);">
          ★ ${mess.average_rating || 4.5}
        </div>
      </div>
    `;

    return LInstance.divIcon({
      className: "custom-map-pin",
      html,
      iconSize: [pinSize, pinSize + 16],
      iconAnchor: [pinSize / 2, pinSize + 12],
      popupAnchor: [0, -(pinSize + 8)],
    });
  };

  // User live location GPS pin
  const createUserLocationPin = () => {
    if (!LInstance) return null;

    const html = `
      <div class="relative flex items-center justify-center cursor-pointer" style="width: 36px; height: 36px;">
        <span class="absolute inline-flex h-9 w-9 rounded-full bg-blue-500 opacity-60 animate-ping"></span>
        <span class="absolute inline-flex h-6 w-6 rounded-full bg-blue-400 opacity-40 animate-pulse"></span>
        <div class="relative w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center text-white">
          <div class="w-2 h-2 bg-white rounded-full"></div>
        </div>
      </div>
    `;

    return LInstance.divIcon({
      className: "custom-user-pin",
      html,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      popupAnchor: [0, -18],
    });
  };

  const handleLocateMe = async () => {
    try {
      await detectUserLocation();
      setRecenterCount(prev => prev + 1);
    } catch (e) {
      console.warn("GPS trigger:", e);
    }
  };

  if (!mounted || !MapComponents || !LInstance) {
    return (
      <div className="w-full h-full min-h-[420px] bg-slate-100 rounded-3xl flex flex-col items-center justify-center border border-slate-200 p-6 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center animate-bounce">
          <MapPin className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-bold text-slate-800 text-sm">Initializing Location Dashboard...</h4>
          <p className="text-xs text-slate-500 mt-1">
            Loading Google Maps Location Services & OpenStreetMap layers
          </p>
        </div>
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker, Popup } = MapComponents;

  // Selected mess object
  const selectedMess = messes.find(m => m.id === selectedMessId);

  // Center on user location or first mess or Pune FC Road default
  const defaultCenter = userLocation?.lat && userLocation?.lng
    ? [userLocation.lat, userLocation.lng]
    : messes.length > 0
    ? [messes[0].latitude, messes[0].longitude]
    : [18.5236, 73.8415];

  // Map Tile Layers
  const tileUrls = {
    streets: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    voyager: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  };

  const tileAttributions = {
    streets: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    voyager: '&copy; <a href="https://carto.com/">CARTO</a> & OpenStreetMap',
    satellite: 'Tiles &copy; Esri, Maxar, Earthstar Geographics',
  };

  return (
    <div className="w-full h-full min-h-[440px] rounded-3xl overflow-hidden border border-slate-200 shadow-soft-lg flex flex-col bg-white relative">
      
      {/* ================= LOCATION DASHBOARD TOP CONTROLS ================= */}
      <div className="bg-white/95 backdrop-blur-md px-4 py-3 border-b border-slate-200 z-20 flex flex-wrap items-center justify-between gap-2.5">
        
        {/* Left: Location Pin Title & Status */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-emerald-glow shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xs text-navy-900 tracking-tight">Location Dashboard</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-2.5 h-2.5" />
                Live Map
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium truncate max-w-[200px] sm:max-w-xs">
              📍 {userLocation?.name || "Pune Campuses"}
            </p>
          </div>
        </div>

        {/* Right: GPS Locate Me & Map Layer Switcher */}
        <div className="flex items-center gap-1.5">
          {/* GPS Locate Me Button */}
          <button
            type="button"
            onClick={handleLocateMe}
            disabled={isDetectingLocation}
            title="Detect My Live Location via GPS"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isDetectingLocation ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Navigation className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">
              {isDetectingLocation ? "Locating..." : "Locate Me"}
            </span>
          </button>

          {/* Recenter Button */}
          <button
            type="button"
            onClick={() => setRecenterCount(c => c + 1)}
            title="Recenter Map View"
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Compass className="w-4 h-4" />
          </button>

          {/* Map Layer Style Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-[11px] font-semibold text-slate-600">
            <button
              type="button"
              onClick={() => setMapStyle("streets")}
              className={`px-2 py-1 rounded-lg transition-all ${
                mapStyle === "streets" ? "bg-white text-navy-900 shadow-xs font-bold" : "hover:text-navy-900"
              }`}
            >
              Street
            </button>
            <button
              type="button"
              onClick={() => setMapStyle("voyager")}
              className={`px-2 py-1 rounded-lg transition-all ${
                mapStyle === "voyager" ? "bg-white text-navy-900 shadow-xs font-bold" : "hover:text-navy-900"
              }`}
            >
              Clean
            </button>
            <button
              type="button"
              onClick={() => setMapStyle("satellite")}
              className={`px-2 py-1 rounded-lg transition-all ${
                mapStyle === "satellite" ? "bg-white text-navy-900 shadow-xs font-bold" : "hover:text-navy-900"
              }`}
            >
              Satellite
            </button>
          </div>
        </div>
      </div>

      {/* ================= LEAFLET / GOOGLE MAP CONTAINER ================= */}
      <div className="relative flex-1 w-full min-h-[380px]">
        <MapContainer
          center={defaultCenter}
          zoom={13}
          scrollWheelZoom={false}
          className="w-full h-full min-h-[380px]"
        >
          <TileLayer
            key={mapStyle}
            attribution={tileAttributions[mapStyle]}
            url={tileUrls[mapStyle]}
          />

          {/* Smooth auto-panning controller */}
          <MapController
            selectedMess={selectedMess}
            userLocation={userLocation}
            triggerRecenter={recenterCount}
            MapComponents={MapComponents}
          />

          {/* User Live GPS Location Marker */}
          {userLocation?.lat && userLocation?.lng && (
            <Marker
              position={[userLocation.lat, userLocation.lng]}
              icon={createUserLocationPin()}
            >
              <Popup className="mess-map-popup">
                <div className="p-2 text-center">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 mx-auto flex items-center justify-center mb-1">
                    <Navigation className="w-4 h-4" />
                  </div>
                  <h4 className="font-extrabold text-navy-900 text-xs">Your Current Location</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">{userLocation.name}</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Mess Location Markers */}
          {messes.map((mess) => {
            const isSelected = selectedMessId === mess.id;
            const distance = calculateDistanceKm(
              userLocation?.lat,
              userLocation?.lng,
              mess.latitude,
              mess.longitude
            );
            const directionsUrl = getGoogleMapsDirectionsUrl({
              destinationLat: mess.latitude,
              destinationLng: mess.longitude,
              destinationName: mess.name,
              originLat: userLocation?.lat,
              originLng: userLocation?.lng,
            });

            return (
              <Marker
                key={mess.id}
                position={[mess.latitude, mess.longitude]}
                icon={createMessPin(mess, isSelected)}
                zIndexOffset={isSelected ? 1000 : 100}
                eventHandlers={{
                  click: () => onSelectMess(mess.id),
                }}
              >
                <Popup className="mess-map-popup">
                  <div className="p-1 max-w-[240px]">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div>
                        <h4 className="font-bold text-navy-900 text-sm leading-tight hover:text-emerald-700">
                          {mess.name}
                        </h4>
                        <span className="text-[10px] font-semibold text-emerald-600 block mt-0.5">
                          {mess.diet_type === "veg" ? "Pure Veg" : mess.diet_type === "jain" ? "100% Jain" : "Veg & Non-Veg"}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5 text-xs font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200 shrink-0">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        <span>{mess.average_rating || 4.5}</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 line-clamp-1 mb-2 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{mess.address}</span>
                    </p>

                    {distance !== null && (
                      <div className="mb-2 px-2 py-1 rounded-lg bg-emerald-50/80 border border-emerald-100 flex items-center justify-between text-[11px]">
                        <span className="text-slate-600 font-medium">Distance from you:</span>
                        <span className="font-extrabold text-emerald-700">{distance} km</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs gap-2">
                      <div>
                        <span className="font-bold text-navy-900 text-sm">₹{mess.monthly_price}</span>
                        <span className="text-[10px] text-slate-500">/mo</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <a
                          href={directionsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Open directions in Google Maps"
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors flex items-center"
                        >
                          <Car className="w-3.5 h-3.5" />
                        </a>
                        <Link
                          href={`/messes/${mess.id}`}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] transition-colors shadow-xs"
                        >
                          View Menu
                        </Link>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Floating Google Maps API Integration Badge at bottom */}
        <div className="absolute bottom-3 left-3 z-20 pointer-events-auto">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/90 backdrop-blur-md border border-slate-200 text-[10px] font-semibold text-slate-600 shadow-soft-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Google Location API</span>
            <span className="text-slate-400 font-mono text-[9px]">
              {googleMapsApiKey ? `(${googleMapsApiKey.substring(0, 10)}...)` : "(Active)"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
