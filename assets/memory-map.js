const memoryData = [
  {
    "id": 1,
    "title": "Lovers Fest 💕",
    "coordinates": [12.93417794756412, 77.61595810429198],
    "date": "2025-02-16",
    "category": "Lovers Fest",
    "description": "This is where everything started! I was so nervous but you made me feel at ease immediately. I knew you were special from that first smile.",
    "photos": ["1.jpg", "2.jpg"]
  },
  {
    "id": 2,
    "title": "Jamming Goat",
    "coordinates": [12.965428731499749, 77.64177062583153],
    "date": "2025-02-22",
    "category": "Jamming Goat",
    "description": "Starting point of our love story. Turns out to be the best day of my life.",
    "photos": ["3.jpg","4.jpg"]
  },
  {
    "id": 4,
    "title": "Our First movie - Chhava",
    "coordinates": [12.90829251962783, 77.60102548010025],
    "date": "2025-03-03",
    "category": "A cute cafe next to highway",
    "description": "We got bored and came out in the intermission"
  },
  {
    "id": 3,
    "title": "Isckon Temple",
    "coordinates": [13.00982426170265, 77.55113962523774],
    "date": "2025-03-18",
    "category": "Our First temple visit",
    "description": "The moment i prayed for 'us' ",
    "photos": ["5.jpg"]
  },
  {
    "id": 5,
    "title": "Our first bike ride",
    "coordinates": [12.75328498396486, 77.30178316475407],
    "date": "2025-03-23",
    "category": "Sholay Shooting spot",
    "description": "Spontaneous plan turns out to be the best and most exciting. Remember, we stopped at filter cafe on the way?",
    "photos": ["6.jpg"]
  },
  {
    "id": 6,
    "title": "Oia",
    "coordinates": [13.074124807735409, 77.6526407972975],
    "date": "2025-04-05",
    "category": "Utk's Birthday",
    "description": "You wanted to be here since so long. Your smile meant everything to me that day.",
    "photos": ["7.jpg", "8.jpg"]
  },
  {
    "id": 7,
    "title": "Cafe Noir",
    "coordinates": [12.970070211302394, 77.63626500485914],
    "date": "2025-05-04",
    "category": "You were sad",
    "description": "Remember! how much i had to nag you to come here",
    "photos": ["9.jpg"]
  },
  {
    "id": 8,
    "title": "Our last meeting :(",
    "coordinates": [13.199548255221307, 77.70688022298229],
    "date": "2025-05-16",
    "category": "Dropped you at the airport",
    "description": "You've no idea how much i cried after dropping you off",
    "photos": ["10.jpg"]
  },
  {
  "id": 9,
    "title": "Your PG",
    "coordinates": [12.949809409342569, 77.70229935853256],
    "date": "infinite times",
    "category": "PG",
    "description": "I don't even remember how many times i visited you here. Now,I don't even need google maps to reach your location"
  },
  {
  "id": 10,
    "title": "Aroma's Biryani",
    "coordinates": [12.948763930163002, 77.69890705371573],
    "date": "2025-03-05",
    "description": "One of the best biryani place i tried with you",
    "photos": ["12.jpg"]
  }
];

let map;
let currentInfoWindow;
let memoryMarkers = []; // Store marker references
let allMarkers = new Map(); // Cache all markers by ID for reuse
let cachedElements = {}; // Cache DOM elements
let bounceTimeouts = new Map(); // Track bounce animation timeouts

// Initialize the memory map
function initMemoryMap() {
  try {
    console.log("Initializing map with", memoryData.length, "memories");
    
    // Cache DOM elements
    cachedElements.mapSection = document.getElementById('memory-map-section');
    cachedElements.mapDiv = document.getElementById('map');
    
    map = new google.maps.Map(cachedElements.mapDiv, {
      zoom: 11,
      center: { lat: 12.9716, lng: 77.5946 },
      styles: getTaylorSwiftMapStyle()
    });
    
    // Create all markers once and cache them
    createAllMarkers();
    addMapControls();
    
    // Show all markers initially
    showMarkersForCategory('all');
  } catch (error) {
    console.error('Error initializing memory map:', error);
    showError('Unable to load our memories. Please try again later! 💔');
  }
}

// Google Maps callback function
function initMap() {
  initMemoryMap();
}

// Taylor Swift inspired map styling
function getTaylorSwiftMapStyle() {
  return [
    {
      "featureType": "all",
      "elementType": "all",
      "stylers": [
        {"saturation": -20},
        {"lightness": 20}
      ]
    },
    {
      "featureType": "water",
      "elementType": "all",
      "stylers": [
        {"color": "#e6f3ff"},
        {"saturation": 30}
      ]
    },
    {
      "featureType": "landscape",
      "elementType": "all",
      "stylers": [
        {"color": "#faf0e6"},
        {"saturation": 10}
      ]
    },
    {
      "featureType": "road",
      "elementType": "all",
      "stylers": [
        {"color": "#f8d7da"},
        {"saturation": -10}
      ]
    }
  ];
}

// Create all markers once and cache them for reuse
function createAllMarkers() {
  const iconConfig = {
    url: 'assets/heart-pin.png',
    scaledSize: new google.maps.Size(35, 35)
  };
  
  memoryData.forEach(memory => {
    const marker = new google.maps.Marker({
      position: { 
        lat: memory.coordinates[0], 
        lng: memory.coordinates[1] 
      },
      map: null, // Don't add to map initially
      icon: iconConfig,
      title: memory.title,
      animation: google.maps.Animation.DROP
    });
    
    // Add optimized event listeners
    marker.addListener('click', () => showMemoryDetails(map, marker, memory));
    
    // Debounced hover effect
    marker.addListener('mouseover', () => handleMarkerHover(marker));
    
    // Store marker with memory data
    marker.memoryData = memory;
    allMarkers.set(memory.id, marker);
  });
}

// Optimized hover handler with debouncing
function handleMarkerHover(marker) {
  // Clear any existing timeout for this marker
  const existingTimeout = bounceTimeouts.get(marker);
  if (existingTimeout) {
    clearTimeout(existingTimeout);
  }
  
  // Start bounce animation
  marker.setAnimation(google.maps.Animation.BOUNCE);
  
  // Set timeout to stop animation
  const timeout = setTimeout(() => {
    marker.setAnimation(null);
    bounceTimeouts.delete(marker);
  }, 750);
  
  bounceTimeouts.set(marker, timeout);
}

// Show/hide markers based on category (optimized version)
function showMarkersForCategory(category) {
  // Use requestAnimationFrame for smooth transitions
  requestAnimationFrame(() => {
    allMarkers.forEach(marker => {
      const memory = marker.memoryData;
      const shouldShow = category === 'all' || memory.category === category;
      
      // Only change map property if needed
      if (shouldShow && marker.getMap() === null) {
        marker.setMap(map);
      } else if (!shouldShow && marker.getMap() !== null) {
        marker.setMap(null);
      }
    });
  });
}

// Show memory details in popup with lazy loading
function showMemoryDetails(map, marker, memory) {
  if (currentInfoWindow) {
    currentInfoWindow.close();
  }
  
  // Create popup content with lazy-loaded images
  const popupContent = createPopupContent(memory);
  
  currentInfoWindow = new google.maps.InfoWindow({
    content: popupContent,
    maxWidth: 350
  });
  
  currentInfoWindow.open(map, marker);
  
  // Lazy load images after popup opens
  setTimeout(() => lazyLoadPopupImages(), 100);
}

// Create popup content efficiently
function createPopupContent(memory) {
  const parts = [
    '<div class="memory-popup">',
    `<h3>${memory.title}</h3>`,
    `<div class="date">${formatDate(memory.date)}</div>`,
    `<p>${memory.description}</p>`
  ];
  
  // Add photo placeholders for lazy loading
  if (memory.photos && memory.photos.length > 0) {
    memory.photos.forEach(photo => {
      parts.push(`<img data-src="assets/memory-photos/${photo}" alt="Memory photo" class="lazy-image" style="display:none;" onerror="this.style.display='none'">`);
    });
  }
  
  // Add audio if exists
  if (memory.audioNote) {
    parts.push(`
      <audio controls>
        <source src="assets/memory-notes/${memory.audioNote}" type="audio/mpeg">
        Your browser doesn't support audio playback 💔
      </audio>`);
  }
  
  parts.push('</div>');
  return parts.join('');
}

// Lazy load images in popup
function lazyLoadPopupImages() {
  const lazyImages = document.querySelectorAll('.lazy-image');
  lazyImages.forEach(img => {
    if (img.dataset.src) {
      img.src = img.dataset.src;
      img.style.display = 'block';
      img.classList.remove('lazy-image');
      delete img.dataset.src;
    }
  });
}

// Add map control buttons with event delegation
function addMapControls() {
  const controlsHtml = `
    <div class="map-controls" id="map-controls">
      <button class="map-control-btn active" data-category="all">All Memories 💕</button>
      <button class="map-control-btn" data-category="Lovers Fest">Lovers Fest ✨</button>
      <button class="map-control-btn" data-category="Jamming Goat">Jamming Goat 🎵</button>
      <button class="map-control-btn" data-category="Our First temple visit">Temple Visit 🙏</button>
      <button class="map-control-btn" data-category="Utk's Birthday">Your birthday</button>
    </div>
  `;
  
  if (cachedElements.mapDiv) {
    cachedElements.mapDiv.insertAdjacentHTML('beforebegin', controlsHtml);
    
    // Use event delegation for better performance
    const controlsContainer = document.getElementById('map-controls');
    cachedElements.controlsContainer = controlsContainer;
    
    controlsContainer.addEventListener('click', handleControlClick);
  }
}

// Optimized control click handler
function handleControlClick(event) {
  if (!event.target.classList.contains('map-control-btn')) return;
  
  // Update active state
  const allButtons = cachedElements.controlsContainer.querySelectorAll('.map-control-btn');
  allButtons.forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  
  // Filter memories
  const category = event.target.dataset.category;
  showMarkersForCategory(category);
}

// Legacy function kept for backward compatibility (now optimized)
function filterMemories(category) {
  showMarkersForCategory(category);
  
  // Update active button if called directly
  if (cachedElements.controlsContainer) {
    const buttons = cachedElements.controlsContainer.querySelectorAll('.map-control-btn');
    buttons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.category === category);
    });
  }
}

// Optimized date formatting with caching
const dateFormatCache = new Map();
function formatDate(dateString) {
  if (dateFormatCache.has(dateString)) {
    return dateFormatCache.get(dateString);
  }
  
  const date = new Date(dateString);
  const formatted = date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  dateFormatCache.set(dateString, formatted);
  return formatted;
}

// Show error message (optimized)
function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.innerHTML = `
    <div style="background: #f8d7da; color: #721c24; padding: 20px; border-radius: 15px; text-align: center; margin: 20px;">
      ${message}
    </div>
  `;
  
  const mapSection = cachedElements.mapSection || document.getElementById('memory-map-section');
  if (mapSection) {
    mapSection.appendChild(errorDiv);
  }
}

// Cleanup function for better memory management
function cleanup() {
  // Clear all timeouts
  bounceTimeouts.forEach(timeout => clearTimeout(timeout));
  bounceTimeouts.clear();
  
  // Clear cached elements
  cachedElements = {};
  
  // Clear date format cache if it gets too large
  if (dateFormatCache.size > 100) {
    dateFormatCache.clear();
  }
  
  // Close any open info windows
  if (currentInfoWindow) {
    currentInfoWindow.close();
    currentInfoWindow = null;
  }
}
