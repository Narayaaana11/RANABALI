/**
 * Ranabaali: The Colonial Resistance
 * Unified Input Manager (Keyboard, Gamepad & Mobile Touch)
 */

class InputManager {
    constructor() {
        this.keys = {};
        this.justPressed = {};
        this.touchActive = false;

        // Virtual joystick state
        this.joystick = {
            active: false,
            touchId: null,
            originX: 0,
            originY: 0,
            currX: 0,
            currY: 0,
            dx: 0,
            dy: 0,
            angle: 0,
            distance: 0,
            maxRadius: 55,
            jumpTriggered: false
        };

        // Virtual buttons
        this.virtualButtons = {
            attack: false,
            heavy: false,
            roll: false,
            support: false,
            cycle: false,
            fury: false,
            jump: false
        };

        this.domJoystick = null;
        this.domBase = null;
        this.domKnob = null;
        this.domHint = null;

        this.initEventListeners();
    }

    initEventListeners() {
        // Keyboard listeners
        window.addEventListener('keydown', (e) => {
            // First user interaction initializes audio
            if (window.soundEngine) window.soundEngine.resume();

            const code = e.code;
            if (!this.keys[code]) {
                this.justPressed[code] = true;
            }
            this.keys[code] = true;

            // Prevent scroll on gameplay keys
            if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(code)) {
                e.preventDefault();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
            this.justPressed[e.code] = false;
        });

        // Touch event listeners for mobile and tablet devices
        window.addEventListener('touchstart', (e) => {
            if (window.soundEngine) window.soundEngine.resume();
            this.touchActive = true;
            this.handleTouches(e.touches);
            if (e.cancelable && e.target && e.target.closest('#gameContainer')) {
                e.preventDefault();
            }
        }, { passive: false });

        window.addEventListener('touchmove', (e) => {
            this.handleTouches(e.touches);
            if (e.cancelable && e.target && e.target.closest('#gameContainer')) {
                e.preventDefault();
            }
        }, { passive: false });

        window.addEventListener('touchend', (e) => {
            this.handleTouches(e.touches);
            if (e.cancelable && e.target && e.target.closest('#gameContainer')) {
                e.preventDefault();
            }
        }, { passive: false });

        window.addEventListener('touchcancel', () => {
            this.resetTouchState();
        });
    }

    getDomElements() {
        if (!this.domJoystick) {
            this.domJoystick = document.getElementById('dynamicJoystick');
            this.domBase = document.getElementById('joystickBase');
            this.domKnob = document.getElementById('joystickKnob');
            this.domHint = document.getElementById('virtualStickHint');
        }
    }

    handleTouches(touches) {
        const vp = window.visualViewport;
        const width = vp ? vp.width : window.innerWidth;
        this.getDomElements();

        // 1. Check if our existing tracked joystick touch is still active
        let activeStickTouch = null;
        if (this.joystick.touchId !== null) {
            for (let i = 0; i < touches.length; i++) {
                if (touches[i].identifier === this.joystick.touchId) {
                    activeStickTouch = touches[i];
                    break;
                }
            }
        }

        // 2. If no active tracked touch, look for a new touch on the left half of the screen
        if (!activeStickTouch) {
            for (let i = 0; i < touches.length; i++) {
                const t = touches[i];
                // Left 50% of screen is dedicated to analog movement
                if (t.clientX < width * 0.50) {
                    activeStickTouch = t;
                    this.joystick.touchId = t.identifier;
                    this.joystick.originX = t.clientX;
                    this.joystick.originY = t.clientY;
                    this.joystick.jumpTriggered = false;
                    break;
                }
            }
        }

        // 3. Process joystick movement
        if (activeStickTouch) {
            this.joystick.active = true;
            this.joystick.currX = activeStickTouch.clientX;
            this.joystick.currY = activeStickTouch.clientY;

            const rawDx = this.joystick.currX - this.joystick.originX;
            const rawDy = this.joystick.currY - this.joystick.originY;
            const dist = Math.hypot(rawDx, rawDy);
            this.joystick.distance = Math.min(dist, this.joystick.maxRadius);
            this.joystick.angle = Math.atan2(rawDy, rawDx);

            const clampedDx = Math.cos(this.joystick.angle) * this.joystick.distance;
            const clampedDy = Math.sin(this.joystick.angle) * this.joystick.distance;

            const factor = this.joystick.distance / this.joystick.maxRadius;
            this.joystick.dx = Math.cos(this.joystick.angle) * factor;
            this.joystick.dy = Math.sin(this.joystick.angle) * factor;

            // Debounced Upward Flick for Jump
            if (this.joystick.dy < -0.65) {
                if (!this.joystick.jumpTriggered) {
                    this.justPressed['JOYSTICK_UP'] = true;
                    this.joystick.jumpTriggered = true;
                }
            } else if (this.joystick.dy > -0.35) {
                this.joystick.jumpTriggered = false;
            }

            // Update Dynamic Visual Elements
            if (this.domJoystick && this.domBase && this.domKnob) {
                this.domJoystick.style.display = 'block';
                this.domJoystick.style.opacity = '1';
                this.domBase.style.transform = `translate3d(${this.joystick.originX - 55}px, ${this.joystick.originY - 55}px, 0)`;
                this.domKnob.style.transform = `translate3d(${this.joystick.originX + clampedDx - 25}px, ${this.joystick.originY + clampedDy - 25}px, 0)`;
            }
            if (this.domHint) {
                this.domHint.style.opacity = '0.12';
            }
        } else {
            this.resetJoystick();
        }
    }

    resetJoystick() {
        this.joystick.active = false;
        this.joystick.touchId = null;
        this.joystick.dx = 0;
        this.joystick.dy = 0;
        this.joystick.jumpTriggered = false;

        if (this.domJoystick) {
            this.domJoystick.style.opacity = '0';
            this.domJoystick.style.display = 'none';
        }
        if (this.domHint) {
            this.domHint.style.opacity = '0.6';
        }
    }

    setVirtualButton(name, isPressed) {
        if (!this.virtualButtons[name] && isPressed) {
            this.justPressed['VB_' + name] = true;
        }
        this.virtualButtons[name] = isPressed;
    }

    resetTouchState() {
        this.resetJoystick();
        for (const key in this.virtualButtons) {
            this.virtualButtons[key] = false;
        }
    }

    // Called at the end of each frame to clear single-frame pulses
    endFrame() {
        for (const code in this.justPressed) {
            this.justPressed[code] = false;
        }
    }

    // --- QUERY HELPERS ---

    isLeft() {
        return this.keys['KeyA'] || this.keys['ArrowLeft'] || this.joystick.dx < -0.25;
    }

    isRight() {
        return this.keys['KeyD'] || this.keys['ArrowRight'] || this.joystick.dx > 0.25;
    }

    isJump() {
        return this.isJustPressed('Space') || this.isJustPressed('KeyW') || this.isJustPressed('ArrowUp') ||
               this.isJustPressed('JOYSTICK_UP') ||
               this.isJustPressed('VB_jump');
    }

    isDown() {
        return this.keys['KeyS'] || this.keys['ArrowDown'] || this.joystick.dy > 0.5;
    }

    // Light Attack (J or Action A)
    isLightAttack() {
        return this.isJustPressed('KeyJ') || this.isJustPressed('VB_attack');
    }

    // Heavy Cleave (K or Action B)
    isHeavyAttack() {
        return this.isJustPressed('KeyK') || this.isJustPressed('VB_heavy');
    }

    // Dodge Roll (L, Shift, or Action C)
    isDodgeRoll() {
        return this.isJustPressed('KeyL') || this.isJustPressed('ShiftLeft') || this.isJustPressed('ShiftRight') || this.isJustPressed('VB_roll');
    }

    // Jayamma Support (E, U, or Action D)
    isJayammaSupport() {
        return this.isJustPressed('KeyE') || this.isJustPressed('KeyU') || this.isJustPressed('VB_support');
    }

    // Cycle Jayamma Support Tactic (R, T, or Action Cycle)
    isCycleCompanionMode() {
        return this.isJustPressed('KeyR') || this.isJustPressed('KeyT') || this.isJustPressed('VB_cycle');
    }

    // Ranavatharam Fury (F, I, Q, or Action E)
    isFuryMode() {
        return this.isJustPressed('KeyF') || this.isJustPressed('KeyI') || this.isJustPressed('KeyQ') || this.isJustPressed('VB_fury');
    }

    // Pause (Escape or P)
    isPause() {
        return this.isJustPressed('Escape') || this.isJustPressed('KeyP');
    }

    isJustPressed(code) {
        return !!this.justPressed[code];
    }
}

window.inputManager = new InputManager();
