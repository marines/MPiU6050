const moment = require('moment');
const fs = require('fs');
const {
  io,
  socket,
  setResetCallback,
} = require('./server');
const {
  mpu,
  offset,
  initSensors,
  calibrate,
  readSensors,
} = require('./sensors');

const GYROSCOPE_SCALE_FACTOR = 65;
const dt = 0.0093;
const calibrationSamples = 500;
const sampleRate = 20;
const filterCoefficient = 0.96;
const smoothingCoefficient = 0.3;

let lastUpdate = 0;
let lastSave = 0;
let resetInProgress = false;

let accX = 0;
let accY = 0;
let accZ = 0;
let angleX = 0;
let angleY = 0;
let angleZ = 0;

let stream;

function start() {
  stream = fs.createWriteStream('log.csv', { flags: 'a' });

  return initSensors()
    .then(() => calibrate(calibrationSamples))
    .then(() => console.log('Calibration finished and these are the offsets:'))
    .then(() => console.log(offset))
    .then(() => console.log('Application started...'))
    .then(loop);
}

function loop() {
  if (resetInProgress) {
    setTimeout(loop, 0);
    return;
  }

  return new Promise((resolve, reject) => {
    readSensors().then(updateAngles).then(() => {
      const now = (new Date()).getTime();
      if (now - lastUpdate > 1000 / sampleRate) {
//        if (now - lastSave > 1000) {
//          console.log('tak');
//          {
//            const data = [moment(now).format('YYYY-MM-DD HH:mm:ss:SSS'), angleX, angleY, angleZ, accX / 16384, accY / 16384, accZ / 16384];
//            stream.write(data.join(';\t') + '\n');
//          }
//          lastSave = now;
//        } else {
//          console.log('nie');
//        }

        io.emit('motion', [angleX, angleY, angleZ, accX / 16384, accY / 16384, accZ / 16384]);
        lastUpdate = now;
      }

      setTimeout(resolve, 10);
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
  accX = accRawX - offset.aX;
  accY = accRawY - offset.aY;
  accZ = accRawZ - offset.aZ;

//  let accAngleY = Math.atan(-accX / Math.sqrt(Math.pow(accY, 2) + Math.pow(accZ, 2))) * 180 / Math.PI;
//  let accAngleX = Math.atan(accY / Math.sqrt(Math.pow(accX, 2) + Math.pow(accZ, 2))) * 180 / Math.PI;
  let accAngleY = Math.atan2(-accX, accZ) * 180 / Math.PI;
  let accAngleX = Math.atan2(accY, accZ) * 180 / Math.PI;
  let accAngleZ = 0;

  let gyrAngleX = gyrX * dt + angleX;
  let gyrAngleY = gyrY * dt + angleY;
  let gyrAngleZ = gyrZ * dt + angleZ + 0.0000521;

  let complementaryAngleX = filterCoefficient * gyrAngleX + (1.0 - filterCoefficient) * accAngleX;
  let complementaryAngleY = filterCoefficient * gyrAngleY + (1.0 - filterCoefficient) * accAngleY;

  angleX = smoothingCoefficient * angleX + (1 - smoothingCoefficient) * complementaryAngleX;
  angleY = smoothingCoefficient * angleY + (1 - smoothingCoefficient) * complementaryAngleY;
  angleZ = smoothingCoefficient * angleZ + (1 - smoothingCoefficient) * gyrAngleZ;
}

function reset() {
  resetInProgress = true;
  console.log('Calibration has been requested...');

  return calibrate(calibrationSamples)
    .then(() => console.log('Calibration finished and these are the offsets:'))
    .then(() => console.log(offset))
    .then(() => {
      angleX = 0;
      angleY = 0;
      angleZ = 0;
      resetInProgress = false;
    });
}

setResetCallback(reset);

module.exports = {
  mpu,
  start,
};
