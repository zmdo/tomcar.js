import Environment from "./core/env";
import TomBrain from "./tom/brain";
import Fertari from "./tom/fertari";
import Radar, { DEFAULT_RADAR_INSTANCE } from "./tom/radar";
import Tom from "./tom/tom";

function GetTomCar(env:Environment):{car:Fertari,driver:Tom,brain:TomBrain} {

    // init brain
    var tomBrain:TomBrain = new TomBrain();
    var size:number = env.width * env.height;
    tomBrain.InitBrain(size,10,10,3);

    // init driver
    var tomDriver:Tom = new Tom(tomBrain);

    // init car
    var tomCar:Fertari = new Fertari(tomDriver,10,0,0,10,0,10);
    tomCar.SetSensorUseDefaultName(DEFAULT_RADAR_INSTANCE);
    
    return {
        car:tomCar,
        driver:tomDriver,
        brain:tomBrain,
    };
    
}