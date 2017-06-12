const { io } = require('../../server');
const exitHandlers = require('../../exit');
var mpu6050 = require('./mpu6050');

// Instantiate and initialize.
var mpu = new mpu6050();
mpu.initialize();

// Test the connection before using.
mpu.testConnection(function(err, testPassed) {
  if (!testPassed) {
    console.log('Connection failed!');
    return;
  }

  chain();
});

let n_accX, n_accY, n_accZ;
let n_gyrX, n_gyrY, n_gyrZ;

function chain() {
  return new Promise((resolve, reject) => {
    mpu.getMotion6((err, data) => {
      const [ accX, accY, accZ, gyrX, gyrY, gyrZ ] = data;

      n_accX = 0.5 * (n_accX || accX) + 0.5 * accX;
      n_accY = 0.5 * (n_accY || accY) + 0.5 * accY;
      n_accZ = 0.5 * (n_accZ || accZ) + 0.5 * accZ;

      n_gyrX = 0.5 * (n_gyrX || gyrX) + 0.5 * gyrX;
      n_gyrY = 0.5 * (n_gyrY || gyrY) + 0.5 * gyrY;
      n_gyrZ = 0.5 * (n_gyrZ || gyrZ) + 0.5 * gyrZ;

      const output = {
        accX: n_accX / 16384.0 * 9.81,
        accY: n_accY / 16384.0 * 9.81,
        accZ: n_accZ / 16384.0 * 9.81,

        gyrX: n_gyrX / 131.0,
        gyrY: n_gyrY / 131.0,
        gyrZ: n_gyrZ / 131.0,
      };

      io.emit('motion', output);
      setTimeout(resolve, 16);
    });
  }).then(() => chain());
}

exitHandlers.push(() => {
  console.log('go to sleep, sweet prince...');
  // Put the MPU6050 back to sleep.
  mpu.setSleepEnabled(1);
  process.exit(0);
});