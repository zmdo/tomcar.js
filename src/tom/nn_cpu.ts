import NeuralNetwork from "./nn";

export default abstract class NeuralNetworkBase implements NeuralNetwork {
    
    powers:number[][][];
    bias:number[][];

    constructor(powers:number[][][],bias:number[][]) {
        this.powers = powers;
        this.bias = bias;
    }

    public GetLayer(index:number): {size:number,power:number[][],bias:number[]}{
        return {
            size:this.bias[index].length,
            power:this.powers[index],
            bias:this.bias[index],
        }
    }

    public NumberOfLayers(): number{
        return this.powers.length;
    }

    public Input(data:number[]): number[]{
        var output!:number[];
        var input:number[] = data;

        for(var i:number = 0 ; i < this.NumberOfLayers() ; i ++) {
            var layer = this.GetLayer(i);
            output = new Array(layer.size);
            for(var j:number = 0; j < layer.size ; j ++) {
                output[j] = 0;
                for(var k:number = 0; k < layer.power[j].length ; k ++) {
                    output[j] += layer.power[j][k]*input[k];
                }
                output[j] = this.ActivationFunction(layer.power[j].length,output[j],layer.bias[j]);
            }
            input = output;
        }
        return output;
    }
    
    protected abstract ActivationFunction(len:number,sum:number,bias:number): number;
}

/**
 * Default neural network : activate network using sigmoid function
 */
export class DefaultNeuralNetwork extends NeuralNetworkBase {

    constructor(powers:number[][][],bias:number[][]) {
        super(powers,bias);
    }

    // sigmoid
    protected ActivationFunction(len:number,sum: number, bias: number): number {
        return 1.0/(1.0 + Math.exp(-(sum/len + bias)));
    }

}