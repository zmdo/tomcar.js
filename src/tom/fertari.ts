import Car from "../core/car";
import Driver from "../core/driver";
import Drawable from "../graphics/drawable";
import RigidBody from "../physis/rigid_body";
import Radar from "./radar";

export default class Fertari extends Car implements Drawable,RigidBody {

    // collision volume
    private readonly radius:number;

    constructor(id:number,driver:Driver,radius:number,x:number,y:number,vx:number,vy:number,turnRadian:number) {
        super(id,driver,x,y,vx,vy,turnRadian);
        this.radius = radius;
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
        let distance:number = Math.sqrt(Math.pow(this.GetX() - body.GetX(),2) + Math.pow(this.GetY() - body.GetY(),2));
        return (distance < this.GetRadius() + body.GetRadius());
    }

    public Draw(canvas: HTMLCanvasElement): void {
        let c2d:CanvasRenderingContext2D|null = canvas.getContext("2d");
        if (c2d != null) {
            if(this.IsAlive()) {

                // create sensor data
                let radarData:number[] = this.GetScanResultBy(Radar.SENSOR_NAME);

                if (radarData != null) {

                    // get radar
                    let radar:Radar = <Radar> (this.sensors.get(Radar.SENSOR_NAME));
                    let visualField:number = radar.visualField;
                    let scanLine:number = radar.scanLine;
                    
                    // calculate the angle
                    let cos:number,sin:number ;
                    let dAngle = visualField / scanLine ;
                    let angle = this.GetCurrentDirection() - visualField/2 ;
                    
                    c2d.strokeStyle="green";
                    for (let i:number = 0 ; i < radarData.length ; i ++) {

                        // 绘制起点
                        c2d.beginPath();
                        c2d.moveTo(this.locationX,this.locationY);

                        // 绘制终点
                        let visualLen:number = radar.detectionRange*radarData[i];
                        sin = Math.sin(angle);
                        cos = Math.cos(angle);
                        c2d.lineTo(this.locationX +  Math.floor(cos*visualLen),this.locationY + Math.floor(sin*visualLen));
                        angle += dAngle;

                        // 绘制扫描线
                        c2d.stroke();
                    }
                }
                c2d.fillStyle="blue";
            } else {
                c2d.fillStyle="red";
            }

            // 绘制车主体
            c2d.beginPath();
            c2d.arc(this.GetX(), this.GetY(), this.GetRadius(), 0, 2*Math.PI, false);
            c2d.fill();
        }            
    }

}