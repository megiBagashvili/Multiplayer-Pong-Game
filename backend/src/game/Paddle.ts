// backend/src/game/Paddle.ts

export class Paddle {
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public dy: number; // Velocity or speed of the paddle in the y-direction

  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.dy = 0; // Initially paddle is stationary, or you can set a default speed
  }

  /**
   * Updates the paddle's Y position.
   * Ensures the paddle stays within the game boundaries (top and bottom walls).
   * @param newY The target new Y position.
   * @param gameAreaHeight The height of the game area.
   */
  public updatePosition(gameAreaHeight: number): void {
    // Update y position based on its velocity dy
    this.y += this.dy;

    // Keep the paddle within the game boundaries
    if (this.y < 0) {
      this.y = 0;
    } else if (this.y + this.height > gameAreaHeight) {
      this.y = gameAreaHeight - this.height;
    }
  }

  /**
   * Moves the paddle up by setting its vertical velocity.
   * @param speed The speed at which to move the paddle.
   */
  public moveUp(speed: number): void {
    this.dy = -Math.abs(speed); // Ensure speed is negative for upward movement
  }

  /**
   * Moves the paddle down by setting its vertical velocity.
   * @param speed The speed at which to move the paddle.
   */
  public moveDown(speed: number): void {
    this.dy = Math.abs(speed); // Ensure speed is positive for downward movement
  }

  /**
   * Stops the paddle's movement.
   */
  public stop(): void {
    this.dy = 0;
  }

  // You might add other methods later, e.g., for handling specific player input
}