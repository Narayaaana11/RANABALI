/**
 * Ranabaali: The Colonial Resistance
 * Menu System: Title Screen, Prologue Comic, Stage Clear, Game Over, and Epilogue
 */

class MenuManager {
    constructor() {
        this.currentScreen = 'TITLE'; // TITLE, PROLOGUE, PAUSE, STAGE_CLEAR, GAME_OVER, VICTORY, CONTROLS
        this.selectedOption = 0;
        this.selectedPauseOption = 0;
        this.animTimer = 0;
        this.prologueStep = 0;

        this.prologuePanels = [
            {
                title: "MADRAS PRESIDENCY — 1876",
                text: "A catastrophic drought strikes the Rayalaseema region. Wells run dry, crops turn to ash, and millions of villagers face the horrors of the Great Famine."
            },
            {
                title: "THE COLONIAL EXPLOITATION",
                text: "Under Commissioner Sir Theodore Hector, the British Empire lays ruthless railway lines to forcibly siphon the remaining grain to colonial trade ships—leaving our people to starve."
            },
            {
                title: "THE RISE OF RANABAALI",
                text: "From the scorched red soil of Singanamala arises one man. Wielding twin machetes and backed by Jayamma and his people, SINGANAMALA BOBBILI RANABAALI takes up arms. The rebellion begins!"
            }
        ];
    }

    setScreen(screen) {
        this.currentScreen = screen;
        this.selectedOption = 0;
        this.selectedPauseOption = 0;
        this.animTimer = 0;
        if (screen === 'PROLOGUE') {
            this.prologueStep = 0;
        }
    }

    update(dt, input, sound) {
        this.animTimer += dt;
    }

    render(ctx, width, height, player, levelManager, hud) {
        ctx.save();

        switch (this.currentScreen) {
            case 'TITLE':
                this.renderTitleScreen(ctx, width, height);
                break;
            case 'PROLOGUE':
                this.renderPrologue(ctx, width, height);
                break;
            case 'CONTROLS':
                this.renderControlsScreen(ctx, width, height);
                break;
            case 'PAUSE':
                this.renderPauseMenu(ctx, width, height);
                break;
            case 'STAGE_CLEAR':
                this.renderStageClear(ctx, width, height, levelManager, hud);
                break;
            case 'GAME_OVER':
                this.renderGameOver(ctx, width, height);
                break;
            case 'VICTORY':
                this.renderVictory(ctx, width, height, hud);
                break;
        }

        ctx.restore();
    }

    renderTitleScreen(ctx, width, height) {
        // Dramatic Dark Crimson & Amber Background
        const grad = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, 600);
        grad.addColorStop(0, '#5a1910');
        grad.addColorStop(0.5, '#2b0906');
        grad.addColorStop(1, '#0c0403');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Render Real Ranabaali Movie Artwork on Right
        const ranaImg = window.assetManager ? window.assetManager.getImage('ranabaali') : null;
        if (ranaImg) {
            ctx.save();
            ctx.globalAlpha = 0.88;
            // Draw image with smooth fade
            ctx.drawImage(ranaImg, width - 580, 20, 520, 680);

            // Dark vignette overlay on left edge of image
            const fadeGrad = ctx.createLinearGradient(width - 580, 0, width - 380, 0);
            fadeGrad.addColorStop(0, '#0c0403');
            fadeGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = fadeGrad;
            ctx.fillRect(width - 580, 0, 240, height);
            ctx.restore();
        }

        // Sun & Dust glow in background
        ctx.fillStyle = 'rgba(255, 68, 0, 0.15)';
        ctx.beginPath();
        ctx.arc(380, height / 2 - 40, 220, 0, Math.PI * 2);
        ctx.fill();

        // Main Title & Menu on Left Side
        ctx.save();
        const menuCenterX = 380;
        ctx.textAlign = 'center';

        const logoImg = window.assetManager ? window.assetManager.getImage('logo') : null;
        let menuButtonsStartY = height / 2 + 55;

        if (logoImg) {
            // Draw Official Ranabaali 3D Movie Logo
            const logoW = 490;
            const logoH = 220;
            const logoY = height / 2 - 240;

            ctx.save();
            ctx.shadowColor = 'rgba(255, 68, 0, 0.85)';
            ctx.shadowBlur = 30;
            ctx.drawImage(logoImg, menuCenterX - logoW / 2, logoY, logoW, logoH);
            ctx.restore();

            // Telugu Subtitle & Mass Cinema Tagline
            ctx.font = 'bold 21px "Outfit", "Arial Unicode MS", Georgia, serif';
            ctx.fillStyle = '#ffdf00';
            ctx.shadowColor = '#c41e1e';
            ctx.shadowBlur = 12;
            ctx.fillText('రణబలి : THE SAVAGE\'S OATH (1876)', menuCenterX, logoY + logoH + 15);
            ctx.shadowBlur = 0;

            // Music credit
            ctx.font = 'italic bold 13px sans-serif';
            ctx.fillStyle = '#d4af37';
            ctx.fillText('⚡ OFFICIAL THEME BY AJAY–ATUL ⚡', menuCenterX, logoY + logoH + 36);

            menuButtonsStartY = logoY + logoH + 68;
        } else {
            // Movie subtitle fallback
            ctx.font = 'bold 15px Georgia, serif';
            ctx.fillStyle = '#d4af37';
            ctx.fillText('A VIJAY DEVERAKONDA MASS ACTION GAME', menuCenterX, height / 2 - 150);

            // Game Logo: RANABAALI
            ctx.font = 'italic 900 76px Impact, sans-serif';
            ctx.lineWidth = 10;
            ctx.strokeStyle = '#000000';
            ctx.strokeText('RANABAALI', menuCenterX, height / 2 - 75);

            const textGrad = ctx.createLinearGradient(0, height / 2 - 120, 0, height / 2 - 45);
            textGrad.addColorStop(0, '#ffffff');
            textGrad.addColorStop(0.35, '#ffea00');
            textGrad.addColorStop(0.75, '#ff4500');
            textGrad.addColorStop(1, '#8b0000');
            ctx.fillStyle = textGrad;
            ctx.fillText('RANABAALI', menuCenterX, height / 2 - 75);

            // Subtitle
            ctx.font = 'bold 20px Georgia, serif';
            ctx.fillStyle = '#e0d0b5';
            ctx.fillText('THE COLONIAL RESISTANCE (1876)', menuCenterX, height / 2 - 30);

            ctx.font = 'italic bold 13px sans-serif';
            ctx.fillStyle = '#d4af37';
            ctx.fillText('⚡ MUSIC BY AJAY–ATUL ⚡', menuCenterX, height / 2 - 5);
            menuButtonsStartY = height / 2 + 45;
        }

        // Menu Buttons
        const options = ['START CAMPAIGN', 'ENDLESS RESISTANCE', 'CONTROLS & LORE', 'LOAD CUSTOM AUDIO / MP3'];
        ctx.font = 'bold 18px Impact, sans-serif';

        for (let i = 0; i < options.length; i++) {
            const btnY = menuButtonsStartY + (i * 48);
            const isHovered = (this.selectedOption === i);

            // Button Box
            ctx.fillStyle = isHovered ? 'rgba(196, 30, 30, 0.95)' : 'rgba(35, 20, 15, 0.88)';
            ctx.strokeStyle = isHovered ? '#ffea00' : '#8b5a2b';
            ctx.lineWidth = isHovered ? 3 : 1.5;
            ctx.fillRect(menuCenterX - 155, btnY - 22, 310, 38);
            ctx.strokeRect(menuCenterX - 155, btnY - 22, 310, 38);

            ctx.fillStyle = isHovered ? '#ffffff' : '#e0e0e0';
            ctx.fillText(options[i], menuCenterX, btnY + 4);
        }

        // Tap to start hint
        ctx.font = 'italic 12px sans-serif';
        ctx.fillStyle = '#a89885';
        ctx.fillText('CLICK AN OPTION OR USE [ARROW KEYS + ENTER] TO BEGIN', menuCenterX, height - 16);

        ctx.restore();
    }

    renderPrologue(ctx, width, height) {
        // Darkened canvas overlay
        ctx.fillStyle = 'rgba(8, 4, 3, 0.95)';
        ctx.fillRect(0, 0, width, height);

        const panel = this.prologuePanels[this.prologueStep];
        ctx.save();

        // Big Ornate Graphic Novel Panel Frame
        const frameX = width / 2 - 460;
        const frameY = height / 2 - 210;
        const frameW = 920;
        const frameH = 420;

        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 3.5;
        ctx.strokeRect(frameX, frameY, frameW, frameH);

        // Determine corresponding character image for each panel
        let panelImg = null;
        if (window.assetManager) {
            if (this.prologueStep === 0) panelImg = window.assetManager.getImage('britishTroops');
            else if (this.prologueStep === 1) panelImg = window.assetManager.getImage('hector');
            else if (this.prologueStep === 2) panelImg = window.assetManager.getImage('ranabaali');
        }

        // Left Side: Image illustration
        const imgX = frameX + 25;
        const imgY = frameY + 25;
        const imgW = 290;
        const imgH = 370;

        ctx.fillStyle = '#1c100c';
        ctx.fillRect(imgX, imgY, imgW, imgH);
        ctx.strokeStyle = '#8b5a2b';
        ctx.lineWidth = 2;
        ctx.strokeRect(imgX, imgY, imgW, imgH);

        if (panelImg) {
            ctx.drawImage(panelImg, imgX, imgY, imgW, imgH);
        }

        // Right Side: Narrative Story Text
        const textStartX = frameX + 345;
        ctx.textAlign = 'left';

        // Step Counter
        ctx.fillStyle = '#8b5a2b';
        ctx.font = 'bold 13px sans-serif';
        ctx.fillText(`PROLOGUE PART ${this.prologueStep + 1} OF 3`, textStartX, frameY + 50);

        // Panel Title
        ctx.fillStyle = '#ffea00';
        ctx.font = 'bold 28px Georgia, serif';
        ctx.fillText(panel.title, textStartX, frameY + 95);

        // Panel Narrative
        ctx.fillStyle = '#f0e6d6';
        ctx.font = '19px Georgia, serif';
        const words = panel.text.split(' ');
        let line = '';
        let lineY = frameY + 155;
        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            if (metrics.width > 530 && n > 0) {
                ctx.fillText(line, textStartX, lineY);
                line = words[n] + ' ';
                lineY += 34;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, textStartX, lineY);

        // Continue Button
        const btnY = frameY + 355;
        ctx.fillStyle = '#c41e1e';
        ctx.fillRect(textStartX, btnY - 24, 250, 44);
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2;
        ctx.strokeRect(textStartX, btnY - 24, 250, 44);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Impact, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(this.prologueStep === 2 ? 'ENTER BATTLE [SPACE]' : 'CONTINUE [SPACE]', textStartX + 125, btnY + 5);

        ctx.restore();
    }

    renderControlsScreen(ctx, width, height) {
        ctx.fillStyle = 'rgba(10, 5, 4, 0.96)';
        ctx.fillRect(0, 0, width, height);

        ctx.save();
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 32px Georgia, serif';
        ctx.fillText('COMBAT CONTROLS & REBEL TACTICS', width / 2, 75);

        // Controls Table
        const controls = [
            ['MOVE / SPRINT', '[A] / [D] or [LEFT] / [RIGHT] ARROWS / Mobile Joystick'],
            ['JUMP', '[SPACE] (or [W] / [UP] ARROW)'],
            ['LIGHT ATTACK (COMBO 1-2-3)', '[J] or [SLASH] Touch Button'],
            ['HEAVY CLEAVE / GUARD BREAK', '[K] or [HEAVY] Touch Button'],
            ['DODGE ROLL (I-FRAMES)', '[L] or [SHIFT] / [ROLL] Touch Button'],
            ['BULLET DEFLECT / PARRY', 'TIMED [J] JUST BEFORE BULLET HITS YOU'],
            ['JAYAMMA SUPPORT (HERBS / BLIND)', '[E] or [U] / [JAYAMMA] Touch Button'],
            ['CYCLE JAYAMMA TACTIC', '[R] or CLICK JAYAMMA ICON (HEAL / BLIND / CHARGE)'],
            ['RANAVATHARAM FURY MODE', '[F] or [I] / [Q] / [FURY] Touch Button (at 100% Fury)'],
            ['PAUSE GAME', '[ESCAPE] or [P]']
        ];

        ctx.font = '16px sans-serif';
        const startY = 135;
        for (let i = 0; i < controls.length; i++) {
            const y = startY + (i * 38);
            ctx.textAlign = 'right';
            ctx.fillStyle = '#ffaa00';
            ctx.fillText(controls[i][0] + ' :', width / 2 - 20, y);

            ctx.textAlign = 'left';
            ctx.fillStyle = '#ffffff';
            ctx.fillText(controls[i][1], width / 2 + 20, y);
        }

        // Back button
        ctx.textAlign = 'center';
        ctx.fillStyle = '#c41e1e';
        ctx.fillRect(width / 2 - 100, height - 90, 200, 42);
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2;
        ctx.strokeRect(width / 2 - 100, height - 90, 200, 42);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Impact, sans-serif';
        ctx.fillText('BACK TO MENU', width / 2, height - 64);

        ctx.restore();
    }

    renderPauseMenu(ctx, width, height) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.78)';
        ctx.fillRect(0, 0, width, height);

        ctx.save();
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 44px Impact, sans-serif';
        ctx.fillText('GAME PAUSED', width / 2, height / 2 - 80);

        const options = ['RESUME', 'RESTART STAGE', 'MAIN MENU'];
        ctx.font = 'bold 20px Impact, sans-serif';

        for (let i = 0; i < options.length; i++) {
            const btnY = height / 2 + (i * 55);
            const isSelected = (this.selectedPauseOption === i);

            ctx.fillStyle = isSelected ? '#d32f2f' : '#8b0000';
            ctx.fillRect(width / 2 - 130, btnY - 24, 260, 42);

            ctx.strokeStyle = isSelected ? '#ffea00' : '#d4af37';
            ctx.lineWidth = isSelected ? 3.5 : 2;
            ctx.strokeRect(width / 2 - 130, btnY - 24, 260, 42);

            ctx.fillStyle = isSelected ? '#ffea00' : '#ffffff';
            ctx.fillText(options[i], width / 2, btnY + 4);

            if (isSelected) {
                ctx.fillStyle = '#ffea00';
                ctx.fillText('►', width / 2 - 150, btnY + 4);
                ctx.fillText('◄', width / 2 + 150, btnY + 4);
            }
        }

        ctx.font = '13px sans-serif';
        ctx.fillStyle = '#a89885';
        ctx.fillText('USE [ARROW KEYS + ENTER] OR CLICK TO SELECT', width / 2, height / 2 + 190);

        ctx.restore();
    }

    renderStageClear(ctx, width, height, levelManager, hud) {
        ctx.fillStyle = 'rgba(12, 6, 4, 0.92)';
        ctx.fillRect(0, 0, width, height);

        ctx.save();
        ctx.textAlign = 'center';

        ctx.fillStyle = '#33ff88';
        ctx.font = 'bold 46px Impact, sans-serif';
        ctx.fillText('STAGE CLEARED!', width / 2, height / 2 - 100);

        ctx.fillStyle = '#ffffff';
        ctx.font = '20px Georgia, serif';
        ctx.fillText(`Grain Sacks Liberated: ${levelManager.grainCollected} Sacks`, width / 2, height / 2 - 35);
        ctx.fillText(`Highest Combo Streak: ${hud.maxCombo} Hits`, width / 2, height / 2 + 5);

        // Next Stage Button
        ctx.fillStyle = '#c41e1e';
        ctx.fillRect(width / 2 - 150, height / 2 + 65, 300, 48);
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2;
        ctx.strokeRect(width / 2 - 150, height / 2 + 65, 300, 48);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px Impact, sans-serif';
        ctx.fillText('PROCEED TO NEXT ACT [ENTER]', width / 2, height / 2 + 96);

        ctx.restore();
    }

    renderGameOver(ctx, width, height) {
        ctx.fillStyle = 'rgba(30, 0, 0, 0.9)';
        ctx.fillRect(0, 0, width, height);

        ctx.save();
        ctx.textAlign = 'center';

        ctx.fillStyle = '#ff2200';
        ctx.font = 'bold 54px Impact, sans-serif';
        ctx.fillText('RANABAALI HAS FALLEN', width / 2, height / 2 - 70);

        ctx.fillStyle = '#f0e6d6';
        ctx.font = '18px Georgia, serif';
        ctx.fillText('The colonial forces seized the grain... but the spirit of Rayalaseema will never die.', width / 2, height / 2 - 15);

        // Retry Button
        ctx.fillStyle = '#c41e1e';
        ctx.fillRect(width / 2 - 140, height / 2 + 45, 280, 45);
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2;
        ctx.strokeRect(width / 2 - 140, height / 2 + 45, 280, 45);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px Impact, sans-serif';
        ctx.fillText('RETRY ACT [ENTER]', width / 2, height / 2 + 74);

        ctx.restore();
    }

    renderVictory(ctx, width, height, hud) {
        ctx.fillStyle = 'rgba(10, 6, 4, 0.95)';
        ctx.fillRect(0, 0, width, height);

        ctx.save();
        ctx.textAlign = 'center';

        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 50px Impact, sans-serif';
        ctx.fillText('THE GRAIN IS RECLAIMED!', width / 2, height / 2 - 120);

        ctx.fillStyle = '#ffaa00';
        ctx.font = 'bold 24px Georgia, serif';
        ctx.fillText('SIR THEODORE HECTOR AND THE COLONIAL FORCES ROUTED', width / 2, height / 2 - 70);

        ctx.fillStyle = '#e8dec8';
        ctx.font = '18px Georgia, serif';
        ctx.fillText('Through fierce valour and unyielding sacrifice, Singanamala Bobbili Ranabaali', width / 2, height / 2 - 20);
        ctx.fillText('and Jayamma fed their people, shattering the shackles of colonial oppression.', width / 2, height / 2 + 10);

        ctx.fillStyle = '#33ff88';
        ctx.font = 'bold 18px sans-serif';
        ctx.fillText('🏆 ENDLESS RESISTANCE MODE UNLOCKED!', width / 2, height / 2 + 65);

        // Return to Menu Button
        ctx.fillStyle = '#c41e1e';
        ctx.fillRect(width / 2 - 140, height / 2 + 105, 280, 45);
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2;
        ctx.strokeRect(width / 2 - 140, height / 2 + 105, 280, 45);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px Impact, sans-serif';
        ctx.fillText('RETURN TO MENU [ENTER]', width / 2, height / 2 + 134);

        ctx.restore();
    }
}

window.MenuManager = MenuManager;
