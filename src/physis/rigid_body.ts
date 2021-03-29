export default interface RigidBody {
    
    GetX(): number;
    
    GetY(): number;

    GetRadius(): number;

    hasCollided(body: RigidBody): boolean;

}