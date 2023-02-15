import Brain from "../core/brain"
import Gene from "../ga/gene";
import NeuralNetwork from "./nn";
import { DefaultNeuralNetwork } from "./nn_cpu";
import Radar from "./radar";

export default class TomBrain implements Gene,Brain {

    net!: NeuralNetwork;
    mutatedRate:number = 0.2;
    chiasmaRate:number = 0.5;

    private inputData:Map<string,number[]> = new Map();
    private tempOutput:number[] = [];

    /**
     * Randomly generate network data.
     * 
     * 1. input layer
     * 2. hidden layer
     * ...
     * n. output layer
     * 
     * @param layers number of neurons in each layer 
     */
    public InitBrain(...layers: number[]) {

        let powers : number[][][];
        let bias : number[][];
        let t:number;
        let sign:number;

        powers = new Array(layers.length-1);
        bias = new Array(layers.length-1);

        for(let i:number = 1; i < layers.length ; i++ ) {
            t = i-1;
            powers[t] = new Array(layers[i]);
            bias[t] = new Array(layers[i]);
            
            for (let j:number = 0 ; j < layers[i]; j ++ ) {
                powers[t][j] = new Array(layers[i - 1]);
                for (let k:number = 0 ; k < layers[i - 1] ; k ++) {
                    sign = Math.random() < 0.5 ? 1:-1;
                    powers[t][j][k] = Math.random()*sign;
                }

                sign = Math.random() < 0.5 ? 1:-1;
                bias[t][j] = Math.random()*sign;
            }
        }
        this.net = new DefaultNeuralNetwork(powers,bias);
    }

    /**
     * Make neurons mutate by mutatedRate
     */
    public Mutate(): void {
        let sign:number;
        for (let i:number = 0 ; i < this.net.NumberOfLayers() ; i ++ ) {
            let layer = this.net.GetLayer(i);
            for(let j:number = 0 ; j < layer.size ; j ++ ) {
                for(let k = 0 ; k < layer.power[j].length ; k ++) {
                    if(Math.random() < this.mutatedRate) {
                        sign = Math.random() < 0.5 ? 1:-1;
                        layer.power[j][k] = Math.random()*sign;
                    }
                }
                if(Math.random() < this.mutatedRate) {
                    sign = Math.random() < 0.5 ? 1:-1;
                    layer.bias[j] = Math.random()*sign;
                }
            }
        }
    }
    
    /**
     * genes chiasma produces new gene (the original gene will not change)
     * @param gene 
     * @returns 
     */
    public Chiasma(gene: TomBrain): TomBrain {
        
        let powers : number[][][];
        let bias : number[][];

        let nol:number = this.net.NumberOfLayers();
        powers = new Array(nol);
        bias = new Array(nol);

        for (let i:number = 0 ; i < nol ; i ++ ) {

            let fLayer = this.net.GetLayer(i);
            let mLayer = gene.net.GetLayer(i);

            powers[i] = new Array(fLayer.size);
            bias[i] = new Array(fLayer.size);

            for(let j:number = 0 ; j < fLayer.size ; j ++ ) {
                
                powers[i][j] = new Array(fLayer.power[j].length);

                for(let k = 0 ; k < fLayer.power[j].length ; k ++) {
                    if(Math.random() < this.chiasmaRate) {
                        powers[i][j][k] = fLayer.power[j][k];
                    } else {
                        powers[i][j][k] = mLayer.power[j][k];
                    }
                }

                if(Math.random() < this.chiasmaRate) {
                    bias[i][j] = fLayer.bias[j];
                } else {
                    bias[i][j] = mLayer.bias[j];
                }

            }
        }

        let son:TomBrain = new TomBrain();
        son.mutatedRate = this.mutatedRate;
        son.chiasmaRate = this.chiasmaRate;
        son.net = new DefaultNeuralNetwork(powers, bias);

        return son;
    }
    
    public Copy(): Gene {
        let powers : number[][][];
        let bias : number[][];

        let nol:number = this.net.NumberOfLayers();
        powers = new Array(nol);
        bias = new Array(nol);
        for (let i:number = 0 ; i < nol ; i ++ ) {

            let layer = this.net.GetLayer(i);

            powers[i] = new Array(layer.size);
            bias[i] = new Array(layer.size);

            for(let j:number = 0 ; j < layer.size ; j ++ ) {
                powers[i][j] = new Array(layer.power[j].length);
                for(let k = 0 ; k < layer.power[j].length ; k ++) {
                    powers[i][j][k] = layer.power[j][k];
                }
                bias[i][j] = layer.bias[j];
            }
        }

        let brainCopy:TomBrain = new TomBrain();
        brainCopy.mutatedRate = this.mutatedRate;
        brainCopy.chiasmaRate = this.chiasmaRate;
        brainCopy.net = new DefaultNeuralNetwork(powers, bias);
        
        return brainCopy;
    }
    
    public Input(channel: string, data: number[]): void {
        this.inputData.clear();
        this.inputData.set(channel,data);
    }
    
    public Think(): void {
        let radarInput = this.inputData.get(Radar.SENSOR_NAME);
        if(radarInput != null) {
            this.tempOutput = this.net.Input(radarInput);
        }
    }

    public Output(): number[] {
        return this.tempOutput;
    }

}
