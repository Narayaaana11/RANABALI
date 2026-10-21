/**
 * Ranabaali: The Colonial Resistance
 * Companion Support: Jayamma (Rashmika Mandanna)
 */

class JayammaSupport {
    constructor() {
        this.cooldown = 15.0; // 15s cooldown
        this.currentCooldown = 0;
        this.isActive = false;
        this.activeTimer = 0;

        // Current support ability mode (0 = Heal, 1 = Red Soil Blind, 2 = Villager Charge)
        this.currentMode = 1;
        this.modeNames = ['SANJEEVANI HEAL', 'ERRA MATTI BLIND', 'VILLAGER CHARGE'];

        // Positioning for animation
        this.x = 0;
        this.y = 0;
        this.facing = 1;
        this.villagers = [];
    }

    reset() {
        this.currentCooldown = 0;
        this.isActive = false;
        this.activeTimer = 0;
        this.villagers.length = 0;
    }

    cycleMode() {
        this.currentMode = (this.currentMode + 1) % 3;
        return this.modeNames[this.currentMode];
    }

    canSummon() {
        return this.currentCooldown <= 0 && !this.isActive;
    }

    trigger(player, enemies, sound, particles, camera) {
        if (!this.canSummon()) return false;

        this.isActive = true;
        this.activeTimer = 1.4;
        this.currentCooldown = this.cooldown;

        // Appear near player
        this.facing = player.facing;
        this.x = player.x - (this.facing * 50);
        this.y = player.y;

        sound.playJayammaSummon();

        // Trigger Cinematic Cut-In Card with real Rashmika Mandanna artwork
        if (window.game && window.game.cutIns) {
            window.game.cutIns.triggerJayammaSupport(this.modeNames[this.currentMode]);
        }

        if (this.currentMode === 0) {
            // MODE 0: Sanjeevani Healing
            player.heal(35, particles);
            particles.addComicText(this.x, this.y - 90, "JAYAMMA'S BLESSING!", '#33ff88', true);

        } else if (this.currentMode === 1) {
            // MODE 1: Erra Matti (Blinding Red Soil Throw)
            particles.addComicText(this.x, this.y - 90, 'ERRA MATTI BLIND!', '#ff7733', true);
            camera.addTrauma(0.3);

            // Stun all nearby enemies within 350px
            for (const enemy of enemies) {
                if (Math.abs(enemy.x - player.x) < 360 && enemy.state !== 'DEAD') {
                    enemy.applyStun(4.0, particles);
                }
            }

            // Massive red dust cloud explosion
            for (let i = 0; i < 25; i++) {
                particles.emitDust(player.x + (player.facing * 120), player.y - 40, 4, player.facing);
            }

        } else if (this.currentMode === 2) {
            // MODE 2: Villager Charge
            particles.addComicText(this.x, this.y - 90, 'VILLAGERS RALLY!', '#ffcc00', true);
            camera.addTrauma(0.4);

            // Spawn 3 charging villagers
            this.villagers = [
                { x: player.x - 220, y: player.y, speed: 450, hasHit: new Set() },
                { x: player.x - 290, y: player.y - 10, speed: 420, hasHit: new Set() },
                { x: player.x - 360, y: player.y + 10, speed: 480, hasHit: new Set() }
            ];
        }

        return true;
    }

    update(dt, player, enemies, sound, particles, camera) {
        if (this.currentCooldown > 0) {
            this.currentCooldown -= dt;
        }

        if (this.isActive) {
            this.activeTimer -= dt;
            // Jayamma dashes forward slightly, casts support, and retreats
            this.x += this.facing * 60 * dt;

            // Update charging villagers if active
            for (let i = this.villagers.length - 1; i >= 0; i--) {
                const v = this.villagers[i];
                v.x += player.facing * v.speed * dt;

                // Trample enemies in path
                for (const enemy of enemies) {
                    if (enemy.state !== 'DEAD' && !v.hasHit.has(enemy)) {
                        if (Math.abs(enemy.x - v.x) < 45 && Math.abs(enemy.y - v.y) < 50) {
                            v.hasHit.add(enemy);
                            enemy.takeDamage(24, player.facing, true, sound, particles, camera);
                            particles.addComicText(enemy.x, enemy.y - 60, 'TRAMPLED!', '#ffaa00', false);
                        }
                    }
                }

                // Despawn after travelling across screen
                if (Math.abs(v.x - player.x) > 750) {
                    this.villagers.splice(i, 1);
                }
            }

            if (this.activeTimer <= 0) {
                this.isActive = false;
            }
        }
    }

    render(ctx) {
        // Render charging villagers
        for (const v of this.villagers) {
            ctx.save();
            ctx.translate(v.x, v.y);
            this.drawVillager(ctx);
            ctx.restore();
        }

        if (!this.isActive) return;

        // Render Articulated Jayamma (Rashmika Mandanna)
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(this.facing, 1);

        // Ground shadow
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.beginPath();
        ctx.ellipse(0, 0, 22, 7, 0, 0, Math.PI * 2);
        ctx.fill();

        // Traditional Rayalaseema dark green saree with golden border
        ctx.fillStyle = '#1e4d2b';
        ctx.beginPath();
        ctx.moveTo(-12, -45);
        ctx.lineTo(14, -45);
        ctx.lineTo(18, 0);
        ctx.lineTo(-14, 0);
        ctx.closePath();
        ctx.fill();

        // Golden saree border
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-14, -1);
        ctx.lineTo(18, -1);
        ctx.stroke();

        // Pallu draped across shoulder
        ctx.fillStyle = '#b22222';
        ctx.beginPath();
        ctx.moveTo(-8, -62);
        ctx.lineTo(12, -44);
        ctx.lineTo(6, -42);
        ctx.lineTo(-10, -60);
        ctx.closePath();
        ctx.fill();

        // Face & Hair
        ctx.fillStyle = '#a66a38';
        ctx.beginPath();
        ctx.arc(0, -68, 10, 0, Math.PI * 2);
        ctx.fill();

        // Traditional braid with jasmine flowers
        ctx.fillStyle = '#111111';
        ctx.beginPath();
        ctx.arc(-4, -70, 9, 0, Math.PI * 2);
        ctx.fill();
        // Jasmine white dots
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-8, -66, 3, 3);
        ctx.fillRect(-6, -62, 3, 3);

        // Bindi on forehead
        ctx.fillStyle = '#c41e1e';
        ctx.beginPath();
        ctx.arc(3, -70, 2, 0, Math.PI * 2);
        ctx.fill();

        // Casting arm throwing herbs / soil
        ctx.strokeStyle = '#a66a38';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(4, -54);
        ctx.lineTo(24, -58);
        ctx.stroke();

        ctx.restore();
    }

    drawVillager(ctx) {
        // Articulated Famine Rebel Villager (Zero box/card)

        // Quick procedural villager fallback
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.beginPath();
        ctx.ellipse(0, 0, 18, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#c9bfa8';
        ctx.fillRect(-8, -32, 16, 28);

        ctx.fillStyle = '#7a4e23';
        ctx.fillRect(-6, -50, 12, 18);

        ctx.fillStyle = '#8f552a';
        ctx.beginPath();
        ctx.arc(0, -56, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#e67e22';
        ctx.fillRect(-6, -62, 12, 6);

        ctx.strokeStyle = '#5c3818';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(-10, -60);
        ctx.lineTo(28, -25);
        ctx.stroke();
    }
}

window.JayammaSupport = JayammaSupport;
