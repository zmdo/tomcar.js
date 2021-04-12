var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define("core/brain", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("core/driver", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * driver
     */
    class Driver {
        constructor(brain) {
            this.brain = brain;
        }
        /**
         * The driver will turn the steering wheel according to the sensor data
         */
        Drive() {
            if (this.car == null) {
                throw new Error("the car not found!");
            }
            if (this.brain == null) {
                throw new Error("the brain not found!");
            }
            // get dependent sensors
            var sensors = this.DependentSensors();
            // scan environment by this car
            // and input the scanned data into the brain 
            sensors.forEach(sensor => {
                var data = this.car.GetScanResultBy(sensor);
                this.brain.Input(sensor, data);
            });
            // compute
            this.brain.Think();
            // opeate
            this.Opeate(this.brain.Output(), this.car);
        }
    }
    exports.default = Driver;
});
define("core/env", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * environment resource manager class
     */
    class Environment {
        constructor(width, height) {
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
        GetResource(name, x, y) {
            var resource = this.GetAllResourcesByName(name);
            return resource[y * this.width + x];
        }
        /**
         * Get all the data of a kind of resources
         * @param name resource name
         * @returns resource data
         */
        GetAllResources(name) {
            var resource = this.GetAllResourcesByName(name);
            // copy data
            // var resourceCopy : number[] = new Array(resource.length);
            // Object.assign(resourceCopy,resource);
            return resource;
        }
        /**
         * Set resource data
         * @param name sensor name
         * @param data resource data
         * @param x location x
         * @param y location y
         */
        SetResource(name, data, x, y) {
            var resource = this.GetAllResourcesByName(name);
            resource[y * this.width + x] = data;
        }
        /**
         * Get all the data of a kind of resources
         * @param name resource name
         * @param data resource data array
         */
        SetAllResources(name, data) {
            this.resources.set(name, data);
        }
        /**
         * Get all the data of a kind of resources
         * The data obtained is POINTER
         * @param name resource name
         * @returns resource data pointer
         */
        GetAllResourcesByName(name) {
            var resource = this.resources.get(name);
            if (resource == null) {
                throw new Error("resource not found : " + name);
            }
            return resource;
        }
    }
    exports.default = Environment;
});
define("core/sensor", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SensorBase = void 0;
    class SensorBase {
        constructor(visualField, scanLine, detectionRange) {
            this.visualField = visualField;
            this.scanLine = scanLine;
            this.detectionRange = detectionRange;
        }
        Scan(env, x, y, direction) {
            // get resources
            var resources = env.GetAllResources(this.GetDetectableResourceName());
            var width = env.width;
            var height = env.height;
            var result = new Array(this.scanLine);
            // scan environment
            var cos, sin;
            var dAngle = this.visualField / this.scanLine;
            var angle = direction - this.visualField / 2;
            for (var index = 0; index < this.scanLine; index++) {
                sin = Math.sin(angle);
                cos = Math.cos(angle);
                // ger scan line 
                var lineBlocks = new Array(this.detectionRange);
                for (var len = 0; len < this.detectionRange; len++) {
                    var i = Math.floor(x + len * cos);
                    var j = Math.floor(y + len * sin);
                    var pos = Math.floor(j * width + i);
                    lineBlocks[len] = resources[pos];
                }
                result[index] = this.LineScan(lineBlocks);
                angle += dAngle;
            }
            return result;
        }
    }
    exports.SensorBase = SensorBase;
});
define("core/car", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * This is Car's definition
     *
     * It defines what a car can do ,and you can operate the car by this methods :
     * 1. Run()
     * 2. TurnRight()
     * 3. TurnLeft()
     * 4. GetScanResultBy()
     * 5. Record()
     * 6. Restore()
     *
     * you can set a driver in the car by SetDriver()
     *
     */
    class Car {
        constructor(id, driver, x, y, vx, vy, turnRadian) {
            if (driver != null) {
                this.SetDriver(driver);
            }
            this.id = id;
            this.SetLocation(x, y);
            this.SetVelocity(vx, vy);
            this.turnRadian = turnRadian;
            this.sensors = new Map();
            this.mileage = 0;
            this.alive = true;
        }
        /**
         * The car will move at dt(interval time)
         * @param dt interval time
         */
        Run(dt) {
            switch (this.turn) {
                case 1:
                    this.Turn(-this.turnRadian * dt);
                    break;
                case 2:
                    this.Turn(this.turnRadian * dt);
                    break;
            }
            this.locationX += this.velocityX * dt;
            this.locationY += this.velocityY * dt;
            this.mileage += 1;
            this.turn = 0;
        }
        /**
         * The car will turn right from the current direction
         */
        TurnRight() {
            this.turn = 1;
        }
        /**
         * The car will turn left from the current direction
         */
        TurnLeft() {
            this.turn = 2;
        }
        Turn(dRadian) {
            // get new direction
            var direction = this.GetCurrentDirection() + dRadian;
            // compute new velocity 
            var vx = this.velocity * Math.cos(direction);
            var vy = this.velocity * Math.sin(direction);
            this.SetVelocity(vx, vy);
        }
        /**
         *
         * @param name sensor name
         * @returns
         */
        GetScanResultBy(name) {
            var sensor = this.sensors.get(name);
            if (sensor != null) {
                var direction = this.GetCurrentDirection();
                return sensor.Scan(this.environment, this.locationX, this.locationY, direction);
            }
            else {
                throw new Error("sensor not found :" + name);
            }
        }
        /**
         * get current direction
         * @returns current direction
         */
        GetCurrentDirection() {
            // compute sin and cos
            var sin = this.velocityY / this.velocity;
            var cos = this.velocityX / this.velocity;
            // compute direction
            var direction = Math.acos(cos);
            // identify quadrants
            if (sin < 0) {
                direction = 2 * Math.PI - direction;
            }
            return direction;
        }
        /**
         *
         * @param name sensor name
         * @param sensor sensor object
         */
        SetSensor(name, sensor) {
            this.sensors.set(name, sensor);
        }
        /**
         *
         * @param sensor sensor object
         */
        SetSensorUseDefaultName(sensor) {
            this.sensors.set(sensor.GetName(), sensor);
        }
        /**
         * You can set a driver in the car by this method
         * @param driver The driver of the car
         */
        SetDriver(driver) {
            this.driver = driver;
            if (driver != null && driver.car != this) {
                driver.car = this;
            }
        }
        SetEnvironment(env) {
            this.environment = env;
        }
        /**
         * record current status
         */
        Record() {
            if (this.recordCar == null) {
                this.recordCar = new Car(this.id, null, 0, 0, 0, 0, 0);
            }
            Object.assign(this.recordCar, this);
        }
        /**
         * restore status
         */
        Restore() {
            this.SetLocation(this.recordCar.locationX, this.recordCar.locationY);
            this.SetVelocity(this.recordCar.velocityX, this.recordCar.velocityY);
            this.turnRadian = this.recordCar.turnRadian;
            this.mileage = 0;
            this.alive = true;
        }
        SetLocation(x, y) {
            this.locationX = x;
            this.locationY = y;
        }
        SetVelocity(vx, vy) {
            this.velocityX = vx;
            this.velocityY = vy;
            this.velocity = Math.sqrt(Math.pow(this.velocityX, 2) + Math.pow(this.velocityY, 2));
        }
        IsAlive() {
            return this.alive;
        }
    }
    exports.default = Car;
});
define("core/workflow", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("ga/gene", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("tom/nn", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("tom/nn_cpu", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DefaultNeuralNetwork = void 0;
    class NeuralNetworkBase {
        constructor(powers, bias) {
            this.powers = powers;
            this.bias = bias;
        }
        GetLayer(index) {
            return {
                size: this.bias[index].length,
                power: this.powers[index],
                bias: this.bias[index],
            };
        }
        NumberOfLayers() {
            return this.powers.length;
        }
        Input(data) {
            var output;
            var input = data;
            for (var i = 0; i < this.NumberOfLayers(); i++) {
                var layer = this.GetLayer(i);
                output = new Array(layer.size);
                for (var j = 0; j < layer.size; j++) {
                    var sum = 0;
                    for (var k = 0; k < layer.power[j].length; k++) {
                        sum += layer.power[j][k] * input[k];
                    }
                    output[j] = this.ActivationFunction(layer.power[j].length, sum, layer.bias[j]);
                }
                input = output;
            }
            return output;
        }
    }
    exports.default = NeuralNetworkBase;
    /**
     * Default neural network : activate network using sigmoid function
     */
    class DefaultNeuralNetwork extends NeuralNetworkBase {
        constructor(powers, bias) {
            super(powers, bias);
        }
        // 
        ActivationFunction(len, sum, bias) {
            var value = (sum + bias) / len;
            if (value > 0) {
                return value;
            }
            else {
                return 0;
            }
        }
    }
    exports.DefaultNeuralNetwork = DefaultNeuralNetwork;
});
define("tom/radar", ["require", "exports", "core/sensor"], function (require, exports, sensor_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DEFAULT_RADAR_INSTANCE = void 0;
    class Radar extends sensor_1.SensorBase {
        GetDetectableResourceName() {
            return Radar.DETECTABLE_RESOURCE_NAME;
        }
        LineScan(lineBlocks) {
            for (var i = 0; i < lineBlocks.length; i++) {
                if (lineBlocks[i] > 0) {
                    return (i * 1.0) / lineBlocks.length;
                }
            }
            return 1.0;
        }
        GetName() {
            return Radar.SENSOR_NAME;
        }
    }
    exports.default = Radar;
    Radar.SENSOR_NAME = "radar";
    Radar.DETECTABLE_RESOURCE_NAME = "land";
    exports.DEFAULT_RADAR_INSTANCE = new Radar(2 * Math.PI / 3.0, 12, 50);
});
define("tom/brain", ["require", "exports", "tom/nn_cpu", "tom/radar"], function (require, exports, nn_cpu_1, radar_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class TomBrain {
        constructor() {
            this.mutatedRate = 0.2;
            this.chiasmaRate = 0.5;
            this.inputData = new Map();
            this.tempOutput = new Array();
        }
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
        InitBrain(...layers) {
            var powers;
            var bias;
            var t;
            var sign;
            powers = new Array(layers.length - 1);
            bias = new Array(layers.length - 1);
            for (var i = 1; i < layers.length; i++) {
                t = i - 1;
                powers[t] = new Array(layers[i]);
                bias[t] = new Array(layers[i]);
                for (var j = 0; j < layers[i]; j++) {
                    powers[t][j] = new Array(layers[i - 1]);
                    for (var k = 0; k < layers[i - 1]; k++) {
                        sign = Math.random() < 0.5 ? 1 : -1;
                        powers[t][j][k] = Math.random() * sign;
                    }
                    sign = Math.random() < 0.5 ? 1 : -1;
                    bias[t][j] = Math.random() * sign;
                }
            }
            this.net = new nn_cpu_1.DefaultNeuralNetwork(powers, bias);
        }
        /**
         * Make neurons mutate by mutatedRate
         */
        Mutate() {
            var sign;
            for (var i = 0; i < this.net.NumberOfLayers(); i++) {
                var layer = this.net.GetLayer(i);
                for (var j = 0; j < layer.size; j++) {
                    for (var k = 0; k < layer.power[j].length; k++) {
                        if (Math.random() < this.mutatedRate) {
                            sign = Math.random() < 0.5 ? 1 : -1;
                            layer.power[j][k] = Math.random() * sign;
                        }
                    }
                    if (Math.random() < this.mutatedRate) {
                        sign = Math.random() < 0.5 ? 1 : -1;
                        layer.bias[j] = Math.random() * sign;
                    }
                }
            }
        }
        /**
         * genes chiasma produces new gene (the original gene will not change)
         * @param gene
         * @returns
         */
        Chiasma(gene) {
            var powers;
            var bias;
            var nol = this.net.NumberOfLayers();
            powers = new Array(nol);
            bias = new Array(nol);
            for (var i = 0; i < nol; i++) {
                var fLayer = this.net.GetLayer(i);
                var mLayer = gene.net.GetLayer(i);
                powers[i] = new Array(fLayer.size);
                bias[i] = new Array(fLayer.size);
                for (var j = 0; j < fLayer.size; j++) {
                    powers[i][j] = new Array(fLayer.power[j].length);
                    for (var k = 0; k < fLayer.power[j].length; k++) {
                        if (Math.random() < this.chiasmaRate) {
                            powers[i][j][k] = fLayer.power[j][k];
                        }
                        else {
                            powers[i][j][k] = mLayer.power[j][k];
                        }
                    }
                    if (Math.random() < this.chiasmaRate) {
                        bias[i][j] = fLayer.bias[j];
                    }
                    else {
                        bias[i][j] = mLayer.bias[j];
                    }
                }
            }
            var son = new TomBrain();
            son.mutatedRate = this.mutatedRate;
            son.chiasmaRate = this.chiasmaRate;
            son.net = new nn_cpu_1.DefaultNeuralNetwork(powers, bias);
            return son;
        }
        Copy() {
            var powers;
            var bias;
            var nol = this.net.NumberOfLayers();
            powers = new Array(nol);
            bias = new Array(nol);
            for (var i = 0; i < nol; i++) {
                var layer = this.net.GetLayer(i);
                powers[i] = new Array(layer.size);
                bias[i] = new Array(layer.size);
                for (var j = 0; j < layer.size; j++) {
                    powers[i][j] = new Array(layer.power[j].length);
                    for (var k = 0; k < layer.power[j].length; k++) {
                        powers[i][j][k] = layer.power[j][k];
                    }
                    bias[i][j] = layer.bias[j];
                }
            }
            var brainCopy = new TomBrain();
            brainCopy.mutatedRate = this.mutatedRate;
            brainCopy.chiasmaRate = this.chiasmaRate;
            brainCopy.net = new nn_cpu_1.DefaultNeuralNetwork(powers, bias);
            return brainCopy;
        }
        Input(channel, data) {
            this.inputData.clear();
            this.inputData.set(channel, data);
        }
        Think() {
            var radarInput = this.inputData.get(radar_1.default.SENSOR_NAME);
            if (radarInput != null) {
                this.tempOutput = this.net.Input(radarInput);
            }
        }
        Output() {
            return this.tempOutput;
        }
    }
    exports.default = TomBrain;
});
define("graphics/drawable", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("physis/rigid_body", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("tom/fertari", ["require", "exports", "core/car", "tom/radar"], function (require, exports, car_1, radar_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Fertari extends car_1.default {
        constructor(id, driver, radius, x, y, vx, vy, turnRadian) {
            super(id, driver, x, y, vx, vy, turnRadian);
            this.radius = radius;
        }
        GetRadius() {
            return this.radius;
        }
        GetX() {
            return this.locationX;
        }
        GetY() {
            return this.locationY;
        }
        hasCollided(body) {
            var distance = Math.sqrt(Math.pow(this.GetX() - body.GetX(), 2) + Math.pow(this.GetY() - body.GetY(), 2));
            return (distance < this.GetRadius() + body.GetRadius());
        }
        Draw(canvas) {
            var c2d = canvas.getContext("2d");
            if (c2d != null) {
                // 绘制传感器数据
                var radarData = this.GetScanResultBy(radar_2.default.SENSOR_NAME);
                if (radarData != null) {
                    // 获取雷达
                    var radar = (this.sensors.get(radar_2.default.SENSOR_NAME));
                    var visualField = radar.visualField;
                    var scanLine = radar.scanLine;
                    // 角度
                    var cos, sin;
                    var dAngle = visualField / scanLine;
                    var angle = this.GetCurrentDirection() - visualField / 2;
                    c2d.strokeStyle = "green";
                    for (var i = 0; i < radarData.length; i++) {
                        // 绘制起点
                        c2d.beginPath();
                        c2d.moveTo(this.locationX, this.locationY);
                        // 绘制终点
                        let visualLen = radar.detectionRange * radarData[i];
                        sin = Math.sin(angle);
                        cos = Math.cos(angle);
                        c2d.lineTo(this.locationX + Math.floor(cos * visualLen), this.locationY + Math.floor(sin * visualLen));
                        angle += dAngle;
                        // 绘制扫描线
                        c2d.stroke();
                    }
                }
                // 绘制车主体
                c2d.strokeStyle = "blue";
                c2d.beginPath();
                c2d.arc(this.GetX(), this.GetY(), this.GetRadius(), 0, 2 * Math.PI, false);
                c2d.fill();
            }
        }
    }
    exports.default = Fertari;
});
define("tom/tom", ["require", "exports", "core/driver", "tom/radar"], function (require, exports, driver_1, radar_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Tom extends driver_1.default {
        constructor(brain) {
            super(brain);
        }
        Opeate(out, car) {
            // get best result
            var result = Tom.BestChoice(out);
            // toggle direction
            switch (result) {
                case 1:
                    car.TurnLeft();
                    break;
                case 2:
                    car.TurnRight();
                    break;
                case 0:
                // keep direction
                default:
                // keep direction
            }
        }
        DependentSensors() {
            return Tom.DEPENDENT_SENSORS;
        }
        static BestChoice(data) {
            var maxIndex = 0;
            var max = data[0];
            for (var i = 0; i < data.length; i++) {
                if (data[i] > max) {
                    max = data[i];
                    maxIndex = i;
                }
            }
            return maxIndex;
        }
    }
    exports.default = Tom;
    Tom.DEPENDENT_SENSORS = [radar_3.default.SENSOR_NAME];
});
define("workflow", ["require", "exports", "core/env", "tom/radar", "tom/tom"], function (require, exports, env_1, radar_4, tom_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class GAWorkFlow {
        constructor(canvas, prototypeCar, cars) {
            this.dt = 0.1;
            this.canvas = canvas;
            this.prototypeCar = prototypeCar;
            this.cars = cars;
        }
        Init() {
            // scan canvas
            var c2d = this.canvas.getContext("2d");
            if (c2d == null)
                return;
            var width = this.canvas.width;
            var height = this.canvas.height;
            var data = new Array(width * height);
            var canvasData = c2d.getImageData(0, 0, width, height);
            var pos;
            for (var i = 0; i < width; i++) {
                for (var j = 0; j < height; j++) {
                    pos = j * width * 4 + i * 4;
                    if (canvasData.data[pos] > 0) {
                        data[j * width + i] = 1;
                    }
                    else {
                        data[j * width + i] = 0;
                    }
                }
            }
            // load data
            this.environment = new env_1.default(width, height);
            this.environment.SetAllResources(GAWorkFlow.LAND, data);
            // init car
            this.cars.forEach(car => {
                car.environment = this.environment;
                if (this.prototypeCar != null) {
                    car.SetLocation(this.prototypeCar.locationX, this.prototypeCar.locationY);
                    car.SetVelocity(this.prototypeCar.velocityX, this.prototypeCar.velocityY);
                }
                car.Record();
            });
        }
        Start() {
            this.cars.forEach(car => {
                car.Restore();
            });
        }
        NextStep() {
            // dont merge 
            this.cars.forEach(car => {
                if (car.IsAlive()) {
                    car.driver.Drive();
                }
            });
            this.cars.forEach(car => {
                if (car.IsAlive()) {
                    car.Run(this.dt);
                }
            });
            // rule
            this.cars.forEach(car => {
                var x = Math.floor(car.locationX);
                var y = Math.floor(car.locationY);
                if (this.environment.GetResource(GAWorkFlow.LAND, x, y) > 0) {
                    car.alive = false;
                }
            });
            // draw
            this.Draw();
        }
        Draw() {
            var c2d = this.canvas.getContext("2d");
            if (c2d == null)
                return;
            var width = this.environment.width;
            var height = this.environment.height;
            // clear all 
            c2d.clearRect(0, 0, width, height);
            // draw background
            c2d.fillStyle = "black";
            var lands = this.environment.GetAllResources(GAWorkFlow.LAND);
            for (var i = 0; i < width; i++) {
                for (var j = 0; j < height; j++) {
                    if (lands[j * width + i] > 0) {
                        c2d.fillRect(i, j, 1, 1);
                    }
                }
            }
            // draw cars
            this.cars.forEach(car => {
                if (c2d == null)
                    return;
                if (car.IsAlive()) {
                    c2d.fillStyle = "blue";
                }
                else {
                    c2d.fillStyle = "red";
                }
                car.Draw(this.canvas);
            });
        }
        IsEnd() {
            var flag = true;
            this.cars.forEach(car => {
                if (car.IsAlive()) {
                    flag = false;
                    return;
                }
            });
            return flag;
        }
        OrderdCars() {
            for (var i = 0; i < this.cars.length; i++) {
                for (var j = i; j < this.cars.length; j++) {
                    if (this.cars[j].mileage > this.cars[i].mileage) {
                        var car = this.cars[i];
                        this.cars[i] = this.cars[j];
                        this.cars[j] = car;
                    }
                }
            }
            return this.cars;
        }
        GetBestCar() {
            var bestCar = this.cars[0];
            this.cars.forEach(car => {
                if (car.mileage > bestCar.mileage) {
                    bestCar = car;
                }
            });
            return bestCar;
        }
        ExecuteStrategicPlan(options) {
            var halfNum = this.cars.length / 2;
            var chiasmaFlag = options.get(GAWorkFlow.CHIASMA_CONTROL);
            if (chiasmaFlag != null && chiasmaFlag) {
                for (var i = 0; i < halfNum; i++) {
                    var driverA = this.cars[i].driver;
                    var driverB = this.cars[i + halfNum].driver;
                    if (driverA instanceof tom_1.default &&
                        driverB instanceof tom_1.default) {
                        var brainA = driverA.brain;
                        var brianB = driverB.brain;
                        var newBrain = brainA.Chiasma(brianB);
                        driverB.brain = newBrain;
                    }
                }
            }
            var mutateFlag = options.get(GAWorkFlow.MUTATE_CONTROL);
            if (mutateFlag != null && chiasmaFlag) {
                for (var i = 0; i < this.cars.length; i++) {
                    var driver = this.cars[i].driver;
                    if (driver instanceof tom_1.default) {
                        var brain = driver.brain;
                        if (Math.random() > 0.5) {
                            brain.Mutate();
                        }
                    }
                }
            }
        }
        ReStart() {
            this.Start();
        }
    }
    exports.default = GAWorkFlow;
    GAWorkFlow.LAND = radar_4.default.DETECTABLE_RESOURCE_NAME;
    GAWorkFlow.MUTATE_CONTROL = "MUTATE";
    GAWorkFlow.CHIASMA_CONTROL = "CHIASMA";
});
define("factory", ["require", "exports", "tom/brain", "tom/fertari", "tom/radar", "tom/tom", "workflow"], function (require, exports, brain_1, fertari_1, radar_5, tom_2, workflow_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GetGAWorkFlow = void 0;
    function GetTomCar(id, locationX, locationY, velocityX, velocityY) {
        // init brain
        var tomBrain = new brain_1.default();
        tomBrain.InitBrain(radar_5.DEFAULT_RADAR_INSTANCE.scanLine, 10, 3);
        // init driver
        var tomDriver = new tom_2.default(tomBrain);
        // init car
        var tomCar = new fertari_1.default(id, tomDriver, 5, locationX, locationY, velocityX, velocityY, Math.PI / 6);
        tomCar.SetSensorUseDefaultName(radar_5.DEFAULT_RADAR_INSTANCE);
        return {
            car: tomCar,
            driver: tomDriver,
            brain: tomBrain,
        };
    }
    exports.default = GetTomCar;
    function GetGAWorkFlow(canvas, n, locationX, locationY, velocityX, velocityY) {
        var prototypeCar = GetTomCar(0, locationX, locationY, velocityX, velocityY).car;
        var cars = new Array(n);
        for (var i = 0; i < n; i++) {
            cars[i] = GetTomCar(i, locationX, locationY, velocityX, velocityY).car;
        }
        var workflow = new workflow_1.default(canvas, prototypeCar, cars);
        return workflow;
    }
    exports.GetGAWorkFlow = GetGAWorkFlow;
});
define("tomcar", ["require", "exports", "workflow"], function (require, exports, workflow_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class TomcarController {
        constructor(workflow) {
            this.runFlag = true;
            this.pauseFlag = false;
            this.workflow = workflow;
            this.options = new Map();
            this.options.set(workflow_2.default.MUTATE_CONTROL, true);
            this.options.set(workflow_2.default.CHIASMA_CONTROL, true);
        }
        Begin() {
            this.workflow.Init();
            this.workflow.Start();
            this.runFlag = true;
            this.pauseFlag = false;
            this.TaskRun();
        }
        Start() {
            this.pauseFlag = false;
        }
        Pause() {
            this.pauseFlag = true;
        }
        Stop() {
            this.runFlag = false;
        }
        TaskRun() {
            return __awaiter(this, void 0, void 0, function* () {
                while (this.runFlag) {
                    while ((!this.workflow.IsEnd()) && this.runFlag) {
                        if (!this.pauseFlag) {
                            this.workflow.NextStep();
                            this.workflow.OrderdCars();
                        }
                        yield sleep(10);
                    }
                    this.workflow.ExecuteStrategicPlan(this.options);
                    this.workflow.ReStart();
                }
            });
        }
    }
    exports.default = TomcarController;
    const sleep = (timeout) => new Promise((resolve, reject) => {
        setTimeout(resolve, timeout);
    });
});
