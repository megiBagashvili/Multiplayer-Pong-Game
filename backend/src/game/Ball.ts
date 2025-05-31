export class Ball {
  public x: number;
  public y: number;
  public radius: number;
  public velocityX: number;
  public velocityY: number;

  constructor(x: number, y: number, radius: number, velocityX: number, velocityY: number) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.velocityX = velocityX;
    this.velocityY = velocityY;
  }
  public updatePosition(): void {
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
  public reset(newX: number, newY: number, newVelocityX: number, newVelocityY: number): void {
    this.x = newX;
    this.y = newY;
    this.velocityX = newVelocityX;
    this.velocityY = newVelocityY;
  }
}