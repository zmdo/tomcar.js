System.register("core/brain", [], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("core/driver", [], function (exports_2, context_2) {
    "use strict";
    var Driver;
    var __moduleName = context_2 && context_2.id;
    return {
        setters: [],
        execute: function () {
            /**
             * driver
             */
            Driver = class Driver {
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
            };
            exports_2("default", Driver);
        }
    };
});
System.register("core/env", [], function (exports_3, context_3) {
    "use strict";
    var Environment;
    var __moduleName = context_3 && context_3.id;
    return {
        setters: [],
        execute: function () {
            /**
             * environment resource manager class
             */
            Environment = class Environment {
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
                 * The data obtained is REPLICATION
                 * @param name resource name
                 * @returns resource data replication
                 */
                GetAllResources(name) {
                    var resource = this.GetAllResourcesByName(name);
                    // copy data
                    var resourceCopy = new Array(resource.length);
                    Object.assign(resourceCopy, resource);
                    return resourceCopy;
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
            };
            exports_3("default", Environment);
        }
    };
});
System.register("core/sensor", [], function (exports_4, context_4) {
    "use strict";
    var SensorBase;
    var __moduleName = context_4 && context_4.id;
    return {
        setters: [],
        execute: function () {
            SensorBase = class SensorBase {
                constructor(visualField, scanLine, detectionRange) {
                    this.visualField = 10;
                    this.scanLine = 120;
                    this.detectionRange = 2 * Math.PI / 2;
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
                        var lineBlocks;
                        for (var len = 0; len < this.detectionRange; len++) {
                            var i = Math.floor(len * cos);
                            var j = Math.floor(len * sin);
                            lineBlocks[len] = SensorBase.GetBlock(resources, width, height, x, y);
                        }
                        result[index] = this.LineScan(lineBlocks);
                        angle += dAngle;
                    }
                    return result;
                }
                static GetBlock(resources, width, height, x, y) {
                    return resources[y * width + x];
                }
            };
            exports_4("SensorBase", SensorBase);
        }
    };
});
System.register("core/car", [], function (exports_5, context_5) {
    "use strict";
    var Car;
    var __moduleName = context_5 && context_5.id;
    return {
        setters: [],
        execute: function () {
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
            Car = class Car {
                constructor(driver, x, y, vx, vy, radian) {
                    this.SetDriver(driver);
                    this.SetLocation(x, y);
                    this.SetVelocity(vx, vy);
                    this.turnRadian = radian;
                    this.sensors = new Map();
                    this.mileage = 0;
                }
                /**
                 * The car will move at dt(interval time)
                 * @param dt interval time
                 */
                Run(dt) {
                    this.locationX += this.velocityX * dt;
                    this.locationY += this.velocityY * dt;
                    this.mileage = 0;
                }
                /**
                 * The car will turn right from the current direction
                 */
                TurnRight() {
                    this.Turn(-this.turnRadian);
                }
                /**
                 * The car will turn left from the current direction
                 */
                TurnLeft() {
                    this.Turn(-this.turnRadian);
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
                        this.recordCar = new Car(null, 0, 0, 0, 0, 0);
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
            };
            exports_5("default", Car);
        }
    };
});
System.register("core/workflow", [], function (exports_6, context_6) {
    "use strict";
    var __moduleName = context_6 && context_6.id;
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("graphics/drawable", [], function (exports_7, context_7) {
    "use strict";
    var __moduleName = context_7 && context_7.id;
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("physis/rigid_body", [], function (exports_8, context_8) {
    "use strict";
    var __moduleName = context_8 && context_8.id;
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("tom/fertari", ["core/car"], function (exports_9, context_9) {
    "use strict";
    var car_1, Fertari;
    var __moduleName = context_9 && context_9.id;
    return {
        setters: [
            function (car_1_1) {
                car_1 = car_1_1;
            }
        ],
        execute: function () {
            Fertari = class Fertari extends car_1.default {
                constructor(driver, radius, x, y, vx, vy, radian) {
                    super(driver, x, y, vx, vy, radian);
                    this.radius = radian;
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
                    c2d.arc(this.GetX(), this.GetY(), this.GetRadius(), 0, 360, true);
                }
            };
            exports_9("default", Fertari);
        }
    };
});
System.register("ga/gene", [], function (exports_10, context_10) {
    "use strict";
    var __moduleName = context_10 && context_10.id;
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("tom/nn", [], function (exports_11, context_11) {
    "use strict";
    var __moduleName = context_11 && context_11.id;
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("tom/nn_cpu", [], function (exports_12, context_12) {
    "use strict";
    var NeuralNetworkBase, DefaultNeuralNetwork;
    var __moduleName = context_12 && context_12.id;
    return {
        setters: [],
        execute: function () {
            NeuralNetworkBase = class NeuralNetworkBase {
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
                            output[j] = 0;
                            for (var k = 0; k < layer.power[j].length; k++) {
                                output[j] += layer.power[j][k] * input[k];
                            }
                            output[j] = this.ActivationFunction(output[j], layer.bias[j]);
                        }
                        input = output;
                    }
                    return output;
                }
            };
            exports_12("default", NeuralNetworkBase);
            /**
             * Default neural network : activate network using sigmoid function
             */
            DefaultNeuralNetwork = class DefaultNeuralNetwork extends NeuralNetworkBase {
                constructor(powers, bias) {
                    super(powers, bias);
                }
                // sigmoid
                ActivationFunction(sum, bias) {
                    return 1.0 / (1.0 + Math.exp(-(sum + bias)));
                }
            };
            exports_12("DefaultNeuralNetwork", DefaultNeuralNetwork);
        }
    };
});
System.register("tom/radar", ["core/sensor"], function (exports_13, context_13) {
    "use strict";
    var sensor_1, Radar, DEFAULT_RADAR_INSTANCE;
    var __moduleName = context_13 && context_13.id;
    return {
        setters: [
            function (sensor_1_1) {
                sensor_1 = sensor_1_1;
            }
        ],
        execute: function () {
            Radar = class Radar extends sensor_1.SensorBase {
                GetDetectableResourceName() {
                    return Radar.DETECTABLE_RESOURCE_NAME;
                }
                LineScan(lineBlocks) {
                    for (var i = 0; i < lineBlocks.length; i++) {
                        if (lineBlocks[i] > 0) {
                            return i / lineBlocks.length;
                        }
                    }
                    return 1.0;
                }
                GetName() {
                    return Radar.SENSOR_NAME;
                }
            };
            exports_13("default", Radar);
            Radar.SENSOR_NAME = "radar";
            Radar.DETECTABLE_RESOURCE_NAME = "land";
            exports_13("DEFAULT_RADAR_INSTANCE", DEFAULT_RADAR_INSTANCE = new Radar(10, 120, 2 * Math.PI / 3));
        }
    };
});
System.register("tom/brain", ["tom/nn_cpu", "tom/radar"], function (exports_14, context_14) {
    "use strict";
    var nn_cpu_1, radar_1, TomBrain;
    var __moduleName = context_14 && context_14.id;
    return {
        setters: [
            function (nn_cpu_1_1) {
                nn_cpu_1 = nn_cpu_1_1;
            },
            function (radar_1_1) {
                radar_1 = radar_1_1;
            }
        ],
        execute: function () {
            TomBrain = class TomBrain {
                constructor() {
                    this.mutatedRate = 0.2;
                    this.chiasmaRate = 0.5;
                    this.inputData = new Map();
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
                    powers = new Array(layers.length);
                    bias = new Array(layers.length);
                    for (var i = 1; i < layers.length; i++) {
                        powers[i] = new Array(layers[i]);
                        bias[i] = new Array(layers[i]);
                        for (var j = 0; j < layers[i]; j++) {
                            powers[i][j] = new Array(layers[i - 1]);
                            bias[i][j] = Math.random();
                            for (var k = 0; k < layers[i - 1]; k++) {
                                powers[i][j][k] = Math.random();
                            }
                        }
                    }
                    this.net = new nn_cpu_1.DefaultNeuralNetwork(powers, bias);
                }
                /**
                 * Make neurons mutate by mutatedRate
                 */
                Mutate() {
                    for (var i = 0; i < this.net.NumberOfLayers(); i++) {
                        var layer = this.net.GetLayer(i);
                        for (var j = 0; j < layer.size; j++) {
                            for (var k = 0; k < layer.power[j].length; k++) {
                                if (Math.random() < this.mutatedRate) {
                                    layer.power[j][k] = Math.random();
                                }
                            }
                            if (Math.random() < this.mutatedRate) {
                                layer.bias[j] = Math.random();
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
            };
            exports_14("default", TomBrain);
        }
    };
});
System.register("tom/tom", ["core/driver", "tom/radar"], function (exports_15, context_15) {
    "use strict";
    var driver_1, radar_2, Tom;
    var __moduleName = context_15 && context_15.id;
    return {
        setters: [
            function (driver_1_1) {
                driver_1 = driver_1_1;
            },
            function (radar_2_1) {
                radar_2 = radar_2_1;
            }
        ],
        execute: function () {
            Tom = class Tom extends driver_1.default {
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
            };
            exports_15("default", Tom);
            Tom.DEPENDENT_SENSORS = [radar_2.default.SENSOR_NAME];
        }
    };
});
System.register("workflow", ["core/env", "tom/radar", "tom/tom"], function (exports_16, context_16) {
    "use strict";
    var env_1, radar_3, tom_1, GAWorkFlow;
    var __moduleName = context_16 && context_16.id;
    return {
        setters: [
            function (env_1_1) {
                env_1 = env_1_1;
            },
            function (radar_3_1) {
                radar_3 = radar_3_1;
            },
            function (tom_1_1) {
                tom_1 = tom_1_1;
            }
        ],
        execute: function () {
            GAWorkFlow = class GAWorkFlow {
                constructor(canvas, prototypeCar, cars) {
                    this.dt = 0.1;
                    this.canvas = canvas;
                    this.prototypeCar = prototypeCar;
                    this.cars = cars;
                }
                Init() {
                    // scan canvas
                    var c2d = this.canvas.getContext("2d");
                    var width = this.canvas.width;
                    var height = this.canvas.height;
                    var data = new Array(width * height);
                    var canvasData = c2d.getImageData(0, 0, width, height);
                    var pos;
                    for (var i = 0; i < width; i++) {
                        for (var j = 0; j < height; j++) {
                            pos = j * width + i;
                            if (canvasData[pos] < 255) {
                                data[pos] = 1;
                            }
                            else {
                                data[pos] = 0;
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
                        if (this.environment.GetResource(GAWorkFlow.LAND, car.locationX, car.locationY) > 0) {
                            car.alive = false;
                        }
                    });
                    // draw
                    this.Draw();
                }
                Draw() {
                    var width = this.environment.width;
                    var height = this.environment.height;
                    var c2d = this.canvas.getContext("2d");
                    // clear all 
                    c2d.clearRect(0, 0, width, height);
                    // draw background
                    var lands = this.environment.GetAllResources(GAWorkFlow.LAND);
                    for (var i; i < width; i++) {
                        for (var j; j < height; j++) {
                            if (lands[j * width + i] > 0) {
                                c2d.fillRect(i, j, 1, 1);
                            }
                        }
                    }
                    // draw cars
                    this.cars.forEach(car => {
                        car.Draw(this.canvas);
                    });
                }
                IsEnd() {
                    this.cars.forEach(car => {
                        if (car.IsAlive()) {
                            return false;
                        }
                    });
                    return true;
                }
                OrderdCars() {
                    for (var i = 0; i < this.cars.length; i++) {
                        for (var j = i; j < this.cars.length; j++) {
                            if (this.cars[j].mileage < this.cars[i].mileage) {
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
                ExecuteStrategicPlan() {
                    var halfNum = this.cars.length / 2;
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
                ReStart() {
                    this.Start();
                }
            };
            exports_16("default", GAWorkFlow);
            GAWorkFlow.LAND = radar_3.default.DETECTABLE_RESOURCE_NAME;
        }
    };
});
System.register("factory", ["tom/brain", "tom/fertari", "tom/radar", "tom/tom"], function (exports_17, context_17) {
    "use strict";
    var brain_1, fertari_1, radar_4, tom_2;
    var __moduleName = context_17 && context_17.id;
    function GetTomCar(locationX, locationY, velocityX, velocityY) {
        // init brain
        var tomBrain = new brain_1.default();
        tomBrain.InitBrain(radar_4.DEFAULT_RADAR_INSTANCE.scanLine, 10, 10, 3);
        // init driver
        var tomDriver = new tom_2.default(tomBrain);
        // init car
        var tomCar = new fertari_1.default(tomDriver, 10, locationX, locationY, velocityX, velocityY, 10);
        tomCar.SetSensorUseDefaultName(radar_4.DEFAULT_RADAR_INSTANCE);
        return {
            car: tomCar,
            driver: tomDriver,
            brain: tomBrain,
        };
    }
    exports_17("default", GetTomCar);
    return {
        setters: [
            function (brain_1_1) {
                brain_1 = brain_1_1;
            },
            function (fertari_1_1) {
                fertari_1 = fertari_1_1;
            },
            function (radar_4_1) {
                radar_4 = radar_4_1;
            },
            function (tom_2_1) {
                tom_2 = tom_2_1;
            }
        ],
        execute: function () {
        }
    };
});
System.register("tomcar", ["workflow", "factory"], function (exports_18, context_18) {
    "use strict";
    var workflow_1, factory_1;
    var __moduleName = context_18 && context_18.id;
    function TomCarStart(workflow) {
        workflow.Init();
        workflow.Start();
        while (true) {
            while (!workflow.IsEnd()) {
                workflow.NextStep();
            }
            workflow.OrderdCars();
            workflow.ExecuteStrategicPlan();
            workflow.ReStart();
        }
    }
    exports_18("TomCarStart", TomCarStart);
    function GetGAWorkFlow(canvas, n, locationX, locationY, velocityX, velocityY) {
        var prototypeCar = factory_1.default(locationX, locationY, velocityX, velocityY).car;
        var cars = new Array(n);
        for (var i = 0; i < n; i++) {
            cars[i] = factory_1.default(locationX, locationY, velocityX, velocityY).car;
        }
        var workflow = new workflow_1.default(canvas, prototypeCar, cars);
        return workflow;
    }
    exports_18("GetGAWorkFlow", GetGAWorkFlow);
    return {
        setters: [
            function (workflow_1_1) {
                workflow_1 = workflow_1_1;
            },
            function (factory_1_1) {
                factory_1 = factory_1_1;
            }
        ],
        execute: function () {
        }
    };
});
//# sourceMappingURL=tomcar.js.map