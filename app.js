// =====================================================
// BB XTRM PRO STUDIO - MAIN APPLICATION
// Complete Supabase Integration with PWA Support
// =====================================================

// ==================== CONFIGURATION ====================
// Fixed: Added quotes and the full URL format
const SUPABASE_URL = 'https://jykeezvbsxngbqiejkkt.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5a2VlenZic3huZ2JxaWVqa2t0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcyNzIyMzIsImV4cCI6MjA4Mjg0ODIzMn0.o47Ddz9NJztpmMDhNryKnvO4lxdDnKn24YSrUZZDjHk'; 

// Initialize Supabase client
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

function createConfetti() {
    const colors = ['#00f2ff', '#ff00ff', '#ffd700', '#2ecc71', '#ff4757'];
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 0.5 + 's';
            document.body.appendChild(confetti);
            setTimeout(() => confetti.remove(), 3000);
        }, i * 30);
    }
}

// ==================== GAME STATE ====================
const SET_LIMIT = 10;
const TASK_TIME = 30;

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

// Card Decks
const cardDecks = {
    production: [
        'High-pass everything below 200Hz', 'Layer an extra snare quietly', 'Bus all melodic elements together',
        'Add a subtle 1/8 delay', 'Lightly saturate the bass', 'Pan the hats 30% right',
        'Double the vocal take', 'Add a reverse reverb tail', 'Add ~20% swing to the MIDI',
        'Sidechain the pad to the kick', 'Boost presence around 3k on vocals', 'Automate a gentle low-pass sweep (8 bars)',
        'Sneak in a foley texture', 'Soft-clip the master peak', 'Widen the chorus only',
        'Mono the sub-bass', 'Shift a melody up one octave', 'Gate the pads rhythmically',
        'Ping-pong delay on the hats', 'Shorten all kick decays', 'Mute the lead instrument (8 bars)',
        'Bitcrush the melody slightly', 'Clip the drum bus instead of compressing', 'Distort the parallel bus',
        'Swap reverb for delay on one element', 'Automate a filter using LFO', 'Hard-pan one background element',
        'Chorus on bass (low mix)', 'Print a resample and commit', 'Remove one plugin you rely on',
        'Turn one send into an insert', 'Automate reverb throw on last word', 'Collapse the mix to mono (4 bars)',
        'Sidechain something unexpected', 'Add a 1-bar silent gap', 'Reverse the entire FX bus (4 bars)',
        'Mute drums completely (8 bars)', 'Print the mix and re-import it', 'Pitch the master down -1 semitone (8 bars)',
        'Automate a hard low-pass to 300Hz (4 bars)', 'Only automate — no static settings (8 bars)', 'Redo the last change, but exaggerate it',
        'Swap roles: bass acts as melody', 'Remove the most "important" element', 'Do the opposite of your instinct',
        'Turn a mistake into the main feature'
    ],
    songwriting: [
        'Rhyme with "stone"', 'Use a weather metaphor', 'Mention a specific color',
        'Tell a 4-line mini story', 'Alliterate the next line', 'End the line with a verb',
        'Write about a machine', 'Describe a smell', 'Use a word with 4+ syllables',
        'Reference a 90s movie', 'Switch perspective to "them"', 'Include a line about time or a clock',
        'Use an AABB rhyme scheme', 'Internal rhymes only', 'Name a real city',
        'Start a line with "Never"', 'Drop in a technical term', 'Repeat one word for emphasis',
        'Write a question as a statement', 'No "I", "me", or "my" allowed', 'Ask three questions in a row',
        'Start the line with the last word used', 'No words ending in "-ing"', 'Write one line with zero verbs',
        'Contradict the previous line', 'Whisper the next 2 lines', 'Use only short words (1–2 syllables)',
        'Change tense mid-verse', 'Say something emotional without emotion words', 'Write from an object\'s POV',
        'Remove all rhymes (1 verse)', 'Turn the hook into spoken word', 'Rewrite the verse as instructions',
        'Say the quietest thought out loud', 'Rewrite your favorite line in a worse way', 'Keep the first idea — no edits',
        'Say what you\'ve been avoiding', 'Turn a filler line into the hook', 'Break your own rule'
    ],
    beats: [
        'Swap the snare for a clap', 'Nudge the hats 5ms late', 'Add a shaker loop',
        'Reverse the crash', 'Half-time the hi-hats', 'Humanize kick velocities',
        'Woodblock on beat 4', 'Delete every 4th kick', 'Add a rimshot on the "and"',
        'Ghost-note the snares', 'Pitch the hats down', 'Tambourine on 2 and 4',
        'Randomize hat velocities', 'Filter the drums (2 bars)', 'Snare roll at the end',
        'Add a single cowbell hit', 'Layer a quiet perc loop', 'Mute drums except kick (4 bars)',
        'Pitch the kick up 2 semitones', 'Insert a 1-bar drum break', 'Triple the hi-hat speed',
        'Replace the kick with a tom', 'Flanger on the drum bus', 'Remove the snare temporarily (8 bars)',
        'Only kicks and hats (4 bars)', 'Offset drums slightly off-grid', 'Mute the kick entirely (8 bars)',
        'Reverse the entire drum loop', 'One drum hit per bar only', 'Resample drums and destroy them',
        'Drums fade in from silence (16 bars)', 'Make the drums answer the vocal rhythm', 'Turn rhythm into melody',
        'Build tension without adding hits', 'Break the groove — then fix it', 'Do something that scares you (slightly)'
    ]
};

// Country list for dropdown
const countries = [
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Argentina", "Armenia", "Australia",
    "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium",
    "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei",
    "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Canada", "Cape Verde", "Central African Republic",
    "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus",
    "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt",
    "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland",
    "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea",
    "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran",
    "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati",
    "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein",
    "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands",
    "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro",
    "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand",
    "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan",
    "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland",
    "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia",
    "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia",
    "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands",
    "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname",
    "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste",
    "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda",
    "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan",
    "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

// ==================== DOM ELEMENTS ====================
const elements = {
    // Screens
    screenLoading: document.getElementById('screen-loading'),
    screenAuth: document.getElementById('screen-auth'),
    screenOnboarding: document.getElementById('screen-onboarding'),
    screenManual: document.getElementById('screen-manual'),
    screenModes: document.getElementById('screen-modes'),
    screenGame: document.getElementById('screen-game'),
    screenResults: document.getElementById('screen-results'),
    
    // Auth
    authEmail: document.getElementById('auth-email'),
    authBtn: document.getElementById('auth-btn'),
    authMessage: document.getElementById('auth-message'),
    
    // Onboarding
    onboardName: document.getElementById('onboard-name'),
    onboardAge: document.getElementById('onboard-age'),
    onboardCountry: document.getElementById('onboard-country'),
    onboardSubmit: document.getElementById('onboard-submit'),
    onboardError: document.getElementById('onboard-error'),
    
    // Modes
    welcomeMsg: document.getElementById('welcome-msg'),
    globalRankDisplay: document.getElementById('global-rank-display'),
    lastScore: document.getElementById('last-score'),
    streakCount: document.getElementById('streak-count'),
    badgeContainer: document.getElementById('badge-container'),
    
    // Game
    taskCount: document.getElementById('task-count'),
    cloutVal: document.getElementById('clout-val'),
    cheatError: document.getElementById('cheat-error'),
    timer: document.getElementById('timer'),
    comboAlert: document.getElementById('combo-alert'),
    cardBody: document.getElementById('card-body'),
    completeBtn: document.getElementById('complete-btn'),
    cooldownTimer: document.getElementById('cooldown-timer'),
    
    // Results
    resultHeader: document.getElementById('result-header'),
    resultClout: document.getElementById('result-clout'),
    previousBest: document.getElementById('previous-best'),
    perfectBadge: document.getElementById('perfect-badge'),
    resultFooter: document.getElementById('result-footer'),
    tryAgainBtn: document.getElementById('try-again-btn'),
    
    // Profile
    profileIcon: document.getElementById('profile-icon'),
    profileOverlay: document.getElementById('profile-overlay'),
    closeProfile: document.getElementById('close-profile'),
    profileInitial: document.getElementById('profile-initial'),
    profileName: document.getElementById('profile-name'),
    profileLocation: document.getElementById('profile-location'),
    statLifetime: document.getElementById('stat-lifetime'),
    statBest: document.getElementById('stat-best'),
    statSessions: document.getElementById('stat-sessions'),
    statTime: document.getElementById('stat-time'),
    logoutBtn: document.getElementById('logout-btn')
};

// ==================== UTILITY FUNCTIONS ====================
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active-screen'));
    const target = document.getElementById(screenId);
    if (target) {
        target.classList.add('active-screen');
    }
}

function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
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

// ==================== AUTH FUNCTIONS ====================
async function checkAuthState() {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
            console.error('Auth error:', error);
            showScreen('screen-auth');
            return;
        }
        
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
        const { error } = await supabase.auth.signInWithOtp({
            email: email,
            options: {
                emailRedirectTo: window.location.origin
            }
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

async function logout() {
    try {
        const { error } = await supabase.auth.signOut();
        if (!error) {
            currentUser = null;
            userProfile = null;
            userAnalytics = null;
            elements.profileOverlay.classList.remove('active');
            showScreen('screen-auth');
            playClick();
        }
    } catch (err) {
        console.error('Logout failed:', err);
    }
}

// ==================== PROFILE FUNCTIONS ====================
async function loadUserProfile() {
    if (!currentUser) {
        showScreen('screen-auth');
        return;
    }
    
    try {
        // Fetch full profile with analytics using RPC
        const { data, error } = await supabase.rpc('get_full_profile');
        
        if (error) {
            console.error('Profile fetch error:', error);
            // Profile doesn't exist - show onboarding
            showScreen('screen-onboarding');
            return;
        }
        
        if (!data || !data.success || !data.profile || !data.profile.onboarding_completed) {
            showScreen('screen-onboarding');
            return;
        }
        
        userProfile = data.profile;
        userAnalytics = data.analytics || {};
        
        // Update UI
        updateMainScreenUI();
        
        // Check if manual was seen this session
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

function updateMainScreenUI() {
    if (!userProfile) return;
    
    elements.welcomeMsg.textContent = `WELCOME, ${userProfile.artist_name || 'ARTIST'}`;
    elements.globalRankDisplay.textContent = userProfile.personal_best || 0;
    elements.lastScore.textContent = `${userProfile.lifetime_clout || 0} LIFETIME CLOUT`;
    elements.streakCount.textContent = userProfile.current_streak || 0;
    
    // Render badges
    elements.badgeContainer.innerHTML = '';
    const badgeCount = userProfile.perfect_sets || 0;
    for (let i = 0; i < badgeCount; i++) {
        const badge = document.createElement('div');
        badge.className = 'mini-badge';
        elements.badgeContainer.appendChild(badge);
    }
}

async function completeOnboarding() {
    const name = elements.onboardName.value.trim();
    const age = parseInt(elements.onboardAge.value);
    const country = elements.onboardCountry.value;
    
    // Validation
    if (name.length < 2) {
        elements.onboardError.textContent = 'Name must be at least 2 characters';
        playError();
        return;
    }
    
    if (!age || age < 13 || age > 120) {
        elements.onboardError.textContent = 'You must be 13 or older to play';
        playError();
        return;
    }
    
    if (!country) {
        elements.onboardError.textContent = 'Please select your country';
        playError();
        return;
    }
    
    elements.onboardSubmit.disabled = true;
    elements.onboardSubmit.textContent = 'SAVING...';
    
    try {
        const { data, error } = await supabase.rpc('complete_onboarding', {
            p_artist_name: name,
            p_age: age,
            p_country: country
        });
        
        if (error || !data || !data.success) {
            elements.onboardError.textContent = error?.message || data?.error || 'Failed to save profile';
            elements.onboardSubmit.disabled = false;
            elements.onboardSubmit.textContent = "LET'S GO";
            playError();
            return;
        }
        
        playSuccess();
        playCassetteInsert();
        
        // Reload profile
        await loadUserProfile();
    } catch (err) {
        elements.onboardError.textContent = 'Network error. Please try again.';
        elements.onboardSubmit.disabled = false;
        elements.onboardSubmit.textContent = "LET'S GO";
        playError();
    }
}

function openProfile() {
    if (!userProfile) return;
    
    elements.profileInitial.textContent = userProfile.artist_name?.charAt(0) || '?';
    elements.profileName.textContent = userProfile.artist_name || 'UNKNOWN';
    elements.profileLocation.textContent = `${userProfile.age || '--'} • ${userProfile.country || 'Unknown'}`;
    elements.statLifetime.textContent = userProfile.lifetime_clout || 0;
    elements.statBest.textContent = userProfile.personal_best || 0;
    elements.statSessions.textContent = userAnalytics?.total_sessions || 0;
    elements.statTime.textContent = formatTime(userAnalytics?.total_time_in_studio || 0);
    
    // Update mode bars
    const total = (userAnalytics?.production_plays || 0) + 
                  (userAnalytics?.beats_plays || 0) + 
                  (userAnalytics?.songwriting_plays || 0);
    
    if (total > 0) {
        const prodBar = document.getElementById('bar-production');
        const beatsBar = document.getElementById('bar-beats');
        const songBar = document.getElementById('bar-songwriting');
        
        if (prodBar) prodBar.style.width = `${(userAnalytics.production_plays / total) * 100}%`;
        if (beatsBar) beatsBar.style.width = `${(userAnalytics.beats_plays / total) * 100}%`;
        if (songBar) songBar.style.width = `${(userAnalytics.songwriting_plays / total) * 100}%`;
    }
    
    const countProd = document.getElementById('count-production');
    const countBeats = document.getElementById('count-beats');
    const countSong = document.getElementById('count-songwriting');
    
    if (countProd) countProd.textContent = userAnalytics?.production_plays || 0;
    if (countBeats) countBeats.textContent = userAnalytics?.beats_plays || 0;
    if (countSong) countSong.textContent = userAnalytics?.songwriting_plays || 0;
    
    elements.profileOverlay.classList.add('active');
    playClick();
}

function closeProfile() {
    elements.profileOverlay.classList.remove('active');
    playClick();
}

// ==================== GAME FUNCTIONS ====================
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
    if (tasksCompleted >= SET_LIMIT) {
        endSession();
        return;
    }
    
    elements.taskCount.textContent = `${tasksCompleted + 1}/${SET_LIMIT}`;
    
    const deck = cardDecks[selectedMode] || cardDecks.production;
    let availableCards = deck.filter(card => !usedCards.includes(card));
    
    if (availableCards.length === 0) {
        usedCards = [];
        availableCards = [...deck];
    }
    
    currentCardText = availableCards[Math.floor(Math.random() * availableCards.length)];
    usedCards.push(currentCardText);
    
    elements.cardBody.classList.add('cassette-load');
    elements.cardBody.textContent = currentCardText;
    
    playCassetteInsert();
    
    setTimeout(() => elements.cardBody.classList.remove('cassette-load'), 600);
    
    timeLeft = TASK_TIME;
    cooldownLeft = 10;
    updateCooldownUI();
    startTimer();
}

function updateCooldownUI() {
    if (cooldownLeft > 0) {
        elements.completeBtn.classList.add('btn-locked');
        elements.cooldownTimer.textContent = `LOCKED: ${cooldownLeft}s`;
    } else {
        elements.completeBtn.classList.remove('btn-locked');
        elements.cooldownTimer.textContent = "READY";
    }
}

function startTimer() {
    clearInterval(timerInterval);
    elements.timer.classList.remove('timer-low');
    
    timerInterval = setInterval(() => {
        timeLeft--;
        if (cooldownLeft > 0) {
            cooldownLeft--;
            updateCooldownUI();
        }
        
        if (timeLeft <= 10) {
            elements.timer.classList.add('timer-low');
            const intensity = (10 - timeLeft) / 10;
            playAlarmBuzz(intensity);
        } else {
            playTick();
        }
        
        const m = Math.floor(timeLeft / 60);
        const s = timeLeft % 60;
        elements.timer.textContent = (m < 10 ? "0" + m : m) + ":" + (s < 10 ? "0" + s : s);
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            comboCount = 0;
            playError();
            // Session failed - go back to modes
            showScreen('screen-modes');
        }
    }, 1000);
}

function attemptComplete() {
    if (cooldownLeft > 0) {
        showCheatError();
        return;
    }
    completeTask();
}

function showCheatError() {
    elements.cheatError.style.opacity = "1";
    playError();
    setTimeout(() => elements.cheatError.style.opacity = "0", 2000);
}

function completeTask() {
    let currentBonus = 0;
    
    if (timeLeft > 15) {
        currentBonus += 5;
        speedDemonCount++;
        triggerAlert("SPEED DEMON +5");
    }
    
    tasksCompleted++;
    sessionClout += (10 + currentBonus);
    comboCount++;
    cleanStreakCount++;
    
    playSuccess();
    playCassetteInsert();
    
    if (comboCount === 3) {
        sessionClout += 25;
        setTimeout(() => triggerAlert("XP OVERDRIVE +25"), 800);
        comboCount = 0;
    }
    
    if (cleanStreakCount === 6 && !rerunUsedInSession) {
        const bonus = Math.floor(Math.random() * 101) + 50;
        sessionClout += bonus;
        setTimeout(() => triggerAlert(`CLEAN STREAK +${bonus}`), 1600);
    }
    
    elements.cloutVal.textContent = sessionClout;
    drawTask();
}

function triggerAlert(text) {
    elements.comboAlert.textContent = text;
    elements.comboAlert.style.opacity = "1";
    setTimeout(() => elements.comboAlert.style.opacity = "0", 2000);
}

async function rerollTask() {
    rerunUsedInSession = true;
    cleanStreakCount = 0;
    totalRerunsThisSession++;
    
    sessionClout -= 5;
    elements.cloutVal.textContent = sessionClout;
    
    playClick();
    playCassetteInsert();
    
    // Track the rerun in database (fire and forget)
    if (currentUser) {
        supabase.rpc('track_card_rerun', {
            p_card_text: currentCardText,
            p_game_mode: selectedMode
        }).catch(err => console.error('Failed to track rerun:', err));
    }
    
    const deck = cardDecks[selectedMode] || cardDecks.production;
    let availableCards = deck.filter(card => !usedCards.includes(card));
    
    if (availableCards.length === 0) {
        availableCards = [...deck];
    }
    
    currentCardText = availableCards[Math.floor(Math.random() * availableCards.length)];
    usedCards[usedCards.length - 1] = currentCardText;
    
    elements.cardBody.classList.add('cassette-load');
    elements.cardBody.textContent = currentCardText;
    setTimeout(() => elements.cardBody.classList.remove('cassette-load'), 600);
    
    timeLeft = TASK_TIME;
    cooldownLeft = 10;
    updateCooldownUI();
    startTimer();
}

function restartSession() {
    if (confirm("RESTART THIS SESSION? (Progress will be lost)")) {
        totalRestartsThisSession++;
        playClick();
        startGame(selectedMode);
    }
}

function restartFromResults() {
    playClick();
    playCassetteInsert();
    startGame(selectedMode);
}

function exitGame() {
    clearInterval(timerInterval);
    playClick();
    showScreen('screen-modes');
}

async function endSession() {
    clearInterval(timerInterval);
    showScreen('screen-results');
    
    const sessionDuration = Math.floor((Date.now() - sessionStartTime) / 1000);
    const wasPerfectSet = !rerunUsedInSession && speedDemonCount >= 5;
    
    // Add perfect set bonus locally for display
    let displayClout = sessionClout;
    if (wasPerfectSet) {
        displayClout += 100;
        elements.perfectBadge.style.display = "block";
    }
    
    playCelebration();
    createConfetti();
    
    try {
        // Call server-side function to increment clout securely
        const { data, error } = await supabase.rpc('increment_clout', {
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
            console.error('Failed to save session:', error);
            elements.resultFooter.textContent = "ERROR SAVING - DATA MAY BE LOST";
            elements.resultFooter.style.color = "var(--red)";
        } else if (data && data.success) {
            // Update local profile data
            userProfile.lifetime_clout = data.new_lifetime_total;
            userProfile.current_streak = data.new_streak;
            
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
            
            let footerText = "SESSION ARCHIVED TO CLOUD.";
            if (data.streak_bonus > 0) {
                footerText += ` STREAK BONUS: +${data.streak_bonus} CLOUT!`;
            }
            elements.resultFooter.textContent = footerText;
            elements.resultFooter.style.color = "";
            
            // Increment analytics locally
            if (userAnalytics) {
                userAnalytics.total_sessions = (userAnalytics.total_sessions || 0) + 1;
                userAnalytics.total_time_in_studio = (userAnalytics.total_time_in_studio || 0) + sessionDuration;
                userAnalytics[`${selectedMode}_plays`] = (userAnalytics[`${selectedMode}_plays`] || 0) + 1;
            }
        }
    } catch (err) {
        console.error('Session save error:', err);
        elements.resultFooter.textContent = "NETWORK ERROR - CHECK CONNECTION";
        elements.resultFooter.style.color = "var(--red)";
    }
}

// ==================== EVENT LISTENERS ====================
function initEventListeners() {
    // Auth
    if (elements.authBtn) {
        elements.authBtn.addEventListener('click', sendMagicLink);
    }
    if (elements.authEmail) {
        elements.authEmail.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMagicLink();
        });
    }
    
    // Onboarding
    if (elements.onboardSubmit) {
        elements.onboardSubmit.addEventListener('click', completeOnboarding);
    }
    
    // Manual
    const manualContinue = document.getElementById('manual-continue');
    if (manualContinue) {
        manualContinue.addEventListener('click', () => {
            playClick();
            showScreen('screen-modes');
        });
    }
    
    const showManual = document.getElementById('show-manual');
    if (showManual) {
        showManual.addEventListener('click', () => {
            playClick();
            showScreen('screen-manual');
        });
    }
    
    // Mode selection
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const mode = btn.dataset.mode;
            if (mode) startGame(mode);
        });
    });
    
    // Game controls
    if (elements.completeBtn) {
        elements.completeBtn.addEventListener('click', attemptComplete);
    }
    
    const rerunBtn = document.getElementById('rerun-btn');
    if (rerunBtn) {
        rerunBtn.addEventListener('click', rerollTask);
    }
    
    const restartBtn = document.getElementById('restart-btn');
    if (restartBtn) {
        restartBtn.addEventListener('click', restartSession);
    }
    
    const exitBtn = document.getElementById('exit-btn');
    if (exitBtn) {
        exitBtn.addEventListener('click', exitGame);
    }
    
    // Results
    const continueBtn = document.getElementById('continue-btn');
    if (continueBtn) {
        continueBtn.addEventListener('click', () => {
            updateMainScreenUI();
            showScreen('screen-modes');
            playClick();
        });
    }
    
    if (elements.tryAgainBtn) {
        elements.tryAgainBtn.addEventListener('click', restartFromResults);
    }
    
    // Profile
    if (elements.profileIcon) {
        elements.profileIcon.addEventListener('click', openProfile);
    }
    
    if (elements.closeProfile) {
        elements.closeProfile.addEventListener('click', closeProfile);
    }
    
    if (elements.logoutBtn) {
        elements.logoutBtn.addEventListener('click', logout);
    }
    
    // Close profile on overlay click
    if (elements.profileOverlay) {
        elements.profileOverlay.addEventListener('click', (e) => {
            if (e.target === elements.profileOverlay) {
                closeProfile();
            }
        });
    }
    
    // Init audio on first interaction
    document.body.addEventListener('click', initAudio, { once: true });
    document.body.addEventListener('touchstart', initAudio, { once: true });
}

// ==================== AUTH STATE LISTENER ====================
supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('Auth state changed:', event);
    
    if (event === 'SIGNED_IN' && session) {
        currentUser = session.user;
        await loadUserProfile();
    } else if (event === 'SIGNED_OUT') {
        currentUser = null;
        userProfile = null;
        userAnalytics = null;
        showScreen('screen-auth');
    }
});

// ==================== PWA SERVICE WORKER ====================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('SW registered:', registration.scope);
        } catch (error) {
            console.log('SW registration failed:', error);
        }
    });
}

// ==================== INITIALIZATION ====================
async function init() {
    populateCountryDropdown();
    initEventListeners();
    await checkAuthState();
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
