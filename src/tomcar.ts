import WorkFlow from "./core/workflow";
import Fertari from "./tom/fertari";
import GAWorkFlow from "./workflow";
import GetTomCar from "./factory"

export function TomCarStart(workflow:WorkFlow): void{

    workflow.Init();
    workflow.Start();

    while(true) {
        while(!workflow.IsEnd()) {
            workflow.NextStep();
        }
        workflow.OrderdCars();
        workflow.ExecuteStrategicPlan();
        workflow.ReStart();
    }

}

export function GetGAWorkFlow(canvas:HTMLCanvasElement,n:number,locationX:number,locationY:number,velocityX:number,velocityY:number): WorkFlow{
    var prototypeCar:Fertari = GetTomCar(locationX,locationY,velocityX,velocityY).car;
    var cars:Fertari[] = new Array(n);
    for (var i=0 ; i < n; i++) {
        cars[i] = GetTomCar(locationX,locationY,velocityX,velocityY).car;
    }
    var workflow:GAWorkFlow = new GAWorkFlow(canvas,prototypeCar,cars);
    return workflow;
}