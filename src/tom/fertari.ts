import Car from "../core/car";
import Driver from "../core/driver";
import Drawable from "../graphics/drawable";
import RigidBody from "../physis/rigid_body";

export default class Fertari extends Car implements Drawable,RigidBody{

    // collision volume
    private radius:number;

    constructor(driver:Driver,radius:number,x:number,y:number,vx:number,vy:number,radian:number) {
        super(driver,x,y,vx,vy,radian);
        this.radius = radian;
    }

    public GetRadius(): number {
        return this.radius
    }

    public GetX(): number {
        return this.locationX;
    }

    public GetY(): number {
        return this.locationY;
    }

    public hasCollided(body: RigidBody): boolean {
        var distance:number = Math.sqrt(Math.pow(this.GetX() - body.GetX(),2) + Math.pow(this.GetY() - body.GetY(),2));
        return (distance < this.GetRadius() + body.GetRadius());
    }

    public Draw(canvas: HTMLCanvasElement): void {
        var c2d:CanvasRenderingContext2D|null = canvas.getContext("2d");
        if (c2d != null) {
            c2d.arc(this.GetX(), this.GetY(), this.GetRadius() , 0, 360, true);
        }
    }

}