/**
 * Ranabaali: The Colonial Resistance
 * Main Game Coordinator & Game Loop Engine
 */

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        // Internal rendering resolution
        this.width = 1280;
        this.height = 720;
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        // Subsystems
        this.camera = new window.Camera(this.width, this.height);
        this.player = new window.Player(160, 530);
        this.companion = new window.JayammaSupport();
        this.boss = new window.BossHector(2400, 530);
        this.levelManager = new window.LevelManager();
        this.hud = new window.HUD();
        this.menu = new window.MenuManager();
        this.cutIns = new window.CutInManager();

        // Load real movie portraits and audio
        if (window.assetManager) {
            window.assetManager.loadAll(() => {
                console.log('Ranabaali movie assets loaded successfully');
            });
        }

        // Active game entities
        this.enemies = [];
        this.bullets = [];
        this.grainSacks = [];
        this.healthDrops = [];

        // Game state
        this.gameState = 'MENU'; // MENU, PLAYING, PAUSED, TRANSITION
        this.lastTime = performance.now();

        // Hit-pause freeze effect (impact frames)
        this.freezeFrames = 0;

        // Mobile touch layer & pause button references
        this.mobileTouchLayer = document.getElementById('mobileTouchLayer');
        this.pauseBtn = document.getElementById('pauseBtn');

        this.initEvents();
        this.resize();
        window.addEventListener('resize', () => this.resize());
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', () => this.resize());
        }
        window.addEventListener('orientationchange', () => {
            setTimeout(() => this.resize(), 80);
            setTimeout(() => this.resize(), 250);
        });
        if (window.screen && window.screen.orientation) {
            window.screen.orientation.addEventListener('change', () => {
                setTimeout(() => this.resize(), 80);
                setTimeout(() => this.resize(), 250);
            });
        }

        // Vercel Analytics Session Initializer
        if (window.trackGameEvent) {
            const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
            const devType = isTouch ? (Math.max(window.innerWidth, window.innerHeight) >= 1024 ? 'tablet' : 'mobile') : 'desktop';
            window.trackGameEvent('game_session_start', {
                device: devType,
                width: window.innerWidth,
                height: window.innerHeight,
                aspectRatio: +(window.innerWidth / window.innerHeight).toFixed(2),
                pixelRatio: window.devicePixelRatio || 1
            });
        }
    }

    resize() {
        const vp = window.visualViewport;
        const winW = vp ? vp.width : window.innerWidth;
        const winH = vp ? vp.height : window.innerHeight;
        const targetAspect = 1280 / 720;
        const windowAspect = winW / winH;

        let w, h;
        if (windowAspect > targetAspect) {
            h = winH;
            w = winH * targetAspect;
        } else {
            w = winW;
            h = winW / targetAspect;
        }

        this.canvas.style.width = `${Math.floor(w)}px`;
        this.canvas.style.height = `${Math.floor(h)}px`;
    }

    initEvents() {
        // Click and Tap handlers for menus
        const handleInteraction = (clientX, clientY) => {
            if (window.soundEngine) window.soundEngine.resume();

            // Transform screen coords to canvas 1280x720 coords
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.width / rect.width;
            const scaleY = this.height / rect.height;
            const clickX = (clientX - rect.left) * scaleX;
            const clickY = (clientY - rect.top) * scaleY;

            this.handleMenuClick(clickX, clickY);
        };

        this.canvas.addEventListener('mousedown', (e) => {
            handleInteraction(e.clientX, e.clientY);
        });

        this.canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length > 0) {
                handleInteraction(e.touches[0].clientX, e.touches[0].clientY);
            }
        }, { passive: false });
    }

    handleMenuClick(x, y) {
        if (this.gameState === 'MENU') {
            const screen = this.menu.currentScreen;

            if (screen === 'TITLE') {
                // Generous thumb touch targets for title screen buttons
                if (x >= 160 && x <= 600) {
                    if (y >= 365 && y <= 425) {
                        this.startCampaign();
                    } else if (y >= 426 && y <= 475) {
                        this.startEndless();
                    } else if (y >= 476 && y <= 525) {
                        this.menu.setScreen('CONTROLS');
                    } else if (y >= 526 && y <= 590) {
                        const fileInput = document.getElementById('audioFileInput');
                        if (fileInput) fileInput.click();
                    }
                }
            } else if (screen === 'PROLOGUE') {
                this.menu.prologueStep++;
                if (this.menu.prologueStep >= this.menu.prologuePanels.length) {
                    this.startAct(1);
                }
            } else if (screen === 'CONTROLS') {
                this.menu.setScreen('TITLE');
            } else if (screen === 'STAGE_CLEAR') {
                if (this.levelManager.currentAct === 1) {
                    this.startAct(2);
                } else if (this.levelManager.currentAct === 2) {
                    this.startAct(3);
                } else if (this.levelManager.currentAct === 3) {
                    this.menu.setScreen('VICTORY');
                }
            } else if (screen === 'GAME_OVER') {
                this.startAct(this.levelManager.currentAct);
            } else if (screen === 'VICTORY') {
                this.menu.setScreen('TITLE');
            }
        } else if (this.gameState === 'PAUSED') {
            // Generous thumb touch targets for Pause screen buttons
            if (x >= this.width / 2 - 160 && x <= this.width / 2 + 160) {
                if (y >= this.height / 2 - 35 && y < this.height / 2 + 25) {
                    this.gameState = 'PLAYING';
                    if (this.pauseBtn) this.pauseBtn.innerHTML = '<span class="topBtnIcon">⏸</span><span class="topBtnText"> PAUSE</span>';
                } else if (y >= this.height / 2 + 25 && y < this.height / 2 + 80) {
                    this.startAct(this.levelManager.currentAct);
                    if (this.pauseBtn) this.pauseBtn.innerHTML = '<span class="topBtnIcon">⏸</span><span class="topBtnText"> PAUSE</span>';
                } else if (y >= this.height / 2 + 80 && y <= this.height / 2 + 140) {
                    this.gameState = 'MENU';
                    this.menu.setScreen('TITLE');
                    if (this.pauseBtn) this.pauseBtn.innerHTML = '<span class="topBtnIcon">⏸</span><span class="topBtnText"> PAUSE</span>';
                    window.soundEngine.stopMusic();
                }
            }
        } else if (this.gameState === 'PLAYING') {
            // Click/tap on Jayamma HUD icon (x: 350, y: 48) to cycle support tactic
            if (Math.hypot(x - 350, y - 48) < 36) {
                const modeName = this.companion.cycleMode();
                window.particleSystem.addComicText(this.player.x, this.player.y - 70, `TACTIC: ${modeName}`, '#33ff88', false);
                if (window.soundEngine) window.soundEngine.playDappuSlap(0.6);
            }
        }
    }

    togglePause() {
        if (this.gameState === 'PLAYING') {
            this.gameState = 'PAUSED';
            this.menu.setScreen('PAUSE');
            if (this.pauseBtn) this.pauseBtn.textContent = '▶ RESUME';
        } else if (this.gameState === 'PAUSED') {
            this.gameState = 'PLAYING';
            if (this.pauseBtn) this.pauseBtn.textContent = '⏸ PAUSE';
        }
    }

    startCampaign() {
        this.menu.setScreen('PROLOGUE');
        if (window.trackGameEvent) window.trackGameEvent('campaign_started');
    }

    startEndless() {
        this.startAct(4);
        if (window.trackGameEvent) window.trackGameEvent('endless_started');
    }

    startAct(actNum) {
        this.gameState = 'PLAYING';
        if (this.pauseBtn) this.pauseBtn.innerHTML = '<span class="topBtnIcon">⏸</span><span class="topBtnText"> PAUSE</span>';
        this.enemies.length = 0;
        this.bullets.length = 0;
        this.grainSacks.length = 0;
        this.healthDrops.length = 0;
        window.particleSystem.reset();

        this.levelManager.loadAct(actNum, this.player, this.enemies, window.soundEngine);
        this.camera.setLevelBounds(0, this.levelManager.levelWidth);
        this.camera.follow(this.player, true);

        // First wave spawn
        this.levelManager.spawnWave(actNum, 1, this.player, this.enemies, this.boss);

        // Music Start
        window.soundEngine.startMusic();

        // Track act start
        if (window.trackGameEvent) {
            window.trackGameEvent('act_started', { act: actNum, mode: actNum === 4 ? 'endless' : 'campaign' });
        }

        // Act Intro Subtitle
        const actIntroTitles = [
            '',
            'ACT I: DEFEND THE HARVEST OF SINGANAMALA!',
            'ACT II: THE GREAT GRAIN TRAIN AMBUSH!',
            'ACT III: STORM THE CITADEL OF HECTOR!',
            'ENDLESS RESISTANCE: FIGHT TO THE LAST BREATH!'
        ];
        this.hud.showSubtitle(actIntroTitles[actNum] || 'RESISTANCE!', 4.0);
    }

    update(dt) {
        // Freeze frame handling
        if (this.freezeFrames > 0) {
            this.freezeFrames--;
            return;
        }

        // Global Pause Toggle
        if (window.inputManager.isPause()) {
            this.togglePause();
            return;
        }

        // Dynamically toggle mobile touch combat layer: only show during active combat
        if (this.mobileTouchLayer) {
            const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || window.innerWidth <= 1024 || (window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
            const shouldShow = (this.gameState === 'PLAYING' && isTouch);
            this.mobileTouchLayer.style.display = shouldShow ? 'block' : 'none';
        }

        if (this.gameState === 'MENU' || this.gameState === 'PAUSED') {
            if (this.menu.currentScreen === 'TITLE') {
                if (window.inputManager.isJustPressed('ArrowDown') || window.inputManager.isJustPressed('KeyS')) {
                    this.menu.selectedOption = (this.menu.selectedOption + 1) % 4;
                    if (window.soundEngine) window.soundEngine.resume();
                } else if (window.inputManager.isJustPressed('ArrowUp') || window.inputManager.isJustPressed('KeyW')) {
                    this.menu.selectedOption = (this.menu.selectedOption + 3) % 4;
                    if (window.soundEngine) window.soundEngine.resume();
                } else if (window.inputManager.isJustPressed('Space') || window.inputManager.isJustPressed('Enter')) {
                    if (window.soundEngine) window.soundEngine.resume();
                    if (this.menu.selectedOption === 0) this.startCampaign();
                    else if (this.menu.selectedOption === 1) this.startEndless();
                    else if (this.menu.selectedOption === 2) this.menu.setScreen('CONTROLS');
                    else if (this.menu.selectedOption === 3) {
                        const fileInput = document.getElementById('audioFileInput');
                        if (fileInput) fileInput.click();
                    }
                }
            } else if (this.gameState === 'PAUSED') {
                if (window.inputManager.isJustPressed('ArrowDown') || window.inputManager.isJustPressed('KeyS')) {
                    this.menu.selectedPauseOption = (this.menu.selectedPauseOption + 1) % 3;
                    if (window.soundEngine) window.soundEngine.resume();
                } else if (window.inputManager.isJustPressed('ArrowUp') || window.inputManager.isJustPressed('KeyW')) {
                    this.menu.selectedPauseOption = (this.menu.selectedPauseOption + 2) % 3;
                    if (window.soundEngine) window.soundEngine.resume();
                } else if (window.inputManager.isJustPressed('Space') || window.inputManager.isJustPressed('Enter')) {
                    if (window.soundEngine) window.soundEngine.resume();
                    if (this.menu.selectedPauseOption === 0) {
                        this.gameState = 'PLAYING';
                    } else if (this.menu.selectedPauseOption === 1) {
                        this.startAct(this.levelManager.currentAct);
                    } else if (this.menu.selectedPauseOption === 2) {
                        this.gameState = 'MENU';
                        this.menu.setScreen('TITLE');
                        window.soundEngine.stopMusic();
                    }
                }
            } else {
                if (window.inputManager.isJustPressed('Space') || window.inputManager.isJustPressed('Enter')) {
                    if (window.soundEngine) window.soundEngine.resume();
                    this.handleMenuClick(380, 420);
                }
            }
            this.menu.update(dt, window.inputManager, window.soundEngine);
            window.inputManager.endFrame();
            return;
        }

        // --- PLAYING STATE UPDATE ---

        // 1. Update Player
        this.player.update(dt, window.inputManager, window.soundEngine, window.particleSystem, this.camera);

        // Check if player cycles Jayamma support mode
        if (window.inputManager.isCycleCompanionMode()) {
            const modeName = this.companion.cycleMode();
            window.particleSystem.addComicText(this.player.x, this.player.y - 70, `TACTIC: ${modeName}`, '#33ff88', false);
            if (window.soundEngine) window.soundEngine.playDappuSlap(0.6);
        }

        // Check if player called Jayamma support
        if (window.inputManager.isJayammaSupport()) {
            this.companion.trigger(this.player, this.enemies, window.soundEngine, window.particleSystem, this.camera);
        }

        // 2. Update Companion
        this.companion.update(dt, this.player, this.enemies, window.soundEngine, window.particleSystem, this.camera);

        // 3. Update Boss if in Act 3 Wave 2
        const isBossActive = (this.levelManager.currentAct === 3 && this.levelManager.currentWave === 2);
        if (isBossActive) {
            this.boss.update(dt, this.player, this.bullets, window.soundEngine, window.particleSystem, this.camera);
        }

        // 4. Update Enemies
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.update(dt, this.player, this.bullets, window.soundEngine, window.particleSystem, this.camera);

            // Despawn dead enemy after 3s and spawn grain drop & health drop
            if (enemy.state === 'DEAD' && enemy.stateTime >= 3.0) {
                // Drop grain sack slightly to the left
                this.grainSacks.push(new window.GrainSack(enemy.x - 16, this.levelManager.groundY));

                // Drop health drop separately to the right
                const dropHealth = (enemy.type !== 'REDCOAT') || (this.player.health < 85) || (Math.random() < 0.65);
                if (dropHealth && window.HealthDrop) {
                    this.healthDrops.push(new window.HealthDrop(enemy.x + 16, this.levelManager.groundY, 30));
                }

                this.levelManager.enemiesDefeated++;
                this.enemies.splice(i, 1);
            }
        }

        // 5. Update Bullets & Deflections
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const b = this.bullets[i];
            b.update(dt);

            // Check collision with player
            if (!b.isPlayerOwned) {
                if (Math.abs(b.x - this.player.x) < 38 && Math.abs(b.y - (this.player.y - 45)) < 40) {
                    // Check if player parries / deflects
                    if (this.player.deflectWindowActive) {
                        this.player.deflectBullet(b, window.soundEngine, window.particleSystem, this.camera);
                    } else if (!this.player.isInvulnerable) {
                        b.hasHit = true;
                        this.player.takeDamage(22, b.vx > 0 ? 1 : -1, window.soundEngine, window.particleSystem, this.camera);
                        this.bullets.splice(i, 1);
                        continue;
                    }
                }
            } else {
                // Player deflected bullet hitting enemies
                for (const enemy of this.enemies) {
                    if (enemy.state !== 'DEAD' && Math.abs(b.x - enemy.x) < 40 && Math.abs(b.y - (enemy.y - 45)) < 45) {
                        b.hasHit = true;
                        enemy.takeDamage(55, b.vx > 0 ? 1 : -1, true, window.soundEngine, window.particleSystem, this.camera);
                        this.hud.addCombo(1);
                        this.bullets.splice(i, 1);
                        break;
                    }
                }
                if (b.hasHit) continue;

                // Player deflected bullet hitting Boss
                if (isBossActive && this.boss.state !== 'DEAD') {
                    if (Math.abs(b.x - this.boss.x) < 45 && Math.abs(b.y - (this.boss.y - 45)) < 50) {
                        b.hasHit = true;
                        this.boss.takeDamage(45, b.vx > 0 ? 1 : -1, true, window.soundEngine, window.particleSystem, this.camera);
                        this.hud.addCombo(1);
                        this.bullets.splice(i, 1);
                        continue;
                    }
                }
            }

            // Despawn bullet if out of bounds
            if (b.life <= 0 || b.x < this.camera.x - 100 || b.x > this.camera.x + this.camera.width + 100) {
                this.bullets.splice(i, 1);
            }
        }

        // 6. Combat Hitbox Arbitration (Player Machete vs Enemies/Boss)
        if (this.player.attackHitbox && !this.player.hasHitEnemyThisAttack) {
            const h = this.player.attackHitbox;

            // Check against normal enemies
            for (const enemy of this.enemies) {
                if (enemy.state !== 'DEAD') {
                    if (h.x < enemy.x + 30 && h.x + h.width > enemy.x - 30 &&
                        h.y < enemy.y && h.y + h.height > enemy.y - 90) {

                        const hitSuccess = enemy.takeDamage(h.damage, this.player.facing, h.isHeavy, window.soundEngine, window.particleSystem, this.camera);
                        if (hitSuccess) {
                            this.player.hasHitEnemyThisAttack = true;
                            this.player.addFury(h.isHeavy ? 14 : 7);
                            this.hud.addCombo(1);
                            this.camera.addTrauma(h.isHeavy ? 0.35 : 0.15);

                            // Apply hit-pause
                            this.freezeFrames = h.isHeavy ? 3 : 1;
                        }
                    }
                }
            }

            // Check against Boss Hector
            if (isBossActive && this.boss.state !== 'DEAD') {
                if (h.x < this.boss.x + 35 && h.x + h.width > this.boss.x - 35 &&
                    h.y < this.boss.y && h.y + h.height > this.boss.y - 95) {

                    this.boss.takeDamage(h.damage, this.player.facing, h.isHeavy, window.soundEngine, window.particleSystem, this.camera);
                    this.player.hasHitEnemyThisAttack = true;
                    this.player.addFury(h.isHeavy ? 16 : 8);
                    this.hud.addCombo(1);
                    this.camera.addTrauma(h.isHeavy ? 0.45 : 0.2);
                    this.freezeFrames = h.isHeavy ? 4 : 2;
                }
            }
        }

        // 7. Update Grain Sacks & Collection
        for (let i = this.grainSacks.length - 1; i >= 0; i--) {
            const sack = this.grainSacks[i];
            sack.update(dt);

            if (Math.abs(sack.x - this.player.x) < 45 && Math.abs(sack.y - this.player.y) < 40) {
                sack.collected = true;
                this.levelManager.grainCollected++;
                window.soundEngine.playGrainCollect();
                window.particleSystem.addComicText(sack.x, sack.y - 30, '+1 GRAIN SACK', '#ffea00', false);
                this.grainSacks.splice(i, 1);
            }
        }

        // 7b. Update Health Drops & Collection
        for (let i = this.healthDrops.length - 1; i >= 0; i--) {
            const drop = this.healthDrops[i];
            drop.update(dt);

            if (Math.abs(drop.x - this.player.x) < 45 && Math.abs(drop.y - this.player.y) < 40) {
                drop.collected = true;
                this.player.heal(drop.healAmount || 30, window.particleSystem);
                window.soundEngine.playHealthPickup();
                this.healthDrops.splice(i, 1);
            }
        }

        // 8. Update Particles, Level Logic, Camera, HUD, and Cut-Ins
        window.particleSystem.update(dt);
        this.levelManager.update(dt, this.player, this.enemies, this.boss, window.soundEngine, window.particleSystem, this.camera);
        this.camera.follow(this.player, this.player.facing > 0);
        this.camera.update(dt);
        this.hud.update(dt);
        this.cutIns.update(dt);

        // 9. Win / Lose State Transitions with Vercel Analytics Telemetry
        if (this.player.health <= 0 && this.player.stateTime > 1.8) {
            this.gameState = 'MENU';
            this.menu.setScreen('GAME_OVER');
            window.soundEngine.stopMusic();
            if (window.trackGameEvent) {
                window.trackGameEvent('game_over', { 
                    act: this.levelManager.currentAct, 
                    grainsLiberated: this.levelManager.grainCollected,
                    maxCombo: this.hud.maxCombo 
                });
            }
        } else if (this.levelManager.levelCompleted) {
            this.gameState = 'MENU';
            if (this.levelManager.currentAct === 3) {
                this.menu.setScreen('VICTORY');
                if (window.trackGameEvent) {
                    window.trackGameEvent('game_victory_complete', { 
                        grainsLiberated: this.levelManager.grainCollected, 
                        maxCombo: this.hud.maxCombo 
                    });
                }
            } else {
                this.menu.setScreen('STAGE_CLEAR');
                if (window.trackGameEvent) {
                    window.trackGameEvent('stage_cleared', { 
                        act: this.levelManager.currentAct, 
                        grainsLiberated: this.levelManager.grainCollected, 
                        maxCombo: this.hud.maxCombo 
                    });
                }
            }
            window.soundEngine.stopMusic();
        }

        window.inputManager.endFrame();
    }

    render() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        if (this.gameState === 'MENU' && this.menu.currentScreen === 'TITLE') {
            this.menu.render(this.ctx, this.width, this.height, this.player, this.levelManager, this.hud);
            return;
        }

        // 1. World Viewport (Camera Transformed)
        this.camera.applyTransform(this.ctx);

        // Background
        this.levelManager.renderBackground(this.ctx, this.camera);

        // Collectibles (Grain Sacks & Health Drops)
        for (const sack of this.grainSacks) {
            sack.render(this.ctx);
        }
        for (const drop of this.healthDrops) {
            drop.render(this.ctx);
        }

        // Companion
        this.companion.render(this.ctx);

        // Enemies
        for (const enemy of this.enemies) {
            enemy.render(this.ctx);
        }

        // Boss
        if (this.levelManager.currentAct === 3 && this.levelManager.currentWave === 2) {
            this.boss.render(this.ctx);
        }

        // Player (Ranabaali)
        this.player.render(this.ctx);

        // Bullets
        for (const b of this.bullets) {
            b.render(this.ctx);
        }

        // Particles & Comic Text
        window.particleSystem.render(this.ctx);

        this.camera.restoreTransform(this.ctx);

        // 2. Screen-Space HUD (Untransformed)
        if (this.gameState === 'PLAYING') {
            this.hud.render(this.ctx, this.player, this.companion, this.levelManager, this.boss);
            this.cutIns.render(this.ctx, this.width, this.height);
        }

        // 3. Menus & Overlays
        if (this.gameState === 'MENU' || this.gameState === 'PAUSED') {
            this.menu.render(this.ctx, this.width, this.height, this.player, this.levelManager, this.hud);
        }
    }

    loop() {
        const now = performance.now();
        let dt = (now - this.lastTime) / 1000;
        this.lastTime = now;

        // Cap dt to prevent spiral of death on tab switches
        if (dt > 0.1) dt = 0.1;

        this.update(dt);
        this.render();

        requestAnimationFrame(() => this.loop());
    }
}

// Start Game on window load
window.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
    window.game.loop();
});
