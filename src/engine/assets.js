/**
 * Ranabaali: The Colonial Resistance
 * Asset Loader for Real Character Portraits & Audio Tracks
 */

class AssetManager {
    constructor() {
        this.images = {};
        this.audio = {};
        this.loadedCount = 0;
        this.totalCount = 0;
        this.isLoaded = false;

        // Image manifests (Portraits, Logo, and Realistic Miniature Sprites)
        this.imageManifest = {
            ranabaali: 'assets/images/ranabaali.jpg',
            jayamma: 'assets/images/jayamma.jpg',
            hector: 'assets/images/hector.jpg',
            britishTroops: 'assets/images/british_troops.jpg',
            logo: 'assets/images/ranabaali_logo.jpg',
            // Realistic Character Miniature Sprites
            ranabaaliSprite: 'assets/images/ranabaali_sprite.png',
            jayammaSprite: 'assets/images/jayamma_sprite.png',
            hectorSprite: 'assets/images/hector_sprite.png',
            britishSoldierSprite: 'assets/images/british_soldier_sprite.png',
            villagersSprite: 'assets/images/villagers_sprite.png'
        };

        // Audio manifests (The 11 Movie Action SFX extracted from YouTube)
        this.audioManifest = {
            sfxSlashLight: 'assets/audio/sfx/sfx_slash_light.mp3',
            sfxMacheteHeavy: 'assets/audio/sfx/sfx_machete_heavy.mp3',
            sfxDeflectParry: 'assets/audio/sfx/sfx_deflect_parry.mp3',
            sfxVijayRoar: 'assets/audio/sfx/sfx_vijay_roar.mp3',
            sfxHitFlesh: 'assets/audio/sfx/sfx_hit_flesh.mp3',
            sfxGunshotEnfield: 'assets/audio/sfx/sfx_gunshot_enfield.mp3',
            sfxArtilleryBoom: 'assets/audio/sfx/sfx_artillery_boom.mp3',
            sfxHectorCommand: 'assets/audio/sfx/sfx_hector_command.mp3',
            sfxJayammaCall: 'assets/audio/sfx/sfx_jayamma_call.mp3',
            sfxJayammaFlute: 'assets/audio/sfx/sfx_jayamma_flute.mp3',
            sfxWaveStart: 'assets/audio/sfx/sfx_wave_start.mp3',
            sfxVictorySting: 'assets/audio/sfx/sfx_victory_sting.mp3'
        };
        this.lastPlayTime = {};
    }

    loadAll(onComplete) {
        const imgKeys = Object.keys(this.imageManifest);
        this.totalCount = imgKeys.length;

        imgKeys.forEach((key) => {
            const img = new Image();
            img.src = this.imageManifest[key];
            img.onload = () => {
                this.images[key] = img;
                this.loadedCount++;
                if (this.loadedCount >= this.totalCount) {
                    this.isLoaded = true;
                    if (onComplete) onComplete();
                }
            };
            img.onerror = () => {
                console.warn(`Could not load image: ${this.imageManifest[key]}, falling back to procedural`);
                this.loadedCount++;
                if (this.loadedCount >= this.totalCount) {
                    this.isLoaded = true;
                    if (onComplete) onComplete();
                }
            };
        });

        // Try preloading external audio if present
        Object.keys(this.audioManifest).forEach((key) => {
            const audio = new Audio();
            audio.src = this.audioManifest[key];
            audio.oncanplaythrough = () => {
                this.audio[key] = audio;
            };
            audio.onerror = () => {
                // Not present or blocked, fallback to procedural synthesis
                this.audio[key] = null;
            };
        });
    }

    loadCustomAudio(fileOrBlob, key = 'theme', callback) {
        try {
            const url = (typeof fileOrBlob === 'string') ? fileOrBlob : URL.createObjectURL(fileOrBlob);
            const audio = new Audio();
            audio.src = url;
            audio.oncanplaythrough = () => {
                this.audio[key] = audio;
                console.log(`Custom audio track '${key}' loaded successfully!`);
                if (callback) callback(true);
            };
            audio.onerror = (err) => {
                console.warn(`Failed to load custom audio:`, err);
                if (callback) callback(false);
            };
        } catch (e) {
            console.error('Error loading custom audio:', e);
            if (callback) callback(false);
        }
    }

    getImage(key) {
        return this.images[key] || null;
    }

    hasAudio(key) {
        return !!this.audio[key];
    }

    playAudio(key, loop = false, volume = 0.8) {
        if (!this.audio[key]) return false;

        const now = performance.now();
        const minIntervals = {
            sfxSlashLight: 90,
            sfxMacheteHeavy: 180,
            sfxHitFlesh: 100,
            sfxGunshotEnfield: 120,
            sfxDeflectParry: 110,
            sfxJayammaCall: 4000, // Jayamma's vocal call throttled so it never overlaps
            sfxJayammaFlute: 4000,
            sfxVijayRoar: 1500,
            sfxHectorCommand: 1200,
            sfxWaveStart: 2000,
            sfxVictorySting: 3000
        };

        const minInterval = minIntervals[key] || 70;
        if (this.lastPlayTime[key] && (now - this.lastPlayTime[key] < minInterval)) {
            return false; // Throttled to prevent cacophony
        }
        this.lastPlayTime[key] = now;

        if (loop) {
            this.audio[key].currentTime = 0;
            this.audio[key].loop = true;
            this.audio[key].volume = volume;
            const p = this.audio[key].play();
            if (p && typeof p.catch === 'function') p.catch(() => {});
            return true;
        }

        // For Jayamma vocal/flute: single instance playback without stacking clones
        if (key === 'sfxJayammaCall' || key === 'sfxJayammaFlute') {
            try {
                this.audio[key].currentTime = 0;
                this.audio[key].volume = volume;
                const p = this.audio[key].play();
                if (p && typeof p.catch === 'function') p.catch(() => {});
                return true;
            } catch (err) {
                return false;
            }
        }

        // For rapid SFX: clone node allows polyphonic overlapping without memory explosion
        try {
            const sfxClone = this.audio[key].cloneNode(true);
            sfxClone.volume = volume;
            const p = sfxClone.play();
            if (p && typeof p.catch === 'function') p.catch(() => {});
            return true;
        } catch (err) {
            this.audio[key].currentTime = 0;
            this.audio[key].volume = volume;
            this.audio[key].play().catch(() => {});
            return true;
        }
    }

    stopAudio(key) {
        if (this.audio[key]) {
            this.audio[key].pause();
            this.audio[key].currentTime = 0;
        }
    }
}

window.assetManager = new AssetManager();
