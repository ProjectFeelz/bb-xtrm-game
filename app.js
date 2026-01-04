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
const TASK_TIME = 26;
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
        'Chorus on bass (low mix)', 'Print a resample and commit', 'Remove one plugin you rely on'
    ],
    songwriting: [
        'Rhyme with "stone"', 'Use a weather metaphor', 'Mention a specific color',
        'Tell a 4-line mini story', 'Alliterate the next line', 'End the line with a verb',
        'Write about a machine', 'Describe a smell', 'Use a word with 4+ syllables',
        'Reference a 90s movie', 'Switch perspective to "them"', 'Include a line about time or a clock',
        'Use an AABB rhyme scheme', 'Internal rhymes only', 'Name a real city',
        'Start a line with "Never"', 'Drop in a technical term', 'Repeat one word for emphasis'
    ],
    beats: [
        'Swap the snare for a clap', 'Nudge the hats 5ms late', 'Add a shaker loop',
        'Reverse the crash', 'Half-time the hi-hats', 'Humanize kick velocities',
        'Woodblock on beat 4', 'Delete every 4th kick', 'Add a rimshot on the "and"',
        'Ghost-note the snares', 'Pitch the hats down', 'Tambourine on 2 and 4',
        'Randomize hat velocities', 'Filter the drums (2 bars)', 'Snare roll at the end'
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
        const { data, error } = await supabaseClient.rpc('get_full_profile');
        if (error) { console.error('Profile fetch error:', error); showScreen('screen-onboarding'); return; }
        if (!data || !data.success || !data.profile || !data.profile.onboarding_completed) { showScreen('screen-onboarding'); return; }
        userProfile = data.profile;
        userAnalytics = data.analytics || {};
        updateMainScreenUI();
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
    elements.statReruns.textContent = userAnalytics?.total_reruns || 0;
    elements.statCloutLost.textContent = userAnalytics?.clout_lost || 0;
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
    let availableCards = deck.filter(card => !usedCards.includes(card));
    if (availableCards.length === 0) { usedCards = []; availableCards = [...deck]; }
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
        elements.cooldownTimer.textContent = 'LOCKED: ' + cooldownLeft + 's';
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
        if (cooldownLeft > 0) { cooldownLeft--; updateCooldownUI(); }
        if (timeLeft <= 10) {
            elements.timer.classList.add('timer-low');
            playAlarmBuzz((10 - timeLeft) / 10);
        } else { playTick(); }
        const m = Math.floor(timeLeft / 60);
        const s = timeLeft % 60;
        elements.timer.textContent = (m < 10 ? "0" + m : m) + ":" + (s < 10 ? "0" + s : s);
        if (timeLeft <= 0) { clearInterval(timerInterval); comboCount = 0; playError(); showScreen('screen-modes'); }
    }, 1000);
}

function attemptComplete() { if (cooldownLeft > 0) { showCheatError(); return; } completeTask(); }

function showCheatError() { elements.cheatError.style.opacity = "1"; playError(); setTimeout(() => elements.cheatError.style.opacity = "0", 2000); }

function completeTask() {
    let currentBonus = 0;
    if (timeLeft > 15) { currentBonus += 5; speedDemonCount++; triggerAlert("SPEED DEMON +5"); }
    tasksCompleted++;
    sessionClout += (10 + currentBonus);
    comboCount++;
    cleanStreakCount++;
    playSuccess();
    playCassetteInsert();
    if (comboCount === 3) { sessionClout += 25; setTimeout(() => triggerAlert("XP OVERDRIVE +25"), 800); comboCount = 0; }
    if (cleanStreakCount === 6 && !rerunUsedInSession) { const bonus = Math.floor(Math.random() * 101) + 50; sessionClout += bonus; setTimeout(() => triggerAlert('CLEAN STREAK +' + bonus), 1600); }
    elements.cloutVal.textContent = sessionClout;
    drawTask();
}

function triggerAlert(text) { elements.comboAlert.textContent = text; elements.comboAlert.style.opacity = "1"; setTimeout(() => elements.comboAlert.style.opacity = "0", 2000); }

async function rerollTask() {
    if (sessionClout < RERUN_PENALTY) { triggerAlert('NEED ' + RERUN_PENALTY + ' CLOUT'); playError(); return; }
    rerunUsedInSession = true;
    cleanStreakCount = 0;
    comboCount = 0;
    totalRerunsThisSession++;
    sessionClout -= RERUN_PENALTY;
    elements.cloutVal.textContent = sessionClout;
    playClick();
    playCassetteInsert();
    if (currentUser) { supabaseClient.rpc('track_card_rerun', { p_card_text: currentCardText, p_game_mode: selectedMode }).catch(err => console.error('Track rerun failed:', err)); }
    const deck = cardDecks[selectedMode] || cardDecks.production;
    let availableCards = deck.filter(card => !usedCards.includes(card) && card !== currentCardText);
    if (availableCards.length === 0) availableCards = deck.filter(card => card !== currentCardText);
    const newCard = availableCards[Math.floor(Math.random() * availableCards.length)];
    usedCards[usedCards.length - 1] = newCard;
    currentCardText = newCard;
    elements.cardBody.classList.add('cassette-load');
    elements.cardBody.textContent = currentCardText;
    setTimeout(() => elements.cardBody.classList.remove('cassette-load'), 600);
    clearInterval(timerInterval);
    timeLeft = TASK_TIME;
    cooldownLeft = 10;
    updateCooldownUI();
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
    if (wasPerfectSet) { displayClout += 100; elements.perfectBadge.style.display = "block"; }
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
        if (error) { console.error('Save failed:', error); elements.resultFooter.textContent = "ERROR SAVING"; elements.resultFooter.style.color = "var(--red)"; }
        else if (data && data.success) {
            userProfile.lifetime_clout = data.new_lifetime_total;
            userProfile.current_streak = data.new_streak;
            if (data.is_new_best) { userProfile.personal_best = data.final_clout; elements.resultHeader.textContent = "NEW PERSONAL BEST!"; elements.tryAgainBtn.style.display = "none"; elements.previousBest.style.display = "none"; }
            else { elements.resultHeader.textContent = "SESSION COMPLETE"; elements.tryAgainBtn.style.display = "block"; elements.previousBest.style.display = "block"; elements.previousBest.querySelector('span').textContent = userProfile.personal_best; }
            elements.resultClout.textContent = data.final_clout;
            let footerText = "SESSION ARCHIVED.";
            if (data.streak_bonus > 0) footerText += ' STREAK BONUS: +' + data.streak_bonus + '!';
            elements.resultFooter.textContent = footerText;
            elements.resultFooter.style.color = "";
            if (userAnalytics) { userAnalytics.total_reruns = (userAnalytics.total_reruns || 0) + totalRerunsThisSession; userAnalytics.clout_lost = (userAnalytics.clout_lost || 0) + (totalRerunsThisSession * RERUN_PENALTY); }
        }
    } catch (err) { console.error('Session error:', err); elements.resultFooter.textContent = "NETWORK ERROR"; elements.resultFooter.style.color = "var(--red)"; }
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
    document.body.addEventListener('click', initAudio, { once: true });
    document.body.addEventListener('touchstart', initAudio, { once: true });
}

supabaseClient.auth.onAuthStateChange(async (event, session) => {
    console.log('Auth state:', event);
    if (event === 'SIGNED_IN' && session) { currentUser = session.user; await loadUserProfile(); }
    else if (event === 'SIGNED_OUT') { currentUser = null; userProfile = null; userAnalytics = null; showScreen('screen-auth'); }
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try { await navigator.serviceWorker.register('/sw.js'); } catch (e) { console.log('SW failed:', e); }
    });
}

async function init() { populateCountryDropdown(); initEventListeners(); await checkAuthState(); }
if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); } else { init(); }
