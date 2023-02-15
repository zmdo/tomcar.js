export default interface RigidBody {

    /**
     * The x-coordinate of the current position
     * @returns x-coordinate
     */
    GetX(): number;

    /**
     * The y-coordinate of the current position
     * @returns y-coordinate
     */
    GetY(): number;

    /**
     * The collision radius of the current object
     * @returns Collision radius
     */
    GetRadius(): number;

    /**
     * Whether there is collision
     * @param body target body
     * @returns ture - has collided / false - no collision
     */
    hasCollided(body: RigidBody): boolean;

}