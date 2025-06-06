"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ball = void 0;
class Ball {
    constructor(x, y, radius, velocityX, velocityY) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.velocityX = velocityX;
        this.velocityY = velocityY;
    }
    updatePosition() {
        this.x += this.velocityX;
        this.y += this.velocityY;
    }
    /**
     * Resets the ball's position and velocity.
     * Typically used after a score or to start a new round.
     * @param newX The new x-coordinate.
     * @param newY The new y-coordinate.
     * @param newVelocityX The new horizontal velocity.
     * @param newVelocityY The new vertical velocity.
     */
    reset(newX, newY, newVelocityX, newVelocityY) {
        this.x = newX;
        this.y = newY;
        this.velocityX = newVelocityX;
        this.velocityY = newVelocityY;
    }
}
exports.Ball = Ball;
