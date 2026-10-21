/**
 * Ranabaali: The Colonial Resistance
 * Stage Environments & Wave Progression System
 */

class LevelManager {
    constructor() {
        this.currentAct = 1; // 1 = Village, 2 = Train Heist, 3 = Fort Citadel, 4 = Endless
        this.levelWidth = 2800;
        this.groundY = 530;

        // Wave state
        this.currentWave = 1;
        this.totalWaves = 4;
        this.waveTimer = 0;
        this.waveCleared = false;
        this.levelCompleted = false;

        // Collectibles
        this.grainCollected = 0;
        this.grainTarget = 15;
        this.enemiesDefeated = 0;

        // Parallax scroll offsets
        this.scrollX = 0;
        this.trainSpeed = 480;

        // Weather FX (Act 3 rain & lightning)
        this.rainDrops = [];
        this.lightningTimer = 0;
        this.isLightning = false;

        this.initRain();
    }

    initRain() {
        this.rainDrops = [];
        for (let i = 0; i < 180; i++) {
            this.rainDrops.push({
                x: Math.random() * 1400,
                y: Math.random() * 750,
                speed: 850 + Math.random() * 300,
                length: 18 + Math.random() * 10
            });
        }
    }

    loadAct(actNum, player, enemies, sound) {
        this.currentAct = actNum;
        this.currentWave = 1;
        this.waveTimer = 0;
        this.waveCleared = false;
        this.levelCompleted = false;
        this.enemiesDefeated = 0;

        if (actNum === 1) {
            // Act 1: Village of Singanamala
            this.levelWidth = 2400;
            this.groundY = 530;
            this.totalWaves = 3;
            this.grainTarget = 12;
            player.reset(160, this.groundY);
            sound.setTension(1, false);

        } else if (actNum === 2) {
            // Act 2: Moving Grain Train Heist
            this.levelWidth = 3200;
            this.groundY = 510;
            this.totalWaves = 4;
            this.grainTarget = 18;
            player.reset(200, this.groundY);
            sound.setTension(1, false);

        } else if (actNum === 3) {
            // Act 3: Fort St. George Citadel
            this.levelWidth = 2600;
            this.groundY = 530;
            this.totalWaves = 2; // Wave 1: Armored Vanguard, Wave 2: Hector Boss
            this.grainTarget = 20;
            player.reset(180, this.groundY);
            sound.setTension(2, false);

        } else if (actNum === 4) {
            // Endless Resistance
            this.levelWidth = 2800;
            this.groundY = 530;
            this.totalWaves = 999;
            this.grainTarget = 9999;
            player.reset(200, this.groundY);
            sound.setTension(1, false);
        }
    }

    spawnWave(act, wave, player, enemies, boss) {
        const pX = player.x;

        if (act === 1) {
            // Act 1 Spawns
            if (wave === 1) {
                enemies.push(new Enemy(pX + 550, this.groundY, 'REDCOAT'));
                enemies.push(new Enemy(pX + 700, this.groundY, 'REDCOAT'));
                enemies.push(new Enemy(pX + 900, this.groundY, 'RIFLEMAN'));
            } else if (wave === 2) {
                enemies.push(new Enemy(pX - 450, this.groundY, 'REDCOAT'));
                enemies.push(new Enemy(pX + 600, this.groundY, 'REDCOAT'));
                enemies.push(new Enemy(pX + 780, this.groundY, 'ENFORCER'));
                enemies.push(new Enemy(pX + 950, this.groundY, 'RIFLEMAN'));
            } else if (wave === 3) {
                enemies.push(new Enemy(pX + 500, this.groundY, 'ENFORCER'));
                enemies.push(new Enemy(pX + 680, this.groundY, 'REDCOAT'));
                enemies.push(new Enemy(pX + 850, this.groundY, 'REDCOAT'));
                enemies.push(new Enemy(pX + 1050, this.groundY, 'RIFLEMAN'));
                enemies.push(new Enemy(pX + 1200, this.groundY, 'RIFLEMAN'));
            }

        } else if (act === 2) {
            // Act 2 Moving Train Spawns
            if (wave === 1) {
                enemies.push(new Enemy(pX + 500, this.groundY, 'REDCOAT'));
                enemies.push(new Enemy(pX + 750, this.groundY, 'REDCOAT'));
            } else if (wave === 2) {
                enemies.push(new Enemy(pX + 550, this.groundY, 'RIFLEMAN'));
                enemies.push(new Enemy(pX + 750, this.groundY, 'ENFORCER'));
            } else if (wave === 3) {
                enemies.push(new Enemy(pX - 400, this.groundY, 'REDCOAT'));
                enemies.push(new Enemy(pX + 600, this.groundY, 'REDCOAT'));
                enemies.push(new Enemy(pX + 850, this.groundY, 'ENFORCER'));
                enemies.push(new Enemy(pX + 1000, this.groundY, 'RIFLEMAN'));
            } else if (wave === 4) {
                // Elite Train Convoy Captains
                enemies.push(new Enemy(pX + 550, this.groundY, 'ENFORCER'));
                enemies.push(new Enemy(pX + 700, this.groundY, 'ENFORCER'));
                enemies.push(new Enemy(pX + 900, this.groundY, 'RIFLEMAN'));
                enemies.push(new Enemy(pX + 1100, this.groundY, 'REDCOAT'));
            }

        } else if (act === 3) {
            // Act 3 Fort Citadel
            if (wave === 1) {
                enemies.push(new Enemy(pX + 500, this.groundY, 'ENFORCER'));
                enemies.push(new Enemy(pX + 680, this.groundY, 'ENFORCER'));
                enemies.push(new Enemy(pX + 850, this.groundY, 'RIFLEMAN'));
                enemies.push(new Enemy(pX + 1000, this.groundY, 'RIFLEMAN'));
            } else if (wave === 2) {
                // SPAWN SIR THEODORE HECTOR
                boss.reset(pX + 650, this.groundY);
                if (window.trackGameEvent) {
                    window.trackGameEvent('boss_fight_reached', { boss: 'Sir Theodore Hector' });
                }
            }

        } else if (act === 4) {
            // Endless scaling
            const count = 3 + Math.floor(wave * 0.8);
            for (let i = 0; i < count; i++) {
                const types = ['REDCOAT', 'REDCOAT', 'RIFLEMAN', 'ENFORCER'];
                const selectedType = types[Math.floor(Math.random() * types.length)];
                const spawnDir = Math.random() > 0.35 ? 1 : -1;
                const dist = 500 + (i * 180);
                enemies.push(new Enemy(pX + (spawnDir * dist), this.groundY, selectedType));
            }
        }
    }

    update(dt, player, enemies, boss, sound, particles, camera) {
        // Scroll speed for train parallax
        if (this.currentAct === 2) {
            this.scrollX += this.trainSpeed * dt;
        }

        // Weather logic for Act 3
        if (this.currentAct === 3) {
            this.updateRain(dt);
            this.lightningTimer -= dt;
            if (this.lightningTimer <= 0) {
                this.isLightning = true;
                camera.addTrauma(0.2);
                sound.playExplosion();
                this.lightningTimer = 6.0 + Math.random() * 8.0;
                setTimeout(() => { this.isLightning = false; }, 90);
            }
        }

        // Check active living enemies
        const livingEnemies = enemies.filter(e => e.state !== 'DEAD').length;
        const bossAlive = (this.currentAct === 3 && this.currentWave === 2 && boss.state !== 'DEAD');

        if (livingEnemies === 0 && !bossAlive && !this.levelCompleted) {
            this.waveTimer += dt;
            if (this.waveTimer > 2.0) {
                this.waveTimer = 0;
                if (this.currentWave < this.totalWaves) {
                    this.currentWave++;
                    this.spawnWave(this.currentAct, this.currentWave, player, enemies, boss);
                    particles.addComicText(player.x, player.y - 120, `WAVE ${this.currentWave}`, '#ffcc00', true);
                    if (sound && sound.playWaveStart) sound.playWaveStart();
                } else if (this.currentAct !== 4) {
                    // Level Completed!
                    this.levelCompleted = true;
                    particles.addComicText(player.x, player.y - 120, 'STAGE CLEARED!', '#33ff88', true);
                    if (sound && sound.playVictorySting) sound.playVictorySting();
                    else sound.playExplosion();
                } else {
                    // Endless next wave
                    this.currentWave++;
                    this.spawnWave(4, this.currentWave, player, enemies, boss);
                    particles.addComicText(player.x, player.y - 120, `WAVE ${this.currentWave}`, '#ffcc00', true);
                    if (sound && sound.playWaveStart) sound.playWaveStart();
                }
            }
        }
    }

    updateRain(dt) {
        for (const drop of this.rainDrops) {
            drop.y += drop.speed * dt;
            drop.x -= drop.speed * 0.25 * dt;
            if (drop.y > 720) {
                drop.y = -20;
                drop.x = Math.random() * 1400;
            }
        }
    }

    // --- ENVIRONMENT RENDERING ---

    renderBackground(ctx, camera) {
        if (this.currentAct === 1) {
            this.renderVillageBackground(ctx, camera);
        } else if (this.currentAct === 2) {
            this.renderTrainBackground(ctx, camera);
        } else if (this.currentAct === 3) {
            this.renderCitadelBackground(ctx, camera);
        } else {
            this.renderEndlessBackground(ctx, camera);
        }
    }

    renderVillageBackground(ctx, camera) {
        const w = camera.width;
        const h = camera.height;

        // Sky: Arid Rayalaseema Sunset (Terracotta Orange to Dusty Ochre)
        const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.75);
        skyGrad.addColorStop(0, '#78281f');
        skyGrad.addColorStop(0.45, '#c04a20');
        skyGrad.addColorStop(1, '#e68a35');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(camera.x, camera.y, w, h);

        // Blazing sun
        ctx.fillStyle = 'rgba(255, 235, 180, 0.85)';
        ctx.beginPath();
        ctx.arc(camera.x + w * 0.72, camera.y + 160, 55, 0, Math.PI * 2);
        ctx.fill();

        // Parallax Layer 1: Distant Rayalaseema Rocky Ridges / Gorges
        ctx.fillStyle = '#5c221a';
        ctx.beginPath();
        ctx.moveTo(camera.x, camera.y + 420);
        for (let x = 0; x <= w + 100; x += 120) {
            const worldX = camera.x * 0.25 + x;
            const yOffset = Math.sin(worldX * 0.005) * 60 + Math.cos(worldX * 0.012) * 35;
            ctx.lineTo(camera.x + x, camera.y + 360 + yOffset);
        }
        ctx.lineTo(camera.x + w + 100, camera.y + h);
        ctx.lineTo(camera.x, camera.y + h);
        ctx.closePath();
        ctx.fill();

        // Parallax Layer 2: Thorny scrub trees & village huts
        ctx.fillStyle = '#3a1813';
        for (let x = -200; x < this.levelWidth + 400; x += 380) {
            // Thatched huts
            ctx.fillRect(x, this.groundY - 60, 90, 60);
            ctx.beginPath();
            ctx.moveTo(x - 15, this.groundY - 60);
            ctx.lineTo(x + 45, this.groundY - 110);
            ctx.lineTo(x + 105, this.groundY - 60);
            ctx.closePath();
            ctx.fill();

            // Thorny babool/acacia tree
            ctx.fillRect(x + 160, this.groundY - 120, 14, 120);
            ctx.beginPath();
            ctx.arc(x + 167, this.groundY - 130, 36, 0, Math.PI * 2);
            ctx.fill();
        }

        // Foreground: Red Soil Ground
        ctx.fillStyle = '#8b2e1b';
        ctx.fillRect(camera.x, this.groundY, w, 220);

        // Cracked soil texture lines
        ctx.strokeStyle = '#5c190c';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(camera.x, this.groundY);
        ctx.lineTo(camera.x + w, this.groundY);
        ctx.stroke();
    }

    renderTrainBackground(ctx, camera) {
        const w = camera.width;
        const h = camera.height;

        // Speeding Desert Sky
        const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.7);
        skyGrad.addColorStop(0, '#2c3e50');
        skyGrad.addColorStop(0.5, '#d35400');
        skyGrad.addColorStop(1, '#f39c12');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(camera.x, camera.y, w, h);

        // Distant hills rushing slowly
        ctx.fillStyle = '#6e2c00';
        ctx.beginPath();
        ctx.moveTo(camera.x, camera.y + 400);
        for (let x = 0; x <= w + 100; x += 150) {
            const worldX = (this.scrollX * 0.15) + x;
            ctx.lineTo(camera.x + x, camera.y + 350 + Math.sin(worldX * 0.008) * 45);
        }
        ctx.lineTo(camera.x + w, camera.y + h);
        ctx.lineTo(camera.x, camera.y + h);
        ctx.closePath();
        ctx.fill();

        // Telegraph poles rushing past in midground
        ctx.strokeStyle = '#2c1507';
        ctx.lineWidth = 6;
        const poleSpacing = 420;
        const offset = (this.scrollX * 0.8) % poleSpacing;
        for (let x = camera.x - offset; x < camera.x + w + poleSpacing; x += poleSpacing) {
            ctx.beginPath();
            ctx.moveTo(x, this.groundY - 140);
            ctx.lineTo(x, this.groundY);
            ctx.moveTo(x - 25, this.groundY - 120);
            ctx.lineTo(x + 25, this.groundY - 120);
            ctx.stroke();
        }

        // --- THE MOVING GRAIN TRAIN (ACT 2 FOREGROUND) ---
        // Train Rails
        ctx.fillStyle = '#4a4a4a';
        ctx.fillRect(camera.x, this.groundY + 12, w, 14);
        ctx.fillStyle = '#7a4e23';
        for (let x = camera.x - (this.scrollX % 30); x < camera.x + w; x += 30) {
            ctx.fillRect(x, this.groundY + 14, 18, 16); // Railway sleepers
        }

        // Train Carriages (Roofs and Flatbeds where battle takes place)
        const wagonW = 520;
        const gap = 55;
        for (let i = 0; i < 6; i++) {
            const wx = 120 + (i * (wagonW + gap));

            // Carriage chassis
            ctx.fillStyle = (i === 0) ? '#1f2421' : (i % 2 === 0 ? '#4a3b32' : '#8c2d19');
            ctx.fillRect(wx, this.groundY - 90, wagonW, 90);

            // Roof line (battle platform)
            ctx.fillStyle = '#222222';
            ctx.fillRect(wx - 6, this.groundY - 96, wagonW + 12, 10);

            // Carriage Windows & Metal Rivets
            ctx.fillStyle = '#dcdde1';
            for (let r = 20; r < wagonW - 20; r += 50) {
                ctx.fillRect(wx + r, this.groundY - 65, 24, 20);
            }

            // Coupler chains in gaps
            if (i < 5) {
                ctx.fillStyle = '#111111';
                ctx.fillRect(wx + wagonW, this.groundY - 25, gap, 8);
            }

            // Steel wheels
            ctx.fillStyle = '#333333';
            ctx.beginPath();
            ctx.arc(wx + 60, this.groundY + 6, 20, 0, Math.PI * 2);
            ctx.arc(wx + wagonW - 60, this.groundY + 6, 20, 0, Math.PI * 2);
            ctx.fill();
        }

        // Coal smoke puffs from locomotive
        ctx.fillStyle = 'rgba(40, 40, 40, 0.45)';
        for (let s = 0; s < 8; s++) {
            const sx = 100 - (s * 80) - (this.scrollX % 200);
            const sy = this.groundY - 140 - (s * 25);
            ctx.beginPath();
            ctx.arc(sx, sy, 35 + s * 14, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    renderCitadelBackground(ctx, camera) {
        const w = camera.width;
        const h = camera.height;

        // Stormy Citadel Night
        ctx.fillStyle = this.isLightning ? '#e0ecf8' : '#0b131a';
        ctx.fillRect(camera.x, camera.y, w, h);

        // Imposing Stone Fortress Bastions
        ctx.fillStyle = this.isLightning ? '#607280' : '#1a232a';
        ctx.fillRect(camera.x, this.groundY - 260, w, 260);

        // Fort Battlements / Crenellations
        for (let x = camera.x; x < camera.x + w; x += 60) {
            ctx.fillRect(x, this.groundY - 290, 36, 30);
        }

        // Union Jack colonial banners
        ctx.fillStyle = '#b71c1c';
        ctx.fillRect(camera.x + 300, this.groundY - 330, 80, 50);
        ctx.fillRect(camera.x + 950, this.groundY - 330, 80, 50);
        ctx.fillRect(camera.x + 1600, this.groundY - 330, 80, 50);

        // Heavy Iron Cannons Emplacements
        ctx.fillStyle = '#111111';
        ctx.fillRect(camera.x + 520, this.groundY - 280, 45, 14);
        ctx.fillRect(camera.x + 1250, this.groundY - 280, 45, 14);

        // Rainy Wet Stone Courtyard Ground
        ctx.fillStyle = '#161b20';
        ctx.fillRect(camera.x, this.groundY, w, 220);
        ctx.strokeStyle = '#2d3748';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(camera.x, this.groundY);
        ctx.lineTo(camera.x + w, this.groundY);
        ctx.stroke();

        // Render Rain Droplets
        ctx.save();
        ctx.strokeStyle = 'rgba(180, 210, 240, 0.55)';
        ctx.lineWidth = 1.8;
        for (const drop of this.rainDrops) {
            ctx.beginPath();
            ctx.moveTo(camera.x + drop.x, drop.y);
            ctx.lineTo(camera.x + drop.x - (drop.length * 0.25), drop.y + drop.length);
            ctx.stroke();
        }
        ctx.restore();
    }

    renderEndlessBackground(ctx, camera) {
        // Red mountain pass at twilight
        this.renderVillageBackground(ctx, camera);
    }
}

window.LevelManager = LevelManager;
