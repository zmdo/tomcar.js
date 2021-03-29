/**
 * environment resource manager class
 */
export default class Environment {
    width:number;
    height:number;
    private resources:Map<string,number[]>;

    constructor(width:number,height:number) {
        this.width = width;
        this.height = height;
        this.resources = new Map();
    }

    /**
     * Get resource data
     * @param name resource name
     * @param x location x
     * @param y location y
     * @returns 
     */
    public GetResource(name:string,x:number,y:number): number {
        var resource = this.GetAllResourcesByName(name);
        return resource[y*this.width + x];
    }

    /**
     * Get all the data of a kind of resources
     * The data obtained is REPLICATION
     * @param name resource name
     * @returns resource data replication
     */
    public GetAllResources(name:string): number[]{
        var resource = this.GetAllResourcesByName(name);
        // copy data
        var resourceCopy : number[] = new Array(resource.length);
        Object.assign(resourceCopy,resource);
        return resourceCopy;
    }

    /**
     * Set resource data 
     * @param name sensor name
     * @param data resource data
     * @param x location x
     * @param y location y
     */
    public SetResource(name:string,data:number,x:number,y:number): void{
        var resource = this.GetAllResourcesByName(name);
        resource[y*this.width + x] = data; 
    }

    /**
     * Get all the data of a kind of resources
     * @param name resource name
     * @param data resource data array
     */
    public SetAllResources(name:string,data:number[]): void{
        this.resources.set(name,data);
    }

    /**
     * Get all the data of a kind of resources
     * The data obtained is POINTER
     * @param name resource name
     * @returns resource data pointer
     */
    private GetAllResourcesByName(name:string): number[]{
        var resource = this.resources.get(name);
        if (resource == null) {
            throw new Error("resource not found : " + name);
        }
        return resource;  
    }
}