const DOMCache = {
  elements: new Map(),
  get(id) {
    if (!this.elements.has(id)) {
      this.elements.set(id, document.getElementById(id));
    }
    return this.elements.get(id);
  },
  clear() {
    this.elements.clear();
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

function showSlide(index) {
  const img = document.getElementById("slide-img");
  const video = document.getElementById("slide-video");
  const caption = document.getElementById("slide-caption");
  const slide = slides[index];

  // Update progress dots
  updateProgressDots(index);

  img.style.opacity = 0;
  video.style.opacity = 0;

  setTimeout(() => {
    if (slide.type === "photo") {
      img.src = slide.src;
      img.hidden = false;
      video.hidden = true;
      caption.textContent = slide.caption;
      img.style.opacity = 1;

      // Add subtle animation
      img.style.transform = "scale(0.95)";
      setTimeout(() => {
        img.style.transition = "transform 0.5s ease";
        img.style.transform = "scale(1)";
      }, 50);
    } else {
      // Clean up previous event listeners
      video.oncanplay = null;
      video.onended = null;

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

          // Add subtle animation
          video.style.transform = "scale(0.95)";
          setTimeout(() => {
            video.style.transition = "transform 0.5s ease";
            video.style.transform = "scale(1)";
          }, 50);
        }, 100);
      };

      clearInterval(autoSlideTimer); // Pause for video
      video.onended = () => {
        const audio = document.getElementById("bg-music");
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
  const pages = document.querySelectorAll(".page");
  pages.forEach(p => {
    p.classList.remove("active");
    p.style.display = "none"; // hide all
  });


  function goToMemoryMap() {
  nextPage('memory-map');
}

  const surpriseVideo = document.getElementById("surprise-video");
  if (surpriseVideo) {
    surpriseVideo.pause();
  }

  const next = document.getElementById(id);
  if (next) {
    next.style.display = "block"; // show target
    next.classList.add("active");
  }

  if (id === "slideshow") {
    currentSlide = 0;
    showSlide(currentSlide);
    startAutoSlide();
  }

  if (id === "quiz") showQuestion();

  // Initialize surprise page animations and effects
  if (id === "surprise") {
    setTimeout(() => {
      initSurpriseAnimations();
      createFloatingParticles();
    }, 100);
  }

  if (id === "goodbye") {
    // Auto-open chatbot on goodbye page load
    setTimeout(() => {
      document.getElementById('chatbot').style.display = 'flex';
      displayBotMessages();
    }, 1500);
  }

  const audio = document.getElementById("bg-music");
  if (audio && audio.paused) {
    audio.play().catch(e => console.warn("Autoplay blocked", e));
  }

  // Highlight timeline step
document.querySelectorAll(".timeline-step").forEach(step => step.classList.remove("active"));
const timelineStep = document.getElementById(`step-${id}`);
if (timelineStep) timelineStep.classList.add("active");

}

// ------------------------ QUIZ FUNCTIONALITY ------------------------

const quizData = [
  {
    question: "What did I notice about you in the first sight when we met?",
    options: ["👀 Eyes", "👗 Outfit", "😊 Smile", "🎤 Voice"],
    answer: "👗 Outfit"
  },
  {
    question: "Where did we go after the Lover Fest?",
    options: ["🍔 Burger King", "☕ Starbucks", "🍟 McDonalds", "🏠 Home"],
    answer: "🍟 McDonalds"
  },
  {
    question: "Where did we go for our first bike ride?",
    options: ["🌄 Sholay shooting spot", "🥤 Philly's", "🍰 A cute cafe next to highway", "🏙️ HSR"],
    answer: "🍰 A cute cafe next to highway"
  },
  {
    question: "What song would always remind me of you?",
    options: ["✨ Enchanted", "💖 Lover", "🌅 Daylight", "🎸 Fearless"],
    answer: "💖 Lover"
  },
  {
    question: "Our cute fights are about?",
    options: ["🍕 Food", "🌧️ Mood", "📱 Texts", "👚 Outfits"],
    answer: "🌧️ Mood"
  }
];

let currentQuestion = 0;
let score = 0;

function showQuestion() {
  const q = quizData[currentQuestion];
  document.getElementById("question-text").innerText = q.question;
  const optionsContainer = document.getElementById("options");
  optionsContainer.innerHTML = "";
  document.getElementById("feedback").innerText = "";

  const progress = ((currentQuestion) / quizData.length) * 100;
  document.getElementById("quizProgressBar").style.width = `${progress}%`;
  document.getElementById("question-counter").innerText = `Question ${currentQuestion + 1} of ${quizData.length}`;


  q.options.forEach(option => {
    const btn = document.createElement("button");
    btn.classList.add("option-btn");
    btn.innerText = option;
    btn.onclick = () => checkAnswer(btn, q.answer);
    optionsContainer.appendChild(btn);
  });
}

function checkAnswer(button, correctAnswer) {
  const buttons = document.querySelectorAll(".option-btn");
  buttons.forEach(btn => btn.disabled = true);

  if (button.innerText === correctAnswer) {
    button.classList.add("correct");
    document.getElementById("feedback").innerText = "Yay! You're right! 💖";
    score++;
  } else {
    button.classList.add("wrong");
    document.getElementById("feedback").innerText = `Oops! Correct: ${correctAnswer}`;
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
  document.getElementById("quiz-box").style.display = "none";
  document.getElementById("quiz-end").style.display = "block";
  document.getElementById("final-score").innerText = score;

  document.getElementById("quizProgressBar").style.width = `100%`;
document.getElementById("question-counter").innerText = `Quiz Complete 🎉`;


  
  const rewardMsg = document.getElementById("reward-message");
  const rewardGift = document.getElementById("reward-gift");
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
  const container = document.getElementById("confetti");
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

  document.getElementById("claimBtn").disabled = true;
  document.getElementById("claimBtn").innerText = "🎊 Claimed!";

  setTimeout(() => {
    nextPage("surprise-pr");
    setTimeout(hideSurpriseText, 4000);
  }, 2000);
}


function hideSurpriseText() {
  const text = document.getElementById("celebrate-text");
  if (text) text.style.display = "none";
}

function replaySurprise() {
  const video = document.getElementById("surprise-video");
  video.currentTime = 0;
  video.play();
}

// ------------------------ LETTER POPUPS ------------------------

function openLetter(id) {
  document.getElementById(id).style.display = "block";
}
function closeLetter(id) {
  document.getElementById(id).style.display = "none";
}

// ------------------------ HEART PARTICLES ------------------------

window.addEventListener("load", () => {
  const canvas = document.getElementById("heartCanvas");
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
    for (let i = 0; i < 3; i++) createHeart();
  }, 200);

  animate();
});


// ------------------------ TOUCH SWIPE FOR SLIDESHOW (Optimized) ------------------------
(function optimizeSlideshowTouch() {
  const slideshowElement = document.getElementById("slideshow");
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
  const modal = document.getElementById("imageModal");
  const modalImg = document.getElementById("modalImage");
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
  const modal = document.getElementById("imageModal");
  modal.style.transition = "all 0.3s ease";
  modal.style.opacity = "0";
  modal.style.transform = "scale(0.8)";
  
  setTimeout(() => {
    modal.style.display = "none";
  }, 300);
}

let waitingForRishabMessage = false; // State variable for chatbot

// Enhanced surprise page animations
function initSurpriseAnimations() {
  const surpriseImages = document.querySelectorAll('.surprise-img');
  const surpriseCenter = document.querySelector('.surprise-center');
  
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
  const surprisePage = document.getElementById('surprise');
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

const surpriseVideo = document.getElementById("surprise-video");
const bgMusic = document.getElementById("bg-music");

// Optional: Set initial volume
bgMusic.volume = 0.5;

// Listen for volume/mute changes
surpriseVideo.addEventListener("volumechange", () => {
  if (!surpriseVideo.muted && surpriseVideo.volume > 0) {
    // Lower bg music when video is unmuted
    bgMusic.volume = 0.15;
  } else {
    // Restore bg music volume when video is muted again
    bgMusic.volume = 0.5;
  }
});

function showGlitchPopup() {
  const popup = document.getElementById("glitch-popup");
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
  const popup = document.getElementById("glitch-popup");
  if (popup) popup.style.display = "none";
}

// ------------------------ CHATBOT FUNCTIONS ------------------------
function toggleChat() {
  const chatbot = document.getElementById('chatbot');
  chatbot.style.display = chatbot.style.display === 'flex' ? 'none' : 'flex';
}

function displayBotMessages() {
  const messages = [
    "Heyy Utk! It's me Taylor",
    "Hope you loved this little surprise! But guess what? This isn't the end",
    "A Super cute gift hamper tailored especially for you is already on its way to your address",
    "They will be delivered in 2 shipments...out of which 1 you will receive today throught Porter",
    "The one will be delivered by Delhivery",
    "Tracking ID: <span style='color:#ff87ab;font-weight:600'>TN123456789</span>", // Themed color
    "Rishab has requested only you to open the gift hamper, not anyone else"
  ];

  const chatMessages = document.getElementById('chat-messages');
  
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
  const chatMessages = document.getElementById('chat-messages');
  
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
    gap: 10px;
    margin: 10px 0;
    justify-content: center;
  `;
  
  const yesButton = document.createElement('button');
  yesButton.innerHTML = '✨ Yes';
  yesButton.style.cssText = `
    background: linear-gradient(135deg, #ff6b9d, #e25594);
    color: white;
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
  noButton.innerHTML = '💔 No';
  noButton.style.cssText = `
    background: linear-gradient(135deg, #ffcce0, #ffa8cc);
    color: #8b4c7a;
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
  gift1Video.controls = true;
  gift1Video.style.cssText = `
    width: 300px;
    max-width: 100%;
    border-radius: 10px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  `;
  
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
  gift2Video.controls = true;
  gift2Video.style.cssText = `
    width: 300px;
    max-width: 100%;
    border-radius: 10px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  `;
  
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
  const modal = document.getElementById('gift-popup-modal');
  if (modal) {
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
  const userInput = document.getElementById('user-input');
  const message = userInput.value.trim();
  document.getElementById('user-input').value = '';
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
  userInput.value = '';
  
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
const loadingText = document.getElementById("loading-text");
loadingText.style.display = "block";

setTimeout(() => {
nextPage("surprise");
}, 1500);
}


// Batch DOM insertion for sparkles
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


function updateLoveMeter(progress) {
  const fill = document.getElementById('heart-fill');
  fill.style.width = progress + '%';
}

document.getElementById("wishForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const wish = this.wish.value;

  fetch("https://script.google.com/macros/s/AKfycby8IA3jgSSW8WSegW1X8mP5hzITx06TPjDNWoylAb2xSNZ0m33cQpFG8nCxjWR73vV2/exec", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `wish=${encodeURIComponent(wish)}`
  })
    .then(() => {
      document.getElementById("wishStatus").innerText = "The universe received your wish 🌠";
      this.reset();
    })
    .catch(() => {
      document.getElementById("wishStatus").innerText = "Something went wrong. Try again!";
    });
});
 

/*
// Secret Letter */

function checkSecret() {
  const password = prompt("Enter your phone number to unlock 💌:");

  if (password === "7076863754") {
    document.getElementById("secretLetter").style.display = "block";
    document.body.style.overflow = "hidden"; // prevent background scroll
  } else if (password !== null) {
    alert("Oops! Wrong password 💔");
  }
}

// 🎥 Video Player Logic
function initVideo() {
  const video = document.getElementById('surprise-video');
  const playHint = document.querySelector('.play-hint');
  
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
  if (!createHeartParticle.container) {
    createHeartParticle.container = document.querySelector('.hearts');
  }
  const container = createHeartParticle.container;
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
  }, 2000);
}

// Add to your existing nextPage() function:
if (id === "surprise") {
  setTimeout(() => {
    initVideo();
    // Start floating lyrics animation (prevent multiple intervals)
    const lyrics = document.querySelector('.floating-lyrics');
    if (window.lyricsInterval) clearInterval(window.lyricsInterval);
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
  }, 100);
}

// 🎥 Fixed Replay Function 
function replayVideo() {
  const video = document.getElementById('surprise-video');
  
  // Reset and play
  video.currentTime = 0;
  video.play().catch(e => console.log("Auto-play prevented:", e));
  
  // Visual feedback
  const btn = document.querySelector('[onclick="replayVideo()"]');
  btn.innerHTML = '<span>🎀 Playing...</span>';
  
  setTimeout(() => {
    btn.innerHTML = '<span>🔄 Replay</span>';
  }, 1500);
  
  // Restart heart particles if needed
  if (window.heartInterval) clearInterval(window.heartInterval);
  const rect = video.getBoundingClientRect();
  window.heartInterval = setInterval(() => {
    createHeartParticle(rect.left + 150, rect.top + 100);
  }, 300);
}

function addMessage(text, sender) {
  const chatMessages = document.getElementById('chat-messages');
  
  const messageElement = document.createElement('div');
  messageElement.classList.add('message', sender + '-message');
  messageElement.innerHTML = text; // Use innerHTML to allow for themed spans in bot messages
  
  chatMessages.appendChild(messageElement);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  // --- NEW: Log message to Google Sheet ---
  logChatToGoogleSheet(text, sender);
}

// --- NEW FUNCTION: To send chat data to Google Sheet ---
function logChatToGoogleSheet(message, sender) {
  if (!WEB_APP_URL || WEB_APP_URL === 'YOUR_DEPLOYED_WEB_APP_URL_HERE') {
    console.warn("WEB_APP_URL is not set. Chat messages will not be logged to Google Sheet.");
    return;
  }

  fetch('https://script.google.com/macros/s/AKfycbzR5YJcx0ogDWC-6uLCwkEyW7PQS083KTNaBsowpKiuEwpon49Gr8-72bDeA5bzUlgZlg/exec', {
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
  const chatMessages = document.getElementById('chat-messages');
  
  // Show typing indicator
  const typingIndicator = createTypingIndicator();
  chatMessages.appendChild(typingIndicator);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  
  setTimeout(() => {
    // Remove typing indicator
    chatMessages.removeChild(typingIndicator);
    
    // Generate response
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

  // Add your thank-you + invite to play "Let's Remember"
  setTimeout(() => {
    addMessage(response, 'bot'); // This will also log to sheet

    // Thank you message
    setTimeout(() => {
      addMessage("Before we wrap this up... wanna play something sweet? 💭 It’s called Let's Remember — where you finish our memories!", 'bot'); // This will also log to sheet

      // Start the memory game
      isInLetsRemember = true;
      letsRememberStep = 0;
      memoryAnswers = [];

      setTimeout(() => {
        addMessage(letsRememberFlow[letsRememberStep], 'bot'); // This will also log to sheet
      }, 1500);
    }, 1500);

  }, 100); // initial bot response delay

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
    
    addMessage(response, 'bot'); // This will also log to sheet
  }, 1500);
}


// Update the showSlide function to handle the new design
function showSlide(index) {
  const img = document.getElementById("slide-img");
  const video = document.getElementById("slide-video");
  const caption = document.getElementById("slide-caption");
  const slide = slides[index];
  
  // Update progress dots
  updateProgressDots(index);

  img.style.opacity = 0;
  video.style.opacity = 0;

  setTimeout(() => {
    if (slide.type === "photo") {
      img.src = slide.src;
      img.hidden = false;
      video.hidden = true;
      caption.textContent = slide.caption;
      img.style.opacity = 1;
      
      // Add subtle animation
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
          
          // Add subtle animation
          video.style.transform = "scale(0.95)";
          setTimeout(() => {
            video.style.transition = "transform 0.5s ease";
            video.style.transform = "scale(1)";
          }, 50);
        }, 100);
      };
      
      clearInterval(autoSlideTimer); // Pause for video
      video.onended = () => {
        const audio = document.getElementById("bg-music");
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
  const dotsContainer = document.querySelector(".progress-dots");
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
  document.querySelectorAll('video').forEach(video => {
    video.pause();
    video.currentTime = 0;
  });
}


function openPasswordPrompt() {
  document.getElementById("passwordModal").style.display = "block";
}

function closePasswordModal() {
  document.getElementById("passwordModal").style.display = "none";
  document.getElementById("letterPassword").value = "";
  document.getElementById("wrongPass").style.display = "none";
}

function verifyPassword() {
  const entered = document.getElementById("letterPassword").value.trim();
  const correct = "1984"; // 🔒 Replace this with your actual password

  if (entered === correct) {
    closePasswordModal();
    document.getElementById("secretLetter").style.display = "block";
  } else {
    document.getElementById("wrongPass").style.display = "block";
  }
}
