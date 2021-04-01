import {SensorBase} from "../core/sensor";

export default class Radar extends SensorBase {

    public static SENSOR_NAME:string = "radar";
    public static DETECTABLE_RESOURCE_NAME:string = "land";

    protected GetDetectableResourceName(): string {
        return Radar.DETECTABLE_RESOURCE_NAME;
    }
    
    protected LineScan(lineBlocks: number[]): number {
        for(var i:number = 0 ; i < lineBlocks.length ; i ++) {
            if(lineBlocks[i] > 0) {
                return i/lineBlocks.length;
            }
        }
        return 1.0;
    }

    public GetName(): string {
        return Radar.SENSOR_NAME;
    }

}

export let DEFAULT_RADAR_INSTANCE:Radar = new Radar(2*Math.PI/3.0,120,120);