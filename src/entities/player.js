/**
 * Ranabaali: The Colonial Resistance
 * Playable Protagonist: Singanamala Bobbili Ranabaali (Vijay Deverakonda)
 */

class Player {
    constructor(x = 150, y = 480) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.width = 60;
        this.height = 95;
        this.groundY = y;

        // Facing direction: 1 = right, -1 = left
        this.facing = 1;

        // Combat Stats
        this.maxHealth = 100;
        this.health = 100;
        this.maxFury = 100;
        this.fury = 0;
        this.isFuryMode = false;
        this.furyTimer = 0;
        this.furyDuration = 10.0; // 10 seconds

        // Movement Physics
        this.moveSpeed = 320;
        this.jumpForce = -580;
        this.gravity = 1400;
        this.isGrounded = true;

        // Action States
        this.state = 'IDLE'; // IDLE, RUN, JUMP, FALL, ATTACK_LIGHT, ATTACK_HEAVY, DEFLECT, ROLL, HURT, DEAD
        this.stateTime = 0;

        // Combo system
        this.comboIndex = 0; // 0, 1, 2
        this.comboResetTimer = 0;
        this.canChainCombo = false;
        this.hasHitEnemyThisAttack = false;

        // Defensive Windows
        this.isInvulnerable = false;
        this.deflectWindowActive = false;

        // Roll mechanic
        this.rollSpeed = 520;
        this.rollDuration = 0.38;

        // Animation timers
        this.animTimer = 0;
        this.walkCycle = 0;
        this.afterImages = [];

        // Hitbox specifications
        this.attackHitbox = null;
    }

    reset(x = 150, y = 480) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.groundY = y;
        this.facing = 1;
        this.health = this.maxHealth;
        this.fury = 0;
        this.isFuryMode = false;
        this.furyTimer = 0;
        this.state = 'IDLE';
        this.stateTime = 0;
        this.comboIndex = 0;
        this.isInvulnerable = false;
        this.deflectWindowActive = false;
        this.afterImages = [];
        this.attackHitbox = null;
    }

    update(dt, input, sound, particles, camera) {
        this.stateTime += dt;
        this.animTimer += dt;

        // Update Fury timer
        if (this.isFuryMode) {
            this.furyTimer -= dt;
            this.fury = Math.max(0, (this.furyTimer / this.furyDuration) * this.maxFury);
            particles.emitFuryEmbers(this.x, this.y - 45, 2);

            if (this.furyTimer <= 0) {
                this.isFuryMode = false;
                this.fury = 0;
                sound.setTension(1, false);
            }
        }

        // Combo timeout decay
        if (this.comboResetTimer > 0) {
            this.comboResetTimer -= dt;
            if (this.comboResetTimer <= 0) {
                this.comboIndex = 0;
            }
        }

        // Update after-images (ghost trails) during roll or fury
        for (let i = this.afterImages.length - 1; i >= 0; i--) {
            this.afterImages[i].alpha -= dt * 3.5;
            if (this.afterImages[i].alpha <= 0) {
                this.afterImages.splice(i, 1);
            }
        }

        // Handle State Transitions
        switch (this.state) {
            case 'IDLE':
            case 'RUN':
                this.handleMovement(input, particles);
                this.handleCombatInputs(input, sound, particles, camera);
                break;

            case 'JUMP':
            case 'FALL':
                this.handleAirMovement(input);
                this.handleAirCombatInputs(input, sound, particles, camera);
                break;

            case 'ATTACK_LIGHT':
                this.updateLightAttack(dt, input, sound, particles, camera);
                break;

            case 'ATTACK_HEAVY':
                this.updateHeavyAttack(dt, input, sound, particles, camera);
                break;

            case 'DEFLECT':
                this.updateDeflect(dt, input);
                break;

            case 'ROLL':
                this.updateRoll(dt, particles);
                break;

            case 'HURT':
                this.updateHurt(dt);
                break;

            case 'DEAD':
                this.vx *= 0.9;
                break;
        }

        // Apply Physics
        this.x += this.vx * dt;
        this.y += this.vy * dt;

        // Stage Boundary Clamping (Left & Right Level Edges)
        if (window.game && window.game.levelManager) {
            const minX = 40;
            const maxX = window.game.levelManager.levelWidth - 40;

            if (this.x < minX) {
                this.x = minX;
                if (this.vx < 0) {
                    this.vx = 0;
                    if (particles && Math.random() < 0.25) {
                        particles.emitDust(this.x, this.y, 4, 1);
                    }
                }
            } else if (this.x > maxX) {
                this.x = maxX;
                if (this.vx > 0) {
                    this.vx = 0;
                    if (particles && Math.random() < 0.25) {
                        particles.emitDust(this.x, this.y, 4, -1);
                    }
                }
            }
        }

        if (!this.isGrounded) {
            this.vy += this.gravity * dt;
            if (this.y >= this.groundY) {
                this.y = this.groundY;
                this.vy = 0;
                this.isGrounded = true;
                if (this.state === 'FALL' || this.state === 'JUMP') {
                    this.state = 'IDLE';
                    particles.emitDust(this.x, this.y, 6, 0);
                }
            }
        }

        // Record ghost trails
        if ((this.state === 'ROLL' || this.isFuryMode) && Math.random() < 0.35) {
            this.afterImages.push({
                x: this.x,
                y: this.y,
                facing: this.facing,
                state: this.state,
                alpha: 0.55,
                isFury: this.isFuryMode
            });
        }
    }

    handleMovement(input, particles) {
        let moveDir = 0;
        if (input.isLeft()) moveDir -= 1;
        if (input.isRight()) moveDir += 1;

        if (moveDir !== 0) {
            this.facing = moveDir;
            const speed = this.isFuryMode ? this.moveSpeed * 1.3 : this.moveSpeed;
            this.vx = moveDir * speed;
            this.state = 'RUN';
            this.walkCycle += 12 * 0.016;

            // Footstep dust
            if (Math.sin(this.walkCycle) > 0.85) {
                particles.emitDust(this.x, this.y, 2, this.facing);
            }
        } else {
            this.vx = 0;
            this.state = 'IDLE';
        }

        if (input.isJump() && this.isGrounded) {
            this.vy = this.jumpForce;
            this.isGrounded = false;
            this.state = 'JUMP';
            particles.emitDust(this.x, this.y, 5, 0);
        }
    }

    handleAirMovement(input) {
        let moveDir = 0;
        if (input.isLeft()) moveDir -= 1;
        if (input.isRight()) moveDir += 1;
        if (moveDir !== 0) {
            this.facing = moveDir;
            this.vx = moveDir * this.moveSpeed * 0.85;
        } else {
            this.vx *= 0.95;
        }

        if (this.vy > 0) this.state = 'FALL';
    }

    handleCombatInputs(input, sound, particles, camera) {
        // Fury Mode Trigger (I / Q)
        if (input.isFuryMode() && this.fury >= this.maxFury && !this.isFuryMode) {
            this.activateFury(sound, particles, camera);
            return;
        }

        // Dodge Roll (L / Shift)
        if (input.isDodgeRoll()) {
            this.startRoll(sound, particles);
            return;
        }

        // Heavy Cleave (K)
        if (input.isHeavyAttack()) {
            this.startHeavyAttack(sound, particles, camera);
            return;
        }

        // Light Attack (J)
        if (input.isLightAttack()) {
            this.startLightAttack(sound, particles, camera);
            return;
        }
    }

    handleAirCombatInputs(input, sound, particles, camera) {
        if (input.isHeavyAttack()) {
            // Dive cleave down
            this.startHeavyAttack(sound, particles, camera);
            this.vy = 650;
        } else if (input.isLightAttack()) {
            this.startLightAttack(sound, particles, camera);
        }
    }

    activateFury(sound, particles, camera) {
        this.isFuryMode = true;
        this.furyTimer = this.furyDuration;
        sound.playVijayRoar();
        sound.setTension(2, true);
        camera.addTrauma(0.7);
        camera.punchZoom(1.1);

        if (window.trackGameEvent) {
            window.trackGameEvent('ranavatharam_fury_activated');
        }

        // Trigger Cinematic Cut-In Slash Card with real Vijay Deverakonda artwork
        if (window.game && window.game.cutIns) {
            window.game.cutIns.triggerRanavatharam();
        }

        particles.addShockwave(this.x, this.y - 40, 180, '#ff2200', 12);
        particles.addComicText(this.x, this.y - 100, 'సింగనమల రణబాలి!', '#ff2200', true);
        particles.addScreenSlash(0, 180, 1280, 540, '#ffea00', 8);
    }

    startRoll(sound, particles) {
        this.state = 'ROLL';
        this.stateTime = 0;
        this.isInvulnerable = true;
        this.vx = this.facing * this.rollSpeed;
        sound.playDodge();
        particles.emitDust(this.x, this.y, 8, this.facing);
    }

    updateRoll(dt, particles) {
        if (this.stateTime >= this.rollDuration) {
            this.isInvulnerable = false;
            this.state = 'IDLE';
            this.vx = 0;
        }
    }

    startLightAttack(sound, particles, camera) {
        this.state = 'ATTACK_LIGHT';
        this.stateTime = 0;
        this.hasHitEnemyThisAttack = false;

        // Combo index increments (0 -> 1 -> 2 -> 0)
        this.comboIndex = (this.comboIndex + 1) % 3;
        this.comboResetTimer = 0.85;

        // Sound
        sound.playSlash(this.comboIndex + 1);

        // Forward step momentum
        this.vx = this.facing * (this.comboIndex === 2 ? 180 : 120);

        // Active deflection window on startup of Attack 1 & 2
        this.deflectWindowActive = true;

        // Hitbox
        const reach = this.comboIndex === 2 ? 115 : 90;
        const hx = this.facing > 0 ? this.x + 10 : this.x - reach - 10;
        this.attackHitbox = {
            x: hx,
            y: this.y - 85,
            width: reach,
            height: 85,
            damage: this.isFuryMode ? 35 : (15 + this.comboIndex * 6),
            isHeavy: this.isFuryMode,
            knockbackX: this.facing * (this.comboIndex === 2 ? 260 : 160),
            knockbackY: this.comboIndex === 2 ? -220 : -80
        };

        // Cinematic Blade Arc Ribbon Trail VFX
        const arcColor = this.isFuryMode ? 'rgba(255, 30, 0, 0.95)' : 'rgba(255, 210, 60, 0.85)';
        if (this.comboIndex === 0) {
            particles.emitSlashArc(this.x + this.facing * 30, this.y - 50, 75, -Math.PI * 0.35, Math.PI * 0.35, this.facing, arcColor, 15);
        } else if (this.comboIndex === 1) {
            particles.emitSlashArc(this.x + this.facing * 30, this.y - 50, 75, Math.PI * 0.45, -Math.PI * 0.3, this.facing, arcColor, 15);
        } else {
            particles.emitSlashArc(this.x, this.y - 50, 85, 0, Math.PI * 2, 1, arcColor, 18);
            if (this.isFuryMode) {
                particles.addScreenSlash(0, 180, 1280, 540, '#ff3300');
            }
        }

        if (this.comboIndex === 2) {
            camera.addTrauma(0.2);
        }
    }

    updateLightAttack(dt, input, sound, particles, camera) {
        this.vx *= 0.85;

        // Turn off deflect window halfway through
        if (this.stateTime > 0.18) {
            this.deflectWindowActive = false;
        }

        // Combo chaining window
        if (this.stateTime > 0.15 && this.stateTime < 0.35) {
            if (input.isLightAttack()) {
                this.startLightAttack(sound, particles, camera);
                return;
            }
            if (input.isHeavyAttack()) {
                this.startHeavyAttack(sound, particles, camera);
                return;
            }
            if (input.isDodgeRoll()) {
                this.startRoll(sound, particles);
                return;
            }
        }

        if (this.stateTime >= 0.36) {
            this.attackHitbox = null;
            this.deflectWindowActive = false;
            this.state = 'IDLE';
        }
    }

    startHeavyAttack(sound, particles, camera) {
        this.state = 'ATTACK_HEAVY';
        this.stateTime = 0;
        this.hasHitEnemyThisAttack = false;
        this.vx = this.facing * 160;
        this.comboIndex = 0;

        sound.playHeavyCleave();
        camera.addTrauma(0.45);
        camera.punchZoom(1.05);

        // Big Cleave Hitbox
        const reach = 135;
        const hx = this.facing > 0 ? this.x + 10 : this.x - reach - 10;
        this.attackHitbox = {
            x: hx,
            y: this.y - 95,
            width: reach,
            height: 95,
            damage: this.isFuryMode ? 65 : 42,
            isHeavy: true,
            knockbackX: this.facing * 340,
            knockbackY: -280
        };

        // Heavy Attack Slash Ribbon & Ground Shockwave
        const hColor = this.isFuryMode ? '#ff1100' : '#ff7700';
        particles.emitSlashArc(this.x + this.facing * 40, this.y - 45, 100, -Math.PI * 0.55, Math.PI * 0.45, this.facing, hColor, 22);
        particles.addShockwave(this.x + this.facing * 45, this.y, 95, hColor, 8);

        if (this.isFuryMode) {
            particles.addScreenSlash(1280, 120, 0, 620, '#ffea00', 7);
        }
    }

    updateHeavyAttack(dt, input, sound, particles, camera) {
        this.vx *= 0.88;

        if (this.stateTime >= 0.48) {
            this.attackHitbox = null;
            this.state = 'IDLE';
        }
    }

    deflectBullet(bullet, sound, particles, camera) {
        // Reflect bullet back to the right or left with double speed
        bullet.vx = -bullet.vx * 1.5;
        bullet.isPlayerOwned = true;

        sound.playBulletDeflect();
        camera.addTrauma(0.35);
        particles.addHitSparkBurst(bullet.x, bullet.y, 24);

        const deflectWords = ['DEFLECT!', 'భళ్ళున!', 'దభ్!'];
        const chosen = deflectWords[Math.floor(Math.random() * deflectWords.length)];
        particles.addComicText(bullet.x, bullet.y - 25, chosen, '#00e5ff', true);

        // Boost fury on successful deflect
        this.addFury(20);
    }

    takeDamage(amount, knockDir = 1, sound, particles, camera) {
        if (this.isInvulnerable || this.state === 'DEAD') return false;

        this.health = Math.max(0, this.health - amount);
        this.state = 'HURT';
        this.stateTime = 0;
        this.vx = knockDir * 180;
        this.vy = -120;
        this.isGrounded = false;
        this.comboIndex = 0;

        sound.playHitImpact(true);
        camera.addTrauma(0.35);
        particles.emitHitSplatter(this.x, this.y - 45, -knockDir, 16);

        // Build fury on taking damage
        this.addFury(12);

        if (this.health <= 0) {
            this.state = 'DEAD';
            particles.addComicText(this.x, this.y - 80, 'RANABAALI FELL...', '#ff1100', true);
        }

        return true;
    }

    heal(amount, particles) {
        if (this.health <= 0) return 0;
        const prev = this.health;
        this.health = Math.min(this.maxHealth, this.health + amount);
        const actual = Math.round(this.health - prev);
        if (particles && actual > 0) {
            particles.addComicText(this.x, this.y - 75, `+${actual} HP`, '#00e676', true);
            if (particles.emitHealingSparks) {
                particles.emitHealingSparks(this.x, this.y - 45, 16);
            } else {
                for (let i = 0; i < 12; i++) {
                    particles.emitSparks(this.x + (Math.random() * 40 - 20), this.y - (Math.random() * 70), 2, '#00e676');
                }
            }
        }
        return actual;
    }

    addFury(amount) {
        if (!this.isFuryMode) {
            this.fury = Math.min(this.maxFury, this.fury + amount);
        }
    }

    updateHurt(dt) {
        this.vx *= 0.9;
        if (this.stateTime >= 0.28) {
            this.state = 'IDLE';
        }
    }

    // --- PROCEDURAL STYLIZED SPRITE RENDERING ---

    render(ctx) {
        ctx.save();

        // Render After-Images (Ghost Trails)
        for (const ghost of this.afterImages) {
            ctx.save();
            ctx.globalAlpha = ghost.alpha * 0.5;
            ctx.translate(ghost.x, ghost.y);
            ctx.scale(ghost.facing, 1);
            this.drawSilhouettedBody(ctx, ghost.isFury ? '#ff2200' : '#d2691e');
            ctx.restore();
        }

        ctx.translate(this.x, this.y);
        ctx.scale(this.facing, 1);

        // Fury fiery underglow
        if (this.isFuryMode) {
            ctx.save();
            ctx.beginPath();
            ctx.ellipse(0, -45, 45, 65, 0, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 68, 0, 0.25)';
            ctx.fill();
            ctx.restore();
        }

        // Draw shadow on ground
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(0, 0, 28, 9, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.fill();
        ctx.restore();

        // Draw Ranabaali Body & Weapon Keyframes
        this.drawRanabaali(ctx);

        ctx.restore();
    }

    drawSilhouettedBody(ctx, color) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(0, -45, 22, 42, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    drawRanabaali(ctx) {
        const isAttacking = this.state === 'ATTACK_LIGHT' || this.state === 'ATTACK_HEAVY';
        const isRolling = this.state === 'ROLL';
        const isFury = this.isFuryMode;

        // Roll animation: rotating somersault
        if (isRolling) {
            ctx.save();
            ctx.translate(0, -35);
            ctx.rotate(this.stateTime * 18);

            // Tucked body
            ctx.fillStyle = '#b23b18';
            ctx.beginPath();
            ctx.arc(0, 0, 30, 0, Math.PI * 2);
            ctx.fill();

            // Machete spinning in roll
            ctx.strokeStyle = '#e0e0e0';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(0, 0, 36, 0, Math.PI * 1.2);
            ctx.stroke();

            ctx.restore();
            return;
        }

        // --- ARTICULATED REALISTIC RAYALASEEMA REBEL WARRIOR (VIJAY DEVERAKONDA) ---
        // Zero rectangular boxes: fully articulated animated limbs, dhoti, and dual sickles

        // --- LEGS & DHOTI ---
        const legCycle = (this.state === 'RUN') ? Math.sin(this.walkCycle) : 0;

        // Dhoti back
        ctx.fillStyle = '#dcd4c7';
        ctx.beginPath();
        ctx.moveTo(-18, -48);
        ctx.lineTo(16, -48);
        ctx.lineTo(20 + legCycle * 10, -10);
        ctx.lineTo(-22 - legCycle * 8, -10);
        ctx.closePath();
        ctx.fill();

        // Left Leg
        ctx.fillStyle = '#8b5a2b';
        ctx.fillRect(-14 - legCycle * 8, -12, 10, 14);

        // Right Leg
        ctx.fillStyle = '#7a4e23';
        ctx.fillRect(8 + legCycle * 8, -12, 10, 14);

        // Feet (barefoot Rayalaseema warrior)
        ctx.fillStyle = '#5c3818';
        ctx.fillRect(-16 - legCycle * 8, 0, 14, 4);
        ctx.fillRect(6 + legCycle * 8, 0, 14, 4);

        // --- TORSO (MUSCULAR, RUSTIC BROWN SKIN) ---
        ctx.fillStyle = '#8f552a';
        ctx.beginPath();
        ctx.ellipse(0, -56, 19, 22, 0, 0, Math.PI * 2);
        ctx.fill();

        // Sacred Thread / Rayalaseema warrior sash across chest
        ctx.strokeStyle = '#c41e1e';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(-14, -72);
        ctx.lineTo(14, -42);
        ctx.stroke();

        // Waist Band (Red Rumal tied around waist)
        ctx.fillStyle = '#a8241b';
        ctx.fillRect(-18, -46, 36, 9);
        // Dangling sash
        ctx.beginPath();
        ctx.moveTo(10, -42);
        ctx.lineTo(18, -18);
        ctx.lineTo(12, -18);
        ctx.closePath();
        ctx.fill();

        // --- HEAD, BEARD & HEADSCARF ---
        // Neck
        ctx.fillStyle = '#7a4823';
        ctx.fillRect(-6, -78, 12, 8);

        // Face
        ctx.fillStyle = '#8f552a';
        ctx.beginPath();
        ctx.arc(0, -84, 13, 0, Math.PI * 2);
        ctx.fill();

        // Rayalaseema Full Beard
        ctx.fillStyle = '#1c1512';
        ctx.beginPath();
        ctx.moveTo(-12, -84);
        ctx.quadraticCurveTo(0, -68, 12, -84);
        ctx.lineTo(10, -78);
        ctx.quadraticCurveTo(0, -66, -10, -78);
        ctx.closePath();
        ctx.fill();

        // Eyes (Fierce glow in Fury)
        ctx.fillStyle = isFury ? '#ff1100' : '#ffffff';
        ctx.fillRect(2, -87, 4, 3);
        ctx.fillStyle = isFury ? '#ffff00' : '#000000';
        ctx.fillRect(4, -87, 2, 2);

        // Red Headscarf / Headband (Rumal)
        ctx.fillStyle = '#b5221b';
        ctx.beginPath();
        ctx.ellipse(0, -92, 15, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        // Flowing headband tail behind head
        ctx.beginPath();
        ctx.moveTo(-12, -90);
        ctx.quadraticCurveTo(-26, -82 + Math.sin(this.animTimer * 8) * 4, -30, -72);
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#b5221b';
        ctx.stroke();

        // --- ARMS & DUAL MACHETES (VETA KATTHULU) ---
        this.drawArmsAndWeapons(ctx, isAttacking, isFury);
    }

    drawArmsAndWeapons(ctx, isAttacking, isFury) {
        const bladeColor = isFury ? '#ff4500' : '#dcdde1';
        const bladeGlow = isFury ? '#ff9900' : '#f5f6fa';

        ctx.save();

        if (this.state === 'ATTACK_LIGHT') {
            const attackProgress = this.stateTime / 0.36;

            if (this.comboIndex === 0) {
                // Slash 1: Horizontal high swing
                const armAngle = -Math.PI * 0.4 + (attackProgress * Math.PI * 1.1);
                ctx.rotate(armAngle);

                // Right arm
                ctx.fillStyle = '#8f552a';
                ctx.fillRect(0, -60, 26, 9);

                // Machete 1
                this.drawCurvedMachete(ctx, 24, -62, -0.2, bladeColor, bladeGlow, isFury);

                // Blade trail arc
                ctx.beginPath();
                ctx.arc(0, -60, 75, -Math.PI * 0.3, Math.PI * 0.4);
                ctx.strokeStyle = isFury ? 'rgba(255, 60, 0, 0.7)' : 'rgba(255, 235, 180, 0.6)';
                ctx.lineWidth = 14;
                ctx.stroke();

            } else if (this.comboIndex === 1) {
                // Slash 2: Upward diagonal back cut
                const armAngle = Math.PI * 0.5 - (attackProgress * Math.PI * 1.2);
                ctx.rotate(armAngle);

                ctx.fillStyle = '#8f552a';
                ctx.fillRect(0, -56, 26, 9);
                this.drawCurvedMachete(ctx, 24, -58, 0.3, bladeColor, bladeGlow, isFury);

            } else {
                // Slash 3: Whirlwind 360 swing
                const armAngle = attackProgress * Math.PI * 3.5;
                ctx.rotate(armAngle);

                this.drawCurvedMachete(ctx, 20, -56, 0, bladeColor, bladeGlow, isFury);
                this.drawCurvedMachete(ctx, -20, -56, Math.PI, bladeColor, bladeGlow, isFury);

                // Full circular blur
                ctx.beginPath();
                ctx.arc(0, -56, 85, 0, Math.PI * 2);
                ctx.strokeStyle = isFury ? 'rgba(255, 20, 0, 0.8)' : 'rgba(255, 180, 50, 0.65)';
                ctx.lineWidth = 18;
                ctx.stroke();
            }

        } else if (this.state === 'ATTACK_HEAVY') {
            // Heavy Cleave: Double machete overhead slam
            const progress = this.stateTime / 0.48;
            const slamAngle = progress < 0.4 ? -Math.PI * 0.7 : Math.PI * 0.35;

            ctx.translate(10, -58);
            ctx.rotate(slamAngle);

            // Both arms
            ctx.fillStyle = '#8f552a';
            ctx.fillRect(-6, -10, 32, 14);

            // Double heavy machetes together
            this.drawCurvedMachete(ctx, 26, -14, -0.15, bladeColor, bladeGlow, isFury, 1.3);
            this.drawCurvedMachete(ctx, 26, -4, 0.1, bladeColor, bladeGlow, isFury, 1.3);

        } else {
            // Idle / Run stance: Dual machetes held ready at sides
            const sway = Math.sin(this.animTimer * 5) * 3;

            // Back arm & machete
            ctx.fillStyle = '#73441f';
            ctx.fillRect(-12, -58 + sway, 16, 8);
            this.drawCurvedMachete(ctx, -14, -56 + sway, -Math.PI * 0.4, bladeColor, bladeGlow, isFury);

            // Front arm & machete
            ctx.fillStyle = '#8f552a';
            ctx.fillRect(6, -58 - sway, 20, 8);
            this.drawCurvedMachete(ctx, 22, -56 - sway, Math.PI * 0.35, bladeColor, bladeGlow, isFury);
        }

        ctx.restore();
    }

    drawCurvedMachete(ctx, x, y, angle, bladeColor, glowColor, isFury, scale = 1.0) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.scale(scale, scale);

        // Brass handle & hilt
        ctx.fillStyle = '#c59b27';
        ctx.fillRect(-4, -3, 8, 6);
        ctx.fillStyle = '#3a200e';
        ctx.fillRect(-12, -2, 9, 4);

        // Curved steel blade (Rayalaseema sickle-machete profile)
        ctx.fillStyle = bladeColor;
        ctx.beginPath();
        ctx.moveTo(4, -3);
        ctx.lineTo(42, -5);
        ctx.quadraticCurveTo(56, -16, 52, 6); // Aggressive forward curved hook
        ctx.quadraticCurveTo(34, 4, 4, 3);
        ctx.closePath();
        ctx.fill();

        // Razor-sharp edge highlight
        ctx.strokeStyle = glowColor;
        ctx.lineWidth = isFury ? 3 : 1.5;
        ctx.stroke();

        ctx.restore();
    }
}

window.Player = Player;
