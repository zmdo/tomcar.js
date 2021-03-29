export default interface Brain {

    Input(channel:string,data:number[]): void;

    Think(): void;

    Output(): number[];

}