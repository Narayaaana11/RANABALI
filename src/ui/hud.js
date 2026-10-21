/**
 * Ranabaali: The Colonial Resistance
 * In-Game Cinematic HUD & Combat Feedback Display
 */

class HUD {
    constructor() {
        this.comboCount = 0;
        this.comboTimer = 0;
        this.comboScale = 1.0;
        this.maxCombo = 0;

        // Subtitle notification
        this.subtitleText = '';
        this.subtitleTimer = 0;
    }

    addCombo(count = 1) {
        this.comboCount += count;
        this.comboTimer = 2.4; // 2.4s combo window
        this.comboScale = 1.6;
        if (this.comboCount > this.maxCombo) {
            this.maxCombo = this.comboCount;
        }
    }

    resetCombo() {
        this.comboCount = 0;
        this.comboTimer = 0;
    }

    showSubtitle(text, duration = 3.5) {
        this.subtitleText = text;
        this.subtitleTimer = duration;
    }

    update(dt) {
        if (this.comboTimer > 0) {
            this.comboTimer -= dt;
            if (this.comboTimer <= 0) {
                this.comboCount = 0;
            }
        }
        this.comboScale += (1.0 - this.comboScale) * 0.15;

        if (this.subtitleTimer > 0) {
            this.subtitleTimer -= dt;
        }
    }

    render(ctx, player, companion, levelManager, boss) {
        ctx.save();

        // 1. TOP-LEFT: RANABAALI HEALTH & FURY BARS
        this.renderPlayerStatus(ctx, player);

        // 2. JAYAMMA SUPPORT ICON & COOLDOWN
        this.renderJayammaStatus(ctx, companion);

        // 3. TOP-RIGHT: LEVEL OBJECTIVE & GRAIN COUNTER
        this.renderObjectives(ctx, levelManager);

        // 4. RIGHT-CENTER: COMBO COUNTER & MASS TITLES
        if (this.comboCount >= 2) {
            this.renderComboCounter(ctx);
        }

        // 5. TOP-CENTER: BOSS HEALTH BAR (ACT 3)
        if (levelManager.currentAct === 3 && levelManager.currentWave === 2 && boss && boss.state !== 'DEAD') {
            this.renderBossBar(ctx, boss);
        }

        // 6. BOTTOM-CENTER: SUBTITLES / BATTLE SHOUTS
        if (this.subtitleTimer > 0) {
            this.renderSubtitles(ctx);
        }

        ctx.restore();
    }

    renderPlayerStatus(ctx, player) {
        const startX = 30;
        const startY = 30;
        const ranaImg = window.assetManager ? window.assetManager.getImage('ranabaali') : null;

        // Ranabaali Portrait Frame
        ctx.save();
        ctx.fillStyle = '#1c1512';
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(startX + 28, startY + 28, 28, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Render Real Ranabaali Face
        if (ranaImg) {
            ctx.beginPath();
            ctx.arc(startX + 28, startY + 28, 25, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(ranaImg, startX - 4, startY - 10, 64, 76);
        } else {
            ctx.fillStyle = '#b5221b';
            ctx.beginPath();
            ctx.arc(startX + 28, startY + 28, 25, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 14px Impact, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('RANA', startX + 28, startY + 34);
        }
        ctx.restore();

        // --- HEALTH BAR ---
        const barX = startX + 68;
        const barY = startY + 8;
        const barW = 240;
        const barH = 18;
        const healthPct = Math.max(0, player.health / player.maxHealth);

        // Frame
        ctx.fillStyle = 'rgba(15, 10, 8, 0.85)';
        ctx.strokeStyle = '#8b5a2b';
        ctx.lineWidth = 2.5;
        ctx.fillRect(barX, barY, barW, barH);
        ctx.strokeRect(barX, barY, barW, barH);

        // Crimson Liquid Fill
        const hpGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
        hpGrad.addColorStop(0, '#c41e1e');
        hpGrad.addColorStop(1, '#ff4d4d');
        ctx.fillStyle = hpGrad;
        ctx.fillRect(barX + 2, barY + 2, (barW - 4) * healthPct, barH - 4);

        // Health Text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`HP: ${Math.ceil(player.health)} / ${player.maxHealth}`, barX + (barW / 2), barY + 13);

        // --- FURY / UGRA GAUGE ---
        const furyY = barY + 24;
        const furyH = 12;
        const furyPct = Math.max(0, player.fury / player.maxFury);

        ctx.fillStyle = 'rgba(15, 10, 8, 0.85)';
        ctx.strokeStyle = player.isFuryMode ? '#ff3300' : '#d4af37';
        ctx.lineWidth = 2;
        ctx.fillRect(barX, furyY, barW, furyH);
        ctx.strokeRect(barX, furyY, barW, furyH);

        // Flaming Orange Fill
        if (furyPct > 0) {
            const furyGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
            furyGrad.addColorStop(0, '#ff3300');
            furyGrad.addColorStop(0.5, '#ff8800');
            furyGrad.addColorStop(1, '#ffea00');
            ctx.fillStyle = furyGrad;
            ctx.fillRect(barX + 2, furyY + 2, (barW - 4) * furyPct, furyH - 4);
        }

        // Ready Indicator text
        const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.innerWidth <= 1024);
        if (player.fury >= player.maxFury && !player.isFuryMode) {
            ctx.fillStyle = Math.sin(performance.now() * 0.01) > 0 ? '#ffea00' : '#ffffff';
            ctx.font = 'bold 11px Impact, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(isTouch ? 'TAP [FURY] : UGRA RUPAM READY!' : 'PRESS [F] / [I] : UGRA RUPAM READY!', barX, furyY + 24);
        } else if (player.isFuryMode) {
            ctx.fillStyle = '#ff3300';
            ctx.font = 'bold 11px Impact, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(`RANAVATHARAM ACTIVE (${Math.ceil(player.furyTimer)}s)`, barX, furyY + 24);
        }
    }

    renderJayammaStatus(ctx, companion) {
        const iconX = 350;
        const iconY = 48;
        const radius = 26;
        const jayaImg = window.assetManager ? window.assetManager.getImage('jayamma') : null;

        ctx.save();
        // Circular background
        ctx.fillStyle = '#1e4d2b';
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(iconX, iconY, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Real Jayamma Face
        if (jayaImg) {
            ctx.beginPath();
            ctx.arc(iconX, iconY, radius - 2, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(jayaImg, iconX - 28, iconY - 32, 56, 68);
        } else {
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 10px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('JAYAMMA', iconX, iconY + 4);
        }
        ctx.restore();

        // Cooldown sweep overlay
        if (companion.currentCooldown > 0) {
            ctx.save();
            const cdFraction = companion.currentCooldown / companion.cooldown;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.beginPath();
            ctx.moveTo(iconX, iconY);
            ctx.arc(iconX, iconY, radius, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * cdFraction), false);
            ctx.closePath();
            ctx.fill();

            // CD text
            ctx.fillStyle = '#ffff00';
            ctx.font = 'bold 14px Impact, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`${Math.ceil(companion.currentCooldown)}s`, iconX, iconY + 5);
            ctx.restore();
        }

        const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.innerWidth <= 1024);

        // Active Ability Name & Key Hint
        ctx.fillStyle = '#33ff88';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(companion.modeNames[companion.currentMode], iconX, iconY + 38);
        ctx.fillStyle = '#ffcc00';
        ctx.font = 'bold 9px sans-serif';
        ctx.fillText(isTouch ? 'CYCLE TACTIC' : '[R] CYCLE TACTIC', iconX, iconY + 50);

        ctx.fillStyle = '#d4af37';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText(isTouch ? 'TAP TO SUMMON' : '[E] SUMMON', iconX, iconY - 32);
    }

    renderObjectives(ctx, levelManager) {
        // Positioned cleanly below the topBar buttons (y = 66) to avoid any UI overlap
        const panelW = 285;
        const panelH = 74;
        const panelX = 1280 - panelW - 16;
        const panelY = 66;

        ctx.save();
        // Translucent background with warm gold rim
        ctx.fillStyle = 'rgba(18, 9, 7, 0.82)';
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.45)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        if (ctx.roundRect) {
            ctx.roundRect(panelX, panelY, panelW, panelH, 6);
        } else {
            ctx.rect(panelX, panelY, panelW, panelH);
        }
        ctx.fill();
        ctx.stroke();

        const rightX = panelX + panelW - 12;
        ctx.textAlign = 'right';
        ctx.fillStyle = '#d4af37';
        ctx.font = 'bold 14px Georgia, serif';
        const actNames = ['', 'ACT I: SINGANAMALA DEFENSE', 'ACT II: GRAIN TRAIN HEIST', 'ACT III: FORT ST. GEORGE', 'ENDLESS RESISTANCE'];
        ctx.fillText(actNames[levelManager.currentAct] || 'RESISTANCE', rightX, panelY + 20);

        ctx.fillStyle = '#e0e0e0';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(`WAVE ${levelManager.currentWave} / ${levelManager.totalWaves}`, rightX, panelY + 40);

        ctx.fillStyle = '#ffea00';
        ctx.font = 'bold 13px Impact, sans-serif';
        ctx.fillText(`🌾 GRAIN LIBERATED: ${levelManager.grainCollected} SACKS`, rightX, panelY + 62);
        ctx.restore();
    }

    renderComboCounter(ctx) {
        const cx = 1180;
        const cy = 220;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(this.comboScale, this.comboScale);

        let tierName = 'MASS STRIKE';
        let tierColor = '#ffea00';
        if (this.comboCount >= 25) {
            tierName = 'UGRA RUPAM (FURY INCARNATE)!';
            tierColor = '#ff1100';
        } else if (this.comboCount >= 15) {
            tierName = 'OORA MASS!!';
            tierColor = '#ff6600';
        } else if (this.comboCount >= 8) {
            tierName = 'RAYALASEEMA REBEL!';
            tierColor = '#ffaa00';
        }

        ctx.font = 'italic 900 48px Impact, sans-serif';
        ctx.textAlign = 'center';
        ctx.lineWidth = 6;
        ctx.strokeStyle = '#000000';
        ctx.strokeText(`${this.comboCount} HITS!`, 0, 0);
        ctx.fillStyle = tierColor;
        ctx.fillText(`${this.comboCount} HITS!`, 0, 0);

        ctx.font = 'bold 16px sans-serif';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 4;
        ctx.strokeText(tierName, 0, 24);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(tierName, 0, 24);

        ctx.restore();
    }

    renderBossBar(ctx, boss) {
        const bx = 440;
        const by = 28;
        const bw = 400;
        const bh = 18;
        const hpPct = Math.max(0, boss.health / boss.maxHealth);
        const hectorImg = window.assetManager ? window.assetManager.getImage('hector') : null;

        // Boss Portrait on the left of bar
        ctx.save();
        ctx.fillStyle = '#1c1512';
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(bx - 26, by + 10, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        if (hectorImg) {
            ctx.beginPath();
            ctx.arc(bx - 26, by + 10, 20, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(hectorImg, bx - 46, by - 12, 42, 50);
        }
        ctx.restore();

        // Title
        ctx.font = 'bold 15px Georgia, serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffd700';
        ctx.fillText('COMMISSIONER SIR THEODORE HECTOR', bx + (bw / 2), by - 8);

        // Frame
        ctx.fillStyle = 'rgba(10, 10, 10, 0.85)';
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 2.5;
        ctx.fillRect(bx, by, bw, bh);
        ctx.strokeRect(bx, by, bw, bh);

        // Liquid Gold / Crimson Boss Bar
        const grad = ctx.createLinearGradient(bx, 0, bx + bw, 0);
        grad.addColorStop(0, '#8b0000');
        grad.addColorStop(0.5, '#dc143c');
        grad.addColorStop(1, '#ffd700');
        ctx.fillStyle = grad;
        ctx.fillRect(bx + 2, by + 2, (bw - 4) * hpPct, bh - 4);

        // HP Text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(`${Math.ceil(boss.health)} / ${boss.maxHealth} (PHASE ${boss.phase})`, bx + (bw / 2), by + 13);
    }

    renderSubtitles(ctx) {
        // Positioned at y = 595 so it never overlaps the desktop keyboard bar (which is at the bottom y >= 670)
        const sx = 640;
        const sy = 595;

        ctx.save();
        ctx.font = 'italic bold 20px Georgia, serif';
        const textWidth = ctx.measureText(this.subtitleText).width;

        // Elegant dark backing pill
        ctx.fillStyle = 'rgba(12, 6, 5, 0.82)';
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.45)';
        ctx.lineWidth = 1;
        const padX = 22;
        const padY = 7;
        const bx = sx - (textWidth / 2) - padX;
        const by = sy - 20 - padY;
        const bw = textWidth + padX * 2;
        const bh = 28 + padY * 2;

        ctx.beginPath();
        if (ctx.roundRect) {
            ctx.roundRect(bx, by, bw, bh, 8);
        } else {
            ctx.rect(bx, by, bw, bh);
        }
        ctx.fill();
        ctx.stroke();

        ctx.textAlign = 'center';
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#000000';
        ctx.strokeText(this.subtitleText, sx, sy);
        ctx.fillStyle = '#ffea00';
        ctx.fillText(this.subtitleText, sx, sy);
        ctx.restore();
    }
}

window.HUD = HUD;
