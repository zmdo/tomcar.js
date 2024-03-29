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

    protected Operate(out: number[], car:Car): void {

        // get best result
        let result = Tom.BestChoice(out);
        
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
        let maxIndex = 0;
        let max = data[0];
        for (let i = 0 ; i < data.length ; i ++ ) {
            if (data[i] > max) {
                max = data[i];
                maxIndex = i;
            }
        }
        return maxIndex;
    }

}

