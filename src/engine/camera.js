/**
 * Ranabaali: The Colonial Resistance
 * Cinematic Camera with Smooth Lerp, Boundary Clamping, and Trauma-Based Screen Shake
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

        // Smooth follow lerp
        this.lerpSpeed = 0.08;
        this.leadAhead = 140;

        // Trauma-based screen shake
        this.trauma = 0; // 0 to 1
        this.maxShakeOffset = 28;
        this.maxShakeAngle = 0.04; // radians
        this.shakeOffsetX = 0;
        this.shakeOffsetY = 0;
        this.shakeAngle = 0;

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
        const lead = facingRight ? this.leadAhead : -this.leadAhead;
        this.targetX = target.x + lead - (this.width / 2);
        this.targetY = target.y - (this.height / 2) - 40;

        // Clamp to level bounds
        this.targetX = Math.max(this.minX, Math.min(this.maxX - this.width, this.targetX));
        this.targetY = Math.max(this.minY, Math.min(this.maxY, this.targetY));
    }

    addTrauma(amount) {
        this.trauma = Math.min(1.0, this.trauma + amount);
    }

    punchZoom(level = 1.06) {
        this.zoom = level;
    }

    update(dt) {
        // Smooth camera position lerp
        this.x += (this.targetX - this.x) * this.lerpSpeed;
        this.y += (this.targetY - this.y) * this.lerpSpeed;

        // Smooth zoom return
        this.zoom += (this.targetZoom - this.zoom) * 0.1;

        // Shake calculation: shake = trauma^2
        if (this.trauma > 0) {
            const shake = this.trauma * this.trauma;
            const seed = performance.now() * 0.05;

            this.shakeOffsetX = (Math.sin(seed * 1.7) * 2 - 1) * this.maxShakeOffset * shake;
            this.shakeOffsetY = (Math.cos(seed * 2.3) * 2 - 1) * this.maxShakeOffset * shake;
            this.shakeAngle = (Math.sin(seed * 3.1) * 2 - 1) * this.maxShakeAngle * shake;

            // Decay trauma over time
            this.trauma = Math.max(0, this.trauma - (dt * 1.5));
        } else {
            this.shakeOffsetX = 0;
            this.shakeOffsetY = 0;
            this.shakeAngle = 0;
        }
    }

    applyTransform(ctx) {
        ctx.save();

        // Apply zoom from screen center
        if (this.zoom !== 1.0) {
            ctx.translate(this.width / 2, this.height / 2);
            ctx.scale(this.zoom, this.zoom);
            ctx.translate(-this.width / 2, -this.height / 2);
        }

        // Apply shake rotation & offset
        if (this.shakeAngle !== 0) {
            ctx.translate(this.width / 2, this.height / 2);
            ctx.rotate(this.shakeAngle);
            ctx.translate(-this.width / 2, -this.height / 2);
        }

        ctx.translate(-Math.round(this.x + this.shakeOffsetX), -Math.round(this.y + this.shakeOffsetY));
    }

    restoreTransform(ctx) {
        ctx.restore();
    }
}

window.Camera = Camera;
