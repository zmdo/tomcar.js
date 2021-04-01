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
        var c2d:CanvasRenderingContext2D|null = this.canvas.getContext("2d");
        if (c2d == null) return ;
        
        var width = this.canvas.width;
        var height = this.canvas.height;

        var data:number[] = new Array(width*height);
        var canvasData:ImageData =  c2d.getImageData(0,0,width,height);
        var pos:number;
        for (var i:number = 0; i < width ; i ++) {
            for (var j:number = 0 ; j < height; j ++) {
                pos = j*width + i;
                if(canvasData.data[pos] < 255){
                    data[pos] = 1;
                } else {
                    data[pos] = 0;
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
        // this.cars.forEach(car => {
        //     if(this.environment.GetResource(GAWorkFlow.LAND,car.locationX,car.locationY) > 0) {
        //         car.alive = false;
        //     }
        // });

        // draw
        this.Draw();

    }

    private Draw(): void {

        var c2d:CanvasRenderingContext2D|null = this.canvas.getContext("2d");
        if (c2d == null) return ;

        var width:number = this.environment.width;
        var height:number = this.environment.height;

        // clear all 
        c2d.clearRect(0,0,width,height);

        // draw background
        // var lands:number[] = this.environment.GetAllResources(GAWorkFlow.LAND);
        // for(var i:number = 0; i < width ; i++ ) {
        //     for(var j:number = 0; j < height ; j++ ) {
        //         if(lands[j*width + i ] > 0) {
        //             c2d.fillRect(i,j,1,1);
        //         }
        //     }
        // }

        // draw cars
        this.cars.forEach(car => {
            car.Draw(this.canvas);
        });

    }

    public IsEnd(): boolean {
        var flag:boolean = true
        this.cars.forEach(car => {
            if (car.IsAlive()) {
                flag = false;
                return ;
            }
        });
        return flag;
    }

    public OrderdCars(): Car[] {
        for (var i:number = 0 ; i < this.cars.length ; i ++ ) {
            for (var j:number = i; j < this.cars.length ; j ++ ) {
                if(this.cars[j].mileage < this.cars[i].mileage) {
                    var car:Fertari = this.cars[i];
                    this.cars[i] = this.cars[j];
                    this.cars[j] = car;
                } 
            }
        }
        return this.cars;
    }

    public GetBestCar(): Car {
        var bestCar:Car = this.cars[0];
        this.cars.forEach(car => {
            if ( car.mileage > bestCar.mileage ) {
                bestCar = car;
            }
        });
        return bestCar;
    }

    public ExecuteStrategicPlan(): void {

        var halfNum:number = this.cars.length/2;
        for(var i:number = 0; i < halfNum ; i ++ ) {
            var driverA:Driver = this.cars[i].driver;
            var driverB:Driver = this.cars[i + halfNum].driver;
            if (driverA instanceof Tom && 
                driverB instanceof Tom) {
                var brainA:TomBrain = (<Tom> driverA).brain;
                var brianB:TomBrain = (<Tom> driverB).brain;
                var newBrain = brainA.Chiasma(brianB);
                driverB.brain = newBrain;
            }
        }

        for (var i:number = 0; i < this.cars.length ; i ++ ) {
            var driver:Driver = this.cars[i].driver;
            if (driver instanceof Tom) {
                var brain:TomBrain = (<Tom> driver).brain;
                if (Math.random() > 0.5) {
                    brain.Mutate();
                }
            }
        }

    }

    public ReStart(): void {
        this.Start();
    }
    
}