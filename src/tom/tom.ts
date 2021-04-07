import Car from "../core/car";
import Driver from "../core/driver";
import TomBrain from "./brain";
import Radar from "./radar";

export default class Tom extends Driver {

    public static DEPENDENT_SENSORS:string[] = [Radar.SENSOR_NAME];

    brain!:TomBrain;

    constructor(brain:TomBrain){
        super(brain);
    }

    protected Opeate(out: number[],car:Car): void {

        // get best result
        var result = Tom.BestChoice(out);
        
        // toggle direction
        switch(result) {
            case 1: 
                car.TurnLeft();
                break;
            case 2: 
                car.TurnRight();
                break;
            case 0:
                // keep direction
            default:
                // keep direction
        }
    }
    
    public DependentSensors(): string[] {
        return Tom.DEPENDENT_SENSORS;
    }

    private static BestChoice(data : number[]): number {
        var maxIndex = 0;
        var max = data[0];
        for (var i = 0 ; i < data.length ; i ++ ) {
            if (data[i] > max) {
                max = data[i];
                maxIndex = i;
            }
        }
        return maxIndex;
    }

}

