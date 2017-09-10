const {
  io
} = require('./server');
const {
  mpu,
  offset,
  initSensors,
  calibrate,
  readSensors,
} = require('./sensors');

const GYROSCOPE_SCALE_FACTOR = 131;
const dt = 0.01;
const calibrationSamples = 100;
const sampleRate = 60;
const filterCoefficient = 0.96;

let angleX = 0;
let angleY = 0;
let angleZ = 0;

function start() {
  return initSensors()
    .then(() => calibrate(calibrationSamples))
    .then(() => console.log('Calibration finished and these are the offsets:'))
    .then(() => console.log(offset))
    .then(() => console.log('Application started...'))
    .then(loop);
}

function loop() {
  return new Promise((resolve, reject) => {
    readSensors().then(updateAngles).then(() => {
      io.emit('motion', [angleX, angleY, angleZ]);
      setTimeout(resolve, 1000 / sampleRate);
    });
  }).then(loop);
}

function updateAngles([accRawX, accRawY, accRawZ, gyrRawX, gyrRawY, gyrRawZ]) {
  /**
   * arduino
   * http://www.geekmomprojects.com/mpu-6050-redux-dmp-data-fusion-vs-complementary-filter/
   */
  let gyrX = (gyrRawX - offset.gX) / GYROSCOPE_SCALE_FACTOR;
  let gyrY = (gyrRawY - offset.gY) / GYROSCOPE_SCALE_FACTOR;
  let gyrZ = (gyrRawZ - offset.gZ) / GYROSCOPE_SCALE_FACTOR;
  let accX = accRawX - offset.aX;
  let accY = accRawY - offset.aY;
  let accZ = accRawZ - offset.aZ;

  let accAngleY = Math.atan(-accX / Math.sqrt(Math.pow(accY, 2) + Math.pow(accZ, 2))) * 180 / Math.PI;
  let accAngleX = Math.atan(accY / Math.sqrt(Math.pow(accX, 2) + Math.pow(accZ, 2))) * 180 / Math.PI;
  let accAngleZ = 0;

  let gyrAngleX = gyrX * dt + angleX;
  let gyrAngleY = gyrY * dt + angleY;
  let gyrAngleZ = gyrZ * dt + angleZ;

  angleX = filterCoefficient * gyrAngleX + (1.0 - filterCoefficient) * accAngleX;
  angleY = filterCoefficient * gyrAngleY + (1.0 - filterCoefficient) * accAngleY;
  angleZ = -gyrAngleZ;
}

module.exports = {
  mpu,
  start,
};