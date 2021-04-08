import WorkFlow from "./core/workflow";

export async function TomCarStart(workflow:WorkFlow): Promise<void>{

    workflow.Init();
    workflow.Start();

    while(true) {

        while(!workflow.IsEnd()) {
            workflow.NextStep();
            await sleep(10);
        }

        workflow.OrderdCars();
        workflow.ExecuteStrategicPlan();
        workflow.ReStart();

    }
}

const sleep = (timeout:number)=>new Promise((resolve, reject)=>{
    setTimeout(resolve, timeout);
});
