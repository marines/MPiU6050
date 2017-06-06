var mpu6050 = require('./mpu6050');

// Instantiate and initialize.
var mpu = new mpu6050();
mpu.initialize();

// Test the connection before using.
mpu.testConnection(function(err, testPassed) {
  if (testPassed) {
    const { io } = require('./server');

    let n_accX, n_accY, n_accZ;

    function chain() {
      return new Promise((resolve, reject) => {
        mpu.getMotion6(function(err, data){
          const [ accX, accY, accZ, gyrX, gyrY, gyrZ ] = data;

          n_accX = 0.6 * (n_accX || accX) + 0.4 * accX;
          n_accY = 0.6 * (n_accY || accY) + 0.4 * accY;
          n_accZ = 0.6 * (n_accZ || accZ) + 0.4 * accZ;
          const output = {
            accX: n_accX / 16384.0 * 9.81,
            accY: n_accY / 16384.0 * 9.81,
            accZ: n_accZ / 16384.0 * 9.81,

            gyrX: Math.round(gyrX / 131.0),
            gyrY: Math.round(gyrY / 131.0),
            gyrZ: Math.round(gyrZ / 131.0),
          };

          io.emit('motion', output);
          setTimeout(resolve, 16);
        });
      }).then(() => chain());
    }

    chain();
  }
});

function gracefulExit() {
  console.log('go to sleep, sweet prince...');
  // Put the MPU6050 back to sleep.
  mpu.setSleepEnabled(1);
  process.exit(0);
}
process.on('SIGTERM', gracefulExit);
process.on('SIGINT', gracefulExit);
