import WorkFlow from "./core/workflow";
import TomBrain from "./tom/brain";
import Fertari from "./tom/fertari";
import { DEFAULT_RADAR_INSTANCE } from "./tom/radar";
import Tom from "./tom/tom";
import GAWorkFlow from "./workflow";

/**
 * Get a new tomcar
 * @param id car id
 * @param locationX start point x coordinate
 * @param locationY start point y coordinate
 * @param velocityX the size of the starting velocity vector in the X direction
 * @param velocityY the size of the starting velocity vector in the y direction
 * @returns New Tomcar
 */
export default function GetTomCar(id:number,locationX:number,locationY:number,velocityX:number,velocityY:number) : {car:Fertari,driver:Tom,brain:TomBrain} {

    // init brain
    let tomBrain:TomBrain = new TomBrain();
    tomBrain.InitBrain(DEFAULT_RADAR_INSTANCE.scanLine,10,3);

    // init driver
    let tomDriver:Tom = new Tom(tomBrain);

    // init car
    let tomCar:Fertari = new Fertari(id,tomDriver,5,locationX,locationY,velocityX,velocityY,Math.PI/6);
    tomCar.SetSensorUseDefaultName(DEFAULT_RADAR_INSTANCE);
    
    return {
        car:tomCar,
        driver:tomDriver,
        brain:tomBrain,
    };
    
}

/**
 * Get a Genetic Algorithm Workflow
 * @param canvas target canvas
 * @param n number of cars
 * @param locationX start point x coordinate
 * @param locationY start point y coordinate
 * @param velocityX the size of the starting velocity vector in the X direction
 * @param velocityY the size of the starting velocity vector in the y direction
 * @returns Genetic Algorithm Workflow
 */
export function GetGAWorkFlow(canvas:HTMLCanvasElement,n:number,locationX:number,locationY:number,velocityX:number,velocityY:number) : WorkFlow{
    let prototypeCar:Fertari = GetTomCar(0,locationX,locationY,velocityX,velocityY).car;
    let cars:Fertari[] = new Array(n);
    for (let i=0 ; i < n; i++) {
        cars[i] = GetTomCar(i,locationX,locationY,velocityX,velocityY).car;
    }
    let workflow:GAWorkFlow = new GAWorkFlow(canvas,prototypeCar,cars);
    return workflow;
}