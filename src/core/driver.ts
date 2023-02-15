import Car from "./car"
import Brain from "./brain"

/**
 * Driver
 */
export default abstract class Driver {
    car!: Car;
    brain:Brain;

    protected constructor(brain:Brain) {
        this.brain = brain;
    }

    /**
     * The driver will turn the steering wheel according to the sensor data
     */
    public Drive(): void{

        if (this.car == null) {
            throw new Error("the car not found!");
        }

        if (this.brain == null) {
            throw new Error("the brain not found!");
        }

        // get dependent sensors
        var sensors = this.DependentSensors();

        // scan environment by this car
        // and input the scanned data into the brain 
        sensors.forEach(sensor => {
            var data = this.car.GetScanResultBy(sensor);
            this.brain.Input(sensor,data);
        });

        // compute
        this.brain.Think();

        // operate
        this.Operate(this.brain.Output(),this.car);

    }

    /**
     * Act on current perceived data
     * @param out current data
     * @param car current car
     */
    protected abstract Operate(out:number[], car:Car): void;

    public abstract DependentSensors(): string[];

}