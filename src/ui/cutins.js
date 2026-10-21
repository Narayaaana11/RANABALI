/**
 * Ranabaali: The Colonial Resistance
 * Cinematic Cut-In System (Special Moves, Character Entrances & Battle Dialogue)
 */

class CutInManager {
    constructor() {
        this.activeCutIn = null; // { type, timer, maxDuration, image, title, subtitle, quote, quoteTe }
    }

    triggerRanavatharam() {
        this.activeCutIn = {
            type: 'RANAVATHARAM',
            timer: 1.4,
            maxDuration: 1.4,
            imageKey: 'ranabaali',
            title: 'RANABAALI UGRAM!',
            subtitle: 'రానబాలి ఉగ్రరూపం — THE SAVAGE\'S OATH',
            quote: '"Maa matti... Maa panta... Maa praanam!"'
        };
    }

    triggerJayammaSupport(modeName) {
        this.activeCutIn = {
            type: 'JAYAMMA',
            timer: 1.2,
            maxDuration: 1.2,
            imageKey: 'jayamma',
            title: `JAYAMMA: ${modeName}`,
            subtitle: 'జయమ్మ తోడు — THE REBEL SHIELD',
            quote: '"Nee thodu nenu unna Ranabaali!"'
        };
    }

    triggerHectorBoss(phaseNum, quote) {
        this.activeCutIn = {
            type: 'HECTOR',
            timer: 1.3,
            maxDuration: 1.3,
            imageKey: 'hector',
            title: `SIR THEODORE HECTOR (PHASE ${phaseNum})`,
            subtitle: 'BRITISH COMMISSIONER — MADRAS PRESIDENCY',
            quote: quote || '"You savages will bow before the Empire!"'
        };
    }

    update(dt) {
        if (this.activeCutIn) {
            this.activeCutIn.timer -= dt;
            if (this.activeCutIn.timer <= 0) {
                this.activeCutIn = null;
            }
        }
    }

    render(ctx, width, height) {
        if (!this.activeCutIn) return;

        const c = this.activeCutIn;
        const progress = 1 - (c.timer / c.maxDuration);
        const img = window.assetManager ? window.assetManager.getImage(c.imageKey) : null;

        ctx.save();

        if (c.type === 'RANAVATHARAM') {
            // Full-screen diagonal slash banner
            let slideX = 0;
            if (progress < 0.2) {
                slideX = (1 - (progress / 0.2)) * width; // Slide in from right
            } else if (progress > 0.8) {
                slideX = -((progress - 0.8) / 0.2) * width; // Slide out to left
            }

            // Darkened fiery letterbox
            ctx.fillStyle = 'rgba(20, 4, 2, 0.88)';
            ctx.fillRect(0, 180, width, 360);

            // Fiery golden accent lines
            ctx.fillStyle = '#ff3300';
            ctx.fillRect(0, 176, width, 4);
            ctx.fillRect(0, 540, width, 4);
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(0, 180, width, 2);
            ctx.fillRect(0, 538, width, 2);

            ctx.translate(slideX, 0);

            // Render Real Ranabaali Portrait
            if (img) {
                ctx.save();
                ctx.beginPath();
                ctx.rect(80, 190, 280, 340);
                ctx.clip();
                ctx.drawImage(img, 80, 180, 280, 360);
                // Fiery vignette around portrait
                ctx.strokeStyle = '#ffd700';
                ctx.lineWidth = 4;
                ctx.strokeRect(80, 190, 280, 340);
                ctx.restore();
            }

            // Hero Typography
            const textX = 400;
            ctx.textAlign = 'left';

            // Telugu subtitle
            ctx.fillStyle = '#ffaa00';
            ctx.font = 'bold 22px Georgia, serif';
            ctx.fillText(c.subtitle, textX, 260);

            // Grand Title
            ctx.font = 'italic 900 64px Impact, sans-serif';
            ctx.lineWidth = 8;
            ctx.strokeStyle = '#000000';
            ctx.strokeText(c.title, textX, 335);
            ctx.fillStyle = '#ff2200';
            ctx.fillText(c.title, textX, 335);

            // Dialogue Quote
            ctx.font = 'italic bold 26px Georgia, serif';
            ctx.fillStyle = '#ffffff';
            ctx.fillText(c.quote, textX, 410);

            ctx.font = 'bold 16px sans-serif';
            ctx.fillStyle = '#ffd700';
            ctx.fillText('⚡ UNBLOCKABLE DAMAGE & FIERY SHOCKWAVES ENGAGED ⚡', textX, 460);

        } else if (c.type === 'JAYAMMA') {
            // Left-Side Slide-in Card
            let slideX = 0;
            if (progress < 0.2) {
                slideX = -((1 - (progress / 0.2)) * 500);
            } else if (progress > 0.8) {
                slideX = -(((progress - 0.8) / 0.2) * 500);
            }

            ctx.translate(slideX, 0);

            // Emerald Green Banner
            ctx.fillStyle = 'rgba(15, 45, 25, 0.92)';
            ctx.strokeStyle = '#d4af37';
            ctx.lineWidth = 3;
            ctx.fillRect(40, 240, 520, 220);
            ctx.strokeRect(40, 240, 520, 220);

            // Real Jayamma Portrait
            if (img) {
                ctx.save();
                ctx.beginPath();
                ctx.arc(130, 350, 75, 0, Math.PI * 2);
                ctx.clip();
                ctx.drawImage(img, 55, 265, 150, 180);
                ctx.restore();
                ctx.strokeStyle = '#ffd700';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(130, 350, 75, 0, Math.PI * 2);
                ctx.stroke();
            }

            // Text
            const textX = 230;
            ctx.textAlign = 'left';
            ctx.fillStyle = '#ffd700';
            ctx.font = 'bold 15px Georgia, serif';
            ctx.fillText(c.subtitle, textX, 290);

            ctx.fillStyle = '#33ff88';
            ctx.font = 'italic 900 32px Impact, sans-serif';
            ctx.fillText(c.title, textX, 335);

            ctx.fillStyle = '#ffffff';
            ctx.font = 'italic 18px Georgia, serif';
            ctx.fillText(c.quote, textX, 385);

        } else if (c.type === 'HECTOR') {
            // Right-Side Slide-in Card
            let slideX = 0;
            if (progress < 0.2) {
                slideX = (1 - (progress / 0.2)) * 500;
            } else if (progress > 0.8) {
                slideX = ((progress - 0.8) / 0.2) * 500;
            }

            ctx.translate(slideX, 0);

            const startX = width - 560;
            // Imperial Scarlet Banner
            ctx.fillStyle = 'rgba(45, 12, 12, 0.92)';
            ctx.strokeStyle = '#d4af37';
            ctx.lineWidth = 3;
            ctx.fillRect(startX, 240, 520, 220);
            ctx.strokeRect(startX, 240, 520, 220);

            // Real Hector Portrait
            if (img) {
                ctx.save();
                ctx.beginPath();
                ctx.arc(startX + 430, 350, 75, 0, Math.PI * 2);
                ctx.clip();
                ctx.drawImage(img, startX + 355, 265, 150, 180);
                ctx.restore();
                ctx.strokeStyle = '#ffd700';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(startX + 430, 350, 75, 0, Math.PI * 2);
                ctx.stroke();
            }

            // Text
            ctx.textAlign = 'left';
            ctx.fillStyle = '#ffd700';
            ctx.font = 'bold 14px Georgia, serif';
            ctx.fillText(c.subtitle, startX + 30, 290);

            ctx.fillStyle = '#ff4d4d';
            ctx.font = 'italic 900 28px Impact, sans-serif';
            ctx.fillText(c.title, startX + 30, 335);

            ctx.fillStyle = '#ffffff';
            ctx.font = 'italic 16px Georgia, serif';
            ctx.fillText(c.quote, startX + 30, 385);
        }

        ctx.restore();
    }
}

window.CutInManager = CutInManager;
