export default interface NeuralNetwork {

    GetLayer(index:number): {size:number,power:number[][],bias:number[]};

    NumberOfLayers(): number;

    Input(data:number[]): number[];
}