/**
 * Ranabaali: The Colonial Resistance
 * Boss Entity: Commissioner Sir Theodore Hector (Arnold Vosloo)
 */

class BossHector {
    constructor(x = 2400, y = 480) {
        this.x = x;
        this.y = y;
        this.groundY = y;
        this.width = 65;
        this.height = 100;
        this.facing = -1;

        this.vx = 0;
        this.vy = 0;
        this.maxHealth = 400;
        this.health = 400;

        // Boss Phases: 1 (Rapier/Flintlock), 2 (Artillery/Sabre), 3 (Desperation Fury)
        this.phase = 1;

        this.state = 'INTRO'; // INTRO, IDLE, WALK, LUNGE, FLINTLOCK, ARTILLERY_CALL, CUTLASS_SPIN, HURT, DEAD
        this.stateTime = 0;
        this.attackCooldown = 1.0;

        // Dialogue triggers
        this.currentQuote = '';
        this.quoteTimer = 0;

        // Phase 2 Artillery Mortar Strikes
        this.artilleryShells = [];

        this.isGrounded = true;
        this.walkCycle = 0;
    }

    reset(x = 2400, y = 480) {
        this.x = x;
        this.y = y;
        this.groundY = y;
        this.facing = -1;
        this.health = this.maxHealth;
        this.phase = 1;
        this.state = 'IDLE';
        this.stateTime = 0;
        this.attackCooldown = 1.0;
        this.artilleryShells.length = 0;
        this.setQuote("You savages do not comprehend the majesty of the Empire!");
    }

    setQuote(text) {
        this.currentQuote = text;
        this.quoteTimer = 3.5;
    }

    takeDamage(amount, knockDir, isHeavy, sound, particles, camera) {
        if (this.state === 'DEAD') return false;

        // In Phase 3, Hector has hyper-armor resistance against light attacks
        if (this.phase === 3 && !isHeavy) {
            amount *= 0.65;
            sound.playClash();
            particles.emitSparks(this.x, this.y - 50, 10, '#ffd700');
        } else {
            sound.playHitImpact(isHeavy);
            particles.emitHitSplatter(this.x, this.y - 50, knockDir, isHeavy ? 18 : 8);
        }

        this.health = Math.max(0, this.health - amount);
        this.vx = knockDir * (isHeavy ? 140 : 60);

        // Phase checks
        const hpPct = this.health / this.maxHealth;
        if (hpPct <= 0.33 && this.phase < 3) {
            this.phase = 3;
            camera.addTrauma(0.5);
            this.setQuote("Ranabaali! You will bleed on this red soil!");
            particles.addComicText(this.x, this.y - 100, 'HECTOR ENRAGED!', '#ff1100', true);
            sound.playFuryRoar();

            if (window.game && window.game.cutIns) {
                window.game.cutIns.triggerHectorBoss(3, "Ranabaali! You will bleed on this red soil!");
            }
        } else if (hpPct <= 0.66 && this.phase < 2) {
            this.phase = 2;
            camera.addTrauma(0.4);
            this.setQuote("Artillery! Lay waste to these rebel rats!");
            particles.addComicText(this.x, this.y - 100, 'ARTILLERY INBOUND!', '#ff8800', true);
            sound.playExplosion();

            if (window.game && window.game.cutIns) {
                window.game.cutIns.triggerHectorBoss(2, "Artillery! Lay waste to these rebel rats!");
            }
        }

        if (this.health <= 0) {
            this.state = 'DEAD';
            this.stateTime = 0;
            this.vx = knockDir * 280;
            this.vy = -260;
            camera.addTrauma(0.7);
            this.setQuote("Impossible... the Empire... cannot fall...");
            particles.addComicText(this.x, this.y - 110, 'HECTOR DEFEATED!', '#ffd700', true);
            sound.playExplosion();
        }

        return true;
    }

    update(dt, player, bullets, sound, particles, camera) {
        this.stateTime += dt;
        this.walkCycle += dt * 7;

        if (this.quoteTimer > 0) {
            this.quoteTimer -= dt;
        }

        if (this.attackCooldown > 0) {
            this.attackCooldown -= dt;
        }

        // Update active mortar shells
        for (let i = this.artilleryShells.length - 1; i >= 0; i--) {
            const shell = this.artilleryShells[i];
            shell.timer -= dt;

            // Explode when timer expires
            if (shell.timer <= 0 && !shell.exploded) {
                shell.exploded = true;
                sound.playExplosion();
                camera.addTrauma(0.55);

                particles.addShockwave(shell.x, shell.y, 110, '#ff3300', 10);
                particles.emitHitSplatter(shell.x, shell.y, 1, 24);
                particles.addComicText(shell.x, shell.y - 50, 'BOOM!', '#ff2200', true);

                // Damage player if in blast radius
                if (Math.abs(player.x - shell.x) < 85 && Math.abs(player.y - shell.y) < 40) {
                    player.takeDamage(32, player.x > shell.x ? 1 : -1, sound, particles, camera);
                }
            }

            if (shell.exploded && shell.timer < -0.4) {
                this.artilleryShells.splice(i, 1);
            }
        }

        // Dead state physics
        if (this.state === 'DEAD') {
            this.x += this.vx * dt;
            this.y += this.vy * dt;
            this.vy += 1200 * dt;
            if (this.y >= this.groundY) {
                this.y = this.groundY;
                this.vy = 0;
                this.vx *= 0.8;
            }
            return;
        }

        // Apply ground physics
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        if (!this.isGrounded) {
            this.vy += 1200 * dt;
            if (this.y >= this.groundY) {
                this.y = this.groundY;
                this.vy = 0;
                this.isGrounded = true;
            }
        }

        const distToPlayer = player.x - this.x;
        const absDist = Math.abs(distToPlayer);
        if (this.state !== 'LUNGE' && this.state !== 'CUTLASS_SPIN') {
            this.facing = distToPlayer > 0 ? 1 : -1;
        }

        // Boss AI State Machine
        switch (this.state) {
            case 'IDLE':
            case 'WALK':
                this.updateNeutral(dt, player, absDist, distToPlayer, bullets, sound, particles, camera);
                break;

            case 'LUNGE':
                this.updateLunge(dt, player, absDist, sound, particles, camera);
                break;

            case 'FLINTLOCK':
                this.updateFlintlock(dt, bullets, sound, particles);
                break;

            case 'ARTILLERY_CALL':
                this.updateArtillery(dt, player, sound, particles, camera);
                break;

            case 'CUTLASS_SPIN':
                this.updateCutlassSpin(dt, player, absDist, sound, particles, camera);
                break;
        }
    }

    updateNeutral(dt, player, absDist, distToPlayer, bullets, sound, particles, camera) {
        // Attack decision tree
        if (this.attackCooldown <= 0) {
            const rng = Math.random();

            if (this.phase === 1) {
                if (absDist > 240) {
                    // Quickdraw flintlock
                    this.state = 'FLINTLOCK';
                    this.stateTime = 0;
                    this.flintlockShots = 0;
                } else {
                    // Rapier lunge
                    this.state = 'LUNGE';
                    this.stateTime = 0;
                    this.vx = this.facing * 340;
                    sound.playSlash(2);
                }
            } else if (this.phase === 2) {
                if (rng < 0.45 && this.artilleryShells.length === 0) {
                    // Call mortar barrage
                    this.state = 'ARTILLERY_CALL';
                    this.stateTime = 0;
                    this.vx = 0;
                    sound.playHectorCommand();
                } else if (rng < 0.75) {
                    this.state = 'CUTLASS_SPIN';
                    this.stateTime = 0;
                    this.vx = this.facing * 220;
                    sound.playHeavyCleave();
                } else {
                    this.state = 'FLINTLOCK';
                    this.stateTime = 0;
                    this.flintlockShots = 0;
                }
            } else {
                // Phase 3: Relentless assault
                if (rng < 0.6) {
                    this.state = 'LUNGE';
                    this.stateTime = 0;
                    this.vx = this.facing * 440;
                    sound.playHeavyCleave();
                } else {
                    this.state = 'CUTLASS_SPIN';
                    this.stateTime = 0;
                    this.vx = this.facing * 300;
                    sound.playHeavyCleave();
                }
            }
            return;
        }

        // Close distance or circle player
        if (absDist > 140) {
            this.state = 'WALK';
            this.vx = this.facing * (this.phase === 3 ? 190 : 130);
        } else {
            this.state = 'IDLE';
            this.vx = 0;
        }
    }

    updateLunge(dt, player, absDist, sound, particles, camera) {
        this.vx *= 0.94;
        if (this.stateTime > 0.18 && this.stateTime < 0.32 && !this.hasHitThisLunge) {
            if (absDist < 95 && Math.abs(player.y - this.y) < 45) {
                this.hasHitThisLunge = true;
                player.takeDamage(this.phase === 3 ? 34 : 24, this.facing, sound, particles, camera);
                camera.addTrauma(0.35);
            }
        }

        if (this.stateTime >= 0.5) {
            this.state = 'IDLE';
            this.attackCooldown = this.phase === 3 ? 0.6 : 1.2;
            this.hasHitThisLunge = false;
        }
    }

    updateFlintlock(dt, bullets, sound, particles) {
        this.vx = 0;
        // Fire shot 1 at 0.3s, shot 2 at 0.6s
        if (this.stateTime > 0.3 && this.flintlockShots === 0) {
            this.flintlockShots = 1;
            const bSpeed = 750 * this.facing;
            bullets.push(new Bullet(this.x + this.facing * 38, this.y - 54, bSpeed, 0, false));
            sound.playGunshot();
            particles.emitMuzzleSmoke(this.x + this.facing * 38, this.y - 54, this.facing);
        } else if (this.stateTime > 0.65 && this.flintlockShots === 1) {
            this.flintlockShots = 2;
            const bSpeed = 750 * this.facing;
            bullets.push(new Bullet(this.x + this.facing * 38, this.y - 48, bSpeed, 0, false));
            sound.playGunshot();
            particles.emitMuzzleSmoke(this.x + this.facing * 38, this.y - 48, this.facing);
        }

        if (this.stateTime >= 0.9) {
            this.state = 'IDLE';
            this.attackCooldown = 1.4;
        }
    }

    updateArtillery(dt, player, sound, particles, camera) {
        // Whistle and summon 3 shells targeting near player
        if (this.stateTime >= 0.4 && this.artilleryShells.length === 0) {
            this.artilleryShells.push(
                { x: player.x - 70, y: this.groundY, timer: 1.2, exploded: false },
                { x: player.x + 80, y: this.groundY, timer: 1.5, exploded: false },
                { x: player.x, y: this.groundY, timer: 1.8, exploded: false }
            );
            particles.addComicText(this.x, this.y - 85, 'INCOMING!', '#ff4400', true);
        }

        if (this.stateTime >= 0.9) {
            this.state = 'IDLE';
            this.attackCooldown = 2.2;
        }
    }

    updateCutlassSpin(dt, player, absDist, sound, particles, camera) {
        this.vx *= 0.96;
        if (this.stateTime > 0.2 && this.stateTime < 0.5) {
            if (absDist < 110 && Math.abs(player.y - this.y) < 50 && !this.hasHitSpin) {
                this.hasHitSpin = true;
                player.takeDamage(28, this.facing, sound, particles, camera);
                camera.addTrauma(0.4);
            }
        }

        if (this.stateTime >= 0.65) {
            this.state = 'IDLE';
            this.attackCooldown = 1.5;
            this.hasHitSpin = false;
        }
    }

    // --- PROCEDURAL SPRITE RENDERING ---

    render(ctx) {
        // Render artillery warning reticles
        for (const shell of this.artilleryShells) {
            if (!shell.exploded) {
                ctx.save();
                ctx.beginPath();
                ctx.ellipse(shell.x, shell.y, 45, 16, 0, 0, Math.PI * 2);
                ctx.strokeStyle = '#ff1100';
                ctx.lineWidth = 3;
                ctx.stroke();

                // Pulsing crosshair
                ctx.fillStyle = `rgba(255, 30, 0, ${0.3 + Math.sin(performance.now() * 0.02) * 0.25})`;
                ctx.fill();
                ctx.restore();
            }
        }

        ctx.save();
        ctx.translate(this.x, this.y);

        if (this.state === 'DEAD') {
            ctx.rotate(this.facing > 0 ? Math.PI * 0.45 : -Math.PI * 0.45);
            ctx.globalAlpha = Math.max(0.3, 1 - (this.stateTime * 0.25));
        } else {
            ctx.scale(this.facing, 1);
        }

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.45)';
        ctx.beginPath();
        ctx.ellipse(0, 0, 32, 9, 0, 0, Math.PI * 2);
        ctx.fill();

        this.drawHector(ctx);

        ctx.restore();

        // Render Dialogue Speech Bubble if active
        if (this.quoteTimer > 0 && this.state !== 'DEAD') {
            this.drawSpeechBubble(ctx);
        }
    }

    drawHector(ctx) {
        // --- ARTICULATED REALISTIC VICTORIAN COMMISSIONER (ARNOLD VOSLOO) ---
        // Zero rectangular boxes: fully articulated riding boots, scarlet coat, gold bullion epaulettes, and rapier

        const legCycle = (this.state === 'WALK') ? Math.sin(this.walkCycle) * 8 : 0;

        // British Officer High Polished Black Riding Boots
        ctx.fillStyle = '#111111';
        ctx.fillRect(-15 - legCycle, -40, 12, 40);
        ctx.fillRect(4 + legCycle, -40, 12, 40);
        ctx.fillStyle = '#ffd700'; // Golden spurs
        ctx.fillRect(-18 - legCycle, -10, 4, 3);
        ctx.fillRect(16 + legCycle, -10, 4, 3);

        // White Officer Breeches
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-14 - legCycle, -44, 11, 10);
        ctx.fillRect(4 + legCycle, -44, 11, 10);

        // Regal Scarlet Officer Tunic with Gold Embroidery
        ctx.fillStyle = '#9e1b1b';
        ctx.fillRect(-18, -80, 36, 42);

        // Heavy Gold Epaulettes (Fringed officer shoulder armor)
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(-22, -82, 10, 8);
        ctx.fillRect(12, -82, 10, 8);

        // Golden Frogging / Braiding down the chest
        ctx.fillStyle = '#d4af37';
        for (let i = 0; i < 5; i++) {
            ctx.fillRect(-12, -74 + (i * 6), 24, 2.5);
        }

        // Officer Gold Sash
        ctx.fillStyle = '#c59b27';
        ctx.fillRect(-19, -44, 38, 7);

        // Head (Arnold Vosloo - Stern British Commissioner)
        ctx.fillStyle = '#f0c4ad';
        ctx.beginPath();
        ctx.arc(0, -88, 11, 0, Math.PI * 2);
        ctx.fill();

        // Stern eyes and British aristocratic moustache
        ctx.fillStyle = '#3a200e';
        ctx.fillRect(2, -86, 8, 3);

        // Bicorne Hat (Removed in Phase 3)
        if (this.phase < 3) {
            ctx.fillStyle = '#1c1c1c';
            ctx.beginPath();
            ctx.moveTo(-22, -92);
            ctx.lineTo(0, -112);
            ctx.lineTo(22, -92);
            ctx.closePath();
            ctx.fill();
            // Golden edge trim
            ctx.strokeStyle = '#ffd700';
            ctx.lineWidth = 2.5;
            ctx.stroke();
            // Cockade
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(0, -96, 4, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Unkempt aristocratic hair in Phase 3
            ctx.fillStyle = '#4a3319';
            ctx.beginPath();
            ctx.arc(0, -94, 12, Math.PI, 0);
            ctx.fill();
        }

        // Weapons (Officer Rapier / Naval Cutlass)
        ctx.save();
        ctx.translate(14, -62);
        if (this.state === 'LUNGE') {
            ctx.rotate(0.05);
        } else if (this.state === 'CUTLASS_SPIN') {
            ctx.rotate(this.stateTime * 14);
        } else {
            ctx.rotate(0.35);
        }

        // Gold basket hilt
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(0, 0, 7, 0, Math.PI * 2);
        ctx.fill();

        // Steel Blade
        ctx.fillStyle = '#e8ecf1';
        ctx.fillRect(4, -3, 62, 5);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(4, -3, 62, 5);
        ctx.restore();
    }

    drawSpeechBubble(ctx) {
        ctx.save();
        const bx = this.x;
        const by = this.y - 135;

        ctx.font = 'bold 15px Georgia, serif';
        const textWidth = ctx.measureText(this.currentQuote).width;
        const padX = 16;
        const padY = 8;
        const bw = textWidth + (padX * 2);
        const bh = 32;

        // Bubble background
        ctx.fillStyle = 'rgba(20, 20, 20, 0.9)';
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(bx - (bw / 2), by - (bh / 2), bw, bh, 6);
        ctx.fill();
        ctx.stroke();

        // Text
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.currentQuote, bx, by);
        ctx.restore();
    }
}

window.BossHector = BossHector;
