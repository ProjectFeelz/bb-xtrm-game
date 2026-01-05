// =====================================================
// BB XTRM PRO STUDIO - MAIN APPLICATION
// Complete supabaseClient Integration with PWA Support
// =====================================================

// ==================== CONFIGURATION ====================
const GAME_URL = 'https://qholvwlaeldvrlmvepnj.supabase.co'; 
const GAME_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFob2x2d2xhZWxkdnJsbXZlcG5qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0NTgxODIsImV4cCI6MjA4MzAzNDE4Mn0.vuf0EAsbWi2xduhkncMvjYAlEb3CPOcY9Px2fuk_N54'; 

const supabaseClient = window.supabase.createClient(GAME_URL, GAME_KEY, {
    auth: {
        persistSession: true,
        storageKey: 'bb-xtrm-auth',
        storage: window.localStorage,
        autoRefreshToken: true,
        detectSessionInUrl: true
    }
});

// ==================== CACHE & SERVICE WORKER MANAGEMENT ====================
const APP_VERSION = '1.0.7'; // Increment this when you deploy updates

// Clear old caches and manage service worker
// ═══════════════════════════════════════════════════════════════
// BB XTRM - MOBILE/APK FIXES
// Add these fixes to your app.js to solve PWA issues
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// FIX 1: PREVENT BOOT LOOP - IMPROVED CACHE MANAGEMENT
// ═══════════════════════════════════════════════════════════════
// Replace your existing manageCacheAndSW() function with this:

async function clearAllCaches() {
    const APP_VERSION = '1.0.6'; // Increment this when deploying updates
    const storedVersion = localStorage.getItem('app_version');
    
    // Check if we're stuck in a boot loop
    const bootAttempts = parseInt(sessionStorage.getItem('boot_attempts') || '0');
    const lastBootTime = parseInt(sessionStorage.getItem('last_boot_time') || '0');
    const now = Date.now();
    
    // If we've tried to boot multiple times in quick succession, clear everything
    if (bootAttempts > 3 && (now - lastBootTime) < 5000) {
        console.warn('⚠️ Boot loop detected, forcing cache clear...');
        localStorage.clear();
        sessionStorage.clear();
        if ('caches' in window) {
            const names = await caches.keys();
            await Promise.all(names.map(name => caches.delete(name)));
        }
        // Don't reload - just continue with fresh state
        sessionStorage.setItem('boot_attempts', '0');
        return true;
    }
    
    // Track boot attempt
    sessionStorage.setItem('boot_attempts', (bootAttempts + 1).toString());
    sessionStorage.setItem('last_boot_time', now.toString());
    
    // Clear boot attempts after successful load
    setTimeout(() => {
        sessionStorage.setItem('boot_attempts', '0');
    }, 5000);
    
    if (storedVersion !== APP_VERSION) {
        console.log('New version detected, clearing caches...');
        
        // Clear all caches
        if ('caches' in window) {
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map(name => caches.delete(name)));
        }
        
        // Unregister service workers
        if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            for (const registration of registrations) {
                await registration.unregister();
            }
        }
        
        // Clear only session storage (keep auth in localStorage)
        sessionStorage.clear();
        
        // Update version
        localStorage.setItem('app_version', APP_VERSION);
        
        // Only reload if this wasn't a fresh install
        if (storedVersion !== null) {
            console.log('Reloading for version update...');
            window.location.reload(true);
            return false;
        }
    }
    
    return true;
}

// ═══════════════════════════════════════════════════════════════
// FIX 2: DISABLE SERVICE WORKER (PREVENTING CACHING ISSUES)
// ═══════════════════════════════════════════════════════════════
// Add this to your init() function or at the end of the file:

// Unregister any existing service workers
async function removeServiceWorkers() {
    if ('serviceWorker' in navigator) {
        try {
            const registrations = await navigator.serviceWorker.getRegistrations();
            for (const registration of registrations) {
                await registration.unregister();
                console.log('Unregistered service worker');
            }
        } catch (err) {
            console.error('Failed to unregister service workers:', err);
        }
    }
}

// Call this on init
removeServiceWorkers();

// ═══════════════════════════════════════════════════════════════
// FIX 3: PERFORMANCE OPTIMIZATION - REDUCE PHONE HEATING
// ═══════════════════════════════════════════════════════════════

// A) THROTTLE TIMER UPDATES
// Replace your startTimer() function with this optimized version:

function startTimer() {
    clearInterval(timerInterval);
    elements.timer.classList.remove('timer-low');
    
    // Show time immediately
    updateTimerDisplay();
    
    // Reduce update frequency to reduce CPU usage
    let lastUpdate = Date.now();
    const UPDATE_INTERVAL = 1000; // Update every 1 second (not faster)
    
    timerInterval = setInterval(() => {
        const now = Date.now();
        
        // Only update if enough time has passed
        if (now - lastUpdate < UPDATE_INTERVAL) return;
        lastUpdate = now;
        
        timeLeft--;
        
        if (cooldownLeft > 0) { 
            cooldownLeft--; 
            updateCooldownUI(); 
        }
        
        // Only play sound effects on certain beats (not every tick)
        if (timeLeft <= 10) {
            elements.timer.classList.add('timer-low');
            if (timeLeft % 2 === 0) { // Only every 2 seconds
                playAlarmBuzz((10 - timeLeft) / 10);
            }
        } else if (timeLeft % 5 === 0) { // Only every 5 seconds
            playTick();
        }
        
        updateTimerDisplay();
        
        if (timeLeft <= 0) { 
            clearInterval(timerInterval); 
            comboCount = 0; 
            playError(); 
            showScreen('screen-modes'); 
        }
    }, 100); // Check every 100ms, but only update UI every 1000ms
}

function updateTimerDisplay() {
    const min = Math.floor(timeLeft / 60);
    const sec = timeLeft % 60;
    elements.timer.textContent = (min < 10 ? "0" + min : min) + ":" + (sec < 10 ? "0" + sec : sec);
}

// C) CLEANUP INTERVALS AND TIMEOUTS
// Add this cleanup function and call it when switching screens:

function cleanupTimers() {
    // Clear all intervals
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    // Clear any animation frames
    if (window.animationFrame) {
        cancelAnimationFrame(window.animationFrame);
        window.animationFrame = null;
    }
}

// Update showScreen to cleanup on screen change:
function showScreen(screenId) {
    // Clean up timers before switching
    cleanupTimers();
    
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active-screen'));
    const target = document.getElementById(screenId);
    if (target) target.classList.add('active-screen');
}

// D) LIMIT CONFETTI (CPU INTENSIVE)
// Replace createConfetti() with this lighter version:

function createConfetti() {
    // Reduce confetti count on mobile
    const isMobile = window.innerWidth < 768;
    const confettiCount = isMobile ? 15 : 50; // Much less on mobile
    
    const colors = ['#00f2ff', '#ff00ff', '#ffd700'];
    
    for (let i = 0; i < confettiCount; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 0.5 + 's';
            document.body.appendChild(confetti);
            
            // IMPORTANT: Clean up after animation
            setTimeout(() => {
                confetti.remove();
            }, 3000);
        }, i * 30);
    }
}

// ═══════════════════════════════════════════════════════════════
// FIX 4: HIDE BROWSER BAR IN PWA MODE
// ═══════════════════════════════════════════════════════════════
// Update your manifest.json file with these settings:

/*
{
  "name": "BB XTRM Pro Studio",
  "short_name": "BB XTRM",
  "display": "standalone",
  "orientation": "portrait",
  "theme_color": "#1a1d26",
  "background_color": "#1a1d26",
  "start_url": "/",
  "scope": "/",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
*/

// Add this meta tag to your index.html <head> section:
/*
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
*/

// ═══════════════════════════════════════════════════════════════
// FIX 5: PREVENT MEMORY LEAKS
// ═══════════════════════════════════════════════════════════════

// Add this to clean up event listeners when changing screens:
let activeListeners = [];

function addManagedListener(element, event, handler) {
    if (!element) return;
    element.addEventListener(event, handler);
    activeListeners.push({ element, event, handler });
}

function cleanupEventListeners() {
    activeListeners.forEach(({ element, event, handler }) => {
        if (element) {
            element.removeEventListener(event, handler);
        }
    });
    activeListeners = [];
}

// Call cleanupEventListeners() when leaving screens
// For example, when exiting game:
function exitGame() { 
    cleanupTimers();
    cleanupEventListeners();
    clearInterval(timerInterval); 
    playClick(); 
    showScreen('screen-modes'); 
}

// ═══════════════════════════════════════════════════════════════
// FIX 6: AUDIO CONTEXT OPTIMIZATION
// ═══════════════════════════════════════════════════════════════

// Add this to prevent audio context from staying active:
function cleanupAudio() {
    if (audioContext && audioContext.state !== 'closed') {
        audioContext.suspend(); // Suspend instead of close to allow reuse
    }
}

// Call this when app goes to background:
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
        cleanupAudio();
        cleanupTimers();
    }
});

// ═══════════════════════════════════════════════════════════════
// FIX 7: REDUCE DOM MANIPULATION IN FEED
// ═══════════════════════════════════════════════════════════════

// When loading feed, use DocumentFragment for better performance:
async function loadFeedPosts() {
    console.log('🔵 loadFeedPosts() called');
    const feedList = document.getElementById('feed-list');
    
    if (!feedList) {
        console.error('❌ Feed list not found');
        return;
    }
    
    feedList.innerHTML = '<div style="text-align:center;color:#888;padding:20px;">Loading clips...</div>';
    
    try {
        let query = supabaseClient
            .from('feed_posts')
            .select('*')
            .eq('is_approved', true)
            .order('created_at', { ascending: false })
            .limit(10); // REDUCE FROM 20 TO 10 for better performance
        
        if (currentFeedTab === 'challenges') {
            query = query.eq('is_challenge_entry', true);
        }
        
        const { data, error } = await query;
        
        if (error || !data || data.length === 0) {
            feedList.innerHTML = '<div style="text-align:center;color:#888;padding:40px;">No clips yet</div>';
            return;
        }
        
        // Use DocumentFragment for better performance
        const fragment = document.createDocumentFragment();
        const tempDiv = document.createElement('div');
        
        let html = '';
        for (const post of data) {
            // ... your existing post HTML generation ...
            // (keep the same HTML generation code)
        }
        
        tempDiv.innerHTML = html;
        while (tempDiv.firstChild) {
            fragment.appendChild(tempDiv.firstChild);
        }
        
        // Single DOM update
        feedList.innerHTML = '';
        feedList.appendChild(fragment);
        
        // Load comment counts
        for (const post of data) {
            loadCommentCount(post.id);
        }
        
    } catch (err) {
        console.error('Feed error:', err);
        feedList.innerHTML = '<div style="text-align:center;color:var(--red);padding:20px;">Error loading feed</div>';
    }
}

// ═══════════════════════════════════════════════════════════════
// SUMMARY OF FIXES:
// ═══════════════════════════════════════════════════════════════
/*
1. ✅ Boot loop prevention with smart detection
2. ✅ Service worker removal (no more aggressive caching)
3. ✅ Timer throttling (reduces CPU usage)
4. ✅ Limited animations on mobile
5. ✅ Confetti reduction (CPU intensive)
6. ✅ Proper cleanup of timers and listeners
7. ✅ Audio context suspension when app hidden
8. ✅ Optimized DOM manipulation
9. ✅ PWA manifest for hiding browser bar
10. ✅ Reduced feed limit (10 instead of 20)

Apply these fixes and your phone should:
- ❌ NOT heat up anymore
- ❌ NOT get stuck in boot loop
- ❌ NOT show browser bar (in PWA mode)
- ✅ Run smooth and cool
- ✅ Persist login properly
*/

// Prevent stale cache on page show (back/forward cache)
window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        // Page was restored from back/forward cache
        window.location.reload();
    }
});

// ==================== AUDIO SYSTEM ====================
let audioContext = null;

function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
}

function playClick() {
    initAudio();
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.frequency.value = 900;
    gain.gain.setValueAtTime(0.12, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
    osc.start();
    osc.stop(audioContext.currentTime + 0.05);
}

function playTick() {
    initAudio();
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.frequency.value = 1200;
    gain.gain.setValueAtTime(0.03, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.03);
    osc.start();
    osc.stop(audioContext.currentTime + 0.03);
}

function playAlarmBuzz(intensity) {
    initAudio();
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.type = 'sawtooth';
    osc.frequency.value = 220 + (intensity * 180);
    gain.gain.setValueAtTime(0.08 + (intensity * 0.12), audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.15);
    osc.start();
    osc.stop(audioContext.currentTime + 0.15);
}

function playCassetteInsert() {
    initAudio();
    const click = audioContext.createOscillator();
    const clickGain = audioContext.createGain();
    click.connect(clickGain);
    clickGain.connect(audioContext.destination);
    click.frequency.value = 200;
    clickGain.gain.setValueAtTime(0.15, audioContext.currentTime);
    clickGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    click.start();
    click.stop(audioContext.currentTime + 0.1);
    
    setTimeout(() => {
        const whirr = audioContext.createOscillator();
        const whirrGain = audioContext.createGain();
        whirr.connect(whirrGain);
        whirrGain.connect(audioContext.destination);
        whirr.type = 'sawtooth';
        whirr.frequency.setValueAtTime(100, audioContext.currentTime);
        whirr.frequency.exponentialRampToValueAtTime(300, audioContext.currentTime + 0.3);
        whirrGain.gain.setValueAtTime(0.08, audioContext.currentTime);
        whirrGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        whirr.start();
        whirr.stop(audioContext.currentTime + 0.3);
    }, 100);
}

function playSuccess() {
    initAudio();
    [400, 600, 800].forEach((freq, i) => {
        setTimeout(() => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            osc.connect(gain);
            gain.connect(audioContext.destination);
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.1, audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
            osc.start();
            osc.stop(audioContext.currentTime + 0.15);
        }, i * 50);
    });
}

function playError() {
    initAudio();
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.frequency.setValueAtTime(600, audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.2);
    gain.gain.setValueAtTime(0.15, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    osc.start();
    osc.stop(audioContext.currentTime + 0.2);
}

function playCelebration() {
    initAudio();
    const notes = [392, 494, 587, 698, 784, 880];
    notes.forEach((freq, i) => {
        setTimeout(() => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            osc.connect(gain);
            gain.connect(audioContext.destination);
            osc.frequency.value = freq;
            osc.type = 'sine';
            gain.gain.setValueAtTime(0.12, audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
            osc.start();
            osc.stop(audioContext.currentTime + 0.4);
        }, i * 80);
    });
}

// ==================== GAME STATE ====================
const SET_LIMIT = 10;
const RERUN_PENALTY = 50;

let currentUser = null;
let userProfile = null;
let userAnalytics = null;

let sessionClout = 0;
let timeLeft = 0;
let timerInterval = null;
let selectedMode = '';
let tasksCompleted = 0;
let comboCount = 0;
let rerunUsedInSession = false;
let cleanStreakCount = 0;
let cooldownLeft = 0;
let speedDemonCount = 0;
let usedCards = [];
let sessionStartTime = null;
let totalRerunsThisSession = 0;
let totalRestartsThisSession = 0;
let currentCardText = '';
let currentCardTime = 30;

// ==================== CARD DECKS WITH VARIABLE TIME ====================
// Format: { text: "task", time: 30-60 seconds }
const cardDecks = {
    production: [
        // Quick chaos (30s)
        { text: "DELETE the first plugin you see. No undo.", time: 30 },
        { text: "Mute everything except ONE element. Make it slap.", time: 30 },
        { text: "Pan your kick hard left. Leave it.", time: 30 },
        { text: "Add distortion to your most delicate sound", time: 30 },
        { text: "Reverse your snare. It lives there now.", time: 30 },
        { text: "Put a telephone EQ on your lead melody", time: 30 },
        { text: "Duplicate your bass, pitch it UP 12 semitones", time: 30 },
        { text: "Add 100% wet reverb to your drums for 4 bars", time: 30 },
        { text: "Remove ALL reverb from the entire project", time: 30 },
        { text: "Swap your kick and snare patterns", time: 30 },
        
        // Medium madness (40s)
        { text: "Sidechain your MELODY to your hi-hats", time: 40 },
        { text: "Create a riser using only reversed sounds from your track", time: 40 },
        { text: "Make your bass the lead for 8 bars", time: 40 },
        { text: "Chop your main loop into 8 pieces, rearrange RANDOMLY", time: 40 },
        { text: "Add vinyl crackle but make it LOUDER than your snare", time: 40 },
        { text: "Bounce your master, reimport it, bitcrush it", time: 40 },
        { text: "Pitch your ENTIRE track up 7 semitones for 4 bars", time: 40 },
        { text: "Layer your kick with a vocal chop", time: 40 },
        { text: "Add a field recording from your phone to the mix", time: 40 },
        { text: "Put a gate on your reverb tails, make them rhythmic", time: 40 },
        { text: "Create a build-up using only automation, no new sounds", time: 40 },
        { text: "Make something sound underwater then back to normal", time: 40 },
        
        // Complex tasks (50s)
        { text: "Sample YOUR OWN VOICE saying something dumb, make it a hook", time: 50 },
        { text: "Record yourself banging on your desk, replace your drums", time: 50 },
        { text: "Create an 8-bar breakdown using ONLY reversed sounds", time: 50 },
        { text: "Resample your master through 3 different distortions", time: 50 },
        { text: "Make your weakest element the STAR of a 4-bar section", time: 50 },
        { text: "Add a tempo change mid-track. Make it actually work.", time: 50 },
        { text: "Create a drop using only 3 elements from your track", time: 50 },
        { text: "Turn a mistake into a feature. Find one. Feature it.", time: 50 },
        
        // Full chaos (60s)
        { text: "Export, import to NEW project, flip it into something unrecognizable", time: 60 },
        { text: "Record audio through your phone speaker, use it as a layer", time: 60 },
        { text: "Add 5 random plugins to your master. Make it sound GOOD.", time: 60 },
        { text: "Swap roles: bass=lead, drums=melody, melody=percussion", time: 60 },
        { text: "Create a completely new 8-bar section using ONLY existing sounds", time: 60 },
        { text: "Make a remix of your own track. 60 seconds. Go.", time: 60 }
    ],
    
    beats: [
        // Quick hits (30s)
        { text: "Remove your kick for 4 bars. Fill it with ANYTHING else.", time: 30 },
        { text: "Double-time your hi-hats until they're uncomfortable", time: 30 },
        { text: "Put reverb on your kick. Yes. Do it.", time: 30 },
        { text: "Delete every other snare hit", time: 30 },
        { text: "Pitch your snare UP an octave", time: 30 },
        { text: "Add swing until it sounds DRUNK", time: 30 },
        { text: "Layer your kick with a snap. Just a snap.", time: 30 },
        { text: "Reverse your hi-hat pattern completely", time: 30 },
        { text: "Add a rimshot on EVERY off-beat", time: 30 },
        { text: "Make your drums mono. All of them.", time: 30 },
        
        // Medium tasks (40s)
        { text: "Create a drum fill using ONLY kicks", time: 40 },
        { text: "Make your drums sound like they're in a parking garage", time: 40 },
        { text: "Add a percussion element that makes NO sense", time: 40 },
        { text: "Create a 4-bar pattern with NO kick drum", time: 40 },
        { text: "Chop a breakbeat beyond recognition, use the pieces", time: 40 },
        { text: "Layer 3 snares. Make them sound like ONE weird snare.", time: 40 },
        { text: "Add a polyrhythmic element that fights the groove", time: 40 },
        { text: "Make a roll that speeds up AND slows down", time: 40 },
        { text: "Use a melodic instrument as your main percussion", time: 40 },
        { text: "Add ghost notes to EVERYTHING", time: 40 },
        { text: "Create a 2-bar loop using found sounds only", time: 40 },
        { text: "Sidechain your hi-hats to your snare", time: 40 },
        
        // Complex tasks (50s)
        { text: "Beatbox for 15 seconds, sample it, chop it, use it", time: 50 },
        { text: "Create drums using only household objects (record now)", time: 50 },
        { text: "Make a half-time AND double-time switch in 8 bars", time: 50 },
        { text: "Program drums that sound HUMAN (imperfect timing on purpose)", time: 50 },
        { text: "Create a call-and-response between kick and snare", time: 50 },
        { text: "Build a breakdown where SILENCE is the main rhythm", time: 50 },
        { text: "Layer acoustic drums over electronic. Make it one kit.", time: 50 },
        { text: "Create glitchy drums using ONLY audio effects", time: 50 },
        
        // Chaos tasks (60s)
        { text: "Stomp and clap a full pattern. Record it. That's your drums now.", time: 60 },
        { text: "Sample machinery sounds from YouTube. Build a full kit.", time: 60 },
        { text: "Create 4 completely different drum patterns in 16 bars", time: 60 },
        { text: "Make your drums sound like a COMPLETELY different genre", time: 60 },
        { text: "Build a trap beat using only boom-bap samples (or vice versa)", time: 60 },
        { text: "Create drums that tell a story: soft → chaotic → soft", time: 60 }
    ],
    
    songwriting: [
        // Quick inspiration (30s)
        { text: "Hum a melody RIGHT NOW. Record it raw. Keep it.", time: 30 },
        { text: "Write a one-word hook. Repeat it 4 times with different melodies.", time: 30 },
        { text: "Change one chord to something WRONG. Leave it.", time: 30 },
        { text: "Add a 2-note counter-melody over your hook", time: 30 },
        { text: "Write the WORST bar you can imagine. Use it anyway.", time: 30 },
        { text: "Whisper your next line instead of singing it", time: 30 },
        { text: "Use only 3 notes for your next melody", time: 30 },
        { text: "Add a rest where there absolutely shouldn't be one", time: 30 },
        { text: "Say 'yeah' or 'uh' in a weird place. Commit.", time: 30 },
        { text: "Sing one line in a completely different accent", time: 30 },
        
        // Medium creativity (40s)
        { text: "Write a 4-bar melody using only voice memos as reference", time: 40 },
        { text: "Sing your hook BACKWARDS phonetically. Use it.", time: 40 },
        { text: "Write a pre-chorus in a fake language", time: 40 },
        { text: "Create a melody that only goes DOWN, never up", time: 40 },
        { text: "Write from the perspective of an INANIMATE OBJECT", time: 40 },
        { text: "Add ad-libs that CONTRADICT your main lyrics", time: 40 },
        { text: "Write a verse using only QUESTIONS", time: 40 },
        { text: "Sing something happy over something sad (or vice versa)", time: 40 },
        { text: "Write about the last thing you ate. Make it emotional.", time: 40 },
        { text: "Add a harmony a 5th above. Even if it sounds weird.", time: 40 },
        { text: "Write a line about what you see right now", time: 40 },
        { text: "Use someone's name in the hook (anyone)", time: 40 },
        
        // Complex composition (50s)
        { text: "Write and record an 8-bar verse about your LAST MEAL", time: 50 },
        { text: "Create a call-and-response hook with YOURSELF", time: 50 },
        { text: "Write a bridge that has NOTHING to do with your song", time: 50 },
        { text: "Freestyle 20 seconds. Grab the best line. Build from it.", time: 50 },
        { text: "Write a chorus that works as BOTH the intro AND outro", time: 50 },
        { text: "Record 3 vocal takes with 3 different emotions. Layer them.", time: 50 },
        { text: "Write lyrics that tell the same story forward AND backward", time: 50 },
        { text: "Create a melody using a scale you've NEVER used", time: 50 },
        
        // Chaos creation (60s)
        { text: "Write and record a verse about the LAST TEXT you received", time: 60 },
        { text: "Open a random book/article. First sentence = your hook. Melodize it.", time: 60 },
        { text: "Create a complete hook: lead vocal, harmony, AND ad-libs", time: 60 },
        { text: "Write from 3 different characters' perspectives in ONE verse", time: 60 },
        { text: "Record vocals THROUGH your phone INTO your DAW. That's the lead.", time: 60 },
        { text: "Create an entire chorus melody using ONLY your name", time: 60 }
    ]
};

const countries = ["Afghanistan","Albania","Algeria","Argentina","Australia","Austria","Bangladesh","Belgium","Brazil","Canada","Chile","China","Colombia","Czech Republic","Denmark","Egypt","Finland","France","Germany","Ghana","Greece","Hungary","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Jamaica","Japan","Kenya","Malaysia","Mexico","Netherlands","New Zealand","Nigeria","Norway","Pakistan","Peru","Philippines","Poland","Portugal","Romania","Russia","Saudi Arabia","Singapore","South Africa","South Korea","Spain","Sweden","Switzerland","Taiwan","Thailand","Turkey","Ukraine","United Arab Emirates","United Kingdom","United States","Venezuela","Vietnam","Zimbabwe"];

const elements = {
    screenLoading: document.getElementById('screen-loading'),
    screenAuth: document.getElementById('screen-auth'),
    screenOnboarding: document.getElementById('screen-onboarding'),
    screenManual: document.getElementById('screen-manual'),
    screenModes: document.getElementById('screen-modes'),
    screenGame: document.getElementById('screen-game'),
    screenResults: document.getElementById('screen-results'),
    screenLeaderboard: document.getElementById('screen-leaderboard'),
    authEmail: document.getElementById('auth-email'),
    authBtn: document.getElementById('auth-btn'),
    authMessage: document.getElementById('auth-message'),
    onboardName: document.getElementById('onboard-name'),
    onboardAge: document.getElementById('onboard-age'),
    onboardCountry: document.getElementById('onboard-country'),
    onboardSubmit: document.getElementById('onboard-submit'),
    onboardError: document.getElementById('onboard-error'),
    welcomeMsg: document.getElementById('welcome-msg'),
    globalRankDisplay: document.getElementById('global-rank-display'),
    lastScore: document.getElementById('last-score'),
    streakCount: document.getElementById('streak-count'),
    taskCount: document.getElementById('task-count'),
    cloutVal: document.getElementById('clout-val'),
    cheatError: document.getElementById('cheat-error'),
    timer: document.getElementById('timer'),
    comboAlert: document.getElementById('combo-alert'),
    cardBody: document.getElementById('card-body'),
    completeBtn: document.getElementById('complete-btn'),
    cooldownTimer: document.getElementById('cooldown-timer'),
    resultHeader: document.getElementById('result-header'),
    resultClout: document.getElementById('result-clout'),
    previousBest: document.getElementById('previous-best'),
    perfectBadge: document.getElementById('perfect-badge'),
    resultFooter: document.getElementById('result-footer'),
    tryAgainBtn: document.getElementById('try-again-btn'),
    profileIcon: document.getElementById('profile-icon'),
    profileOverlay: document.getElementById('profile-overlay'),
    closeProfile: document.getElementById('close-profile'),
    profileInitial: document.getElementById('profile-initial'),
    profileName: document.getElementById('profile-name'),
    profileLocation: document.getElementById('profile-location'),
    statLifetime: document.getElementById('stat-lifetime'),
    statBest: document.getElementById('stat-best'),
    statReruns: document.getElementById('stat-reruns'),
    statCloutLost: document.getElementById('stat-clout-lost'),
    logoutBtn: document.getElementById('logout-btn'),
    leaderboardBtn: document.getElementById('leaderboard-btn'),
    leaderboardList: document.getElementById('leaderboard-list'),
    closeLeaderboard: document.getElementById('close-leaderboard')
};

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active-screen'));
    const target = document.getElementById(screenId);
    if (target) target.classList.add('active-screen');
}

function populateCountryDropdown() {
    const select = elements.onboardCountry;
    if (!select) return;
    countries.forEach(country => {
        const option = document.createElement('option');
        option.value = country;
        option.textContent = country;
        select.appendChild(option);
    });
}

async function checkAuthState() {
    try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session) {
            currentUser = session.user;
            await loadUserProfile();
        } else {
            showScreen('screen-auth');
        }
    } catch (err) {
        console.error('Auth check failed:', err);
        showScreen('screen-auth');
    }
}

async function sendMagicLink() {
    const email = elements.authEmail.value.trim();
    if (!email || !email.includes('@')) {
        elements.authMessage.textContent = 'Please enter a valid email address';
        elements.authMessage.style.color = 'var(--red)';
        playError();
        return;
    }
    elements.authBtn.disabled = true;
    elements.authBtn.textContent = 'SENDING...';
    try {
        const { error } = await supabaseClient.auth.signInWithOtp({
            email: email,
            options: { emailRedirectTo: window.location.origin }
        });
        if (error) {
            elements.authMessage.textContent = error.message;
            elements.authMessage.style.color = 'var(--red)';
            playError();
        } else {
            elements.authMessage.textContent = 'Magic link sent! Check your email inbox.';
            elements.authMessage.style.color = 'var(--green)';
            playSuccess();
        }
    } catch (err) {
        elements.authMessage.textContent = 'Network error. Please try again.';
        elements.authMessage.style.color = 'var(--red)';
        playError();
    }
    elements.authBtn.disabled = false;
    elements.authBtn.textContent = 'SEND MAGIC LINK';
}

async function signInWithDiscord() {
    try {
        const { error } = await supabaseClient.auth.signInWithOAuth({
            provider: 'discord',
            options: {
                redirectTo: window.location.origin
            }
        });
        if (error) {
            elements.authMessage.textContent = error.message;
            elements.authMessage.style.color = 'var(--red)';
            playError();
        }
    } catch (err) {
        elements.authMessage.textContent = 'Discord sign-in failed. Try again.';
        elements.authMessage.style.color = 'var(--red)';
        playError();
    }
}

async function logout() {
    try {
        localStorage.clear();
        sessionStorage.clear();
        await supabaseClient.auth.signOut({ scope: 'local' });
        currentUser = null;
        userProfile = null;
        userAnalytics = null;
        if (elements.profileOverlay) elements.profileOverlay.classList.remove('active');
        showScreen('screen-auth');
        playClick();
        setTimeout(() => window.location.reload(), 100);
    } catch (err) {
        console.error('Logout failed:', err);
        window.location.reload();
    }
}

async function loadUserProfile() {
    if (!currentUser) { showScreen('screen-auth'); return; }
    try {
        console.log('Loading profile for user:', currentUser.id);
        const { data, error } = await supabaseClient.rpc('get_full_profile');
        console.log('Profile response:', data, error);
        
        if (error) { console.error('Profile fetch error:', error); showScreen('screen-onboarding'); return; }
        if (!data || !data.success) { 
            console.error('Profile not successful:', data);
            showScreen('screen-onboarding'); 
            return; 
        }
        if (!data.profile || !data.profile.onboarding_completed) { 
            console.log('Onboarding not completed');
            showScreen('screen-onboarding'); 
            return; 
        }
        
        userProfile = data.profile;
        userAnalytics = data.analytics || {};
        console.log('User profile loaded:', userProfile);
        console.log('User analytics loaded:', userAnalytics);
        
        updateMainScreenUI();
        
        // Check for login bonus
        checkLoginBonus();
        
        if (!sessionStorage.getItem('manualSeen')) {
            sessionStorage.setItem('manualSeen', 'true');
            showScreen('screen-manual');
        } else {
            showScreen('screen-modes');
        }
    } catch (err) {
        console.error('Profile load failed:', err);
        showScreen('screen-onboarding');
    }
}

async function checkLoginBonus() {
    try {
        const { data, error } = await supabaseClient.rpc('check_login_bonus');
        if (error) { console.error('Login bonus check failed:', error); return; }
        if (data && data.success && data.bonus > 0) {
            showBonusNotification(data.bonus_type, data.bonus);
            if (userProfile) userProfile.lifetime_clout = data.new_total;
            updateMainScreenUI();
        }
    } catch (err) {
        console.error('Login bonus error:', err);
    }
}

function showBonusNotification(bonusType, amount) {
    const notification = document.createElement('div');
    notification.className = 'bonus-notification';
    notification.innerHTML = `
        <div class="bonus-type">${bonusType}</div>
        <div class="bonus-amount">+${amount} CLOUT</div>
    `;
    document.body.appendChild(notification);
    playSuccess();
    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

function updateMainScreenUI() {
    if (!userProfile) return;
    elements.welcomeMsg.textContent = 'WELCOME, ' + (userProfile.artist_name || 'ARTIST');
    elements.globalRankDisplay.textContent = userProfile.personal_best || 0;
    elements.lastScore.textContent = (userProfile.lifetime_clout || 0) + ' LIFETIME CLOUT';
    elements.streakCount.textContent = userProfile.current_streak || 0;
}

async function completeOnboarding() {
    const name = elements.onboardName.value.trim();
    const age = parseInt(elements.onboardAge.value);
    const country = elements.onboardCountry.value;
    if (!name || name.length < 2) { elements.onboardError.textContent = 'Please enter a valid artist name'; elements.onboardError.style.display = 'block'; playError(); return; }
    if (!age || age < 13 || age > 120) { elements.onboardError.textContent = 'Please enter a valid age (13+)'; elements.onboardError.style.display = 'block'; playError(); return; }
    if (!country) { elements.onboardError.textContent = 'Please select your country'; elements.onboardError.style.display = 'block'; playError(); return; }
    elements.onboardError.style.display = 'none';
    elements.onboardSubmit.disabled = true;
    elements.onboardSubmit.textContent = 'SAVING...';
    try {
        const { error } = await supabaseClient.rpc('complete_onboarding', { p_age: age, p_artist_name: name, p_country: country });
        if (error) throw error;
        userProfile = { onboarding_completed: true, artist_name: name, age: age, country: country, lifetime_clout: 0, personal_best: 0, current_streak: 0, perfect_sets: 0 };
        playSuccess();
        sessionStorage.setItem('manualSeen', 'true');
        showScreen('screen-manual');
    } catch (err) {
        console.error("Onboarding failed:", err);
        elements.onboardError.textContent = 'Error saving: ' + err.message;
        elements.onboardError.style.display = 'block';
        playError();
    }
    elements.onboardSubmit.disabled = false;
    elements.onboardSubmit.textContent = "LET'S GO";
}

function openProfile() {
    if (!userProfile) return;
    elements.profileInitial.textContent = userProfile.artist_name?.charAt(0) || '?';
    elements.profileName.textContent = userProfile.artist_name || 'UNKNOWN';
    elements.profileLocation.textContent = userProfile.country || 'Unknown';
    elements.statLifetime.textContent = userProfile.lifetime_clout || 0;
    elements.statBest.textContent = userProfile.personal_best || 0;
    elements.statReruns.textContent = userProfile.total_reruns || userAnalytics?.total_reruns || 0;
    elements.statCloutLost.textContent = userProfile.clout_lost || userAnalytics?.clout_lost_to_reruns || 0;
    elements.profileOverlay.classList.add('active');
    playClick();
}

function closeProfile() { elements.profileOverlay.classList.remove('active'); playClick(); }

async function openLeaderboard() {
    closeProfile();
    showScreen('screen-leaderboard');
    playClick();
    elements.leaderboardList.innerHTML = '<div style="text-align:center;color:#888;">Loading rankings...</div>';
    try {
        const { data, error } = await supabaseClient.from('profiles').select('artist_name, lifetime_clout, country').order('lifetime_clout', { ascending: false }).limit(50);
        if (error) throw error;
        if (!data || data.length === 0) { elements.leaderboardList.innerHTML = '<div style="text-align:center;color:#888;">No players yet!</div>'; return; }
        let html = '';
        data.forEach((player, index) => {
            const rank = index + 1;
            let emoji = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank;
            const isMe = userProfile && player.artist_name === userProfile.artist_name;
            html += '<div style="display:flex;justify-content:space-between;padding:10px;margin:5px 0;background:' + (isMe ? 'rgba(255,0,255,0.2)' : 'rgba(0,0,0,0.3)') + ';border-radius:8px;border:1px solid ' + (isMe ? 'var(--magenta)' : 'transparent') + ';"><span style="color:var(--cyan);">' + emoji + '</span><span style="flex:1;margin-left:10px;">' + player.artist_name + '</span><span style="color:var(--yellow);">' + (player.lifetime_clout || 0) + '</span></div>';
        });
        elements.leaderboardList.innerHTML = html;
    } catch (err) {
        console.error('Leaderboard error:', err);
        elements.leaderboardList.innerHTML = '<div style="text-align:center;color:var(--red);">Failed to load</div>';
    }
}

function closeLeaderboard() { 
    showScreen('screen-modes'); 
    playClick(); 
}

function startGame(mode) {
    selectedMode = mode;
    tasksCompleted = 0;
    sessionClout = 0;
    comboCount = 0;
    cleanStreakCount = 0;
    rerunUsedInSession = false;
    speedDemonCount = 0;
    usedCards = [];
    totalRerunsThisSession = 0;
    totalRestartsThisSession = 0;
    sessionStartTime = Date.now();
    elements.cloutVal.textContent = "0";
    elements.perfectBadge.style.display = "none";
    playSuccess();
    playCassetteInsert();
    showScreen('screen-game');
    drawTask();
}

function drawTask() {
    if (tasksCompleted >= SET_LIMIT) { endSession(); return; }
    elements.taskCount.textContent = (tasksCompleted + 1) + '/' + SET_LIMIT;
    const deck = cardDecks[selectedMode] || cardDecks.production;
    let availableCards = deck.filter(card => !usedCards.includes(card.text));
    if (availableCards.length === 0) { usedCards = []; availableCards = [...deck]; }
    const selectedCard = availableCards[Math.floor(Math.random() * availableCards.length)];
    currentCardText = selectedCard.text;
    currentCardTime = selectedCard.time;
    usedCards.push(currentCardText);
    elements.cardBody.classList.add('cassette-load');
    elements.cardBody.textContent = currentCardText;
    playCassetteInsert();
    setTimeout(() => elements.cardBody.classList.remove('cassette-load'), 600);
    timeLeft = currentCardTime;
    cooldownLeft = 10;
    updateCooldownUI();
    startTimer();
}

function updateCooldownUI() {
    if (cooldownLeft > 0) {
        elements.completeBtn.classList.add('btn-locked');
        elements.cooldownTimer.textContent = 'LOCKED: ' + cooldownLeft + 's';
    } else {
        elements.completeBtn.classList.remove('btn-locked');
        elements.cooldownTimer.textContent = "READY";
    }
}

function startTimer() {
    clearInterval(timerInterval);
    elements.timer.classList.remove('timer-low');
    
    // Show time immediately before interval starts
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    elements.timer.textContent = (m < 10 ? "0" + m : m) + ":" + (s < 10 ? "0" + s : s);
    
    timerInterval = setInterval(() => {
        timeLeft--;
        if (cooldownLeft > 0) { cooldownLeft--; updateCooldownUI(); }
        if (timeLeft <= 10) {
            elements.timer.classList.add('timer-low');
            playAlarmBuzz((10 - timeLeft) / 10);
        } else { playTick(); }
        const min = Math.floor(timeLeft / 60);
        const sec = timeLeft % 60;
        elements.timer.textContent = (min < 10 ? "0" + min : min) + ":" + (sec < 10 ? "0" + sec : sec);
        if (timeLeft <= 0) { clearInterval(timerInterval); comboCount = 0; playError(); showScreen('screen-modes'); }
    }, 1000);
}

function attemptComplete() { if (cooldownLeft > 0) { showCheatError(); return; } completeTask(); }

function showCheatError() { elements.cheatError.style.opacity = "1"; playError(); setTimeout(() => elements.cheatError.style.opacity = "0", 2000); }

function completeTask() {
    clearInterval(timerInterval);
    
    // Speed demon: finish with more than half the time left
    let currentBonus = 0;
    const halfTime = Math.floor(currentCardTime / 2);
    if (timeLeft > halfTime) { currentBonus += 5; speedDemonCount++; triggerAlert("SPEED DEMON +5"); }
    
    tasksCompleted++;
    sessionClout += (10 + currentBonus);
    comboCount++;
    cleanStreakCount++;
    
    playSuccess();
    
    if (comboCount === 3) { sessionClout += 25; setTimeout(() => triggerAlert("XP OVERDRIVE +25"), 800); comboCount = 0; }
    if (cleanStreakCount === 6 && !rerunUsedInSession) { const bonus = Math.floor(Math.random() * 101) + 50; sessionClout += bonus; setTimeout(() => triggerAlert('CLEAN STREAK +' + bonus), 1600); }
    
    elements.cloutVal.textContent = sessionClout;
    
    // Check if set is complete
    if (tasksCompleted >= SET_LIMIT) {
        endSession();
        return;
    }
    
    // Show cooldown screen between cards
    showCooldownScreen();
}

function showCooldownScreen() {
    showScreen('screen-cooldown');
    
    // Update stats on cooldown screen
    const cooldownTask = document.getElementById('cooldown-task');
    const cooldownClout = document.getElementById('cooldown-clout');
    if (cooldownTask) cooldownTask.textContent = tasksCompleted;
    if (cooldownClout) cooldownClout.textContent = sessionClout;
    
    let cooldownTime = 10;
    const countdownEl = document.getElementById('cooldown-countdown');
    const progressEl = document.getElementById('cooldown-progress');
    
    countdownEl.textContent = cooldownTime;
    progressEl.style.width = '100%';
    
    const cooldownInterval = setInterval(() => {
        cooldownTime--;
        countdownEl.textContent = cooldownTime;
        progressEl.style.width = ((cooldownTime / 10) * 100) + '%';
        
        if (cooldownTime <= 3) {
            playTick();
        }
        
        if (cooldownTime <= 0) {
            clearInterval(cooldownInterval);
            playCassetteInsert();
            showScreen('screen-game');
            drawTask();
        }
    }, 1000);
}

function triggerAlert(text) { elements.comboAlert.textContent = text; elements.comboAlert.style.opacity = "1"; setTimeout(() => elements.comboAlert.style.opacity = "0", 2000); }

async function rerollTask() {
    if (sessionClout < RERUN_PENALTY) { 
        triggerAlert('NEED ' + RERUN_PENALTY + ' CLOUT'); 
        playError(); 
        return; 
    }
    
    // Stop current timer immediately
    clearInterval(timerInterval);
    timerInterval = null;
    
    rerunUsedInSession = true;
    cleanStreakCount = 0;
    comboCount = 0;
    totalRerunsThisSession++;
    sessionClout -= RERUN_PENALTY;
    elements.cloutVal.textContent = sessionClout;
    playClick();
    
    // Get the deck
    const deck = cardDecks[selectedMode] || cardDecks.production;
    if (!deck || deck.length === 0) {
        console.error('No deck found');
        startTimer();
        return;
    }
    
    // Get a different card
    const oldCardText = currentCardText;
    const availableCards = deck.filter(c => c.text !== oldCardText);
    const newCard = availableCards.length > 0 
        ? availableCards[Math.floor(Math.random() * availableCards.length)]
        : deck[Math.floor(Math.random() * deck.length)];
    
    // Update state
    currentCardText = newCard.text;
    currentCardTime = newCard.time || 45;
    timeLeft = currentCardTime;
    cooldownLeft = 10;
    
    // Update UI
    elements.cardBody.textContent = currentCardText;
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    elements.timer.textContent = (m < 10 ? "0" + m : m) + ":" + (s < 10 ? "0" + s : s);
    elements.timer.classList.remove('timer-low');
    updateCooldownUI();
    
    // Start new timer
    startTimer();
    
    triggerAlert('RERUN -' + RERUN_PENALTY + ' CLOUT');
}

function restartSession() { if (confirm("RESTART SESSION? Progress will be lost.")) { totalRestartsThisSession++; playClick(); startGame(selectedMode); } }
function restartFromResults() { playClick(); playCassetteInsert(); startGame(selectedMode); }
function exitGame() { clearInterval(timerInterval); playClick(); showScreen('screen-modes'); }

async function endSession() {
    clearInterval(timerInterval);
    showScreen('screen-results');
    const sessionDuration = Math.floor((Date.now() - sessionStartTime) / 1000);
    const wasPerfectSet = !rerunUsedInSession && speedDemonCount >= 5;
    let displayClout = sessionClout;
    if (wasPerfectSet) { displayClout += 100; elements.perfectBadge.style.display = "block"; } else { elements.perfectBadge.style.display = "none"; }
    
    // Show clout immediately
    elements.resultClout.textContent = displayClout;
    elements.resultHeader.textContent = "SET COMPLETE";
    elements.resultFooter.textContent = "BANKING CLOUT...";
    elements.resultFooter.style.color = "";
    
    playCelebration();
    createConfetti();
    
    try {
        const { data, error } = await supabaseClient.rpc('increment_clout', {
            p_clout_amount: displayClout,
            p_game_mode: selectedMode,
            p_tasks_completed: tasksCompleted,
            p_reruns_used: totalRerunsThisSession,
            p_restarts: totalRestartsThisSession,
            p_speed_demons: speedDemonCount,
            p_was_perfect_set: wasPerfectSet,
            p_session_duration: sessionDuration
        });
        
        if (error) { 
            console.error('Save failed:', error); 
            elements.resultFooter.textContent = "ERROR SAVING - CLOUT NOT RECORDED"; 
            elements.resultFooter.style.color = "var(--red)"; 
            return;
        }
        
        if (data && data.success) {
            userProfile.lifetime_clout = data.new_lifetime_total;
            userProfile.current_streak = data.new_streak;
            userProfile.total_reruns = (userProfile.total_reruns || 0) + totalRerunsThisSession;
            userProfile.clout_lost = (userProfile.clout_lost || 0) + (totalRerunsThisSession * RERUN_PENALTY);
            
            // Update streak display on main screen
            if (elements.streakCount) elements.streakCount.textContent = data.new_streak;
            
            if (data.is_new_best) { 
                userProfile.personal_best = data.final_clout; 
                elements.resultHeader.textContent = "NEW PERSONAL BEST!"; 
                elements.tryAgainBtn.style.display = "none"; 
                elements.previousBest.style.display = "none"; 
            } else { 
                elements.resultHeader.textContent = "SESSION COMPLETE"; 
                elements.tryAgainBtn.style.display = "block"; 
                elements.previousBest.style.display = "block"; 
                elements.previousBest.querySelector('span').textContent = userProfile.personal_best; 
            }
            
            elements.resultClout.textContent = data.final_clout;
            let footerText = "SESSION ARCHIVED.";
            
            // Show streak notification if streak increased
            if (data.streak_increased && data.new_streak > 1) {
                setTimeout(() => {
                    showStreakNotification(data.new_streak, data.streak_bonus);
                }, 1500);
            }
            
            if (data.streak_bonus > 0) {
                footerText += ' 🔥 STREAK BONUS: +' + data.streak_bonus + '!';
            }
            
            elements.resultFooter.textContent = footerText;
            elements.resultFooter.style.color = data.streak_bonus > 0 ? "var(--yellow)" : "";
            
            if (userAnalytics) { 
                userAnalytics.total_reruns = (userAnalytics.total_reruns || 0) + totalRerunsThisSession; 
                userAnalytics.clout_lost = (userAnalytics.clout_lost || 0) + (totalRerunsThisSession * RERUN_PENALTY); 
            }
        } else {
            elements.resultFooter.textContent = "SESSION ARCHIVED.";
        }
    } catch (err) { 
        console.error('Session error:', err); 
        elements.resultFooter.textContent = "NETWORK ERROR - CLOUT NOT RECORDED"; 
        elements.resultFooter.style.color = "var(--red)"; 
    }
}

function showStreakNotification(streak, bonus) {
    const notification = document.createElement('div');
    notification.className = 'streak-notification';
    notification.innerHTML = `
        <div class="streak-fire">🔥</div>
        <div class="streak-count">${streak} PLAY STREAK!</div>
        ${bonus > 0 ? `<div class="streak-bonus">+${bonus} CLOUT</div>` : ''}
        <div class="streak-message">${getStreakMessage(streak)}</div>
    `;
    document.body.appendChild(notification);
    playSuccess();
    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 500);
    }, 3500);
}

function getStreakMessage(streak) {
    if (streak >= 30) return "LEGENDARY STREAK! 👑";
    if (streak >= 14) return "UNSTOPPABLE! 💪";
    if (streak >= 7) return "ON FIRE! 🎯";
    if (streak >= 3) return "BUILDING MOMENTUM! ⚡";
    return "KEEP IT GOING! 🚀";
}

function initEventListeners() {
    if (elements.authBtn) elements.authBtn.addEventListener('click', sendMagicLink);
    if (elements.authEmail) elements.authEmail.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMagicLink(); });
    
    const discordBtn = document.getElementById('discord-btn');
    if (discordBtn) discordBtn.addEventListener('click', signInWithDiscord);
    
    if (elements.onboardSubmit) elements.onboardSubmit.addEventListener('click', completeOnboarding);
    const manualContinue = document.getElementById('manual-continue');
    if (manualContinue) manualContinue.addEventListener('click', () => { playClick(); showScreen('screen-modes'); });
    const showManual = document.getElementById('show-manual');
    if (showManual) showManual.addEventListener('click', () => { playClick(); showScreen('screen-manual'); });
    document.querySelectorAll('.mode-btn').forEach(btn => { btn.addEventListener('click', () => { const mode = btn.dataset.mode; if (mode) startGame(mode); }); });
    if (elements.completeBtn) elements.completeBtn.addEventListener('click', attemptComplete);
    const rerunBtn = document.getElementById('rerun-btn');
    if (rerunBtn) rerunBtn.addEventListener('click', rerollTask);
    const restartBtn = document.getElementById('restart-btn');
    if (restartBtn) restartBtn.addEventListener('click', restartSession);
    const exitBtn = document.getElementById('exit-btn');
    if (exitBtn) exitBtn.addEventListener('click', exitGame);
    const continueBtn = document.getElementById('continue-btn');
    if (continueBtn) continueBtn.addEventListener('click', () => { updateMainScreenUI(); showScreen('screen-modes'); playClick(); });
    if (elements.tryAgainBtn) elements.tryAgainBtn.addEventListener('click', restartFromResults);
    if (elements.profileIcon) elements.profileIcon.addEventListener('click', openProfile);
    if (elements.closeProfile) elements.closeProfile.addEventListener('click', closeProfile);
    if (elements.logoutBtn) elements.logoutBtn.addEventListener('click', logout);
    if (elements.leaderboardBtn) elements.leaderboardBtn.addEventListener('click', openLeaderboard);
    if (elements.closeLeaderboard) elements.closeLeaderboard.addEventListener('click', closeLeaderboard);
    if (elements.profileOverlay) elements.profileOverlay.addEventListener('click', (e) => { if (e.target === elements.profileOverlay) closeProfile(); });
    
    // Community Feed listeners
    const communityBtn = document.getElementById('community-btn');
    if (communityBtn) communityBtn.addEventListener('click', openFeed);
    const closeFeedBtn = document.getElementById('close-feed-btn');
    if (closeFeedBtn) closeFeedBtn.addEventListener('click', () => { playClick(); showScreen('screen-modes'); });
    const submitClipBtn = document.getElementById('submit-clip-btn');
    if (submitClipBtn) submitClipBtn.addEventListener('click', () => { playClick(); showScreen('screen-submit'); });
    const cancelSubmitBtn = document.getElementById('cancel-submit-btn');
    if (cancelSubmitBtn) cancelSubmitBtn.addEventListener('click', () => { playClick(); showScreen('screen-feed'); });
    const submitPostBtn = document.getElementById('submit-post-btn');
    if (submitPostBtn) submitPostBtn.addEventListener('click', submitFeedPost);
    
    // Challenge entry listeners
    const enterChallengeBtn = document.getElementById('enter-challenge-btn');
    if (enterChallengeBtn) enterChallengeBtn.addEventListener('click', openChallengeSubmit);
    const submitChallengeEntryBtn = document.getElementById('submit-challenge-entry-btn');
    if (submitChallengeEntryBtn) submitChallengeEntryBtn.addEventListener('click', submitChallengeEntry);
    const cancelChallengeBtn = document.getElementById('cancel-challenge-btn');
    if (cancelChallengeBtn) cancelChallengeBtn.addEventListener('click', () => { playClick(); showScreen('screen-feed'); });
    
    // Public profile listeners
    const closePublicProfile = document.getElementById('close-public-profile');
    if (closePublicProfile) closePublicProfile.addEventListener('click', () => { playClick(); showScreen('screen-feed'); });
    
    // Edit profile listeners
    const editProfileBtn = document.getElementById('edit-profile-btn');
    if (editProfileBtn) editProfileBtn.addEventListener('click', openEditProfile);
    const saveProfileBtn = document.getElementById('save-profile-btn');
    if (saveProfileBtn) saveProfileBtn.addEventListener('click', saveProfile);
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    if (cancelEditBtn) cancelEditBtn.addEventListener('click', () => { playClick(); showScreen('screen-modes'); });
    
    document.body.addEventListener('click', initAudio, { once: true });
    document.body.addEventListener('touchstart', initAudio, { once: true });
}

// ==================== COMMUNITY FEED FUNCTIONS ====================
let currentChallenge = null;
let currentFeedTab = 'all';

async function openFeed() {
    playClick();
    showScreen('screen-feed');
    await loadWinnerAnnouncement();
    await loadWeeklyChallenge();
    await loadFeedPosts();
    initFeedTabs();
}

function initFeedTabs() {
    document.querySelectorAll('.feed-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.feed-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentFeedTab = tab.dataset.tab;
            loadFeedPosts();
            playClick();
        });
    });
}

async function loadWinnerAnnouncement() {
    try {
        const { data, error } = await supabaseClient
            .from('weekly_challenges')
            .select('*, winner_post:feed_posts!winner_post_id(artist_name)')
            .eq('winner_announced', true)
            .order('end_date', { ascending: false })
            .limit(1);
        
        if (error) throw error;
        
        const winnerBanner = document.getElementById('winner-announcement');
        if (data && data.length > 0 && data[0].winner_post) {
            const challenge = data[0];
            document.getElementById('winner-name').textContent = '@' + challenge.winner_post.artist_name;
            document.getElementById('winner-challenge').textContent = challenge.title;
            if (challenge.youtube_live_url) {
                document.getElementById('winner-youtube-link').href = challenge.youtube_live_url;
                document.getElementById('winner-youtube-link').style.display = 'inline-block';
            } else {
                document.getElementById('winner-youtube-link').style.display = 'none';
            }
            winnerBanner.style.display = 'block';
        } else {
            winnerBanner.style.display = 'none';
        }
    } catch (err) {
        console.error('Failed to load winner:', err);
    }
}

async function loadWeeklyChallenge() {
    try {
        const { data, error } = await supabaseClient
            .from('weekly_challenges')
            .select('*')
            .eq('is_active', true)
            .gte('end_date', new Date().toISOString().split('T')[0])
            .order('created_at', { ascending: false })
            .limit(1);
        
        if (error) throw error;
        
        const challengeBanner = document.getElementById('weekly-challenge');
        if (data && data.length > 0) {
            currentChallenge = data[0];
            document.getElementById('challenge-title').textContent = currentChallenge.title;
            document.getElementById('challenge-desc').textContent = currentChallenge.description;
            document.getElementById('challenge-prize').textContent = currentChallenge.prize ? '🏆 ' + currentChallenge.prize : '';
            
            const endDate = new Date(currentChallenge.end_date);
            const now = new Date();
            const daysLeft = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
            document.getElementById('challenge-timer').textContent = '⏰ ' + daysLeft + ' days left';
            
            challengeBanner.style.display = 'block';
        } else {
            challengeBanner.style.display = 'none';
            currentChallenge = null;
        }
    } catch (err) {
        console.error('Failed to load weekly challenge:', err);
    }
}

// ═══════════════════════════════════════════════════════════════
// CORRECTED loadFeedPosts() FUNCTION
// Replace your existing function with this improved version
// ═══════════════════════════════════════════════════════════════

async function loadFeedPosts() {
    console.log('🔵 loadFeedPosts() called - starting feed load');
    const feedList = document.getElementById('feed-list');
    
    if (!feedList) {
        console.error('❌ CRITICAL: Feed list element (#feed-list) not found in DOM!');
        console.log('Available elements with "feed" in ID:', 
            Array.from(document.querySelectorAll('[id*="feed"]')).map(el => el.id));
        return;
    }
    
    console.log('✅ Feed list element found');
    feedList.innerHTML = '<div style="text-align:center;color:#888;padding:20px;">Loading clips...</div>';
    
    try {
        console.log('📡 Querying Supabase feed_posts table...');
        console.log('Current feed tab:', currentFeedTab);
        
        let query = supabaseClient
            .from('feed_posts')
            .select('*')
            .eq('is_approved', true)
            .order('is_pinned', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(20);
        
        if (currentFeedTab === 'challenges') {
            console.log('Filtering for challenge entries only');
            query = query.eq('is_challenge_entry', true);
        }
        
        const { data, error } = await query;
        
        console.log('📦 Supabase response:');
        console.log('  - Error:', error);
        console.log('  - Data length:', data?.length || 0);
        if (data && data.length > 0) {
            console.log('  - First post:', data[0].artist_name, '-', data[0].card_text);
        }
        
        if (error) {
            console.error('❌ Database query error:', error);
            feedList.innerHTML = '<div style="text-align:center;color:var(--red);padding:20px;">Database error: ' + error.message + '</div>';
            return;
        }
        
        if (!data || data.length === 0) {
            console.log('ℹ️ No posts found in database');
            feedList.innerHTML = '<div style="text-align:center;color:#888;padding:40px;">' + 
                (currentFeedTab === 'challenges' ? 'No challenge entries yet!' : 'No clips yet! Be the first to submit.') + '</div>';
            return;
        }
        
        console.log(`✅ Found ${data.length} posts - starting render`);
        
        // Find highest engagement score for challenge entries
        let highestScore = 0;
        if (currentFeedTab === 'challenges') {
            data.forEach(post => {
                if ((post.engagement_score || 0) > highestScore) {
                    highestScore = post.engagement_score || 0;
                }
            });
            console.log('Highest engagement score:', highestScore);
        }
        
        let html = '';
        let renderedCount = 0;
        
        for (const post of data) {
            try {
                const videoId = extractTikTokId(post.tiktok_url);
                const modeLabel = post.game_mode === 'production' ? 'ENGINEER' : 
                                 post.game_mode === 'beats' ? 'BEATS' : 
                                 post.game_mode === 'songwriting' ? 'WRITER' : 
                                 post.game_mode === 'challenge' ? 'CHALLENGE' : post.game_mode;
                
                const isChallenge = post.is_challenge_entry;
                const postClass = isChallenge ? 'feed-post challenge-entry' : (post.is_pinned ? 'feed-post pinned' : 'feed-post');
                const isLeading = isChallenge && highestScore > 0 && (post.engagement_score || 0) === highestScore;
                const isOwnPost = currentUser && post.user_id === currentUser.id;
                
                html += `
                    <div class="${postClass}" data-post-id="${post.id}">
                        <div class="feed-post-header">
                            <span class="feed-post-author" onclick="viewPublicProfile('${post.artist_name}')" style="cursor:pointer;">@${post.artist_name}${isChallenge ? '<span class="challenge-entry-badge">🎯</span>' : ''}</span>
                            <div style="display:flex;align-items:center;gap:8px;">
                                ${isChallenge ? `<span class="engagement-score ${isLeading ? 'leading' : ''}">🔥 ${post.engagement_score || 0} ${isLeading ? '👑' : ''}</span>` : `<span class="feed-post-mode">${modeLabel}</span>`}
                                ${isOwnPost ? `<button class="feed-delete-btn" onclick="deletePost('${post.id}')" title="Delete">🗑️</button>` : ''}
                            </div>
                        </div>
                        <div class="feed-post-card">"${post.card_text}"</div>
                        ${post.description ? '<div class="feed-post-desc">' + post.description + '</div>' : ''}
                        <div class="feed-tiktok-preview" id="preview-${post.id}" onclick="expandVideo('${post.id}', '${videoId}', '${post.tiktok_url}')">
                            <div class="tiktok-preview-overlay">
                                <span class="tiktok-play-btn">▶</span>
                                <span class="tiktok-tap-text">Tap to watch</span>
                            </div>
                        </div>
                        <div class="feed-post-actions">
                            <button class="feed-like-btn" onclick="toggleLike('${post.id}', this)">
                                ❤️ <span>${post.likes_count || 0}</span>
                            </button>
                            <button class="feed-comment-btn" onclick="toggleComments('${post.id}')">
                                💬 <span class="comment-count-${post.id}">0</span>
                            </button>
                        </div>
                        <div class="feed-comments" id="comments-${post.id}" style="display: none;">
                            <div class="comments-list" id="comments-list-${post.id}"></div>
                            <div class="feed-comment-input">
                                <button class="emoji-btn" onclick="toggleEmojiPicker('${post.id}')">😀</button>
                                <input type="text" placeholder="Add a comment..." id="comment-input-${post.id}" onkeypress="if(event.key==='Enter')addComment('${post.id}')" maxlength="150">
                                <button onclick="addComment('${post.id}')">Post</button>
                            </div>
                            <div class="emoji-picker" id="emoji-picker-${post.id}" style="display:none;">
                                <span onclick="insertEmoji('${post.id}','🔥')">🔥</span>
                                <span onclick="insertEmoji('${post.id}','💯')">💯</span>
                                <span onclick="insertEmoji('${post.id}','🎵')">🎵</span>
                                <span onclick="insertEmoji('${post.id}','🎹')">🎹</span>
                                <span onclick="insertEmoji('${post.id}','🎤')">🎤</span>
                                <span onclick="insertEmoji('${post.id}','🎧')">🎧</span>
                                <span onclick="insertEmoji('${post.id}','⚡')">⚡</span>
                                <span onclick="insertEmoji('${post.id}','💪')">💪</span>
                                <span onclick="insertEmoji('${post.id}','👀')">👀</span>
                                <span onclick="insertEmoji('${post.id}','😂')">😂</span>
                                <span onclick="insertEmoji('${post.id}','🙌')">🙌</span>
                                <span onclick="insertEmoji('${post.id}','❤️')">❤️</span>
                                <span onclick="insertEmoji('${post.id}','👏')">👏</span>
                                <span onclick="insertEmoji('${post.id}','🤯')">🤯</span>
                                <span onclick="insertEmoji('${post.id}','🎯')">🎯</span>
                                <span onclick="insertEmoji('${post.id}','✨')">✨</span>
                            </div>
                        </div>
                    </div>
                `;
                
                renderedCount++;
                
            } catch (postError) {
                console.error(`❌ Error rendering post ${post.id}:`, postError);
            }
        }
        
        console.log(`✅ Successfully rendered ${renderedCount}/${data.length} posts`);
        feedList.innerHTML = html;
        
        // Load comment counts
        console.log('📊 Loading comment counts...');
        for (const post of data) {
            loadCommentCount(post.id);
        }
        
        console.log('🎉 Feed loading complete!');
        
    } catch (err) {
        console.error('❌ CRITICAL ERROR in loadFeedPosts():', err);
        console.error('Stack:', err.stack);
        feedList.innerHTML = '<div style="text-align:center;color:var(--red);padding:20px;">Critical error: ' + err.message + '<br><small>Check console for details</small></div>';
    }
}

function extractTikTokId(url) {
    const match = url.match(/video\/(\d+)/) || url.match(/tiktok\.com\/@[\w.-]+\/video\/(\d+)/);
    return match ? match[1] : '';
}

function expandVideo(postId, videoId, tiktokUrl) {
    const preview = document.getElementById(`preview-${postId}`);
    if (videoId) {
        preview.innerHTML = `<iframe src="https://www.tiktok.com/embed/v2/${videoId}" allowfullscreen style="width:100%;height:400px;border:none;border-radius:8px;"></iframe>`;
        preview.classList.add('expanded');
    } else {
        window.open(tiktokUrl, '_blank');
    }
}

function toggleEmojiPicker(postId) {
    const picker = document.getElementById(`emoji-picker-${postId}`);
    picker.style.display = picker.style.display === 'none' ? 'flex' : 'none';
}

function insertEmoji(postId, emoji) {
    const input = document.getElementById(`comment-input-${postId}`);
    input.value += emoji;
    input.focus();
}

// Profanity filter
const profanityList = ['fuck','shit','ass','bitch','dick','pussy','cock','cunt','nigger','nigga','faggot','retard','whore','slut'];

function filterProfanity(text) {
    let filtered = text;
    profanityList.forEach(word => {
        const regex = new RegExp(word, 'gi');
        filtered = filtered.replace(regex, '*'.repeat(word.length));
    });
    return filtered;
}

function containsProfanity(text) {
    const lowerText = text.toLowerCase();
    return profanityList.some(word => lowerText.includes(word));
}

function getTikTokLink(url) {
    return url;
}

async function deletePost(postId) {
    if (!confirm('Delete this post?')) return;
    
    try {
        const { error } = await supabaseClient
            .from('feed_posts')
            .delete()
            .eq('id', postId)
            .eq('user_id', currentUser.id);
        
        if (error) throw error;
        
        playSuccess();
        loadFeedPosts();
    } catch (err) {
        console.error('Failed to delete post:', err);
        playError();
        alert('Failed to delete post');
    }
}

// ==================== PUBLIC PROFILE FUNCTIONS ====================
async function viewPublicProfile(artistName) {
    playClick();
    showScreen('screen-public-profile');
    
    // Reset display
    document.getElementById('public-avatar').innerHTML = '?';
    document.getElementById('public-name').textContent = artistName;
    document.getElementById('public-location').textContent = '🌍 Loading...';
    document.getElementById('public-bio').textContent = '';
    document.getElementById('public-clout').textContent = '0';
    document.getElementById('public-streak').textContent = '0';
    document.getElementById('public-sets').textContent = '0';
    document.getElementById('public-socials').innerHTML = '';
    
    try {
        console.log('Fetching public profile for:', artistName);
        const { data, error } = await supabaseClient.rpc('get_public_profile', {
            p_artist_name: artistName
        });
        
        console.log('Public profile response:', data, error);
        
        if (error) throw error;
        
        if (data && data.success) {
            const p = data.profile;
            console.log('Profile data:', p);
            
            // Avatar
            const avatarEl = document.getElementById('public-avatar');
            if (p.avatar_url) {
                avatarEl.innerHTML = `<img src="${p.avatar_url}" alt="${p.artist_name}">`;
            } else {
                avatarEl.textContent = p.artist_name.charAt(0).toUpperCase();
            }
            
            // Basic info
            document.getElementById('public-name').textContent = p.artist_name;
            document.getElementById('public-location').textContent = '🌍 ' + (p.country || 'Unknown');
            document.getElementById('public-bio').textContent = p.bio || 'No bio yet...';
            
            // Stats
            document.getElementById('public-clout').textContent = p.lifetime_clout || 0;
            document.getElementById('public-streak').textContent = p.current_streak || 0;
            document.getElementById('public-sets').textContent = p.total_sets || 0;
            
            // Social links with proper icons
            let socialsHtml = '';
            if (p.tiktok_username) {
                const tiktok = p.tiktok_username.replace('@', '');
                socialsHtml += `<a href="https://tiktok.com/@${tiktok}" target="_blank" class="public-social-link tiktok">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
                    TikTok</a>`;
            }
            if (p.youtube_url) {
                socialsHtml += `<a href="${p.youtube_url}" target="_blank" class="public-social-link youtube">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                    YouTube</a>`;
            }
            if (p.instagram_username) {
                const insta = p.instagram_username.replace('@', '');
                socialsHtml += `<a href="https://instagram.com/${insta}" target="_blank" class="public-social-link instagram">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                    Instagram</a>`;
            }
            document.getElementById('public-socials').innerHTML = socialsHtml || '<span style="color:#666;font-size:0.7rem;">No socials linked</span>';
        }
    } catch (err) {
        console.error('Failed to load public profile:', err);
        document.getElementById('public-bio').textContent = 'Failed to load profile';
    }
}

function openEditProfile() {
    playClick();
    closeProfile();
    showScreen('screen-edit-profile');
    
    // Pre-fill with current data
    if (userProfile) {
        document.getElementById('edit-bio').value = userProfile.bio || '';
        document.getElementById('edit-tiktok').value = userProfile.tiktok_username || '';
        document.getElementById('edit-youtube').value = userProfile.youtube_url || '';
        document.getElementById('edit-instagram').value = userProfile.instagram_username || '';
        
        // Show avatar preview
        const preview = document.getElementById('avatar-preview');
        if (userProfile.avatar_url) {
            preview.innerHTML = `<img src="${userProfile.avatar_url}" alt="Avatar">`;
        } else {
            preview.textContent = userProfile.artist_name ? userProfile.artist_name.charAt(0).toUpperCase() : '?';
        }
    }
    document.getElementById('edit-profile-message').textContent = '';
    
    // Set up file upload listener
    const fileInput = document.getElementById('edit-avatar-file');
    if (fileInput) {
        fileInput.value = '';
        fileInput.addEventListener('change', handleAvatarUpload);
    }
    
    const removeBtn = document.getElementById('remove-avatar-btn');
    if (removeBtn) {
        removeBtn.addEventListener('click', removeAvatar);
    }
}

async function handleAvatarUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
        alert('Image too large! Max 2MB');
        return;
    }
    
    const validTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        alert('Invalid file type! Use PNG, JPG, GIF, or WEBP');
        return;
    }
    
    const preview = document.getElementById('avatar-preview');
    const container = document.querySelector('.avatar-upload-container');
    container.classList.add('avatar-uploading');
    preview.innerHTML = '⏳';
    
    try {
        // Create unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${currentUser.id}/avatar.${fileExt}`;
        
        // Upload to Supabase Storage
        const { data, error } = await supabaseClient.storage
            .from('avatars')
            .upload(fileName, file, { 
                upsert: true,
                contentType: file.type
            });
        
        if (error) throw error;
        
        // Get public URL
        const { data: urlData } = supabaseClient.storage
            .from('avatars')
            .getPublicUrl(fileName);
        
        const avatarUrl = urlData.publicUrl + '?t=' + Date.now(); // Cache bust
        
        // Update profile in database
        await supabaseClient.rpc('update_my_profile', {
            p_avatar_url: avatarUrl
        });
        
        // Update local profile
        if (userProfile) userProfile.avatar_url = avatarUrl;
        
        // Show preview
        preview.innerHTML = `<img src="${avatarUrl}" alt="Avatar">`;
        playSuccess();
        
    } catch (err) {
        console.error('Avatar upload failed:', err);
        alert('Upload failed: ' + err.message);
        preview.textContent = userProfile?.artist_name?.charAt(0).toUpperCase() || '?';
        playError();
    }
    
    container.classList.remove('avatar-uploading');
}

async function removeAvatar() {
    if (!confirm('Remove your avatar?')) return;
    
    try {
        // Delete from storage
        const fileName = `${currentUser.id}/avatar`;
        await supabaseClient.storage
            .from('avatars')
            .remove([`${fileName}.png`, `${fileName}.jpg`, `${fileName}.jpeg`, `${fileName}.gif`, `${fileName}.webp`]);
        
        // Update profile
        await supabaseClient.rpc('update_my_profile', {
            p_avatar_url: null
        });
        
        if (userProfile) userProfile.avatar_url = null;
        
        const preview = document.getElementById('avatar-preview');
        preview.textContent = userProfile?.artist_name?.charAt(0).toUpperCase() || '?';
        
        playSuccess();
    } catch (err) {
        console.error('Failed to remove avatar:', err);
        playError();
    }
}

async function saveProfile() {
    const bio = document.getElementById('edit-bio').value.trim();
    const tiktok = document.getElementById('edit-tiktok').value.trim();
    const youtube = document.getElementById('edit-youtube').value.trim();
    const instagram = document.getElementById('edit-instagram').value.trim();
    const messageEl = document.getElementById('edit-profile-message');
    
    const saveBtn = document.getElementById('save-profile-btn');
    saveBtn.disabled = true;
    saveBtn.textContent = 'SAVING...';
    
    try {
        const { data, error } = await supabaseClient.rpc('update_my_profile', {
            p_bio: bio || null,
            p_tiktok_username: tiktok || null,
            p_youtube_url: youtube || null,
            p_instagram_username: instagram || null
        });
        
        if (error) throw error;
        
        // Update local profile
        if (userProfile) {
            userProfile.bio = bio;
            userProfile.tiktok_username = tiktok;
            userProfile.youtube_url = youtube;
            userProfile.instagram_username = instagram;
        }
        
        messageEl.textContent = 'Profile saved!';
        messageEl.style.color = 'var(--green)';
        playSuccess();
        
        setTimeout(() => {
            showScreen('screen-modes');
        }, 1500);
        
    } catch (err) {
        console.error('Failed to save profile:', err);
        messageEl.textContent = 'Failed to save: ' + err.message;
        messageEl.style.color = 'var(--red)';
        playError();
    }
    
    saveBtn.disabled = false;
    saveBtn.textContent = 'SAVE';
}

async function loadCommentCount(postId) {
    try {
        const { count, error } = await supabaseClient
            .from('feed_comments')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', postId);
        
        if (!error) {
            const countEl = document.querySelector(`.comment-count-${postId}`);
            if (countEl) countEl.textContent = count || 0;
        }
    } catch (err) {
        console.error('Failed to load comment count:', err);
    }
}

async function toggleComments(postId) {
    const commentsDiv = document.getElementById(`comments-${postId}`);
    if (commentsDiv.style.display === 'none') {
        commentsDiv.style.display = 'block';
        await loadComments(postId);
    } else {
        commentsDiv.style.display = 'none';
    }
    playClick();
}

async function loadComments(postId) {
    const commentsList = document.getElementById(`comments-list-${postId}`);
    commentsList.innerHTML = '<div style="color:#666;font-size:0.65rem;">Loading...</div>';
    
    try {
        const { data, error } = await supabaseClient
            .from('feed_comments')
            .select('*')
            .eq('post_id', postId)
            .order('created_at', { ascending: true })
            .limit(20);
        
        if (error) throw error;
        
        if (!data || data.length === 0) {
            commentsList.innerHTML = '<div style="color:#666;font-size:0.65rem;">No comments yet</div>';
            return;
        }
        
        let html = '';
        data.forEach(comment => {
            html += `
                <div class="feed-comment">
                    <span class="feed-comment-author">@${comment.artist_name}</span>
                    <span class="feed-comment-text">${comment.comment_text}</span>
                </div>
            `;
        });
        commentsList.innerHTML = html;
    } catch (err) {
        console.error('Failed to load comments:', err);
        commentsList.innerHTML = '<div style="color:var(--red);font-size:0.65rem;">Failed to load</div>';
    }
}

async function addComment(postId) {
    const input = document.getElementById(`comment-input-${postId}`);
    let commentText = input.value.trim();
    
    if (!commentText) return;
    if (!currentUser) {
        alert('Please sign in to comment');
        return;
    }
    
    // Check for profanity and filter it
    if (containsProfanity(commentText)) {
        commentText = filterProfanity(commentText);
    }
    
    try {
        const { data, error } = await supabaseClient.rpc('add_comment', {
            p_post_id: postId,
            p_comment_text: commentText
        });
        
        if (error) throw error;
        
        input.value = '';
        
        // Hide emoji picker
        const picker = document.getElementById(`emoji-picker-${postId}`);
        if (picker) picker.style.display = 'none';
        
        await loadComments(postId);
        await loadCommentCount(postId);
        playSuccess();
        
        // Check for engagement bonus
        const bonusResult = await supabaseClient.rpc('check_engagement_bonus', { p_action_type: 'comment' });
        if (bonusResult.data && bonusResult.data.bonus > 0) {
            showBonusNotification(bonusResult.data.bonus_type, bonusResult.data.bonus);
        }
    } catch (err) {
        console.error('Failed to add comment:', err);
        playError();
    }
}

function getTikTokEmbed(url) {
    const match = url.match(/video\/(\d+)/) || url.match(/tiktok\.com\/@[\w.-]+\/video\/(\d+)/);
    if (match && match[1]) {
        return `<iframe src="https://www.tiktok.com/embed/v2/${match[1]}" allowfullscreen></iframe>`;
    }
    return `<a href="${url}" target="_blank" style="color:var(--cyan);display:block;padding:20px;text-align:center;">Watch on TikTok ↗</a>`;
}

async function toggleLike(postId, btn) {
    if (!currentUser) {
        alert('Please sign in to like posts');
        return;
    }
    
    try {
        const { data, error } = await supabaseClient.rpc('toggle_like', { p_post_id: postId });
        if (error) throw error;
        
        if (data.success) {
            const countSpan = btn.querySelector('span');
            let count = parseInt(countSpan.textContent) || 0;
            if (data.liked) {
                btn.classList.add('liked');
                countSpan.textContent = count + 1;
                
                // Check for engagement bonus
                const bonusResult = await supabaseClient.rpc('check_engagement_bonus', { p_action_type: 'like' });
                if (bonusResult.data && bonusResult.data.bonus > 0) {
                    showBonusNotification(bonusResult.data.bonus_type, bonusResult.data.bonus);
                }
            } else {
                btn.classList.remove('liked');
                countSpan.textContent = Math.max(0, count - 1);
            }
            playClick();
        }
    } catch (err) {
        console.error('Failed to toggle like:', err);
    }
}

function openChallengeSubmit() {
    if (!currentChallenge) {
        alert('No active challenge right now');
        return;
    }
    document.getElementById('challenge-entry-title').textContent = currentChallenge.title;
    document.getElementById('challenge-entry-card').textContent = '"' + currentChallenge.description + '"';
    playClick();
    showScreen('screen-challenge-submit');
}

async function submitChallengeEntry() {
    const tiktokUrl = document.getElementById('challenge-tiktok-url').value.trim();
    const description = document.getElementById('challenge-description').value.trim();
    const messageEl = document.getElementById('challenge-submit-message');
    
    if (!tiktokUrl || !tiktokUrl.includes('tiktok.com')) {
        messageEl.textContent = 'Please enter a valid TikTok URL';
        messageEl.style.color = 'var(--red)';
        playError();
        return;
    }
    
    const submitBtn = document.getElementById('submit-challenge-entry-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'SUBMITTING...';
    
    try {
        const { data, error } = await supabaseClient.rpc('submit_challenge_entry', {
            p_tiktok_url: tiktokUrl,
            p_description: description || null
        });
        
        if (error) throw error;
        
        if (data.success) {
            messageEl.textContent = 'Challenge entry submitted! Good luck! 🎯';
            messageEl.style.color = 'var(--green)';
            playSuccess();
            
            // Show bonus notification if any
            if (data.bonus && data.bonus > 0) {
                showBonusNotification(data.bonus_type, data.bonus);
            }
            
            document.getElementById('challenge-tiktok-url').value = '';
            document.getElementById('challenge-description').value = '';
            
            setTimeout(() => {
                showScreen('screen-feed');
                loadFeedPosts();
                messageEl.textContent = '';
            }, 2000);
        } else {
            throw new Error(data.error || 'Submission failed');
        }
    } catch (err) {
        console.error('Failed to submit challenge entry:', err);
        messageEl.textContent = 'Failed: ' + err.message;
        messageEl.style.color = 'var(--red)';
        playError();
    }
    
    submitBtn.disabled = false;
    submitBtn.textContent = '🎯 SUBMIT ENTRY';
}

async function submitFeedPost() {
    const tiktokUrl = document.getElementById('submit-tiktok-url').value.trim();
    const cardText = document.getElementById('submit-card-text').value.trim();
    const gameMode = document.getElementById('submit-game-mode').value;
    const description = document.getElementById('submit-description').value.trim();
    const messageEl = document.getElementById('submit-message');
    
    if (!tiktokUrl || !tiktokUrl.includes('tiktok.com')) {
        messageEl.textContent = 'Please enter a valid TikTok URL';
        messageEl.style.color = 'var(--red)';
        playError();
        return;
    }
    if (!cardText) {
        messageEl.textContent = 'Please enter the challenge card';
        messageEl.style.color = 'var(--red)';
        playError();
        return;
    }
    if (!gameMode) {
        messageEl.textContent = 'Please select a game mode';
        messageEl.style.color = 'var(--red)';
        playError();
        return;
    }
    
    const submitBtn = document.getElementById('submit-post-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'SUBMITTING...';
    
    try {
        const { data, error } = await supabaseClient.rpc('submit_feed_post', {
            p_tiktok_url: tiktokUrl,
            p_card_text: cardText,
            p_game_mode: gameMode,
            p_description: description || null
        });
        
        if (error) throw error;
        
        if (data.success) {
            messageEl.textContent = 'Clip submitted!';
            messageEl.style.color = 'var(--green)';
            playSuccess();
            
            // Show bonus notification if any
            if (data.bonus && data.bonus > 0) {
                showBonusNotification(data.bonus_type, data.bonus);
            }
            
            document.getElementById('submit-tiktok-url').value = '';
            document.getElementById('submit-card-text').value = '';
            document.getElementById('submit-game-mode').value = '';
            document.getElementById('submit-description').value = '';
            
            setTimeout(() => {
                showScreen('screen-feed');
                loadFeedPosts();
                messageEl.textContent = '';
            }, 2000);
        } else {
            throw new Error(data.error || 'Submission failed');
        }
    } catch (err) {
        console.error('Failed to submit post:', err);
        messageEl.textContent = 'Failed to submit: ' + err.message;
        messageEl.style.color = 'var(--red)';
        playError();
    }
    
    submitBtn.disabled = false;
    submitBtn.textContent = 'SUBMIT';
}

supabaseClient.auth.onAuthStateChange(async (event, session) => {
    console.log('Auth state:', event);
    if (event === 'SIGNED_IN' && session) { currentUser = session.user; await loadUserProfile(); }
    else if (event === 'SIGNED_OUT') { currentUser = null; userProfile = null; userAnalytics = null; showScreen('screen-auth'); }
});

// Don't register a service worker - it causes more problems than it solves for this app
// If you want offline support later, uncomment and create a proper sw.js

async function init() {
    // Manage cache and service worker first
    const shouldContinue = await manageCacheAndSW();
    if (!shouldContinue) return; // Page will reload
    
    populateCountryDropdown();
    initEventListeners();
    await checkAuthState();
}

if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); } else { init(); }
