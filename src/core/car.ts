import Driver from "./driver";
import Environment from "./env";
import Sensor from "./sensor";

/**
 * This is Car's definition
 * 
 * It defines what a car can do ,and you can operate the car by this methods :
 * 1. Run() 
 * 2. TurnRight()
 * 3. TurnLeft()
 * 4. GetScanResultBy()
 * 5. Record()
 * 6. Restore()
 * 
 * you can set a driver in the car by SetDriver()
 * 
 */
export default class Car {

    // Unique identifier
    id:number;
    // car driver
    driver!: Driver;
    // The current environment in which the car is located
    environment!: Environment;
    // distance traveled
    mileage:number;

    // +----------------------------+
    //  Current location coordinates
    // +----------------------------+
    locationX!:number;
    locationY!:number;

    // +-----------------------+
    //  Current velocity vector
    // +-----------------------+
    velocityY!:number;
    velocityX!:number;

    // velocity = sqrt(velocityX*velocityX + velocityY*velocityY)
    velocity !:number;

    turnRadian:number;
    sensors:Map<string,Sensor>;
    alive!:boolean;
    private recordCar!: Car;
    private turn!:number;

    constructor(id:number,driver:Driver | null,x:number,y:number,vx:number,vy:number,turnRadian:number) {
        if(driver != null) {
            this.SetDriver(driver);
        }
        this.id = id;
        this.SetLocation(x,y);
        this.SetVelocity(vx,vy);
        this.turnRadian = turnRadian;
        this.sensors = new Map();
        this.mileage = 0;
        this.alive=true;
    }

    /**
     * The car will move at dt(interval time)
     * @param dt interval time
     */
    public Run(dt:number): void{
        switch(this.turn) {
            case 1:this.Turn(-this.turnRadian*dt);break;
            case 2:this.Turn(this.turnRadian*dt);break;
        }
        this.locationX += this.velocityX*dt;
        this.locationY += this.velocityY*dt;
        this.mileage += 1;
        this.turn = 0;
    }

    /**
     * The car will turn right from the current direction
     */
    public TurnRight(): void{
        this.turn = 1;
    }

    /**
     * The car will turn left from the current direction
     */
    public TurnLeft(): void{
        this.turn = 2;
    }

    /**
     * Take the current angle as the base to turn by dRadian
     * @param dRadian Angle of deviation
     */
    private Turn(dRadian:number): void{

        // get new direction
		let direction = this.GetCurrentDirection() + dRadian;
		
        // compute new velocity 
		let vx = this.velocity*Math.cos(direction);
		let vy = this.velocity*Math.sin(direction);
		
		this.SetVelocity(vx,vy);
    }

    /**
     * Get the scan result of the sensor
     * @param name sensor name
     * @returns scan result data array
     */
    public GetScanResultBy(name:string): number[] {
        let sensor = this.sensors.get(name);
        if (sensor != null) {
            let direction = this.GetCurrentDirection();
            return sensor.Scan(this.environment,this.locationX,this.locationY,direction);
        } else {
            throw new Error("sensor not found :" + name);
        }
    }

    /**
     * get current direction
     * @returns current direction
     */
    public GetCurrentDirection(): number{
        // compute sin and cos
        let sin = this.velocityY/this.velocity;
        let cos = this.velocityX/this.velocity;
        
        // compute direction
        let direction = Math.acos(cos);
        
        // identify quadrants
        if(sin < 0) {
            direction = 2*Math.PI - direction;
        }

        return direction;
    }

    /**
     * 
     * @param name sensor name
     * @param sensor sensor object
     */
    public SetSensor(name:string,sensor:Sensor): void{
        this.sensors.set(name,sensor);
    }

    /**
     * Set the car sensor, and use the default name of
     * the sensor object to identify the sensor
     * @param sensor sensor object
     */
    public SetSensorUseDefaultName(sensor:Sensor): void{
        this.sensors.set(sensor.GetName(),sensor);
    }

    /**
     * You can set a driver in the car by this method
     * @param driver The driver of the car
     */
    public SetDriver(driver:Driver): void{
        this.driver = driver;
        if (driver != null && driver.car != this) {
            driver.car = this ;
        }
    }

    public SetEnvironment(env:Environment): void {
        this.environment = env;
    }

    /**
     * record current status
     */
    public Record(): void{
        if (this.recordCar == null) {
            this.recordCar = new Car(this.id,null,0,0,0,0,0);
        }
        Object.assign(this.recordCar,this);
    }

    /**
     * restore status
     */
    public Restore(): void{
        this.SetLocation(this.recordCar.locationX,this.recordCar.locationY);
        this.SetVelocity(this.recordCar.velocityX,this.recordCar.velocityY);
        this.turnRadian = this.recordCar.turnRadian;
        this.mileage = 0;
        this.alive = true;
    }

    public SetLocation(x:number,y:number): void{
        this.locationX = x;
        this.locationY = y;
    }

    public SetVelocity(vx:number,vy:number): void{
        this.velocityX = vx;
        this.velocityY = vy;
        this.velocity = Math.sqrt(Math.pow(this.velocityX,2) + Math.pow(this.velocityY,2));
    }

    public IsAlive(): boolean {
        return this.alive;
    }

}