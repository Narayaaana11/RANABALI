/**
 * Ranabaali: The Colonial Resistance
 * Colonial Enemy Archetypes: Redcoat Infantry, British Rifleman, and Armored Enforcer
 */

class Bullet {
    constructor(x, y, vx, vy, isPlayerOwned = false) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.radius = 4;
        this.isPlayerOwned = isPlayerOwned;
        this.hasHit = false;
        this.life = 3.0; // Despawn after 3s
    }

    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.life -= dt;
    }

    render(ctx) {
        ctx.save();
        // Golden bullet with bright glow trail
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.isPlayerOwned ? '#00e5ff' : '#ffe600';
        ctx.fill();

        // Speed trail
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x - (this.vx * 0.04), this.y - (this.vy * 0.04));
        ctx.strokeStyle = this.isPlayerOwned ? 'rgba(0, 229, 255, 0.7)' : 'rgba(255, 230, 0, 0.6)';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();
    }
}

class Enemy {
    constructor(x, y, type = 'REDCOAT') {
        this.x = x;
        this.y = y;
        this.groundY = y;
        this.type = type; // REDCOAT, RIFLEMAN, ENFORCER
        this.facing = -1; // Usually faces left toward player

        this.vx = 0;
        this.vy = 0;
        this.width = 50;
        this.height = 90;

        // Stats by type
        if (type === 'REDCOAT') {
            this.maxHealth = 45;
            this.speed = 120;
            this.attackRange = 75;
            this.attackDamage = 14;
            this.attackCooldownMax = 1.4;
        } else if (type === 'RIFLEMAN') {
            this.maxHealth = 35;
            this.speed = 80;
            this.attackRange = 550;
            this.attackDamage = 22;
            this.attackCooldownMax = 2.8;
            this.aimingTimer = 0;
            this.isAiming = false;
        } else if (type === 'ENFORCER') {
            this.maxHealth = 90;
            this.speed = 70;
            this.attackRange = 85;
            this.attackDamage = 26;
            this.attackCooldownMax = 2.0;
            this.hasShield = true;
            this.shieldBroken = false;
        }

        this.health = this.maxHealth;
        this.state = 'IDLE'; // IDLE, WALK, ATTACK, AIM, HURT, STUNNED, DEAD
        this.stateTime = 0;
        this.attackCooldown = 0.5 + Math.random() * 0.8;

        this.stunTimer = 0;
        this.walkCycle = Math.random() * 10;
        this.isGrounded = true;
    }

    applyStun(duration, particles) {
        if (this.state === 'DEAD') return;
        this.state = 'STUNNED';
        this.stunTimer = duration;
        this.stateTime = 0;
        this.vx = 0;
        particles.addComicText(this.x, this.y - 70, 'BLINDED!', '#ff8800', false);
    }

    takeDamage(amount, knockDir, isHeavy, sound, particles, camera) {
        if (this.state === 'DEAD') return false;

        // Armored enforcer front shield check
        if (this.hasShield && !this.shieldBroken && !isHeavy) {
            const isFacingHit = (knockDir > 0 && this.facing < 0) || (knockDir < 0 && this.facing > 0);
            if (isFacingHit) {
                // Blocked by heavy iron shield!
                sound.playClash();
                camera.addTrauma(0.15);
                particles.emitSparks(this.x + this.facing * 20, this.y - 45, 14, '#ffffff');
                particles.addComicText(this.x, this.y - 75, 'BLOCKED!', '#ffffff', false);
                this.vx = knockDir * 60;
                return false;
            }
        }

        // Heavy attack shatters shield
        if (this.hasShield && isHeavy && !this.shieldBroken) {
            this.shieldBroken = true;
            particles.addShockwave(this.x, this.y - 45, 60, '#ffffff', 5);
            particles.addComicText(this.x, this.y - 85, 'GUARD BROKEN!', '#ff3300', true);
        }

        this.health -= amount;
        this.state = 'HURT';
        this.stateTime = 0;
        this.vx = knockDir * (isHeavy ? 280 : 160);
        this.vy = isHeavy ? -180 : -60;
        this.isGrounded = false;

        sound.playHitImpact(isHeavy);
        particles.emitHitSplatter(this.x, this.y - 45, knockDir, isHeavy ? 24 : 12);
        particles.emitBloodMist(this.x, this.y - 45, knockDir, isHeavy ? 10 : 4);

        // Comic damage text (Mass Telugu Cinema sound fx)
        const comicWords = isHeavy
            ? ['DHUM!', 'OORA MASS!', 'దంచేయ్!', 'రణబలి!', 'భళ్ళున!']
            : ['PHAT!', 'దభ్!', 'DISHOOM!', 'ఝాడింపు!'];
        const word = comicWords[Math.floor(Math.random() * comicWords.length)];
        particles.addComicText(this.x, this.y - 70, word, isHeavy ? '#ff2200' : '#ffea00', isHeavy);

        if (this.health <= 0) {
            this.state = 'DEAD';
            this.vx = knockDir * 320;
            this.vy = -220;
            sound.playHitImpact(true);
            particles.emitBloodMist(this.x, this.y - 45, knockDir, 16);
            particles.emitHitSplatter(this.x, this.y - 45, knockDir, 28);
        }

        return true;
    }

    update(dt, player, bullets, sound, particles, camera) {
        this.stateTime += dt;
        this.walkCycle += dt * 8;

        if (this.attackCooldown > 0) {
            this.attackCooldown -= dt;
        }

        // Handle Dead State
        if (this.state === 'DEAD') {
            this.x += this.vx * dt;
            this.y += this.vy * dt;
            this.vy += 1200 * dt;
            if (this.y >= this.groundY) {
                this.y = this.groundY;
                this.vy = 0;
                this.vx *= 0.85;
            }
            return;
        }

        // Handle Stun State
        if (this.state === 'STUNNED') {
            this.stunTimer -= dt;
            this.vx *= 0.85;
            if (this.stunTimer <= 0) {
                this.state = 'IDLE';
            }
            return;
        }

        // Handle Hurt State
        if (this.state === 'HURT') {
            this.vx *= 0.9;
            if (this.stateTime >= 0.28) {
                this.state = 'IDLE';
            }
        }

        // Apply physics
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

        if (this.state === 'HURT') return;

        // Facing direction toward player
        const distToPlayer = player.x - this.x;
        const absDist = Math.abs(distToPlayer);
        if (this.state !== 'ATTACK' && !this.isAiming) {
            this.facing = distToPlayer > 0 ? 1 : -1;
        }

        // AI Logic per archetype
        if (this.type === 'REDCOAT') {
            this.updateRedcoatAI(dt, player, absDist, distToPlayer, sound, particles, camera);
        } else if (this.type === 'RIFLEMAN') {
            this.updateRiflemanAI(dt, player, absDist, distToPlayer, bullets, sound, particles);
        } else if (this.type === 'ENFORCER') {
            this.updateEnforcerAI(dt, player, absDist, distToPlayer, sound, particles, camera);
        }
    }

    updateRedcoatAI(dt, player, absDist, distToPlayer, sound, particles, camera) {
        if (this.state === 'ATTACK') {
            this.vx *= 0.88;
            // Check hit at mid-attack frame
            if (this.stateTime > 0.2 && this.stateTime < 0.32 && !this.hasDealtDamage) {
                if (absDist < this.attackRange + 20 && Math.abs(player.y - this.y) < 40) {
                    this.hasDealtDamage = true;
                    player.takeDamage(this.attackDamage, this.facing, sound, particles, camera);
                }
            }
            if (this.stateTime >= 0.45) {
                this.state = 'IDLE';
                this.attackCooldown = this.attackCooldownMax;
            }
            return;
        }

        // Movement toward player
        if (absDist > this.attackRange) {
            this.state = 'WALK';
            this.vx = this.facing * this.speed;
        } else {
            // Within attack range
            this.vx = 0;
            if (this.attackCooldown <= 0) {
                this.state = 'ATTACK';
                this.stateTime = 0;
                this.hasDealtDamage = false;
                this.vx = this.facing * 140; // Lunge
                sound.playSlash(1);
            } else {
                this.state = 'IDLE';
            }
        }
    }

    updateRiflemanAI(dt, player, absDist, distToPlayer, bullets, sound, particles) {
        if (this.isAiming) {
            this.aimingTimer += dt;
            this.vx = 0;

            // Flash warning when about to fire
            if (this.aimingTimer >= 1.0) {
                // FIRE!
                this.isAiming = false;
                this.attackCooldown = this.attackCooldownMax;
                this.state = 'IDLE';

                const bulletSpeed = 700 * this.facing;
                bullets.push(new Bullet(this.x + this.facing * 35, this.y - 48, bulletSpeed, 0, false));

                sound.playGunshot();
                particles.emitMuzzleSmoke(this.x + this.facing * 35, this.y - 48, this.facing);
            }
            return;
        }

        // Rifleman maintains distance (between 250px and 550px)
        if (absDist < 200) {
            // Back away from Ranabaali!
            this.state = 'WALK';
            this.vx = -this.facing * this.speed;
        } else if (absDist > 550) {
            // Move closer
            this.state = 'WALK';
            this.vx = this.facing * this.speed;
        } else {
            // In optimal firing zone
            this.vx = 0;
            if (this.attackCooldown <= 0) {
                this.isAiming = true;
                this.aimingTimer = 0;
                this.state = 'AIM';
            } else {
                this.state = 'IDLE';
            }
        }
    }

    updateEnforcerAI(dt, player, absDist, distToPlayer, sound, particles, camera) {
        if (this.state === 'ATTACK') {
            this.vx *= 0.85;
            if (this.stateTime > 0.28 && this.stateTime < 0.42 && !this.hasDealtDamage) {
                if (absDist < this.attackRange + 25 && Math.abs(player.y - this.y) < 40) {
                    this.hasDealtDamage = true;
                    player.takeDamage(this.attackDamage, this.facing, sound, particles, camera);
                    camera.addTrauma(0.3);
                }
            }
            if (this.stateTime >= 0.55) {
                this.state = 'IDLE';
                this.attackCooldown = this.attackCooldownMax;
            }
            return;
        }

        if (absDist > this.attackRange) {
            this.state = 'WALK';
            this.vx = this.facing * this.speed;
        } else {
            this.vx = 0;
            if (this.attackCooldown <= 0) {
                this.state = 'ATTACK';
                this.stateTime = 0;
                this.hasDealtDamage = false;
                this.vx = this.facing * 90;
                sound.playHeavyCleave();
            } else {
                this.state = 'IDLE';
            }
        }
    }

    // --- PROCEDURAL SPRITE RENDERING ---

    render(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        // Dead enemy lying flat
        if (this.state === 'DEAD') {
            ctx.rotate(this.facing > 0 ? Math.PI * 0.45 : -Math.PI * 0.45);
            ctx.globalAlpha = Math.max(0.2, 1 - (this.stateTime * 0.4));
        } else {
            ctx.scale(this.facing, 1);
        }

        // Ground shadow
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.beginPath();
        ctx.ellipse(0, 0, 24, 7, 0, 0, Math.PI * 2);
        ctx.fill();

        if (this.type === 'REDCOAT') {
            this.drawRedcoat(ctx);
        } else if (this.type === 'RIFLEMAN') {
            this.drawRifleman(ctx);
        } else if (this.type === 'ENFORCER') {
            this.drawEnforcer(ctx);
        }

        // Aiming laser indicator for Rifleman
        if (this.isAiming) {
            ctx.save();
            ctx.strokeStyle = `rgba(255, 30, 0, ${0.4 + (this.aimingTimer * 0.5)})`;
            ctx.lineWidth = 2;
            ctx.setLineDash([8, 4]);
            ctx.beginPath();
            ctx.moveTo(35, -48);
            ctx.lineTo(550, -48);
            ctx.stroke();
            ctx.restore();
        }

        // Health Bar above enemy
        if (this.health < this.maxHealth && this.state !== 'DEAD') {
            const barW = 44;
            const barH = 5;
            const healthPct = Math.max(0, this.health / this.maxHealth);
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.fillRect(-barW / 2, -100, barW, barH);
            ctx.fillStyle = '#ff2222';
            ctx.fillRect(-barW / 2, -100, barW * healthPct, barH);
        }

        ctx.restore();
    }

    drawRedcoat(ctx) {
        const legCycle = (this.state === 'WALK') ? Math.sin(this.walkCycle) * 8 : 0;

        // White Trousers
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(-12 - legCycle, -38, 9, 38);
        ctx.fillRect(4 + legCycle, -38, 9, 38);

        // Black Boots
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(-14 - legCycle, -10, 12, 10);
        ctx.fillRect(3 + legCycle, -10, 12, 10);

        // British Scarlet Red Tunic
        ctx.fillStyle = '#b71c1c';
        ctx.beginPath();
        ctx.rect(-15, -74, 30, 38);
        ctx.fill();

        // White Crossbelts (Iconic British Colonial uniform)
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(-13, -74);
        ctx.lineTo(13, -38);
        ctx.moveTo(13, -74);
        ctx.lineTo(-13, -38);
        ctx.stroke();

        // Brass belt buckle
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(-4, -40, 8, 5);

        // Head
        ctx.fillStyle = '#e8beac';
        ctx.beginPath();
        ctx.arc(0, -80, 9, 0, Math.PI * 2);
        ctx.fill();

        // Black British Shako Hat with Brass Plaque
        ctx.fillStyle = '#1c1c1c';
        ctx.beginPath();
        ctx.rect(-10, -98, 20, 18);
        ctx.fill();
        // Hat peak
        ctx.fillRect(-12, -82, 24, 4);
        // Brass Shako plate
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(-3, -94, 6, 8);
        // White plume tuft
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-8, -96, 4, 0, Math.PI * 2);
        ctx.fill();

        // Musket & Bayonet
        ctx.save();
        if (this.state === 'ATTACK') {
            ctx.translate(14, -54);
            ctx.rotate(0.1);
        } else {
            ctx.translate(10, -56);
            ctx.rotate(0.35);
        }
        // Wooden stock
        ctx.fillStyle = '#5c3818';
        ctx.fillRect(-4, -3, 36, 6);
        // Steel gun barrel
        ctx.fillStyle = '#4a4a4a';
        ctx.fillRect(30, -2, 28, 4);
        // Triangular bayonet blade
        ctx.fillStyle = '#e0e0e0';
        ctx.beginPath();
        ctx.moveTo(56, -3);
        ctx.lineTo(76, -1);
        ctx.lineTo(56, 1);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    drawRifleman(ctx) {
        const legCycle = (this.state === 'WALK') ? Math.sin(this.walkCycle) * 6 : 0;

        // Dark Rifle-Green Uniform (British 60th / 95th Rifles colonial division)
        ctx.fillStyle = '#1e382b';
        ctx.fillRect(-15, -74, 30, 38);

        // White straps
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-13, -74);
        ctx.lineTo(13, -38);
        ctx.stroke();

        // Trousers
        ctx.fillStyle = '#182b21';
        ctx.fillRect(-12 - legCycle, -38, 9, 38);
        ctx.fillRect(4 + legCycle, -38, 9, 38);

        // Head & Dark Green Shako
        ctx.fillStyle = '#e8beac';
        ctx.beginPath();
        ctx.arc(0, -80, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#112217';
        ctx.fillRect(-9, -96, 18, 16);

        // Precision Long Enfield Rifle
        ctx.save();
        ctx.translate(8, -50);
        ctx.rotate(this.isAiming ? 0 : 0.3);
        ctx.fillStyle = '#4a2e16';
        ctx.fillRect(-8, -3, 44, 6);
        ctx.fillStyle = '#333333';
        ctx.fillRect(34, -2, 38, 4);
        ctx.restore();
    }

    drawEnforcer(ctx) {
        // Heavy Armored Colonial Guard
        // Iron Breastplate
        ctx.fillStyle = '#4f5b66';
        ctx.beginPath();
        ctx.ellipse(0, -56, 18, 22, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#c0c5ce';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Red coat skirts beneath armor
        ctx.fillStyle = '#9e1b1b';
        ctx.fillRect(-15, -42, 30, 14);

        // Heavy Iron Greaves (Leg armor)
        ctx.fillStyle = '#343d46';
        ctx.fillRect(-13, -32, 10, 32);
        ctx.fillRect(4, -32, 10, 32);

        // Helmet (Colonial Pith Helmet with iron spike)
        ctx.fillStyle = '#d8d8d8';
        ctx.beginPath();
        ctx.arc(0, -82, 12, Math.PI, 0);
        ctx.fill();
        ctx.fillRect(-14, -82, 28, 5);
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(-2, -98, 4, 10); // Brass spike

        // Heavy Wooden Truncheon / Club in right hand
        ctx.save();
        ctx.translate(-14, -55);
        ctx.rotate(-0.35);
        ctx.fillStyle = '#3d2514';
        ctx.fillRect(-4, -22, 8, 28);
        ctx.restore();

        // Heavy Iron Tower Shield in front
        if (this.hasShield && !this.shieldBroken) {
            ctx.save();
            ctx.translate(18, -52);
            ctx.fillStyle = '#2b303a';
            ctx.fillRect(-4, -36, 14, 68);
            ctx.strokeStyle = '#ffd700';
            ctx.lineWidth = 3;
            ctx.strokeRect(-4, -36, 14, 68);

            // British Lion Crest on Shield
            ctx.fillStyle = '#ffd700';
            ctx.beginPath();
            ctx.arc(3, -2, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }
}

// Grain Sack / Collectible Item dropped upon enemy defeat
class GrainSack {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.groundY = y;
        this.vy = -180;
        this.isGrounded = false;
        this.collected = false;
        this.bounce = 0;
    }

    update(dt) {
        if (!this.isGrounded) {
            this.y += this.vy * dt;
            this.vy += 800 * dt;
            if (this.y >= this.groundY) {
                this.y = this.groundY;
                this.vy = 0;
                this.isGrounded = true;
            }
        }
        this.bounce += dt * 5;
    }

    render(ctx) {
        if (this.collected) return;
        ctx.save();
        ctx.translate(this.x, this.y - Math.abs(Math.sin(this.bounce)) * 6);

        // Burlap Gunny Sack
        ctx.fillStyle = '#c2a649';
        ctx.beginPath();
        ctx.ellipse(0, -12, 14, 16, 0, 0, Math.PI * 2);
        ctx.fill();

        // Rope tie around neck
        ctx.fillStyle = '#8c5825';
        ctx.fillRect(-8, -24, 16, 4);

        // Grain symbol
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('GRAIN', 0, -10);

        // Golden sparkle
        ctx.strokeStyle = '#fff176';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.restore();
    }
}

// Health Drop / Sanjeevani Ayurvedic Healing Herb Vessel dropped upon enemy defeat
class HealthDrop {
    constructor(x, y, healAmount = 30) {
        this.x = x;
        this.y = y;
        this.groundY = y;
        this.vy = -210;
        this.isGrounded = false;
        this.collected = false;
        this.bounce = Math.random() * Math.PI; // offset phase
        this.healAmount = healAmount;
    }

    update(dt) {
        if (!this.isGrounded) {
            this.y += this.vy * dt;
            this.vy += 850 * dt;
            if (this.y >= this.groundY) {
                this.y = this.groundY;
                this.vy = 0;
                this.isGrounded = true;
            }
        }
        this.bounce += dt * 5.2;
    }

    render(ctx) {
        if (this.collected) return;
        ctx.save();
        const bob = Math.abs(Math.sin(this.bounce)) * 7;
        ctx.translate(this.x, this.y - bob);

        // Ground shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
        ctx.beginPath();
        ctx.ellipse(0, bob, 15, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Pulsing Emerald Healing Aura
        const pulse = 0.55 + Math.sin(this.bounce * 2.5) * 0.25;
        ctx.fillStyle = `rgba(0, 230, 118, ${0.22 * pulse})`;
        ctx.beginPath();
        ctx.arc(0, -16, 22, 0, Math.PI * 2);
        ctx.fill();

        // Ayurvedic Glass / Brass Healing Flask Vessel
        ctx.fillStyle = '#0e3818';
        ctx.beginPath();
        ctx.ellipse(0, -14, 13, 14, 0, 0, Math.PI * 2);
        ctx.fill();

        // Glowing Emerald Life Nectar / Elixir
        const nectarGrad = ctx.createRadialGradient(0, -14, 2, 0, -14, 11);
        nectarGrad.addColorStop(0, '#69f0ae');
        nectarGrad.addColorStop(1, '#00c853');
        ctx.fillStyle = nectarGrad;
        ctx.beginPath();
        ctx.ellipse(0, -13, 10, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // Flask Neck & Wooden Stopper
        ctx.fillStyle = '#8d6e63';
        ctx.fillRect(-5, -28, 10, 6);

        // Sanjeevani Cross / Medicine Emblem
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-6, -15, 12, 3.5);
        ctx.fillRect(-1.75, -19, 3.5, 11.5);

        // Golden rim
        ctx.strokeStyle = '#a7ffeb';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Label above (+30 HP)
        ctx.fillStyle = '#00e676';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 4;
        ctx.fillText(`+${this.healAmount} HP`, 0, -32);

        ctx.restore();
    }
}

window.Enemy = Enemy;
window.Bullet = Bullet;
window.GrainSack = GrainSack;
window.HealthDrop = HealthDrop;
