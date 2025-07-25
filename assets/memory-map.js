const memoryData = [
  {
    "id": 1,
    "title": "Where We First Met 💕",
    "coordinates": [12.93417794756412, 77.61595810429198],
    "date": "2025-02-16",
    "category": "Lovers Fest",
    "description": "This is where our love story began! I was so nervous but you made me feel at ease immediately. I knew you were special from that first smile.",
    "photos": ["1.jpg", "2.jpg"]
  },
  {
    "id": 2,
    "title": "Our First Official Date and first kiss",
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
  "id": 9,
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

// Initialize the memory map
function initMemoryMap() {
  try {
    console.log("Initializing map with", memoryData.length, "memories");
    map = new google.maps.Map(document.getElementById("map"), {
      zoom: 11,
      center: { lat: 12.9716, lng: 77.5946 },
      styles: getTaylorSwiftMapStyle()
    });
    addMemoryPins(map, memoryData);
    addMapControls();
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

// Add heart-shaped pins to the map
function addMemoryPins(map, memories) {
  // Remove old markers
  if (memoryMarkers.length) {
    memoryMarkers.forEach(marker => marker.setMap(null));
    memoryMarkers = [];
  }
  memories.forEach(memory => {
    const marker = new google.maps.Marker({
      position: { 
        lat: memory.coordinates[0], 
        lng: memory.coordinates[1] 
      },
      map: map,
      icon: {
        url: 'assets/heart-pin.png',
        scaledSize: new google.maps.Size(35, 35)
      },
      title: memory.title,
      animation: google.maps.Animation.DROP
    });
    marker.addListener('click', function() {
      showMemoryDetails(map, marker, memory);
    });
    marker.addListener('mouseover', function() {
      marker.setAnimation(google.maps.Animation.BOUNCE);
      setTimeout(() => marker.setAnimation(null), 750);
    });
    memoryMarkers.push(marker);
  });
}

// Show memory details in popup
function showMemoryDetails(map, marker, memory) {
  if (currentInfoWindow) {
    currentInfoWindow.close();
  }
  
  let popupContent = `
    <div class="memory-popup">
      <h3>${memory.title}</h3>
      <div class="date">${formatDate(memory.date)}</div>
      <p>${memory.description}</p>
  `;
  
  if (memory.photos && memory.photos.length > 0) {
    memory.photos.forEach(photo => {
      popupContent += `<img src="assets/memory-photos/${photo}" alt="Memory photo" onerror="this.style.display='none'">`;
    });
  }
  
  if (memory.audioNote) {
    popupContent += `
      <audio controls>
        <source src="assets/memory-notes/${memory.audioNote}" type="audio/mpeg">
        Your browser doesn't support audio playback 💔
      </audio>`;
  }
  
  popupContent += '</div>';
  
  currentInfoWindow = new google.maps.InfoWindow({
    content: popupContent,
    maxWidth: 350
  });
  
  currentInfoWindow.open(map, marker);
}

// Add map control buttons
function addMapControls() {
  const controlsHtml = `
    <div class="map-controls">
      <button class="map-control-btn active" onclick="filterMemories('all')">All Memories 💕</button>
      <button class="map-control-btn" onclick="filterMemories('Lovers Fest')">Lovers Fest ✨</button>
      <button class="map-control-btn" onclick="filterMemories('Jamming Goat')">Jamming Goat 🎵</button>
      <button class="map-control-btn" onclick="filterMemories('Our First temple visit')">Temple Visit 🙏</button>
      <button class="map-control-btn" onclick="filterMemories('Utk's Birthday')">Your birthday</button>
    </div>
  `;
  
  const mapSection = document.getElementById('memory-map-section');
  const mapDiv = document.getElementById('map');
  if (mapDiv) {
    mapDiv.insertAdjacentHTML('beforebegin', controlsHtml);
  }
}

// Filter memories by category
function filterMemories(category) {
  document.querySelectorAll('.map-control-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');
  const filteredMemories = category === 'all' ? memoryData : 
    memoryData.filter(memory => memory.category === category);
  addMemoryPins(map, filteredMemories);
}

// Format date nicely
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

// Show error message
function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.innerHTML = `
    <div style="background: #f8d7da; color: #721c24; padding: 20px; border-radius: 15px; text-align: center; margin: 20px;">
      ${message}
    </div>
  `;
  const mapSection = document.getElementById('memory-map-section');
  if (mapSection) {
    mapSection.appendChild(errorDiv);
  }
}
