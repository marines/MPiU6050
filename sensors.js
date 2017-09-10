const driver = require('./driver');
const mpu = new driver();

const offset = {
    aX: 0,
    aY: 0,
    aZ: 0,
    gX: 0,
    gY: 0,
    gZ: 0,
};

function initSensors() {
    console.log('Initializing sensors...');

    return new Promise((resolve, reject) => {
        mpu.initialize();
        mpu.testConnection(function (err, testPassed) {
            if (!testPassed) {
                reject('Connection failed! ' + err);
            } else {
                resolve();
            }
        });
    });
}

function readSensors() {
    return new Promise((resolve, reject) => {
        mpu.getMotion6((err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

function calibrate(calibrationSamples) {
    console.log('Calibrating the sensor, hold the device in a neutral position...');

    const promises = [];
    for (let i = 0; i < calibrationSamples; i++) {
      promises.push(readSensors());
    }

    return Promise.all(promises)
      .then(readings =>
        readings
          .reduce((averages, reading) => averages ? averages.map((value, index) => value + reading[index]) : reading)
          .map(value => value / calibrationSamples))
      .then(calibrationData => {
        offset.aX = calibrationData[0];
        offset.aY = calibrationData[1];
        offset.aZ = calibrationData[2] - 16384;
        offset.gX = calibrationData[3];
        offset.gY = calibrationData[4];
        offset.gZ = calibrationData[5];
      });
  }

module.exports = {
    mpu,
    offset,
    initSensors,
    calibrate,
    readSensors,
};