export class Paddle {
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public dy: number; 

  constructor(x: number, y: number, width: number, height: number) {
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
  public updatePosition(gameAreaHeight: number): void {
    this.y += this.dy;
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
    this.dy = -Math.abs(speed);
  }

  /**
   * Moves the paddle down by setting its vertical velocity.
   * @param speed The speed at which to move the paddle.
   */
  public moveDown(speed: number): void {
    this.dy = Math.abs(speed);
  }

  /**
   * Stops the paddle's movement.
   */
  public stop(): void {
    this.dy = 0;
  }
}