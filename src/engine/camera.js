/**
 * Ranabaali: The Colonial Resistance
 * Cinematic Camera with Smooth Lerp, Boundary Clamping, and Crisp Trauma-Based Shake
 */

class Camera {
    constructor(viewportWidth = 1280, viewportHeight = 720) {
        this.width = viewportWidth;
        this.height = viewportHeight;

        this.x = 0;
        this.y = 0;
        this.targetX = 0;
        this.targetY = 0;

        this.minX = 0;
        this.maxX = 3000;
        this.minY = -100;
        this.maxY = 200;

        // Smooth follow lerp & smooth directional lead
        this.lerpSpeed = 0.09;
        this.leadAhead = 45; // Gentle cinematic lead
        this.currentLead = 0;

        // Trauma-based screen shake (crisp, zero-centered, non-jarring)
        this.trauma = 0; // 0 to 1
        this.maxShakeOffset = 7; // Crisp punchy impact without disorienting wobble
        this.shakeOffsetX = 0;
        this.shakeOffsetY = 0;

        // Zoom & Slow-mo impact punch
        this.zoom = 1.0;
        this.targetZoom = 1.0;
    }

    setLevelBounds(minX, maxX, minY = -100, maxY = 200) {
        this.minX = minX;
        this.maxX = maxX;
        this.minY = minY;
        this.maxY = maxY;
    }

    follow(target, facingRight = true) {
        // Smoothly interpolate directional lead to eliminate turnaround jerk
        const targetLead = facingRight ? this.leadAhead : -this.leadAhead;
        this.currentLead += (targetLead - this.currentLead) * 0.06;

        this.targetX = target.x + this.currentLead - (this.width / 2);
        this.targetY = target.y - (this.height / 2) - 40;

        // Clamp to level bounds
        this.targetX = Math.max(this.minX, Math.min(this.maxX - this.width, this.targetX));
        this.targetY = Math.max(this.minY, Math.min(this.maxY, this.targetY));
    }

    addTrauma(amount) {
        // Balanced trauma addition with strict ceiling to prevent lingering shake
        this.trauma = Math.min(0.65, this.trauma + amount * 0.5);
    }

    punchZoom(level = 1.03) {
        this.zoom = Math.min(1.04, level);
    }

    update(dt) {
        // Smooth camera position lerp
        this.x += (this.targetX - this.x) * this.lerpSpeed;
        this.y += (this.targetY - this.y) * this.lerpSpeed;

        // Smooth zoom return
        this.zoom += (this.targetZoom - this.zoom) * 0.18;

        // Shake calculation: smooth zero-centered harmonic oscillation
        if (this.trauma > 0) {
            const shake = this.trauma * this.trauma;
            const seed = performance.now() * 0.035;

            // Pure zero-centered sine/cosine waves (-1 to +1 range)
            this.shakeOffsetX = Math.sin(seed * 2.3) * this.maxShakeOffset * shake;
            this.shakeOffsetY = Math.cos(seed * 2.9) * (this.maxShakeOffset * 0.6) * shake;

            // Fast, crisp decay so shake feels like a tight physical impact
            this.trauma = Math.max(0, this.trauma - (dt * 3.0));
        } else {
            this.shakeOffsetX = 0;
            this.shakeOffsetY = 0;
        }
    }

    applyTransform(ctx) {
        ctx.save();

        // Apply zoom from screen center if active
        if (this.zoom !== 1.0) {
            ctx.translate(this.width / 2, this.height / 2);
            ctx.scale(this.zoom, this.zoom);
            ctx.translate(-this.width / 2, -this.height / 2);
        }

        // Sub-pixel translation without Math.round snapping jitter
        ctx.translate(-(this.x + this.shakeOffsetX), -(this.y + this.shakeOffsetY));
    }

    restoreTransform(ctx) {
        ctx.restore();
    }
}

window.Camera = Camera;
