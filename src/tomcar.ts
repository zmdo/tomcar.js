import WorkFlow from "./core/workflow";

export default class TomcarController {

    workflow:WorkFlow;
    runFlag:boolean = true;
    pauseFlag:boolean = false;

    constructor(workflow:WorkFlow){
        this.workflow = workflow;
    }

    public Begin():void {
        this.workflow.Init();
        this.workflow.Start();
        this.runFlag = true;
        this.pauseFlag = false;
        this.TaskRun();
    }

    public Start():void {
        this.pauseFlag = false;
    }

    public Pause():void {
        this.pauseFlag = true;
    }

    public Stop():void {
        this.runFlag = false;
    }

    private async TaskRun() {
        while(this.runFlag) {
            while((!this.workflow.IsEnd()) && this.runFlag) {
                if (!this.pauseFlag) {
                    this.workflow.NextStep();
                    this.workflow.OrderdCars();
                }
                await sleep(10);
            }
            this.workflow.ExecuteStrategicPlan();
            this.workflow.ReStart();
        }
    }
}

const sleep = (timeout:number)=>new Promise((resolve, reject)=>{
    setTimeout(resolve, timeout);
});