import Car from "./car";

export default interface WorkFlow {

    /**
     * init workflow
     */
    Init(): void;

    /**
     * workflow start
     */
    Start(): void;

    /**
     * next step
     */
    NextStep(): void;

    /**
     * Judge whether the process is over
     */
    IsEnd(): boolean;

    /**
     * Return to the car list according to the ranking of the car
     * @returns car list
     */
    OrderdCars(): Car[];

    /**
     * Get the best car
     */
    GetBestCar(): Car;

    /**
     *
     * @param options
     */
    ExecuteStrategicPlan(options:Map<String,Object>): void;

    /**
     *
     */
    ReStart(): void;

}