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
        var resources = env.GetAllResources(this.GetDetectableResourceName());

        var width = env.width;
        var height = env.height;

        var result:number[] = new Array(this.scanLine);
		
        // scan environment
		var cos:number,sin:number ;
		var dAngle = this.visualField / this.scanLine ;
		var angle = direction - this.visualField/2 ;
        for ( var index = 0 ; index < this.scanLine ;  index ++) {

			sin = Math.sin(angle);
			cos = Math.cos(angle);
			
			// ger scan line 
			var lineBlocks:number[] = new Array(this.detectionRange); 			
			for (var len:number = 0 ; len < this.detectionRange ; len ++) { 
                
				var i:number = Math.floor(x + len*cos);
				var j:number = Math.floor(y + len*sin);
                var pos:number = Math.floor(j*width + i);

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