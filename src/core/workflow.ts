import Car from "./car";

export default interface WorkFlow {

    /**
     * init workflow
     */
    Init(): void;

    /**
     *
     */
    Start(): void;

    /**
     * next step
     */
    NextStep(): void;

    IsEnd(): boolean;

    OrderdCars(): Car[];

    GetBestCar(): Car;

    ExecuteStrategicPlan(options:Map<String,Object>): void;

    ReStart(): void;

}