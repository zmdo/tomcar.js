import Car from "./car";

export default interface WorkFlow {
    
    Init(): void;

    Start(): void;

    NextStep(): void;

    IsEnd(): boolean;

    OrderdCars(): Car[];

    GetBestCar(): Car;

    ExecuteStrategicPlan(): void;

    ReStart(): void;

}