const { io } = require('../../server');
const exitHandlers = require('../../exit');
var mpu6050 = require('./mpu6050');

// Instantiate and initialize.
var mpu = new mpu6050();
mpu.initialize();

const offset = {
  aX: 0,
  aY: 0,
  aZ: 0,
  gX: 0,
  gY: 0,
  gZ: 0,
};

let angle_x = 0;
let angle_y = 0;
let angle_z = 0;

// Test the connection before using.
mpu.testConnection(function (err, testPassed) {
  if (!testPassed) {
    console.log('Connection failed!');
    return;
  }

  calibrate().then(() => {
    console.log('Calibration finished and these are the offsets:');
    console.log(offset);
  }).then(loop);
});

function round(n) {
  return Math.round(n * 1000) / 1000;
}

function calibrate() {
  console.log('Calibrating the sensor, hold the device in a neutral position...');

  const promises = [];
  for (let i = 0; i < 100; i++) {
    promises.push(readSensors());
  }

  return Promise.all(promises).then((readings) => {
    return readings.reduce((averages, reading) => {
      if (!averages) {
        return reading;
      }

      return averages.map((value, index) => value + (reading[index]));
    }).map((value) => value / 100);
  }).then((calibrationData) => {
    offset.aX = calibrationData[0];
    offset.aY = calibrationData[1];
    offset.aZ = calibrationData[2];
    offset.gX = calibrationData[3];
    offset.gY = calibrationData[4];
    offset.gZ = calibrationData[5];
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

function loop() {
  return new Promise((resolve, reject) => {
    readSensors().then((data) => {
      const [aX, aY, aZ, gX, gY, gZ] = data;

      let dt = 0.01;

/**
 * arduino
 * http://www.geekmomprojects.com/mpu-6050-redux-dmp-data-fusion-vs-complementary-filter/
 */
      let gyro_x = (gX - offset.gX) / 131;
      let gyro_y = (gY - offset.gY) / 131;
      let gyro_z = (gZ - offset.gZ) / 131;
      let accel_x = aX - offset.aX;
      let accel_y = aY - offset.aY;
      let accel_z = aZ - offset.aZ + 16384;

      // console.log([gyro_x, gyro_y, gyro_z, accel_x, accel_y, accel_z]);

      let accel_angle_y = Math.atan(-accel_x / Math.sqrt(Math.pow(accel_y, 2) + Math.pow(accel_z, 2))) * 180 / Math.PI;
      let accel_angle_x = Math.atan(accel_y / Math.sqrt(Math.pow(accel_x, 2) + Math.pow(accel_z, 2))) * 180 / Math.PI;
      let accel_angle_z = 0;

      // console.log([accel_angle_x, accel_angle_y, accel_angle_z]);

      let gyro_angle_x = gyro_x * dt + angle_x;
      let gyro_angle_y = gyro_y * dt + angle_y;
      let gyro_angle_z = gyro_z * dt + angle_z;

      // console.log([gyro_angle_x, gyro_angle_y, gyro_angle_z]);

      let alpha = 0.96;
      angle_x = alpha * gyro_angle_x + (1.0 - alpha) * accel_angle_x;
      angle_y = alpha * gyro_angle_y + (1.0 - alpha) * accel_angle_y;
      angle_z = gyro_angle_z;  //Accelerometer doesn't give z-angle

      // console.log([round(angle_x), round(angle_y), round(-angle_z)].map(n => `                                   ${n}`.slice(-10)).join(', '));

      io.emit('motion', [angle_x, angle_y, -angle_z]);
      setTimeout(resolve, 16); // 33 ~= 30FPS
    });
  }).then(() => loop());
}

exitHandlers.push(() => {
  console.log('go to sleep, sweet prince...');
  // Put the MPU6050 back to sleep.
  mpu.setSleepEnabled(1);
  process.exit(0);
});