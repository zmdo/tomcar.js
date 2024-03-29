import Car from "./core/car";
import Driver from "./core/driver";
import Environment from "./core/env";
import WorkFlow from "./core/workflow";
import TomBrain from "./tom/brain";
import Fertari from "./tom/fertari";
import Radar from "./tom/radar";
import Tom from "./tom/tom";

export default class GAWorkFlow implements WorkFlow {

    public static LAND:string = Radar.DETECTABLE_RESOURCE_NAME;
    public static MUTATE_CONTROL:string = "MUTATE";
    public static CHIASMA_CONTROL:string = "CHIASMA";
    
    cars:Fertari[];
    environment!:Environment;
    dt:number = 0.1;
    canvas:HTMLCanvasElement;
    prototypeCar:Fertari;

    constructor(canvas: HTMLCanvasElement,prototypeCar:Fertari,cars:Fertari[]) {
        this.canvas = canvas;
        this.prototypeCar = prototypeCar;
        this.cars = cars;
    }

    public Init(): void {

        // scan canvas
        let c2d:CanvasRenderingContext2D|null = this.canvas.getContext("2d");
        if (c2d == null) return ;
        
        let width = this.canvas.width;
        let height = this.canvas.height;

        let data:number[] = new Array(width*height);
        let canvasData:ImageData =  c2d.getImageData(0,0,width,height);
        let pos:number;

        for (let i:number = 0; i < width ; i ++) {
            for (let j:number = 0 ; j < height; j ++) {
                pos = j*width*4 + i*4;
                if(canvasData.data[pos] > 0){
                    data[j*width + i ] = 1;
                } else {
                    data[j*width + i ] = 0;
                }
            }
        }
        
        // load data
        this.environment = new Environment(width,height);
        this.environment.SetAllResources(GAWorkFlow.LAND,data);

        // init car
        this.cars.forEach(car => {
            car.environment = this.environment;
            if(this.prototypeCar != null) {
                car.SetLocation(this.prototypeCar.locationX,this.prototypeCar.locationY);
                car.SetVelocity(this.prototypeCar.velocityX,this.prototypeCar.velocityY);
            }
            car.Record();
        });

    }

    public Start(): void {
        this.cars.forEach(car => {
            car.Restore();
        });
    }

    public NextStep(): void {

        // dont merge 
        this.cars.forEach(car => {
            if (car.IsAlive()) {
                car.driver.Drive();
            }
        });

        this.cars.forEach(car => {
            if(car.IsAlive()) {
                car.Run(this.dt);
            }
        });

        // rule
        this.cars.forEach(car => {
            let x:number = Math.floor(car.locationX);
            let y:number = Math.floor(car.locationY);
            if(this.environment.GetResource(GAWorkFlow.LAND,x,y) > 0) {
                car.alive = false;
            }
        });

        // draw
        this.Draw();

    }

    private Draw(): void {

        let c2d:CanvasRenderingContext2D|null = this.canvas.getContext("2d");
        if (c2d == null) return ;

        let width:number = this.environment.width;
        let height:number = this.environment.height;

        // clear all 
        c2d.clearRect(0,0,width,height);

        // draw background
        c2d.fillStyle="black";
        let lands:number[] = this.environment.GetAllResources(GAWorkFlow.LAND);
        for(let i:number = 0; i < width ; i++ ) {
            for(let j:number = 0; j < height ; j++ ) {
                if(lands[j*width + i ] > 0) {
                    "fillRect" in c2d ? c2d.fillRect(i, j, 1, 1) : reportError("fillRect error");
                }
            }
        }

        // draw cars
        this.cars.forEach(car => {
            if (c2d == null) return ;
            car.Draw(this.canvas);
        });

    }

    public IsEnd(): boolean {
        let flag:boolean = true
        this.cars.forEach(car => {
            if (car.IsAlive()) {
                flag = false;
                return ;
            }
        });
        return flag;
    }

    public OrderdCars(): Car[] {
        for (let i:number = 0 ; i < this.cars.length ; i ++ ) {
            for (let j:number = i; j < this.cars.length ; j ++ ) {
                if(this.cars[j].mileage > this.cars[i].mileage) {
                    let car:Fertari = this.cars[i];
                    this.cars[i] = this.cars[j];
                    this.cars[j] = car;
                } 
            }
        }
        return this.cars;
    }

    public GetBestCar(): Car {
        let bestCar:Car = this.cars[0];
        this.cars.forEach(car => {
            if ( car.mileage > bestCar.mileage ) {
                bestCar = car;
            }
        });
        return bestCar;
    }

    public ExecuteStrategicPlan(options:Map<String,Object>): void {

        let len:number = this.cars.length;

        let chiasmaFlag = options.get(GAWorkFlow.CHIASMA_CONTROL);
        if (chiasmaFlag != null && (<boolean> chiasmaFlag)) {
            for(let i:number = 0; i < len ; i ++ ) {
                let driverA:Driver = this.cars[0].driver;
                let driverB:Driver = this.cars[i].driver;
                if (driverA instanceof Tom && 
                    driverB instanceof Tom) {
                    let brainA:TomBrain = (<Tom> driverA).brain;
                    let brianB:TomBrain = (<Tom> driverB).brain;
                    let newBrain = brainA.Chiasma(brianB);
                    driverB.brain = newBrain;
                }
            }
        }

        let mutateFlag = options.get(GAWorkFlow.MUTATE_CONTROL);
        if (mutateFlag != null && (<boolean> chiasmaFlag)) {
            for (let i:number = 0; i < this.cars.length ; i ++ ) {
                let driver:Driver = this.cars[i].driver;
                if (driver instanceof Tom) {
                    let brain:TomBrain = (<Tom> driver).brain;
                    if (Math.random() > 0.5) {
                        brain.Mutate();
                    }
                }
            }
        }

    }

    public ReStart(): void {
        this.Start();
    }
    
}