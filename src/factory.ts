import WorkFlow from "./core/workflow";
import TomBrain from "./tom/brain";
import Fertari from "./tom/fertari";
import { DEFAULT_RADAR_INSTANCE } from "./tom/radar";
import Tom from "./tom/tom";
import GAWorkFlow from "./workflow";

export default function GetTomCar(id:number,locationX:number,locationY:number,velocityX:number,velocityY:number):{car:Fertari,driver:Tom,brain:TomBrain} {

    // init brain
    var tomBrain:TomBrain = new TomBrain();
    tomBrain.InitBrain(DEFAULT_RADAR_INSTANCE.scanLine,10,3);

    // init driver
    var tomDriver:Tom = new Tom(tomBrain);

    // init car
    var tomCar:Fertari = new Fertari(id,tomDriver,5,locationX,locationY,velocityX,velocityY,Math.PI/6);
    tomCar.SetSensorUseDefaultName(DEFAULT_RADAR_INSTANCE);
    
    return {
        car:tomCar,
        driver:tomDriver,
        brain:tomBrain,
    };
    
}

export function GetGAWorkFlow(canvas:HTMLCanvasElement,n:number,locationX:number,locationY:number,velocityX:number,velocityY:number): WorkFlow{
    var prototypeCar:Fertari = GetTomCar(0,locationX,locationY,velocityX,velocityY).car;
    var cars:Fertari[] = new Array(n);
    for (var i=0 ; i < n; i++) {
        cars[i] = GetTomCar(i,locationX,locationY,velocityX,velocityY).car;
    }
    var workflow:GAWorkFlow = new GAWorkFlow(canvas,prototypeCar,cars);
    return workflow;
}