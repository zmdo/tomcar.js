import WorkFlow from "./core/workflow";

function TomCarStart(workflow:WorkFlow) {

    workflow.Init();
    workflow.Start();
    while(true) {
        while(!workflow.IsEnd()) {
            workflow.NextStep();
        }
        workflow.OrderdCars();
        alert("best car:" + workflow.GetBestCar());
        workflow.ExecuteStrategicPlan();
        workflow.ReStart();
    }

}