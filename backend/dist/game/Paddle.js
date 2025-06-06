"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Paddle = void 0;
class Paddle {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.dy = 0;
    }
    /**
     * Updates the paddle's Y position.
     * Ensures the paddle stays within the game boundaries (top and bottom walls).
     * @param newY The target new Y position.
     * @param gameAreaHeight The height of the game area.
     */
    updatePosition(gameAreaHeight) {
        this.y += this.dy;
        if (this.y < 0) {
            this.y = 0;
        }
        else if (this.y + this.height > gameAreaHeight) {
            this.y = gameAreaHeight - this.height;
        }
    }
    /**
     * Moves the paddle up by setting its vertical velocity.
     * @param speed The speed at which to move the paddle.
     */
    moveUp(speed) {
        this.dy = -Math.abs(speed);
    }
    /**
     * Moves the paddle down by setting its vertical velocity.
     * @param speed The speed at which to move the paddle.
     */
    moveDown(speed) {
        this.dy = Math.abs(speed);
    }
    /**
     * Stops the paddle's movement.
     */
    stop() {
        this.dy = 0;
    }
}
exports.Paddle = Paddle;
