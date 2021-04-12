import Car from "../core/car";
import Driver from "../core/driver";
import Drawable from "../graphics/drawable";
import RigidBody from "../physis/rigid_body";
import Radar from "./radar";

export default class Fertari extends Car implements Drawable,RigidBody{

    // collision volume
    private radius:number;

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
        var distance:number = Math.sqrt(Math.pow(this.GetX() - body.GetX(),2) + Math.pow(this.GetY() - body.GetY(),2));
        return (distance < this.GetRadius() + body.GetRadius());
    }

    public Draw(canvas: HTMLCanvasElement): void {
        var c2d:CanvasRenderingContext2D|null = canvas.getContext("2d");
        if (c2d != null) {

            // 绘制传感器数据
            var radarData:number[] = this.GetScanResultBy(Radar.SENSOR_NAME);

            if (radarData != null) {

                // 获取雷达
                var radar:Radar = <Radar> (this.sensors.get(Radar.SENSOR_NAME));
                var visualField:number = radar.visualField;
                var scanLine:number = radar.scanLine;
                
                // 角度
                var cos:number,sin:number ;
                var dAngle = visualField / scanLine ;
                var angle = this.GetCurrentDirection() - visualField/2 ;
                
                c2d.strokeStyle="green";
                for (var i:number = 0 ; i < radarData.length ; i ++) {
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

            // 绘制车主体
            c2d.strokeStyle="blue";
            c2d.beginPath();
            c2d.arc(this.GetX(), this.GetY(), this.GetRadius(), 0, 2*Math.PI, false);
            c2d.fill();
        }            
    }

}