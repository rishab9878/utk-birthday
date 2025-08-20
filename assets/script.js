const DOMCache = {
  elements: new Map(),
  get(id) {
    if (!this.elements.has(id)) {
      const element = document.getElementById(id);
      if (element) {
        this.elements.set(id, element);
      }
    }
    return this.elements.get(id);
  },
  getBySelector(selector) {
    if (!this.elements.has(selector)) {
      const element = document.querySelector(selector);
      if (element) {
        this.elements.set(selector, element);
      }
    }
    return this.elements.get(selector);
  },
  getAllBySelector(selector) {
    return document.querySelectorAll(selector);
  },
  clear() {
    this.elements.clear();
  },
  // Pre-cache commonly used elements
  preCache() {
    const commonElements = [
      'slide-img', 'slide-video', 'slide-caption', 'bg-music',
      'chat-messages', 'user-input', 'chatbot', 'quiz-box', 'quiz-end',
      'final-score', 'question-text', 'options', 'feedback',
      'quizProgressBar', 'question-counter', 'passwordModal',
      'letterPassword', 'wrongPass', 'secretLetter'
    ];
    
    commonElements.forEach(id => this.get(id));
    
    // Cache common selectors
    this.getBySelector('.progress-dots');
    this.getBySelector('.hearts');
    this.getBySelector('.floating-lyrics');
  }
};

// Add resource preloading
const ResourceLoader = {
  preloadImages(sources) {
    sources.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  },
  preloadVideos(sources) {
    sources.forEach(src => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.src = src;
    });
  }
};

// Preload only essential gifts immediately; defer heavy slideshow media to on-demand
ResourceLoader.preloadVideos(['assets/gift1.mp4', 'assets/gift2.mp4']);
ResourceLoader.preloadImages([
  'media/photo1.jpg',
  'media/photo2.jpg',
  'media/photo3.jpg',
  'media/photo4.jpg',
  'media/photo5.jpg'
]);


let isInLetsRemember = false;
let letsRememberStep = 0;
let memoryAnswers = [];

const letsRememberFlow = [
  "💞 February 16th — the first moment you saw him. What were you thinking?",
  "✨ That pink outfit… remember how he melted? What did he say to you?",
  "🎬 What was the first thing you said that made him laugh?",
  "🌅 That Sholay bike ride — what song was playing in your head?",
  "He'll smile reading all this. 💌 Want to send a final message to him?",
  "Delivering your memories with sparkles and heartbeats 💖 Thanks for playing Let's Remember!"
];

// --- NEW: Google Apps Script Web App URL ---
// IMPORTANT: Replace 'YOUR_DEPLOYED_WEB_APP_URL_HERE' with the actual URL you got after deploying your Apps Script.
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbzR5YJcx0ogDWC-6uLCwkEyW7PQS083KTNaBsowpKiuEwpon49Gr8-72bDeA5bzUlgZlg/exec';


// ------------------------ SLIDESHOW LOGIC ------------------------


let currentSlide = 0;
let autoSlideTimer;

const slides = [
  { type: "photo", src: "media/photo1.jpg", caption: "This is where our story began.", loading: "lazy" },
  { type: "photo", src: "media/photo2.jpg", caption: "Laughs like these stay forever.", loading: "lazy" },
  { type: "photo", src: "media/photo3.jpg", caption: "Your eyes had me stuck in a loop.", loading: "lazy" },
  { type: "photo", src: "media/photo4.jpg", caption: "Wrapped in golden light - each other!", loading: "lazy" },
  { type: "photo", src: "media/photo5.jpg", caption: "Could look at you forever.", loading: "lazy" },
  { type: "video", src: "media/video1.mp4", caption: "Your smile is contagious!", loading: "lazy" },
  { type: "video", src: "media/video2.mp4", caption: "My chaos, my calm.", loading: "lazy" },
  { type: "video", src: "media/video3.mp4", caption: "Caught in the act of being adorable.", loading: "lazy" },
  { type: "video", src: "media/video4.mp4", caption: "The way you smile 🥹", loading: "lazy" },
  { type: "video", src: "media/video5.mp4", caption: "And you stole the show again.", loading: "lazy" }
];

// showSlide is defined later with the updated polaroid design – keep single definition to avoid conflicts


function startAutoSlide() {
  clearInterval(autoSlideTimer);
  
  // Preload next slide
  const nextIndex = (currentSlide + 1) % slides.length;
  const nextSlide = slides[nextIndex];
  if (nextSlide.type === 'photo') {
    const img = new Image();
    img.src = nextSlide.src;
  } else {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.src = nextSlide.src;
  }
  
  // Adjust timing based on content type
  const currentContent = slides[currentSlide];
  const delay = currentContent.type === 'photo' ? 4000 : 0; // Longer for photos, videos control their own timing
  
  if (delay > 0) {
    autoSlideTimer = setInterval(() => {
      currentSlide = (currentSlide + 1) % slides.length;
      showSlide(currentSlide);
    }, delay);
  }
}

function prevSlide() {
  clearInterval(autoSlideTimer);
  currentSlide = (currentSlide - 1 + slides.length) % slides.length;
  showSlide(currentSlide);
  startAutoSlide();
}

function nextSlide() {
  clearInterval(autoSlideTimer);
  currentSlide = (currentSlide + 1) % slides.length;
  showSlide(currentSlide);
  startAutoSlide();
}

// ------------------------ PAGE TRANSITION ------------------------

function nextPage(id) {
  // Stop any ongoing timers/animations and pause media from previous page
  try { cleanup(); } catch (e) { /* no-op */ }
  const pages = document.querySelectorAll(".page");
  pages.forEach(p => {
    p.classList.remove("active");
    p.style.display = "none"; // hide all
  });


  const surpriseVideo = DOMCache.get("surprise-video");
  if (surpriseVideo) {
    surpriseVideo.pause();
  }

  const next = DOMCache.get(id);
  if (next) {
    next.style.display = "block"; // show target
    next.classList.add("active");
  }

  if (id === "slideshow") {
    currentSlide = 0;
    showSlide(currentSlide);
    startAutoSlide();
  }

  if (id === "quiz") {
    // Reset quiz when entering
    currentQuestion = 0;
    score = 0;
    const quizBox = DOMCache.get("quiz-box");
    const quizEnd = DOMCache.get("quiz-end");
    if (quizBox && quizEnd) {
      quizBox.style.display = "block";
      quizEnd.style.display = "none";
    }
    const progressBar = DOMCache.get("quizProgressBar");
    const questionCounter = DOMCache.get("question-counter");
    if (progressBar) progressBar.style.width = '0%';
    if (questionCounter) questionCounter.innerText = `Question 1 of ${quizData.length}`;
    showQuestion();
  }

  // Initialize surprise page animations and effects
  if (id === "surprise") {
    setTimeout(() => {
      initSurpriseAnimations();
      createFloatingParticles();
  onEnterSurprisePage();
    }, 100);
  }

  // Lazy-load Google Maps only when needed
  if (id === 'memory-map') {
    loadGoogleMapsIfNeeded();
  }

  if (id === "goodbye") {
    // Auto-open chatbot on goodbye page load
    setTimeout(() => {
      const chatbot = DOMCache.get('chatbot');
      if (chatbot) {
  chatbot.style.display = 'flex';
  chatbot.classList.add('show');
        displayBotMessages();
      }
    }, 1500);
  }

  const audio = DOMCache.get("bg-music");
  if (audio && audio.paused) {
    audio.play().catch(e => console.warn("Autoplay blocked", e));
  }

  // Highlight timeline step
DOMCache.getAllBySelector(".timeline-step").forEach(step => step.classList.remove("active"));
const timelineStep = DOMCache.get(`step-${id}`);
if (timelineStep) timelineStep.classList.add("active");

}

// ------------------------ QUIZ FUNCTIONALITY ------------------------

const quizData = [
  {
    question: "What did I notice about you in the first sight when we met?",
    options: ["Eyes", "Outfit", "Smile", "Voice"],
    answer: "Outfit"
  },
  {
    question: "Where did we go after the Lover Fest?",
    options: ["Burger King", "Starbucks", "McDonalds", "Home"],
    answer: "McDonalds"
  },
  {
    question: "Where did we go for our first bike ride?",
    options: ["Sholay shooting spot", "Philly's", "A cute cafe next to highway", "HSR"],
    answer: "A cute cafe next to highway"
  },
  {
    question: "What song would always remind me of you?",
    options: ["Enchanted", "Lover", "Daylight", "Fearless"],
    answer: "Lover"
  },
  {
    question: "Our cute fights are about?",
    options: ["Food", "Mood", "Texts", "Outfits"],
    answer: "Mood"
  }
];

let currentQuestion = 0;
let score = 0;

function showQuestion() {
  const q = quizData[currentQuestion];
  const questionText = DOMCache.get("question-text");
  const optionsContainer = DOMCache.get("options");
  const feedback = DOMCache.get("feedback");
  const progressBar = DOMCache.get("quizProgressBar");
  const questionCounter = DOMCache.get("question-counter");

  if (!questionText || !optionsContainer || !feedback || !progressBar || !questionCounter) return;

  questionText.innerText = q.question;
  optionsContainer.innerHTML = "";
  feedback.innerText = "";

  const progress = ((currentQuestion) / quizData.length) * 100;
  progressBar.style.width = `${progress}%`;
  questionCounter.innerText = `Question ${currentQuestion + 1} of ${quizData.length}`;


  q.options.forEach(option => {
    const btn = document.createElement("button");
    btn.classList.add("option-btn");
    btn.innerText = option;
    btn.onclick = () => checkAnswer(btn, q.answer);
    optionsContainer.appendChild(btn);
  });
}

function checkAnswer(button, correctAnswer) {
  const buttons = DOMCache.getAllBySelector(".option-btn");
  const feedback = DOMCache.get("feedback");
  
  if (!feedback) return;
  
  buttons.forEach(btn => btn.disabled = true);

  if (button.innerText === correctAnswer) {
    button.classList.add("correct");
    feedback.innerText = "Yay! You're right! 💖";
    score++;
  } else {
    button.classList.add("wrong");
    feedback.innerText = `Oops! Correct: ${correctAnswer}`;
    buttons.forEach(btn => {
      if (btn.innerText === correctAnswer) btn.classList.add("correct");
    });
  }

  setTimeout(() => {
    currentQuestion++;
    if (currentQuestion < quizData.length) {
      showQuestion();
    } else {
      showQuizEnd();
    }
  }, 500);
}

function showQuizEnd() {
  const quizBox = DOMCache.get("quiz-box");
  const quizEnd = DOMCache.get("quiz-end");
  const finalScore = DOMCache.get("final-score");
  const progressBar = DOMCache.get("quizProgressBar");
  const questionCounter = DOMCache.get("question-counter");
  const rewardMsg = DOMCache.get("reward-message");
  const rewardGift = DOMCache.get("reward-gift");

  if (!quizBox || !quizEnd || !finalScore || !progressBar || !questionCounter || !rewardMsg || !rewardGift) return;

  quizBox.style.display = "none";
  quizEnd.style.display = "block";
  finalScore.innerText = score;

  progressBar.style.width = `100%`;
  questionCounter.innerText = `Quiz Complete 🎉`;

  rewardMsg.innerHTML = "";
  rewardGift.innerHTML = "";

  if (score === 5) {
    rewardMsg.innerText = "Perfect score! You're my Memory Master 💖";
    rewardGift.innerHTML = "🎁 ✨ A forever ticket to all my cuddles ✨";
  } else if (score === 4) {
    rewardMsg.innerText = "Wow! You're almost perfect 😘";
    rewardGift.innerHTML = "🧸 Free cuddles + a tight hug anytime you want!";
  } else if (score === 3) {
    rewardMsg.innerText = "Awww you're trying, and I love that! 🥺💗";
    rewardGift.innerHTML = "🍩 A donut date on me!";
  } else if (score === 2) {
    rewardMsg.innerText = "You got some right! Still cute tho 😌";
    rewardGift.innerHTML = "🍫 A bar of your fav chocolate (guess which)";
  } else {
    rewardMsg.innerText = "It’s okay, we’re still the cutest 😘";
    rewardGift.innerHTML = "💌 A handwritten letter from me — just for you.";
  }
}

// ------------------------ CONFETTI + SURPRISE ------------------------

function claimSurprise() {
  const container = DOMCache.get("confetti");
  const claimBtn = DOMCache.get("claimBtn");

  if (!container || !claimBtn) return;

  container.innerHTML = "";

  const emojis = ["💖", "🎉", "💫", "🥳", "🌸", "✨", "🩷"];
  const count = 30;

  for (let i = 0; i < count; i++) {
    const span = document.createElement("span");
    span.className = "emoji-burst";
    span.innerText = emojis[Math.floor(Math.random() * emojis.length)];
    const x = Math.random() * window.innerWidth - 100;
    const delay = Math.random() * 0.5;

    span.style.left = `${x}px`;
    span.style.animationDelay = `${delay}s`;

    container.appendChild(span);
  }

  claimBtn.disabled = true;
  claimBtn.innerText = "🎊 Claimed!";

  setTimeout(() => {
    nextPage("surprise");
    setTimeout(hideSurpriseText, 4000);
  }, 2000);
}


function hideSurpriseText() {
  const text = DOMCache.get("celebrate-text");
  if (text) text.style.display = "none";
}

function replaySurprise() {
  const video = DOMCache.get("surprise-video");
  if (!video) return;
  video.currentTime = 0;
  video.play();
}

// ------------------------ LETTER POPUPS ------------------------

function openLetter(id) {
  const letter = DOMCache.get(id);
  if (letter) letter.style.display = "block";
}
function closeLetter(id) {
  const letter = DOMCache.get(id);
  if (letter) letter.style.display = "none";
}

// ------------------------ HEART PARTICLES ------------------------

window.addEventListener("load", () => {
  const canvas = DOMCache.get("heartCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  resizeCanvas();
  // Debounce resize event for performance
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resizeCanvas, 100);
  });

  const hearts = [];

  function createHeart(x = null, y = null, burst = false) {
    const count = burst ? 10 : 1;
    for (let j = 0; j < count; j++) {
      const size = Math.random() * 6 + 4;
      hearts.push({
        x: x !== null ? x + (Math.random() - 0.5) * 100 : Math.random() * canvas.width,
        y: y !== null ? y + (Math.random() - 0.5) * 100 : canvas.height + size,
        size,
        speed: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.5 + 0.3,
      });
    }
  }

  function drawHearts() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hearts.forEach((h, i) => {
      ctx.globalAlpha = h.opacity;
      ctx.fillStyle = "#ff85c1"; // pink heart
      ctx.beginPath();
      ctx.moveTo(h.x, h.y);
      ctx.bezierCurveTo(h.x + h.size, h.y - h.size,
                        h.x + h.size * 2, h.y + h.size,
                        h.x, h.y + h.size * 2);
      ctx.bezierCurveTo(h.x - h.size * 2, h.y + h.size,
                        h.x - h.size, h.y - h.size,
                        h.x, h.y);
      ctx.fill();
      ctx.closePath();

      h.y -= h.speed;
      h.x += Math.sin(h.y / 50) * 0.5;
      h.opacity -= 0.001;

      if (h.opacity <= 0 || h.y < -20) {
        hearts.splice(i, 1);
      }
    });
    ctx.globalAlpha = 1;
  }

  function animate() {
    drawHearts();
    requestAnimationFrame(animate);
  }

  setInterval(() => {
    for (let i = 0; i < 2; i++) createHeart();
  }, 400);

  animate();
});


// ------------------------ TOUCH SWIPE FOR SLIDESHOW (Optimized) ------------------------
(function optimizeSlideshowTouch() {
  const slideshowElement = DOMCache.get("slideshow");
  if (!slideshowElement) return;
  let startX = 0;
  let isTouch = false;

  function handleSwipe(diff) {
    if (Math.abs(diff) > 30) {
      clearInterval(autoSlideTimer);
      currentSlide = diff < 0
        ? (currentSlide + 1) % slides.length
        : (currentSlide - 1 + slides.length) % slides.length;
      showSlide(currentSlide);
      startAutoSlide();
    }
  }

  slideshowElement.addEventListener("touchstart", (e) => {
    isTouch = true;
    startX = e.touches[0].clientX;
  }, { passive: true });
  slideshowElement.addEventListener("touchend", (e) => {
    if (!isTouch) return;
    const endX = e.changedTouches[0].clientX;
    handleSwipe(endX - startX);
    isTouch = false;
  }, { passive: true });
  slideshowElement.addEventListener("mousedown", (e) => {
    if (isTouch) return;
    startX = e.clientX;
  });
  slideshowElement.addEventListener("mouseup", (e) => {
    if (isTouch) return;
    const endX = e.clientX;
    handleSwipe(endX - startX);
  });
})();

function openImageModal(src) {
  const modal = DOMCache.get("imageModal");
  const modalImg = DOMCache.get("modalImage");
  
  if (!modal || !modalImg) return;
  
  modalImg.src = src;
  modal.style.display = "block";
  
  // Add enhanced modal animation
  modal.style.opacity = "0";
  modal.style.transform = "scale(0.8)";
  
  setTimeout(() => {
    modal.style.transition = "all 0.3s ease";
    modal.style.opacity = "1";
    modal.style.transform = "scale(1)";
  }, 10);
}

function closeImageModal() {
  const modal = DOMCache.get("imageModal");
  if (!modal) return;
  
  modal.style.transition = "all 0.3s ease";
  modal.style.opacity = "0";
  modal.style.transform = "scale(0.8)";
  
  setTimeout(() => {
    modal.style.display = "none";
  }, 300);
}

let waitingForRishabMessage = false; // State variable for chatbot
let waitingForMessageConfirmation = false; // State variable for "yes" confirmation

// Enhanced surprise page animations
function initSurpriseAnimations() {
  const surpriseImages = DOMCache.getAllBySelector('.surprise-img');
  const surpriseCenter = DOMCache.getBySelector('.surprise-center');
  
  // Add staggered entrance animations
  surpriseImages.forEach((img, index) => {
    img.style.opacity = '0';
    img.style.transform = 'translateY(30px) scale(0.9)';
    
    setTimeout(() => {
      img.style.transition = 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      img.style.opacity = '1';
      img.style.transform = 'translateY(0) scale(1)';
    }, 200 + (index * 150));
  });
  
  // Center animation
  if (surpriseCenter) {
    surpriseCenter.style.opacity = '0';
    surpriseCenter.style.transform = 'scale(0.8)';
    
    setTimeout(() => {
      surpriseCenter.style.transition = 'all 1s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      surpriseCenter.style.opacity = '1';
      surpriseCenter.style.transform = 'scale(1)';
    }, 600);
  }
}

// Add floating particles effect
function createFloatingParticles() {
  const surprisePage = DOMCache.get('surprise');
  if (!surprisePage) return;
  
  const particles = ['💖', '✨', '🌸', '💫', '🎀', '💕'];
  
  // Use DocumentFragment for batch DOM insertion
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < 15; i++) {
    const particle = document.createElement('div');
    particle.innerHTML = particles[Math.floor(Math.random() * particles.length)];
    particle.style.position = 'absolute';
    particle.style.fontSize = Math.random() * 20 + 15 + 'px';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = Math.random() * 100 + '%';
    particle.style.opacity = Math.random() * 0.6 + 0.2;
    particle.style.pointerEvents = 'none';
    particle.style.zIndex = '1';
    particle.style.animation = `floatParticle ${Math.random() * 10 + 8}s ease-in-out infinite`;
    particle.style.animationDelay = Math.random() * 5 + 's';
    fragment.appendChild(particle);
  }
  surprisePage.appendChild(fragment);
}

// Add CSS animation for floating particles
const style = document.createElement('style');
style.textContent = `
  @keyframes floatParticle {
    0%, 100% { 
      transform: translateY(0px) rotate(0deg); 
      opacity: 0.3;
    }
    25% { 
      transform: translateY(-20px) rotate(90deg); 
      opacity: 0.7;
    }
    50% { 
      transform: translateY(-10px) rotate(180deg); 
      opacity: 0.5;
    }
    75% { 
      transform: translateY(-30px) rotate(270deg); 
      opacity: 0.8;
    }
  }
`;
document.head.appendChild(style);

// Background music volume management utility
const BackgroundMusicManager = {
  originalVolume: 0.5,
  loweredVolume: 0,
  
  init() {
    const bgMusic = document.getElementById("bg-music");
    if (bgMusic) {
      bgMusic.volume = this.originalVolume;
    }
  },
  
  lowerVolume() {
    const bgMusic = document.getElementById("bg-music");
    if (bgMusic) {
      bgMusic.volume = this.loweredVolume;
    }
  },
  
  restoreVolume() {
    const bgMusic = document.getElementById("bg-music");
    if (bgMusic) {
      bgMusic.volume = this.originalVolume;
    }
  }
};

// Initialize background music volume
BackgroundMusicManager.init();

const surpriseVideo = DOMCache.get("surprise-video");
const bgMusic = DOMCache.get("bg-music");

// Listen for volume/mute changes on surprise video
if (surpriseVideo) {
  surpriseVideo.addEventListener("volumechange", () => {
    if (!surpriseVideo.muted && surpriseVideo.volume > 0) {
      BackgroundMusicManager.lowerVolume();
    } else {
      BackgroundMusicManager.restoreVolume();
    }
  });

  // Also handle play/pause events
  surpriseVideo.addEventListener("play", () => {
    if (!surpriseVideo.muted) {
      BackgroundMusicManager.lowerVolume();
    }
  });

  surpriseVideo.addEventListener("pause", () => {
    BackgroundMusicManager.restoreVolume();
  });

  surpriseVideo.addEventListener("ended", () => {
    BackgroundMusicManager.restoreVolume();
  });
}

function showGlitchPopup() {
  const popup = DOMCache.get("glitch-popup");
  const messageElement = popup?.querySelector("p");

  const glitchMessages = [
    "Oops! Are you sure? Try 'Yes' 😋",
    "Utk, don't break my heart 😭",
    "Come on, you know you want to see it 😄",
    "Seriously? Just click Yes! 🎉"
  ];

  if (popup && messageElement) {
    const message = glitchMessages[Math.floor(Math.random() * glitchMessages.length)];
    messageElement.innerHTML = message;
    popup.style.display = "flex";
  } else {
    console.warn("Glitch popup or message element not found");
  }
}

function closeGlitchPopup() {
  const popup = DOMCache.get("glitch-popup");
  if (popup) popup.style.display = "none";
}

// ------------------------ CHATBOT FUNCTIONS ------------------------
function toggleChat() {
  const chatbot = DOMCache.get('chatbot');
  if (!chatbot) return;
  const willShow = chatbot.style.display !== 'flex';
  chatbot.style.display = willShow ? 'flex' : 'none';
  chatbot.classList.toggle('show', willShow);
}

function displayBotMessages() {
  const messages = [
    "Heyy Utk! It's me Taylor",
    "Hope you loved this little surprise!",
    "Also the gift hamper tay-lored especially by me. I hope you liked it",
  ];

  const chatMessages = DOMCache.get('chat-messages');
  if (!chatMessages) return;
  
  messages.forEach((msg, index) => {
    setTimeout(() => {
      // Show typing indicator
      const typingIndicator = createTypingIndicator();
      chatMessages.appendChild(typingIndicator);
      
      setTimeout(() => {
        // Remove typing indicator
        chatMessages.removeChild(typingIndicator);
        
        // Add the message
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', 'bot-message');
        messageElement.innerHTML = msg;
        chatMessages.appendChild(messageElement);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Log bot message to Google Sheet
        logChatToGoogleSheet(msg, 'bot');

        // After the last message, show gift selection
        if (index === messages.length - 1) {
          setTimeout(() => {
            showGiftSelection();
          }, 1000);
        }

      }, 1500);
    }, index * 2500);
  });
}

function createTypingIndicator() {
  const div = document.createElement('div');
  div.classList.add('typing-indicator');
  div.innerHTML = '<span></span><span></span><span></span>';
  return div;
}

function showGiftSelection() {
  const chatMessages = DOMCache.get('chat-messages');
  if (!chatMessages) return;
  
  // Add the question message
  const questionElement = document.createElement('div');
  questionElement.classList.add('message', 'bot-message');
  questionElement.innerHTML = "Do you want to see the gift?";
  chatMessages.appendChild(questionElement);
  
  // Log the question to Google Sheet
  logChatToGoogleSheet("Do you want to see the gift?", 'bot');
  
  // Create gift selection buttons
  const buttonContainer = document.createElement('div');
  buttonContainer.classList.add('gift-selection-container');
  buttonContainer.style.cssText = `
    display: flex;
    gap: 0px;
    margin: 5px 0;
    justify-content: center;
  `;
  
  const yesButton = document.createElement('button');
  yesButton.innerHTML = 'Yes';
  yesButton.style.cssText = `
    background: linear-gradient(135deg, #ffcce0, #ffa8cc);
    color: #181616ff;
    border: none;
    padding: 12px 24px;
    border-radius: 25px;
    font-weight: 600;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(226, 85, 148, 0.3);
  `;
  yesButton.onclick = () => handleGiftSelection('yes', buttonContainer);
  
  const noButton = document.createElement('button');
  noButton.innerHTML = 'No';
  noButton.style.cssText = `
    background: linear-gradient(135deg, #ffcce0, #ffa8cc);
    color: #181616ff;
    border: none;
    padding: 12px 24px;
    border-radius: 25px;
    font-weight: 600;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(255, 204, 224, 0.4);
  `;
  noButton.onclick = () => handleGiftSelection('no', buttonContainer);
  
  // Add hover effects
  yesButton.onmouseover = () => yesButton.style.transform = 'translateY(-2px)';
  yesButton.onmouseout = () => yesButton.style.transform = 'translateY(0)';
  noButton.onmouseover = () => noButton.style.transform = 'translateY(-2px)';
  noButton.onmouseout = () => noButton.style.transform = 'translateY(0)';
  
  buttonContainer.appendChild(yesButton);
  buttonContainer.appendChild(noButton);
  chatMessages.appendChild(buttonContainer);
  
  // Scroll to bottom
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function handleGiftSelection(choice, buttonContainer) {
  // Remove the button container
  buttonContainer.remove();
  
  // Add user's choice as a message
  addMessage(choice === 'yes' ? '✨ Yes' : '💔 No', 'user');
  
  if (choice === 'yes') {
    // Show gift popup
    setTimeout(() => {
      showGiftPopup();
    }, 500);
  } else {
    // Continue with original chatbot flow
    setTimeout(() => {
      const finalMessage = "So... what did you think of this web surprise Rishab made for you?";
      addMessage(finalMessage, 'bot');
    }, 1000);
  }
}

function showGiftPopup() {
  // Create gift popup modal
  const modal = document.createElement('div');
  modal.id = 'gift-popup-modal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
    opacity: 0;
    transition: opacity 0.3s ease;
  `;
  
  const popupContent = document.createElement('div');
  popupContent.style.cssText = `
    background: linear-gradient(135deg, #ffeef7, #ffe4f1);
    border-radius: 20px;
    padding: 30px;
    max-width: 90%;
    max-height: 90%;
    overflow-y: auto;
    position: relative;
    box-shadow: 0 20px 40px rgba(226, 85, 148, 0.3);
    border: 2px solid #ffcce0;
  `;
  
  // Close button
  const closeButton = document.createElement('button');
  closeButton.innerHTML = '✕';
  closeButton.style.cssText = `
    position: absolute;
    top: 15px;
    right: 15px;
    background: #e25594;
    color: white;
    border: none;
    width: 35px;
    height: 35px;
    border-radius: 50%;
    font-size: 18px;
    font-weight: bold;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(226, 85, 148, 0.3);
  `;
  closeButton.onclick = closeGiftPopup;
  closeButton.onmouseover = () => {
    closeButton.style.background = '#d14080';
    closeButton.style.transform = 'scale(1.1)';
  };
  closeButton.onmouseout = () => {
    closeButton.style.background = '#e25594';
    closeButton.style.transform = 'scale(1)';
  };
  
  // Title
  const title = document.createElement('h2');
  title.innerHTML = '🎁 Your Special Gifts 🎁';
  title.style.cssText = `
    text-align: center;
    color: #8b4c7a;
    margin-bottom: 30px;
    font-size: 28px;
    text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
  `;
  
  // Videos container
  const videosContainer = document.createElement('div');
  videosContainer.style.cssText = `
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
    justify-content: center;
  `;
  
  // Gift 1 video
  const gift1Container = document.createElement('div');
  gift1Container.style.cssText = `
    text-align: center;
    background: white;
    padding: 20px;
    border-radius: 15px;
    box-shadow: 0 8px 25px rgba(226, 85, 148, 0.15);
    border: 1px solid #ffcce0;
  `;
  
  const gift1Title = document.createElement('h3');
  gift1Title.innerHTML = '💖 Gift 1';
  gift1Title.style.cssText = `
    color: #e25594;
    margin-bottom: 15px;
    font-size: 20px;
  `;
  
  const gift1Video = document.createElement('video');
  gift1Video.src = 'assets/gift1.mp4';
  gift1Video.preload = 'auto';
  gift1Video.controls = true;
  gift1Video.style.cssText = `
    width: 300px;
    max-width: 100%;
    border-radius: 10px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  `;
  
  // Add background music management for gift1 video
  gift1Video.addEventListener("play", () => {
    if (!gift1Video.muted) {
      BackgroundMusicManager.lowerVolume();
    }
  });
  
  gift1Video.addEventListener("pause", () => {
    BackgroundMusicManager.restoreVolume();
  });
  
  gift1Video.addEventListener("ended", () => {
    BackgroundMusicManager.restoreVolume();
  });
  
  gift1Video.addEventListener("volumechange", () => {
    if (!gift1Video.muted && gift1Video.volume > 0 && !gift1Video.paused) {
      BackgroundMusicManager.lowerVolume();
    } else {
      BackgroundMusicManager.restoreVolume();
    }
  });
  
  gift1Container.appendChild(gift1Title);
  gift1Container.appendChild(gift1Video);
  
  // Gift 2 video
  const gift2Container = document.createElement('div');
  gift2Container.style.cssText = `
    text-align: center;
    background: white;
    padding: 20px;
    border-radius: 15px;
    box-shadow: 0 8px 25px rgba(226, 85, 148, 0.15);
    border: 1px solid #ffcce0;
  `;
  
  const gift2Title = document.createElement('h3');
  gift2Title.innerHTML = '💝 Gift 2';
  gift2Title.style.cssText = `
    color: #e25594;
    margin-bottom: 15px;
    font-size: 20px;
  `;
  
  const gift2Video = document.createElement('video');
  gift2Video.src = 'assets/gift2.mp4';
  gift2Video.preload = 'auto';
  gift2Video.controls = true;
  gift2Video.style.cssText = `
    width: 300px;
    max-width: 100%;
    border-radius: 10px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  `;
  
  // Add background music management for gift2 video
  gift2Video.addEventListener("play", () => {
    if (!gift2Video.muted) {
      BackgroundMusicManager.lowerVolume();
    }
  });
  
  gift2Video.addEventListener("pause", () => {
    BackgroundMusicManager.restoreVolume();
  });
  
  gift2Video.addEventListener("ended", () => {
    BackgroundMusicManager.restoreVolume();
  });
  
  gift2Video.addEventListener("volumechange", () => {
    if (!gift2Video.muted && gift2Video.volume > 0 && !gift2Video.paused) {
      BackgroundMusicManager.lowerVolume();
    } else {
      BackgroundMusicManager.restoreVolume();
    }
  });
  
  gift2Container.appendChild(gift2Title);
  gift2Container.appendChild(gift2Video);
  
  videosContainer.appendChild(gift1Container);
  videosContainer.appendChild(gift2Container);
  
  popupContent.appendChild(closeButton);
  popupContent.appendChild(title);
  popupContent.appendChild(videosContainer);
  modal.appendChild(popupContent);
  document.body.appendChild(modal);
  
  // Show modal with animation
  setTimeout(() => {
    modal.style.opacity = '1';
  }, 10);
}

function closeGiftPopup() {
  const modal = DOMCache.get('gift-popup-modal');
  if (modal) {
    // Restore background music volume when closing popup
    BackgroundMusicManager.restoreVolume();
    
    modal.style.opacity = '0';
    setTimeout(() => {
      modal.remove();
      // Continue with chatbot after closing
      setTimeout(() => {
        const finalMessage = "So... what did you think of this web surprise Rishab made for you?";
        addMessage(finalMessage, 'bot');
      }, 500);
    }, 300);
  }
}

function sendMessage() {
  const userInput = DOMCache.get('user-input');
  if (!userInput) return;
  
  const message = userInput.value.trim();
  userInput.value = '';
  
  // 🎮 Check if currently in Let's Remember game
if (isInLetsRemember) {
  // Show user's reply in the chat
  addMessage(message, 'user');

  // Store answer
  memoryAnswers.push(message);
  letsRememberStep++;

  // Show next question or end the game
  if (letsRememberStep < letsRememberFlow.length) {
    setTimeout(() => {
      addMessage(letsRememberFlow[letsRememberStep], 'bot');
    }, 1000);
  } else {
    isInLetsRemember = false;
    setTimeout(() => {
      addMessage("Your memories have been saved with sparkles ✨", 'bot');
      console.log("Memory game answers:", memoryAnswers);
    }, 1000);
  }

  return; // Stop further checks
}

  
  if (message === '') return;

  // Add user message
  addMessage(message, 'user');
  
  // Process and respond
  setTimeout(() => {
    respondToUser(message);
  }, 1000);
}

function handleKeyPress(event) {
  if (event.key === 'Enter') {
    sendMessage();
  }
}

function loadSurprise() {
const loadingText = DOMCache.get("loading-text");
if (loadingText) {
  loadingText.style.display = "block";
}

setTimeout(() => {
nextPage("surprise");
}, 1500);
}



// Optimize: Defer sparkle DOM insertion and wish form event binding until DOMContentLoaded
document.addEventListener("DOMContentLoaded", function () {
  // Pre-cache commonly used elements
  DOMCache.preCache();
  // Make timeline steps clickable for quick navigation
  DOMCache.getAllBySelector('#timeline .timeline-step').forEach(step => {
    step.addEventListener('click', () => {
      const targetId = step.id?.replace('step-', '');
      if (targetId) nextPage(targetId);
    });
  });
  
  // Sparkles
  const sparkleFragment = document.createDocumentFragment();
  for (let i = 0; i < 30; i++) {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';
    sparkle.style.left = Math.random() * 100 + 'vw';
    sparkle.style.top = Math.random() * 100 + 'vh';
    sparkle.style.animationDelay = (Math.random() * 5) + 's';
    sparkleFragment.appendChild(sparkle);
  }
  document.body.appendChild(sparkleFragment);

  // Wish form event binding
  const wishForm = DOMCache.get("wishForm");
  if (wishForm) {
    wishForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const wish = this.wish.value;
      fetch("https://script.google.com/macros/s/AKfycby8IA3jgSSW8WSegW1X8mP5hzITx06TPjDNWoylAb2xSNZ0m33cQpFG8nCxjWR73vV2/exec", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `wish=${encodeURIComponent(wish)}`
      })
        .then(() => {
          const wishStatus = DOMCache.get("wishStatus");
          if (wishStatus) {
            wishStatus.innerText = "The universe received your wish 🌠";
          }
          this.reset();
        })
        .catch(() => {
          const wishStatus = DOMCache.get("wishStatus");
          if (wishStatus) {
            wishStatus.innerText = "Something went wrong. Try again!";
          }
        });
    });
  }
});



// Optimize: Cache DOM lookup for love meter
function updateLoveMeter(progress) {
  const fill = DOMCache.get('heart-fill');
  if (fill) fill.style.width = progress + '%';
}

// Removed duplicate wishForm event binding (now handled in DOMContentLoaded)
 

/*
// Secret Letter */

function checkSecret() {
  const password = prompt("Enter your phone number to unlock 💌:");

  if (password === "7076863754") {
    const secretLetter = DOMCache.get("secretLetter");
    if (secretLetter) {
      secretLetter.style.display = "block";
      document.body.style.overflow = "hidden"; // prevent background scroll
    }
  } else if (password !== null) {
    alert("Oops! Wrong password 💔");
  }
}

// 🎥 Video Player Logic
function initVideo() {
  const video = DOMCache.get('surprise-video');
  const playHint = DOMCache.getBySelector('.play-hint');
  
  if (!video) return;
  
  video.addEventListener('play', function() {
    video.classList.add('show');
    // Only one heart interval per play
    if (window.heartInterval) clearInterval(window.heartInterval);
    const rect = video.getBoundingClientRect();
    window.heartInterval = setInterval(() => {
      createHeartParticle(rect.left + 150, rect.top + 100);
    }, 300);
  });
}

// ❤️ Heart Particles
function createHeartParticle(x, y) {
  // Cache the container for heart particles
  const container = DOMCache.getBySelector('.hearts');
  if (!container) return;
  
  const heart = document.createElement('div');
  heart.innerHTML = '❤️';
  heart.style.position = 'absolute';
  heart.style.left = `${x}px`;
  heart.style.top = `${y}px`;
  heart.style.fontSize = `${Math.random() * 20 + 10}px`;
  heart.style.opacity = Math.random() * 0.5 + 0.5;
  heart.style.animation = `floatHeart ${Math.random() * 3 + 2}s linear forwards`;
  container.appendChild(heart);
  setTimeout(() => {
    heart.remove();
  }, 1000);
}

// Start floating lyrics and init video when entering surprise page (hooked via nextPage above)
function onEnterSurprisePage() {
  setTimeout(() => {
    initVideo();
    const lyrics = DOMCache.getBySelector('.floating-lyrics');
    if (window.lyricsInterval) clearInterval(window.lyricsInterval);
    if (lyrics) {
      window.lyricsInterval = setInterval(() => {
        const lines = [
          "\"You're my, my, my, my... Lover\"",
          "\"Can I go where you go?\"",
          "\"Have I known you 20 seconds or 20 years?\"",
          "\"I love you, ain't that the worst thing you ever heard?\""
        ];
        lyrics.textContent = lines[Math.floor(Math.random() * lines.length)];
        lyrics.style.animation = 'none';
        void lyrics.offsetWidth; // Trigger reflow
        lyrics.style.animation = 'floatUp 3s infinite alternate';
      }, 5000);
    }
  }, 100);
}

// 🎥 Fixed Replay Function 
function replayVideo() {
  const video = DOMCache.get('surprise-video');
  if (!video) return;
  
  // Reset and play
  video.currentTime = 0;
  video.play().catch(e => console.log("Auto-play prevented:", e));
  
  // Visual feedback
  const btn = DOMCache.getBySelector('[onclick="replayVideo()"]');
  if (btn) {
    btn.innerHTML = '<span>🎀 Playing...</span>';
    
    setTimeout(() => {
      btn.innerHTML = '<span>🔄 Replay</span>';
    }, 1500);
  }
  
  // Restart heart particles if needed
  if (window.heartInterval) clearInterval(window.heartInterval);
  const rect = video.getBoundingClientRect();
  window.heartInterval = setInterval(() => {
    createHeartParticle(rect.left + 150, rect.top + 100);
  }, 300);
}

function addMessage(text, sender) {
  const chatMessages = DOMCache.get('chat-messages');
  if (!chatMessages) return;
  
  const messageElement = document.createElement('div');
  messageElement.classList.add('message', sender + '-message');
  messageElement.innerHTML = text;
  chatMessages.appendChild(messageElement);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  logChatToGoogleSheet(text, sender);
}

// --- NEW FUNCTION: To send chat data to Google Sheet ---
function logChatToGoogleSheet(message, sender) {
  if (!WEB_APP_URL || WEB_APP_URL === 'YOUR_DEPLOYED_WEB_APP_URL_HERE') {
    console.warn("WEB_APP_URL is not set. Chat messages will not be logged to Google Sheet.");
    return;
  }

  fetch(WEB_APP_URL, {
    method: 'POST',
    mode: 'no-cors', // Required for cross-origin requests from a simple HTML file
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sender: sender,
      message: message
    })
  })
  .then(response => {
    // In 'no-cors' mode, the response is opaque. We can't read its status or body.
    // The request is sent, but we can't confirm success from the client-side.
    console.log('Chat message sent to Google Sheet (response is opaque due to no-cors).');
  })
  .catch(error => {
    console.error('Error sending chat message to Google Sheet:', error);
  });
}


function respondToUser(message) {
  const chatMessages = DOMCache.get('chat-messages');
  if (!chatMessages) return;
  
  // Show typing indicator
  const typingIndicator = createTypingIndicator();
  chatMessages.appendChild(typingIndicator);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  setTimeout(() => {
    chatMessages.removeChild(typingIndicator);
    let response;
    const lowerMessage = message.toLowerCase();
    if (waitingForRishabMessage) {
      const rishabResponses = [
        `Aww, that's so sweet! 💖 I'll make sure Rishab sees your message`,
        `Your words are going to make Rishab’s day! ✨`,
        `What a beautiful message! 🥺 I recorded this for Rishab`,
        `Rishab will be so touched reading this! 💕`
      ];
      response = rishabResponses[Math.floor(Math.random() * rishabResponses.length)];
      waitingForRishabMessage = false;
      setTimeout(() => {
        addMessage(response, 'bot');
        setTimeout(() => {
          addMessage("Before we wrap this up... wanna play something sweet? 💭 It’s called Let's Remember — where you finish our memories!", 'bot');
          isInLetsRemember = true;
          letsRememberStep = 0;
          memoryAnswers = [];
          setTimeout(() => {
            addMessage(letsRememberFlow[letsRememberStep], 'bot');
          }, 1500);
        }, 1500);
      }, 100);
      return;
    }
    else if (lowerMessage.includes('i miss you') || lowerMessage.includes('i miss him')) {
      response = "I remember it all too well... Rishab misses you more 💔";
    }
    else if (lowerMessage.includes('i love you') || lowerMessage.includes('i love him') || lowerMessage.includes('i love rishab')) {
      response = "This love is good. This love is bad. This love was yours 💕";
    }
    else if (lowerMessage.includes('i am sorry') || lowerMessage.includes("i'm sorry") || lowerMessage.includes('sorry')) {
      response = "It's okay. You're human. So was Rishab — when he waited, when he begged, and when he finally let go 🥺";
    }
    else if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
      response = "You're very welcome! I'm so glad you liked it! ❤️";
    }
    else if (lowerMessage.includes('love') || lowerMessage.includes('amazing') || lowerMessage.includes('awesome')) {
      response = "Yay! That makes me so happy to hear! Rishab put his heart into every detail of this surprise! 💝. Would you like to add a personal message for him?";
      waitingForRishabMessage = true;
    }
    else if (lowerMessage.includes('track') || lowerMessage.includes('delivery') || lowerMessage.includes('address')) {
      response = "Your gift left our facility yesterday. Should arrive within 3-5 business days!";
    }
    else if (lowerMessage.includes('rishab') || lowerMessage.includes('creator') || lowerMessage.includes('made')) {
      response = "Rishab put his heart into every detail of this surprise! 💝 I know he'd love to hear your thoughts - would you like to send him a personal message?";
      waitingForRishabMessage = true;
    }
    else {
      response = "Your words mean so much! 💌 Would you like me to pass along a special message to Rishab about how this made you feel?";
      waitingForRishabMessage = true;
    }
    addMessage(response, 'bot');
  }, 1500);
}


// Update the showSlide function to handle the new design
function showSlide(index) {
  const img = DOMCache.get("slide-img");
  const video = DOMCache.get("slide-video");
  const caption = DOMCache.get("slide-caption");
  const slide = slides[index];
  
  if (!img || !video || !caption) return;
  
  updateProgressDots(index);
  img.style.opacity = 0;
  video.style.opacity = 0;
  setTimeout(() => {
    if (slide.type === "photo") {
      img.src = slide.src;
      img.loading = "lazy";
      img.hidden = false;
      video.hidden = true;
      caption.textContent = slide.caption;
      img.style.opacity = 1;
      img.style.transform = "scale(0.95)";
      setTimeout(() => {
        img.style.transition = "transform 0.5s ease";
        img.style.transform = "scale(1)";
      }, 50);
    } else {
      video.src = slide.src;
      video.hidden = false;
      img.hidden = true;
      caption.textContent = slide.caption;
      video.load();
      video.autoplay = true;
      video.muted = true;
      video.loop = false;
      video.oncanplay = () => {
        setTimeout(() => {
          video.play();
          video.style.opacity = 1;
          video.style.transform = "scale(0.95)";
          setTimeout(() => {
            video.style.transition = "transform 0.5s ease";
            video.style.transform = "scale(1)";
          }, 50);
        }, 100);
      };
      clearInterval(autoSlideTimer);
      video.onended = () => {
        const audio = DOMCache.get("bg-music");
        if (audio && audio.paused) audio.play();
        setTimeout(() => {
          currentSlide = (currentSlide + 1) % slides.length;
          showSlide(currentSlide);
          startAutoSlide();
        }, 500);
      };
    }
  }, 100);
}

// Add progress dots functionality
function updateProgressDots(currentIndex) {
  const dotsContainer = DOMCache.getBySelector(".progress-dots");
  if (!dotsContainer) return;
  
  dotsContainer.innerHTML = "";
  slides.forEach((_, index) => {
    const dot = document.createElement("div");
    dot.className = "progress-dot";
    dot.style.width = "12px";
    dot.style.height = "12px";
    dot.style.borderRadius = "50%";
    dot.style.backgroundColor = index === currentIndex ? "#e25594" : "#ffcce0";
    dot.style.transition = "background-color 0.3s ease";
    dotsContainer.appendChild(dot);
  });
}

function cleanup() {
  // Clear all intervals
  if (autoSlideTimer) clearInterval(autoSlideTimer);
  if (window.heartInterval) clearInterval(window.heartInterval);
  if (window.lyricsInterval) clearInterval(window.lyricsInterval);

  // Pause all videos
  DOMCache.getAllBySelector('video').forEach(video => {
    video.pause();
    video.currentTime = 0;
  });
  
  // Restore background music volume
  BackgroundMusicManager.restoreVolume();
}


function openPasswordPrompt() {
  const passwordModal = DOMCache.get("passwordModal");
  if (passwordModal) {
    passwordModal.style.display = "block";
  }
}

function closePasswordModal() {
  const passwordModal = DOMCache.get("passwordModal");
  const letterPassword = DOMCache.get("letterPassword");
  const wrongPass = DOMCache.get("wrongPass");
  
  if (passwordModal) passwordModal.style.display = "none";
  if (letterPassword) letterPassword.value = "";
  if (wrongPass) wrongPass.style.display = "none";
}

function verifyPassword() {
  const letterPassword = DOMCache.get("letterPassword");
  const secretLetter = DOMCache.get("secretLetter");
  const wrongPass = DOMCache.get("wrongPass");
  
  if (!letterPassword) return;
  
  const entered = letterPassword.value.trim();
  const correct = "8917515075"; // 🔒 Replace this with your actual password

  if (entered === correct) {
    closePasswordModal();
    if (secretLetter) {
      secretLetter.style.display = "block";
    }
  } else {
    if (wrongPass) {
      wrongPass.style.display = "block";
    }
  }
}

// --- Expose functions for inline HTML handlers (ES modules scope fix) ---
if (typeof window !== 'undefined') {
  window.nextPage = nextPage;
  window.prevSlide = prevSlide;
  window.nextSlide = nextSlide;
  window.openLetter = openLetter;
  window.closeLetter = closeLetter;
  window.openImageModal = openImageModal;
  window.closeImageModal = closeImageModal;
  window.replayVideo = replayVideo;
  window.replaySurprise = replaySurprise;
  window.toggleChat = toggleChat;
  window.sendMessage = sendMessage;
  window.handleKeyPress = handleKeyPress;
  window.loadSurprise = loadSurprise;
  window.showGlitchPopup = showGlitchPopup;
  window.closeGlitchPopup = closeGlitchPopup;
  window.openPasswordPrompt = openPasswordPrompt;
  window.closePasswordModal = closePasswordModal;
  window.verifyPassword = verifyPassword;
  window.claimSurprise = claimSurprise;
}

// --- Lazy Google Maps loader to reduce initial load ---
function loadGoogleMapsIfNeeded() {
  if (window.google && window.google.maps) {
    // Maps script already loaded; ensure map is initialized if not
    if (typeof initMap === 'function') {
      // No-op: initMap is called by Google loader; if already loaded, ensure markers show
      return;
    }
  }
  // Prevent duplicate injections
  if (document.getElementById('google-maps-script')) return;
  const script = document.createElement('script');
  script.id = 'google-maps-script';
  script.async = true;
  script.defer = true;
  script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyA5VZqFnIDYAvgT-kfUESa_ZVagFm-X2OM&callback=initMap';
  document.body.appendChild(script);
}

// ------------------ Realtime "Talk to Rishab" (Firebase) ------------------
// Lightweight client-only implementation. Replace FIREBASE_CONFIG below.

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyAEbqZxgXzjrqt3W9vhLCmn4_eHJkZKPEc",
  authDomain: "chatbox-703fd.firebaseapp.com",
  projectId: "chatbox-703fd",
  storageBucket: "chatbox-703fd.firebasestorage.app",
  messagingSenderId: "763623684913",
  appId: "1:763623684913:web:037e07912f5e6fbedc0e10",
  measurementId: "G-N9KK5PF8NH"
};

// Dynamically load Firebase (compat) and initialize DB reference
function loadFirebaseAndInit(cfg) {
  if (!cfg || !cfg.apiKey || cfg.apiKey.startsWith('REPLACE')) {
    console.warn('Firebase config not set. Realtime chat disabled.');
    return;
  }

  if (window._firebaseDB) return; // already loaded

  const s1 = document.createElement('script');
  s1.src = 'https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js';
  const s2 = document.createElement('script');
  s2.src = 'https://www.gstatic.com/firebasejs/9.22.1/firebase-database-compat.js';

  s1.onload = () => {
    s2.onload = () => {
      try {
        firebase.initializeApp(cfg);
        window._firebaseDB = firebase.database();
        console.log('Firebase initialized for realtime chat.');
        createTalkToRishabButton();
      } catch (e) {
        console.error('Firebase init error', e);
      }
    };
    document.head.appendChild(s2);
  };
  document.head.appendChild(s1);
}

// Create persistent "Talk to Rishab" floating button
function createTalkToRishabButton() {
  if (document.getElementById('talk-to-rishab-btn')) return;
  const btn = document.createElement('button');
  btn.id = 'talk-to-rishab-btn';
  btn.textContent = 'Talk to Rishab';
  btn.style.cssText = `
    position: fixed; right: 18px; bottom: 18px; background: linear-gradient(135deg,#ff9ccf,#ff7ab1);
    color: white; border: none; padding: 12px 18px; border-radius: 28px; z-index: 9999;
    box-shadow: 0 6px 18px rgba(0,0,0,0.15); cursor: pointer;
  `;
  btn.onclick = openRealtimeWaitModal;
  document.body.appendChild(btn);
}

// Show wait modal immediately and create session
function openRealtimeWaitModal() {
  const btn = document.getElementById('talk-to-rishab-btn');
  if (btn) btn.disabled = true;

  let modal = document.getElementById('rt-wait-modal');
  if (modal) { modal.style.display = 'flex'; return; }

  modal = document.createElement('div');
  modal.id = 'rt-wait-modal';
  modal.style.cssText = 'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.45);z-index:10001;';

  const box = document.createElement('div');
  box.style.cssText = 'background:white;padding:18px 22px;border-radius:12px;min-width:280px;max-width:90%;text-align:center;position:relative;';

  const msg = document.createElement('div');
  msg.id = 'rt-wait-msg';
  msg.textContent = 'Please wait — connecting you to Rishab';
  msg.style.cssText = 'font-size:16px;margin-bottom:12px;color:#333;';

  const spinner = document.createElement('div');
  spinner.style.cssText = 'width:36px;height:36px;margin:0 auto;border-radius:50%;border:4px solid #ffd6e8;border-top-color:#e25594;animation:rt-spin 0.8s linear infinite;';

  const close = document.createElement('button');
  close.textContent = '✕';
  close.style.cssText = 'position:absolute;right:12px;top:10px;border:none;background:transparent;font-size:16px;cursor:pointer;';
  close.onclick = () => { modal.style.display = 'none'; if (btn) btn.disabled = false; };

  box.appendChild(close);
  box.appendChild(msg);
  box.appendChild(spinner);
  modal.appendChild(box);
  document.body.appendChild(modal);

  if (!document.getElementById('rt-spin-style')) {
    const s = document.createElement('style');
    s.id = 'rt-spin-style';
    s.textContent = '@keyframes rt-spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}';
    document.head.appendChild(s);
  }

  // Start session (will create DB node and notify owner via your Cloud Function)
  startRealtimeSession((err, sessionId) => {
    const msgEl = document.getElementById('rt-wait-msg');
    if (err) {
      if (msgEl) msgEl.textContent = 'Unable to connect. Please try again later.';
      if (btn) btn.disabled = false;
      return console.error('startRealtimeSession error', err);
    }
    if (msgEl) msgEl.textContent = 'Connected — waiting for Rishab to join...';

    // After creating session, open the full chat modal so user sees an input
    setTimeout(() => {
      openRealtimeChatModalFull(sessionId);
    }, 600);
  });
}

// Full chat modal where user can send messages; listens for owner replies
function openRealtimeChatModalFull(sessionId) {
  // remove wait modal if present
  const wait = document.getElementById('rt-wait-modal');
  if (wait) wait.remove();

  // Build / reuse modal
  let modal = document.getElementById('rt-chat-modal');
  if (modal) { modal.style.display = 'flex'; return; }

  modal = document.createElement('div');
  modal.id = 'rt-chat-modal';
  modal.style.cssText = 'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.45);z-index:10001;';

  const box = document.createElement('div');
  box.style.cssText = 'width:360px;max-width:90%;background:white;border-radius:12px;padding:12px;box-shadow:0 10px 30px rgba(0,0,0,0.2);position:relative;';

  const header = document.createElement('div');
  header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;';
  header.innerHTML = `<strong>Talk to Rishab</strong>`;
  const closeX = document.createElement('button');
  closeX.textContent = '✕';
  closeX.style.cssText = 'border:none;background:transparent;cursor:pointer;font-size:16px;';
  closeX.onclick = () => { modal.style.display = 'none'; };
  header.appendChild(closeX);

  const messages = document.createElement('div');
  messages.id = 'rt-chat-messages';
  messages.style.cssText = 'height:220px;overflow:auto;border-radius:8px;background:#fafafa;padding:8px;margin-bottom:8px;';

  const form = document.createElement('div');
  form.style.cssText = 'display:flex;gap:8px;';

  const input = document.createElement('input');
  input.id = 'rt-user-input';
  input.placeholder = 'Type message to Rishab...';
  input.style.cssText = 'flex:1;padding:8px;border-radius:8px;border:1px solid #eee;';
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendRTMessageHandler(sessionId); });

  const sendBtn = document.createElement('button');
  sendBtn.textContent = 'Send';
  sendBtn.style.cssText = 'padding:8px 10px;border-radius:8px;border:none;background:#ff7ab1;color:#fff;cursor:pointer;';
  sendBtn.onclick = () => sendRTMessageHandler(sessionId);

  form.appendChild(input);
  form.appendChild(sendBtn);

  box.appendChild(header);
  box.appendChild(messages);
  box.appendChild(form);
  modal.appendChild(box);
  document.body.appendChild(modal);

  // Show initial system message
  appendRTMessage('System', 'You are now connected. Messages will be delivered to Rishab.');

  // Listen for owner messages
  listenForOwnerMessages(sessionId, (text) => {
    appendRTMessage('Rishab', text);
    // Also add to main chatbot UI so conversation is visible there
    addMessage(text, 'bot');
  });
}

function sendRTMessageHandler(sessionId) {
  const input = document.getElementById('rt-user-input');
  if (!input) return;
  const txt = input.value.trim();
  if (!txt) return;
  // show locally
  appendRTMessage('You', txt);
  // send to DB
  sendRealtimeUserMessage(sessionId, txt);
  // also forward into main chat UX
  addMessage(txt, 'user');
  input.value = '';
}

function appendRTMessage(sender, text) {
  const container = document.getElementById('rt-chat-messages');
  if (!container) return;
  const div = document.createElement('div');
  div.style.cssText = 'margin-bottom:6px;font-size:14px;';
  div.innerHTML = `<strong>${escapeHtml(sender)}:</strong> ${escapeHtml(text)}`;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function escapeHtml(s) {
  if (!s) return '';
  return String(s).replace(/[&<>"]+/g, function (c) {
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];
  });
}

function genId() {
  return 's_' + Math.random().toString(36).slice(2,10);
}

// Create a support request in DB and return sessionId via callback(err, id)
function startRealtimeSession(callback) {
  if (!window._firebaseDB) return callback && callback('Firebase not initialized');
  const id = genId();
  const now = Date.now();
  const payload = { sessionId: id, createdAt: now, userAgent: navigator.userAgent || '', page: location.pathname || '', status: 'pending' };
  window._firebaseDB.ref('support_requests/' + id).set(payload)
    .then(() => callback && callback(null, id))
    .catch(err => callback && callback(err));
}

// Send a message from user into conversations/{sessionId}
function sendRealtimeUserMessage(sessionIdParam, text) {
  if (!window._firebaseDB || !sessionIdParam) return;
  const entry = { from: 'user', text: text, ts: Date.now() };
  window._firebaseDB.ref(`conversations/${sessionIdParam}`).push(entry)
    .catch(e => console.error('rt send error', e));
}

// Listen for owner messages (owner should write {from:'owner', text:...})
function listenForOwnerMessages(sessionIdParam, onOwnerMsg) {
  if (!window._firebaseDB || !sessionIdParam) return;
  const ref = window._firebaseDB.ref(`conversations/${sessionIdParam}`);
  ref.on('child_added', snap => {
    const v = snap.val();
    if (!v) return;
    if (v.from === 'owner' || v.from === 'rishab' || v.from === 'admin') {
      onOwnerMsg && onOwnerMsg(v.text || '');
    }
  });
}

// Auto-init firebase if config filled
try { loadFirebaseAndInit(FIREBASE_CONFIG); } catch (e) { /* ignore */ }

// -------------------------------------------------------------------------
