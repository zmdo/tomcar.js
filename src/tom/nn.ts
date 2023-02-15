export default interface NeuralNetwork {

    /**
     * get a layer of neurons
     * @param index layer index
     * @returns layer data
     */
    GetLayer(index:number) : {size:number,power:number[][],bias:number[]};

    /**
     * total number of layers
     * @returns total number of layers
     */
    NumberOfLayers() : number;

    /**
     * Input data to the neural network
     * @param data input data
     */
    Input(data:number[]) : number[];

}