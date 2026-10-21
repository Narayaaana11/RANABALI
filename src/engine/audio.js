/**
 * Ranabaali: The Colonial Resistance
 * WebAudio Procedural Sound & Dynamic Folk Percussion Engine
 * Inspired by Ajay-Atul's high-octane orchestral Rayalaseema score
 * Supports both real audio track playback and 100% autonomous real-time synthesis.
 */

class SoundEngine {
    constructor() {
        this.ctx = null;
        this.masterVolume = 0.85;
        this.isMuted = false;
        this.isInitialized = false;

        // Music sequencing state
        this.musicPlaying = false;
        this.tempo = 120; // BPM for high-energy Ajay-Atul Dappu rhythm
        this.currentBeat = 0;
        this.musicTimer = null;
        this.furyActive = false;
        this.tensionLevel = 0; // 0: Ambient, 1: Combat, 2: High Combo / Boss

        // Ajay-Atul War Horn / Shehnai Melody Notes (Folk War Raga: D minor / Bhairav scale)
        // D4, Eb4, F#4, G4, A4, Bb4, C#5, D5
        this.melodyNotes = [293.66, 311.13, 369.99, 392.00, 440.00, 466.16, 554.37, 587.33];

        // Jukebox Tracks (From the 4 Analyzed Official YouTube Videos)
        this.tracks = [
            { key: 'savagesOath', name: "1. THE SAVAGE'S OATH (Ajay–Atul)" },
            { key: 'trailerWar', name: "2. THEATRICAL TRAILER WAR MARCH" },
            { key: 'endhayyaSaami', name: "3. ENDHAYYA SAAMI (Jayamma Melody)" },
            { key: 'massBattle', name: "4. ROWDY MASS BATTLE (Q1s_CWfGAHk)" }
        ];
        this.currentTrackIndex = 0;
    }

    init() {
        if (this.isInitialized) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVolume, this.ctx.currentTime);
            this.masterGain.connect(this.ctx.destination);
            this.isInitialized = true;
        } catch (e) {
            console.warn("WebAudio not supported or blocked by user gesture:", e);
        }
    }

    resume() {
        if (!this.ctx) this.init();
        if (this.ctx && this.ctx.state === 'suspended') {
            try {
                const p = this.ctx.resume();
                if (p && typeof p.catch === 'function') {
                    p.catch(() => {
                        // Autoplay policy awaits user gesture; safely caught
                    });
                }
            } catch (err) {
                // Silently wait for click/tap gesture
            }
        }
    }

    setVolume(vol) {
        this.masterVolume = Math.max(0, Math.min(1, vol));
        if (this.masterGain && !this.isMuted) {
            this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.masterGain) {
            this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVolume, this.ctx.currentTime);
        }
        return this.isMuted;
    }

    // --- SFX GENERATORS ---

    // Machete Light Whoosh / Slash
    playSlash(comboIndex = 1) {
        if (window.assetManager && window.assetManager.hasAudio('sfxSlashLight')) {
            window.assetManager.playAudio('sfxSlashLight', false, this.masterVolume * 0.95);
            return;
        }
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;
        const baseFreq = 650 + (comboIndex * 160);

        const bufferSize = this.ctx.sampleRate * 0.12;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(baseFreq, now);
        filter.frequency.exponentialRampToValueAtTime(1900, now + 0.1);
        filter.Q.setValueAtTime(3.8, now);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.5 * this.masterVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        noise.start(now);
    }

    // Heavy Machete Cleave / Slam
    playHeavyCleave() {
        if (window.assetManager && window.assetManager.hasAudio('sfxMacheteHeavy')) {
            window.assetManager.playAudio('sfxMacheteHeavy', false, this.masterVolume);
            return;
        }
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(32, now + 0.38);

        oscGain.gain.setValueAtTime(0.85 * this.masterVolume, now);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

        osc.connect(oscGain);
        oscGain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.38);

        this.playSlash(3);
        this.playDappuBass(0.9);
    }

    // Steel on Steel Clash / Parry
    playClash() {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;

        [1850, 2450, 3900].forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now);
            osc.frequency.exponentialRampToValueAtTime(freq * 0.85, now + 0.22);

            const vol = (0.4 / (idx + 1)) * this.masterVolume;
            gain.gain.setValueAtTime(vol, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(now);
            osc.stop(now + 0.25);
        });
    }

    // Bullet Deflection Ricochet Ping
    playBulletDeflect() {
        if (window.assetManager && window.assetManager.hasAudio('sfxDeflectParry')) {
            window.assetManager.playAudio('sfxDeflectParry', false, this.masterVolume);
            return;
        }
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1500, now);
        osc.frequency.exponentialRampToValueAtTime(4200, now + 0.08);
        osc.frequency.exponentialRampToValueAtTime(2200, now + 0.24);

        gain.gain.setValueAtTime(0.65 * this.masterVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.25);

        this.playClash();
    }

    // British Musket / Rifle Fire
    playGunshot() {
        if (window.assetManager && window.assetManager.hasAudio('sfxGunshotEnfield')) {
            window.assetManager.playAudio('sfxGunshotEnfield', false, this.masterVolume * 0.95);
            return;
        }
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;

        const bufferSize = this.ctx.sampleRate * 0.32;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.15));
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1800, now);
        filter.frequency.exponentialRampToValueAtTime(200, now + 0.32);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.9 * this.masterVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        noise.start(now);
    }

    // Cannon / Mortar Explosion
    playExplosion() {
        if (window.assetManager && window.assetManager.hasAudio('sfxArtilleryBoom')) {
            window.assetManager.playAudio('sfxArtilleryBoom', false, this.masterVolume);
            return;
        }
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;

        const sub = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(95, now);
        sub.frequency.exponentialRampToValueAtTime(22, now + 0.65);

        subGain.gain.setValueAtTime(0.95 * this.masterVolume, now);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

        sub.connect(subGain);
        subGain.connect(this.masterGain);
        sub.start(now);
        sub.stop(now + 0.65);

        const bufferSize = this.ctx.sampleRate * 0.5;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const nFilter = this.ctx.createBiquadFilter();
        nFilter.type = 'lowpass';
        nFilter.frequency.setValueAtTime(800, now);

        const nGain = this.ctx.createGain();
        nGain.gain.setValueAtTime(0.75 * this.masterVolume, now);
        nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

        noise.connect(nFilter);
        nFilter.connect(nGain);
        nGain.connect(this.masterGain);
        noise.start(now);
    }

    playDodge() {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(240, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.18);

        gain.gain.setValueAtTime(0.35 * this.masterVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.18);
    }

    // Golden Grain Sack Collection Chime (Famine Provisions Secured)
    playGrainCollect() {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;

        // Bright 3-note ascending harvest arpeggio (G5, C6, E6)
        [783.99, 1046.50, 1318.51].forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + (idx * 0.055));

            const startTime = now + (idx * 0.055);
            gain.gain.setValueAtTime(0.28 * this.masterVolume, startTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.22);

            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(startTime);
            osc.stop(startTime + 0.23);
        });
    }

    // Sanjeevani Ayurvedic Health Restorative Chime
    playHealthPickup() {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;

        // Harmonious, soothing healing chord (C5, E5, G5, C6) with soft shimmer
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + (idx * 0.04));

            const startTime = now + (idx * 0.04);
            gain.gain.setValueAtTime(0.35 * this.masterVolume, startTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.45);

            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(startTime);
            osc.stop(startTime + 0.46);
        });
    }

    playJayammaSummon() {
        if (window.assetManager && window.assetManager.hasAudio('sfxJayammaCall')) {
            window.assetManager.playAudio('sfxJayammaCall', false, this.masterVolume);
            return;
        }
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;

        // Ethereal Indian flute / chime chord
        [587.33, 698.46, 880.00, 1174.66].forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + (i * 0.05));

            gain.gain.setValueAtTime(0.3 * this.masterVolume, now + (i * 0.05));
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7 + (i * 0.05));

            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(now + (i * 0.05));
            osc.stop(now + 0.75);
        });
    }

    // Vijay Deverakonda Ranavatharam Roar & Kombu War Horn
    playFuryRoar() {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;

        // Traditional South Indian Kombu / Tutari war horn blast
        const horn = this.ctx.createOscillator();
        const hornGain = this.ctx.createGain();
        horn.type = 'sawtooth';
        horn.frequency.setValueAtTime(146.83, now); // D3
        horn.frequency.exponentialRampToValueAtTime(220.00, now + 0.25); // A3
        horn.frequency.exponentialRampToValueAtTime(293.66, now + 0.5); // D4
        horn.frequency.exponentialRampToValueAtTime(146.83, now + 1.1);

        const hornFilter = this.ctx.createBiquadFilter();
        hornFilter.type = 'lowpass';
        hornFilter.frequency.setValueAtTime(550, now);
        hornFilter.frequency.exponentialRampToValueAtTime(1200, now + 0.5);

        hornGain.gain.setValueAtTime(0.85 * this.masterVolume, now);
        hornGain.gain.exponentialRampToValueAtTime(0.001, now + 1.15);

        horn.connect(hornFilter);
        hornFilter.connect(hornGain);
        hornGain.connect(this.masterGain);
        horn.start(now);
        horn.stop(now + 1.15);

        // Vocal Formant War Cry ("HA-RRRR-AAA!")
        this.synthesizeVocalShout("UGRAM", now);

        this.playExplosion();
    }

    // Synthesized Vocal Shouts (Telugu Rebel Battle Cries)
    synthesizeVocalShout(word = "RANABAALI", timeOffset = null) {
        if (!this.ctx || this.isMuted) return;
        const now = timeOffset || this.ctx.currentTime;

        // Formant vocal filters for male voice shout
        const osc = this.ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(115, now);
        osc.frequency.exponentialRampToValueAtTime(145, now + 0.15);
        osc.frequency.exponentialRampToValueAtTime(95, now + 0.45);

        // Formants for vowel 'A' and 'O'
        const f1 = this.ctx.createBiquadFilter();
        f1.type = 'bandpass';
        f1.frequency.setValueAtTime(750, now);
        f1.Q.setValueAtTime(4.0, now);

        const f2 = this.ctx.createBiquadFilter();
        f2.type = 'bandpass';
        f2.frequency.setValueAtTime(1250, now);
        f2.Q.setValueAtTime(5.0, now);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.4 * this.masterVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        osc.connect(f1);
        osc.connect(f2);
        f1.connect(gain);
        f2.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.45);
    }

    playHitImpact(isHeavy = false) {
        if (window.assetManager && window.assetManager.hasAudio('sfxHitFlesh')) {
            window.assetManager.playAudio('sfxHitFlesh', false, this.masterVolume * (isHeavy ? 1.0 : 0.8));
        }
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(isHeavy ? 190 : 280, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.14);

        gain.gain.setValueAtTime((isHeavy ? 0.7 : 0.45) * this.masterVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.14);
    }

    // --- PROCEDURAL AJAY-ATUL RAYALASEEMA DAPPU WAR DRUMS ---

    playDappuBass(vol = 0.55) {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(115, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.16);

        gain.gain.setValueAtTime(vol * this.masterVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.16);
    }

    playDappuSlap(vol = 0.4) {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;

        const bufferSize = this.ctx.sampleRate * 0.05;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(2400, now);
        filter.Q.setValueAtTime(4.5, now);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(vol * this.masterVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        noise.start(now);
    }

    playWarMelodyNote(noteIndex, duration = 0.25, vol = 0.25) {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;
        const freq = this.melodyNotes[noteIndex % this.melodyNotes.length];

        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1100, now);

        gain.gain.setValueAtTime(vol * this.masterVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + duration);
    }

    nextTrack() {
        this.currentTrackIndex = (this.currentTrackIndex + 1) % this.tracks.length;
        this.stopMusic();
        this.startMusic();
        return this.tracks[this.currentTrackIndex].name;
    }

    startMusic() {
        this.resume();
        if (this.musicPlaying) return;
        this.musicPlaying = true;
        this.currentBeat = 0;
        this.stepMusicLoop();
    }

    stopMusic() {
        this.musicPlaying = false;
        if (this.musicTimer) {
            clearTimeout(this.musicTimer);
            this.musicTimer = null;
        }
    }

    playWaveStart() {
        if (window.assetManager && window.assetManager.hasAudio('sfxWaveStart')) {
            window.assetManager.playAudio('sfxWaveStart', false, this.masterVolume);
            return;
        }
        this.playDappuBass(1.2);
    }

    playVictorySting() {
        if (window.assetManager && window.assetManager.hasAudio('sfxVictorySting')) {
            window.assetManager.playAudio('sfxVictorySting', false, this.masterVolume);
            return;
        }
    }

    playVijayRoar() {
        if (window.assetManager && window.assetManager.hasAudio('sfxVijayRoar')) {
            window.assetManager.playAudio('sfxVijayRoar', false, this.masterVolume);
        }
        this.playFuryRoar();
        this.playDappuBass(1.2);
    }

    playHectorCommand() {
        if (window.assetManager && window.assetManager.hasAudio('sfxHectorCommand')) {
            window.assetManager.playAudio('sfxHectorCommand', false, this.masterVolume);
            return;
        }
        this.playGunshot();
    }

    setTension(level, fury = false) {
        this.tensionLevel = level;
        this.furyActive = fury;
        this.tempo = fury ? 146 : (level >= 2 ? 132 : (level >= 1 ? 120 : 102));
    }

    stepMusicLoop() {
        if (!this.musicPlaying) return;
        this.resume();

        const beat16 = this.currentBeat % 16;
        const isFury = this.furyActive;

        // Ajay-Atul High-Impact Dappu Pattern:
        // Strong syncopated beats: 0, 3, 6, 8, 10, 12, 14
        if (beat16 === 0 || beat16 === 4 || beat16 === 8 || beat16 === 10 || (isFury && (beat16 === 2 || beat16 === 14))) {
            const vol = (beat16 === 0 || beat16 === 8) ? 0.7 : 0.5;
            this.playDappuBass(isFury ? vol * 1.3 : vol);
        }

        // Crisp Dappu Rimshots / Slaps
        if (beat16 === 2 || beat16 === 6 || beat16 === 11 || beat16 === 12 || beat16 === 15) {
            this.playDappuSlap(isFury ? 0.5 : 0.35);
        }

        // Orchestral War Brass / Shehnai Melodic Riffs (every 4 or 8 beats)
        if (this.tensionLevel >= 1) {
            const melodyStep = Math.floor(this.currentBeat / 4) % 8;
            if (beat16 % 4 === 0) {
                this.playWarMelodyNote(melodyStep, 0.28, isFury ? 0.32 : 0.2);
            }
        }

        // Bass drone pulse on measure downbeat
        if (this.tensionLevel >= 2 && beat16 === 0 && this.ctx && !this.isMuted) {
            const now = this.ctx.currentTime;
            const drone = this.ctx.createOscillator();
            const droneGain = this.ctx.createGain();
            drone.type = 'sawtooth';
            drone.frequency.setValueAtTime(73.42, now); // D2 drone
            const dFilter = this.ctx.createBiquadFilter();
            dFilter.type = 'lowpass';
            dFilter.frequency.setValueAtTime(240, now);

            droneGain.gain.setValueAtTime(0.25 * this.masterVolume, now);
            droneGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

            drone.connect(dFilter);
            dFilter.connect(droneGain);
            droneGain.connect(this.masterGain);
            drone.start(now);
            drone.stop(now + 0.45);
        }

        this.currentBeat++;
        const beatIntervalMs = (60000 / this.tempo) / 4;
        this.musicTimer = setTimeout(() => this.stepMusicLoop(), beatIntervalMs);
    }
}

window.soundEngine = new SoundEngine();
