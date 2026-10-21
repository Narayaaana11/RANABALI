/**
 * Ranabaali: The Colonial Resistance
 * High-Performance Visual FX & Comic Typography Particle Engine
 */

class ParticleSystem {
    constructor() {
        this.particles = [];
        this.floatingTexts = [];
        this.shockwaves = [];
        this.slashRibbons = [];
        this.screenSlashes = [];
    }

    reset() {
        this.particles.length = 0;
        this.floatingTexts.length = 0;
        this.shockwaves.length = 0;
        this.slashRibbons.length = 0;
        this.screenSlashes.length = 0;
    }

    // --- PARTICLE EMITTERS ---

    // Rayalaseema Red Earth Dust (Footsteps, rolls, landings)
    emitDust(x, y, count = 6, direction = 1) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x + (Math.random() * 20 - 10),
                y: y + (Math.random() * 6 - 3),
                vx: (-direction * (Math.random() * 80 + 30)) + (Math.random() * 20 - 10),
                vy: -(Math.random() * 50 + 10),
                radius: Math.random() * 7 + 4,
                color: `rgba(${190 + Math.floor(Math.random() * 40)}, ${75 + Math.floor(Math.random() * 30)}, ${40 + Math.floor(Math.random() * 20)}, `,
                alpha: 0.7,
                life: 0.45 + Math.random() * 0.3,
                maxLife: 0.6,
                drag: 0.92,
                grow: 1.03
            });
        }
    }

    // Steel Clash / Bullet Deflect Sparks
    emitSparks(x, y, count = 16, color = '#ffd700') {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 260 + 80;
            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                length: Math.random() * 8 + 4,
                color,
                alpha: 1.0,
                life: 0.25 + Math.random() * 0.2,
                maxLife: 0.35,
                drag: 0.94,
                isSpark: true
            });
        }
    }

    // Sanjeevani Healing Herb Emerald Shimmer Sparkles
    emitHealingSparks(x, y, count = 16) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 120 + 40;
            this.particles.push({
                x: x + (Math.random() * 30 - 15),
                y: y + (Math.random() * 40 - 20),
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 60,
                radius: Math.random() * 4 + 2,
                color: Math.random() > 0.3 ? 'rgba(0, 230, 118, ' : 'rgba(167, 255, 235, ',
                alpha: 0.95,
                life: 0.5 + Math.random() * 0.3,
                maxLife: 0.7,
                drag: 0.96,
                isGlow: true
            });
        }
    }

    // Blood / Crimson Ember Splatter on Impact
    emitHitSplatter(x, y, direction = 1, count = 14) {
        for (let i = 0; i < count; i++) {
            const angle = (direction > 0 ? 0 : Math.PI) + (Math.random() * 1.6 - 0.8);
            const speed = Math.random() * 220 + 70;
            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - (Math.random() * 90 + 30),
                radius: Math.random() * 4 + 2,
                color: `rgba(${180 + Math.floor(Math.random() * 60)}, ${15 + Math.floor(Math.random() * 20)}, ${20}, `,
                alpha: 0.9,
                life: 0.35 + Math.random() * 0.25,
                maxLife: 0.5,
                gravity: 380,
                drag: 0.96
            });
        }
    }

    // Gunpowder Smoke & Muzzle Flash
    emitMuzzleSmoke(x, y, direction = 1) {
        // Flash
        this.particles.push({
            x: x + direction * 15,
            y,
            vx: 0,
            vy: 0,
            radius: 18,
            color: 'rgba(255, 230, 130, ',
            alpha: 0.9,
            life: 0.08,
            maxLife: 0.08,
            grow: 1.4
        });

        // Smoke puff
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x: x + direction * 20 + (Math.random() * 10 - 5),
                y: y + (Math.random() * 8 - 4),
                vx: direction * (Math.random() * 90 + 40),
                vy: -(Math.random() * 40 + 10),
                radius: Math.random() * 10 + 6,
                color: 'rgba(200, 195, 190, ',
                alpha: 0.65,
                life: 0.5 + Math.random() * 0.4,
                maxLife: 0.8,
                drag: 0.94,
                grow: 1.04
            });
        }
    }

    // Ranavatharam Fiery Ember Aura
    emitFuryEmbers(x, y, count = 4) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x + (Math.random() * 40 - 20),
                y: y + (Math.random() * 60 - 30),
                vx: (Math.random() * 40 - 20),
                vy: -(Math.random() * 90 + 40),
                radius: Math.random() * 5 + 2,
                color: Math.random() > 0.4 ? 'rgba(255, 60, 20, ' : 'rgba(255, 180, 40, ',
                alpha: 0.9,
                life: 0.4 + Math.random() * 0.3,
                maxLife: 0.6,
                drag: 0.98,
                isGlow: true
            });
        }
    }

    // Ground Shockwave Ring on Heavy Cleave / Mortar
    addShockwave(x, y, maxRadius = 90, color = '#ff4411', width = 6) {
        this.shockwaves.push({
            x,
            y,
            radius: 10,
            maxRadius,
            width,
            color,
            alpha: 1.0,
            life: 0.28,
            maxLife: 0.28
        });
    }

    // Comic-Style Floating Action Text ("DHUM!", "PHAT!", "దభ్!", "భళ్ళున!", "DEFLECT!")
    addComicText(x, y, text, color = '#ffdf00', isBig = false) {
        this.floatingTexts.push({
            x,
            y,
            text,
            color,
            isBig,
            alpha: 1.0,
            scale: isBig ? 1.6 : 1.1,
            targetScale: isBig ? 1.1 : 0.9,
            vy: -80,
            life: 0.75,
            maxLife: 0.75
        });
    }

    // Dynamic Machete Slash Arc Ribbon Trail
    emitSlashArc(x, y, radius = 70, startAngle = -0.4, endAngle = 0.5, facing = 1, color = 'rgba(255, 60, 0, 0.9)', width = 14) {
        this.slashRibbons.push({
            x,
            y,
            radius,
            startAngle,
            endAngle,
            facing,
            color,
            width,
            alpha: 1.0,
            life: 0.16,
            maxLife: 0.16
        });
    }

    // Full-Screen Diagonal Slash Cut (Mass Telugu Cinema trademark)
    addScreenSlash(x1, y1, x2, y2, color = '#ffea00', width = 5) {
        this.screenSlashes.push({
            x1, y1, x2, y2,
            color,
            width,
            alpha: 1.0,
            life: 0.18,
            maxLife: 0.18
        });
    }

    // Heavy Blood Mist / Crimson Vapor
    emitBloodMist(x, y, direction = 1, count = 10) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x + (Math.random() * 24 - 12),
                y: y + (Math.random() * 24 - 12),
                vx: direction * (Math.random() * 100 + 40),
                vy: -(Math.random() * 60 + 10),
                radius: Math.random() * 12 + 6,
                color: 'rgba(180, 20, 20, ',
                alpha: 0.75,
                life: 0.45 + Math.random() * 0.35,
                maxLife: 0.7,
                drag: 0.91,
                grow: 1.04
            });
        }
    }

    // Explosive Radial Hit Spark Burst on Heavy/Parry
    addHitSparkBurst(x, y, count = 28) {
        this.emitSparks(x, y, count, '#ffffff');
        this.emitSparks(x, y, count / 2, '#ffea00');
        this.emitSparks(x, y, count / 2, '#ff3300');
        this.addShockwave(x, y, 75, '#ffea00', 4);
    }

    // --- UPDATE & RENDER ---

    update(dt) {
        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life -= dt;
            if (p.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }

            p.x += p.vx * dt;
            p.y += p.vy * dt;

            if (p.drag) {
                p.vx *= Math.pow(p.drag, dt * 60);
                p.vy *= Math.pow(p.drag, dt * 60);
            }
            if (p.gravity) {
                p.vy += p.gravity * dt;
            }
            if (p.grow) {
                p.radius *= Math.pow(p.grow, dt * 60);
            }

            p.alpha = Math.max(0, (p.life / p.maxLife));
        }

        // Update shockwaves
        for (let i = this.shockwaves.length - 1; i >= 0; i--) {
            const sw = this.shockwaves[i];
            sw.life -= dt;
            if (sw.life <= 0) {
                this.shockwaves.splice(i, 1);
                continue;
            }
            const progress = 1 - (sw.life / sw.maxLife);
            sw.radius = 10 + (sw.maxRadius - 10) * Math.sin(progress * Math.PI * 0.5);
            sw.alpha = 1 - progress;
        }

        // Update slash ribbons
        for (let i = this.slashRibbons.length - 1; i >= 0; i--) {
            const sr = this.slashRibbons[i];
            sr.life -= dt;
            if (sr.life <= 0) {
                this.slashRibbons.splice(i, 1);
                continue;
            }
            sr.alpha = Math.max(0, sr.life / sr.maxLife);
        }

        // Update screen slashes
        for (let i = this.screenSlashes.length - 1; i >= 0; i--) {
            const ss = this.screenSlashes[i];
            ss.life -= dt;
            if (ss.life <= 0) {
                this.screenSlashes.splice(i, 1);
                continue;
            }
            ss.alpha = Math.max(0, ss.life / ss.maxLife);
        }

        // Update comic texts
        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            const ft = this.floatingTexts[i];
            ft.life -= dt;
            if (ft.life <= 0) {
                this.floatingTexts.splice(i, 1);
                continue;
            }

            ft.y += ft.vy * dt;
            ft.vy *= 0.92;
            ft.scale += (ft.targetScale - ft.scale) * 0.15;
            ft.alpha = Math.min(1.0, (ft.life / (ft.maxLife * 0.6)));
        }
    }

    render(ctx) {
        // Render shockwaves first (beneath particles)
        for (const sw of this.shockwaves) {
            ctx.save();
            ctx.beginPath();
            ctx.ellipse(sw.x, sw.y, sw.radius, sw.radius * 0.45, 0, 0, Math.PI * 2);
            ctx.strokeStyle = sw.color;
            ctx.lineWidth = sw.width * sw.alpha;
            ctx.globalAlpha = sw.alpha * 0.85;
            ctx.stroke();
            ctx.restore();
        }

        // Render slash ribbons (glowing blade arcs)
        for (const sr of this.slashRibbons) {
            ctx.save();
            ctx.translate(sr.x, sr.y);
            ctx.scale(sr.facing, 1);
            ctx.globalAlpha = sr.alpha * 0.9;

            ctx.beginPath();
            ctx.arc(0, 0, sr.radius, sr.startAngle, sr.endAngle);
            ctx.strokeStyle = sr.color;
            ctx.lineWidth = sr.width * (0.5 + 0.5 * sr.alpha);
            ctx.lineCap = 'round';
            ctx.stroke();

            // Inner white-hot cutting core
            ctx.beginPath();
            ctx.arc(0, 0, sr.radius, sr.startAngle, sr.endAngle);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = Math.max(2, sr.width * 0.3 * sr.alpha);
            ctx.stroke();

            ctx.restore();
        }

        // Render particles
        for (const p of this.particles) {
            ctx.save();
            ctx.globalAlpha = p.alpha;

            if (p.isSpark) {
                // Directional spark line
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p.x - (p.vx * 0.03), p.y - (p.vy * 0.03));
                ctx.strokeStyle = p.color;
                ctx.lineWidth = 2.5;
                ctx.stroke();
            } else {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = p.color + p.alpha + ')';
                ctx.fill();
            }
            ctx.restore();
        }

        // Render screen-wide slashes (cinematic kill cuts)
        for (const ss of this.screenSlashes) {
            ctx.save();
            ctx.globalAlpha = ss.alpha;
            // Outer blazing aura
            ctx.beginPath();
            ctx.moveTo(ss.x1, ss.y1);
            ctx.lineTo(ss.x2, ss.y2);
            ctx.strokeStyle = ss.color;
            ctx.lineWidth = ss.width * (1.2 + 0.8 * ss.alpha);
            ctx.stroke();

            // White razor line
            ctx.beginPath();
            ctx.moveTo(ss.x1, ss.y1);
            ctx.lineTo(ss.x2, ss.y2);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2.5;
            ctx.stroke();
            ctx.restore();
        }

        // Render floating comic texts (English + Telugu supported)
        for (const ft of this.floatingTexts) {
            ctx.save();
            ctx.globalAlpha = ft.alpha;
            ctx.translate(ft.x, ft.y);
            ctx.scale(ft.scale, ft.scale);

            ctx.font = `italic 900 ${ft.isBig ? '32px' : '23px'} 'Outfit', Impact, 'Arial Unicode MS', sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Comic outline
            ctx.lineWidth = 6;
            ctx.strokeStyle = '#000000';
            ctx.strokeText(ft.text, 0, 0);

            // Vibrant fill
            ctx.fillStyle = ft.color;
            ctx.fillText(ft.text, 0, 0);

            ctx.restore();
        }
    }
}

window.particleSystem = new ParticleSystem();
