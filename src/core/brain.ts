export default interface Brain {

    /**
     * Input channel data
     * @param channel channel name
     * @param data channel data
     */
    Input(channel:string,data:number[]): void;

    /**
     * The brain thinks and makes decisions
     */
    Think(): void;

    /**
     * output brain decision data
     * @return brain decision data
     */
    Output(): number[];

}