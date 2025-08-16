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
    "category": "Airport",
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

// Performance optimization variables
const PERFORMANCE_CONFIG = {
  DEBOUNCE_DELAY: 16, // ~60fps
  ANIMATION_DURATION: 750,
  MAX_CACHE_SIZE: 100,
  BATCH_SIZE: 10
};

let intersectionObserver = null; // For lazy loading images
let throttleTimer = null; // For throttling operations

// Initialize the memory map with performance optimizations
function initMemoryMap() {
  try {
    console.log("Initializing map with", memoryData.length, "memories");
    
    // Cache DOM elements once
    cacheCommonElements();
    
    // Pre-process memory data for better performance
    preprocessMemoryData();
    
    // Initialize map with optimized settings
    map = new google.maps.Map(cachedElements.mapDiv, {
      zoom: 11,
      center: { lat: 12.9716, lng: 77.5946 },
      styles: getTaylorSwiftMapStyle(),
      // Performance optimizations
      gestureHandling: 'cooperative',
      disableDefaultUI: false,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false
    });
    
    // Create all markers efficiently
    createAllMarkersOptimized();
    addMapControls();
    initIntersectionObserver();
    
    // Show all markers initially with batch processing
    showMarkersForCategory('all');
    
    console.log("Map initialized successfully");
  } catch (error) {
    console.error('Error initializing memory map:', error);
    showError('Unable to load our memories. Please try again later! 💔');
  }
}

// Cache commonly used DOM elements
function cacheCommonElements() {
  cachedElements.mapSection = document.getElementById('memory-map-section');
  cachedElements.mapDiv = document.getElementById('map');
  
  if (!cachedElements.mapDiv) {
    throw new Error('Map container not found');
  }
}

// Pre-process memory data for better performance
function preprocessMemoryData() {
  memoryData.forEach(memory => {
    // Convert coordinates to LatLng objects upfront
    memory.latLng = new google.maps.LatLng(memory.coordinates[0], memory.coordinates[1]);
    
    // Pre-format dates
    if (memory.date && memory.date !== 'infinite times') {
      memory.formattedDate = formatDate(memory.date);
    } else {
      memory.formattedDate = memory.date;
    }
    
    // Create photo paths upfront
    if (memory.photos) {
      memory.photoPaths = memory.photos.map(photo => `assets/memory-photos/${photo}`);
    }
  });
}

// Google Maps callback function
function initMap() {
  initMemoryMap();
}

// Expose to global for Google Maps callback when using ES modules
// eslint-disable-next-line no-undef
window.initMap = initMap;

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

// Create all markers with advanced optimizations
function createAllMarkersOptimized() {
  const iconConfig = {
    url: 'assets/heart-pin.png',
    scaledSize: new google.maps.Size(35, 35),
    optimized: true // Enable marker optimization
  };
  
  // Use document fragment for batch processing
  const fragment = document.createDocumentFragment();
  
  // Process markers in batches to avoid blocking the UI
  function processBatch(startIndex) {
    const endIndex = Math.min(startIndex + PERFORMANCE_CONFIG.BATCH_SIZE, memoryData.length);
    
    for (let i = startIndex; i < endIndex; i++) {
      const memory = memoryData[i];
      
      const marker = new google.maps.Marker({
        position: memory.latLng, // Use pre-processed LatLng
        map: null, // Don't add to map initially
        icon: iconConfig,
        title: memory.title,
        animation: google.maps.Animation.DROP,
        optimized: true // Enable marker clustering optimization
      });
      
      // Add throttled event listeners
      marker.addListener('click', () => throttleOperation(() => showMemoryDetails(map, marker, memory)));
      marker.addListener('mouseover', () => throttleOperation(() => handleMarkerHover(marker)));
      
      // Store marker with memory data
      marker.memoryData = memory;
      allMarkers.set(memory.id, marker);
    }
    
    // Process next batch if there are more markers
    if (endIndex < memoryData.length) {
      // Use requestAnimationFrame for smooth processing
      requestAnimationFrame(() => processBatch(endIndex));
    } else {
      console.log("All markers created successfully");
    }
  }
  
  // Start batch processing
  processBatch(0);
}

// Throttle expensive operations to improve performance
function throttleOperation(operation) {
  if (throttleTimer) return;
  
  throttleTimer = setTimeout(() => {
    operation();
    throttleTimer = null;
  }, PERFORMANCE_CONFIG.DEBOUNCE_DELAY);
}

// Enhanced hover handler with better performance
function handleMarkerHover(marker) {
  // Use WeakMap for better memory management if available
  const markerId = marker.memoryData.id;
  
  // Clear any existing timeout for this marker
  const existingTimeout = bounceTimeouts.get(markerId);
  if (existingTimeout) {
    clearTimeout(existingTimeout);
  }
  
  // Start bounce animation only if not already bouncing
  if (marker.getAnimation() !== google.maps.Animation.BOUNCE) {
    marker.setAnimation(google.maps.Animation.BOUNCE);
  }
  
  // Set timeout to stop animation
  const timeout = setTimeout(() => {
    marker.setAnimation(null);
    bounceTimeouts.delete(markerId);
  }, PERFORMANCE_CONFIG.ANIMATION_DURATION);
  
  bounceTimeouts.set(markerId, timeout);
}

// High-performance marker visibility management
function showMarkersForCategory(category) {
  // Use requestAnimationFrame for smooth transitions
  requestAnimationFrame(() => {
    const updates = []; // Batch updates
    
    allMarkers.forEach(marker => {
      const memory = marker.memoryData;
      const shouldShow = category === 'all' || memory.category === category;
      const currentlyVisible = marker.getMap() !== null;
      
      // Only queue updates when state changes
      if (shouldShow !== currentlyVisible) {
        updates.push({ marker, shouldShow });
      }
    });
    
    // Apply updates in batches to avoid UI blocking
    function applyBatch(startIndex) {
      const endIndex = Math.min(startIndex + PERFORMANCE_CONFIG.BATCH_SIZE, updates.length);
      
      for (let i = startIndex; i < endIndex; i++) {
        const { marker, shouldShow } = updates[i];
        marker.setMap(shouldShow ? map : null);
      }
      
      // Continue with next batch if needed
      if (endIndex < updates.length) {
        requestAnimationFrame(() => applyBatch(endIndex));
      }
    }
    
    if (updates.length > 0) {
      applyBatch(0);
    }
  });
}

// Enhanced memory details popup with performance optimizations
function showMemoryDetails(map, marker, memory) {
  if (currentInfoWindow) {
    currentInfoWindow.close();
  }
  
  // Create popup content efficiently using pre-processed data
  const popupContent = createOptimizedPopupContent(memory);
  
  currentInfoWindow = new google.maps.InfoWindow({
    content: popupContent,
    maxWidth: 350,
    disableAutoPan: false // Improve UX
  });
  
  currentInfoWindow.open(map, marker);
  
  // Setup intersection observer for images after popup opens
  setTimeout(() => setupImageLazyLoading(), 50);
}

// Create optimized popup content using template strings and pre-processed data
function createOptimizedPopupContent(memory) {
  let content = `
    <div class="memory-popup">
      <h3>${memory.title}</h3>
      <div class="date">${memory.formattedDate || memory.date}</div>
      <p>${memory.description}</p>
  `;
  
  // Add photo placeholders using pre-processed paths
  if (memory.photoPaths && memory.photoPaths.length > 0) {
    const photoElements = memory.photoPaths.map(photoPath => 
      `<img data-src="${photoPath}" alt="Memory photo" class="lazy-image memory-photo" loading="lazy" onerror="this.style.display='none'">`
    ).join('');
    content += photoElements;
  }
  
  // Add audio if exists
  if (memory.audioNote) {
    content += `
      <audio controls preload="none">
        <source src="assets/memory-notes/${memory.audioNote}" type="audio/mpeg">
        Your browser doesn't support audio playback 💔
      </audio>`;
  }
  
  content += '</div>';
  return content;
}

// Initialize Intersection Observer for efficient image lazy loading
function initIntersectionObserver() {
  if (!('IntersectionObserver' in window)) {
    // Fallback for older browsers
    return;
  }
  
  intersectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.style.display = 'block';
          img.classList.remove('lazy-image');
          delete img.dataset.src;
          intersectionObserver.unobserve(img);
        }
      }
    });
  }, {
    root: null,
    rootMargin: '50px',
    threshold: 0.1
  });
}

// Setup image lazy loading using intersection observer
function setupImageLazyLoading() {
  const lazyImages = document.querySelectorAll('.lazy-image');
  
  if (intersectionObserver) {
    lazyImages.forEach(img => {
      intersectionObserver.observe(img);
    });
  } else {
    // Fallback: load images immediately
    lazyImages.forEach(img => {
      if (img.dataset.src) {
        img.src = img.dataset.src;
        img.style.display = 'block';
        img.classList.remove('lazy-image');
        delete img.dataset.src;
      }
    });
  }
}

// Add optimized map control buttons with better event handling
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
    // Use insertAdjacentHTML for better performance than innerHTML
    cachedElements.mapDiv.insertAdjacentHTML('beforebegin', controlsHtml);
    
    // Cache the controls container
    const controlsContainer = document.getElementById('map-controls');
    cachedElements.controlsContainer = controlsContainer;
    
    // Use passive event listeners for better scroll performance
    controlsContainer.addEventListener('click', handleControlClick, { passive: false });
    
    // Pre-cache all button elements
    cachedElements.controlButtons = controlsContainer.querySelectorAll('.map-control-btn');
  }
}

// Enhanced control click handler with performance optimizations
function handleControlClick(event) {
  if (!event.target.classList.contains('map-control-btn')) return;
  
  // Prevent unnecessary work if same button is clicked
  if (event.target.classList.contains('active')) return;
  
  // Update active state efficiently using cached elements
  cachedElements.controlButtons.forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  
  // Filter memories with throttling
  const category = event.target.dataset.category;
  throttleOperation(() => showMarkersForCategory(category));
}

// Legacy function with performance improvements (backward compatibility)
function filterMemories(category) {
  throttleOperation(() => showMarkersForCategory(category));
  
  // Update active button if called directly (using cached elements)
  if (cachedElements.controlButtons) {
    cachedElements.controlButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.category === category);
    });
  }
}

// Create legacy function alias for backward compatibility
const createAllMarkers = createAllMarkersOptimized;

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

// Enhanced error handling with user-friendly messages
function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'memory-map-error';
  errorDiv.innerHTML = `
    <div style="background: #f8d7da; color: #721c24; padding: 20px; border-radius: 15px; text-align: center; margin: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <h3>Oops! Something went wrong 💔</h3>
      <p>${message}</p>
      <button onclick="location.reload()" style="background: #d1ecf1; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-top: 10px;">
        Try Again
      </button>
    </div>
  `;
  
  const mapSection = cachedElements.mapSection || document.getElementById('memory-map-section');
  if (mapSection) {
    mapSection.appendChild(errorDiv);
  }
}

// Enhanced cleanup function with comprehensive memory management
function cleanup() {
  // Clear all timeouts
  bounceTimeouts.forEach(timeout => clearTimeout(timeout));
  bounceTimeouts.clear();
  
  // Clear throttle timer
  if (throttleTimer) {
    clearTimeout(throttleTimer);
    throttleTimer = null;
  }
  
  // Cleanup intersection observer
  if (intersectionObserver) {
    intersectionObserver.disconnect();
    intersectionObserver = null;
  }
  
  // Clear all marker event listeners
  allMarkers.forEach(marker => {
    google.maps.event.clearInstanceListeners(marker);
  });
  
  // Clear cached elements
  cachedElements = {};
  
  // Clear date format cache if it gets too large
  if (dateFormatCache.size > PERFORMANCE_CONFIG.MAX_CACHE_SIZE) {
    dateFormatCache.clear();
  }
  
  // Close any open info windows
  if (currentInfoWindow) {
    currentInfoWindow.close();
    currentInfoWindow = null;
  }
  
  console.log("Cleanup completed successfully");
}

// Performance monitoring (development mode)
function logPerformanceMetrics() {
  if (typeof performance !== 'undefined' && window.location.hostname === 'localhost') {
    const metrics = {
      markers: allMarkers.size,
      cacheSize: dateFormatCache.size,
      memoryUsage: performance.memory ? {
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + ' MB',
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024) + ' MB'
      } : 'Not available'
    };
    console.log('Memory Map Performance Metrics:', metrics);
  }
}

// Add window error handler for better error tracking
window.addEventListener('error', (event) => {
  if (event.filename && event.filename.includes('memory-map.js')) {
    console.error('Memory Map Error:', event.error);
    showError('A technical error occurred while loading the map. Please refresh the page.');
  }
});

// Add performance monitoring on load
window.addEventListener('load', () => {
  setTimeout(logPerformanceMetrics, 2000);
});