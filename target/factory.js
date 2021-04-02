define(["require", "exports", "./tom/brain", "./tom/fertari", "./tom/radar", "./tom/tom"], function (require, exports, brain_1, fertari_1, radar_1, tom_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function GetTomCar(locationX, locationY, velocityX, velocityY) {
        // init brain
        var tomBrain = new brain_1.default();
        tomBrain.InitBrain(radar_1.DEFAULT_RADAR_INSTANCE.scanLine, 10, 10, 3);
        // init driver
        var tomDriver = new tom_1.default(tomBrain);
        // init car
        var tomCar = new fertari_1.default(tomDriver, 10, locationX, locationY, velocityX, velocityY, 10);
        tomCar.SetSensorUseDefaultName(radar_1.DEFAULT_RADAR_INSTANCE);
        return {
            car: tomCar,
            driver: tomDriver,
            brain: tomBrain,
        };
    }
    exports.default = GetTomCar;
});
//# sourceMappingURL=factory.js.map