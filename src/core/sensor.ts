import Environment from "./env";

export default interface Sensor {

    /**
     * get sensor name
     */
    GetName(): string;

    /**
     * using this sensor to scan the current enviroment
     * @param env current environment
     * @param x currert location x
     * @param y current location y
     * @param direction current direction(radian)
     */
    Scan(env:Environment,x:number,y:number,direction:number): number[];

}


export abstract class SensorBase implements Sensor {

    visualField:number ;
    scanLine:number ;
    detectionRange:number ;
    
    constructor(visualField:number,scanLine:number,detectionRange:number) {
        this.visualField = visualField;
        this.scanLine = scanLine;
        this.detectionRange = detectionRange;
    }

    public abstract GetName(): string ;

    public Scan(env: Environment, x: number, y: number, direction: number): number[] {

        // get resources
        let resources = env.GetAllResources(this.GetDetectableResourceName());

        let width = env.width;
        let height = env.height;

        let result:number[] = new Array(this.scanLine);
		
        // scan environment
		let cos:number,sin:number ;
		let dAngle = this.visualField / this.scanLine ;
		let angle = direction - this.visualField/2 ;
        for ( let index = 0 ; index < this.scanLine ;  index ++) {

			sin = Math.sin(angle);
			cos = Math.cos(angle);
			
			// ger scan line 
			let lineBlocks:number[] = new Array(this.detectionRange);
			for (let len = 0 ; len < this.detectionRange ; len ++) {
                
				let i = Math.floor(x + len*cos);
				let j = Math.floor(y + len*sin);
                let pos = Math.floor(j*width + i);

				lineBlocks[len] = resources[pos];
				
			}

            result[index] = this.LineScan(lineBlocks);
			angle += dAngle;
		}
        
		return result;
    }

    protected abstract GetDetectableResourceName(): string;

    protected abstract LineScan(lineBlocks:number[]): number;
    
}