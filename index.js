var mpu6050 = require('mpu6050');

// Instantiate and initialize.
var mpu = new mpu6050();
mpu.initialize();

// Test the connection before using.
mpu.testConnection(function(err, testPassed) {
  if (testPassed) {
    let i = 0;

    function chain() {
      console.log('pomiar ' + i++);

      return new Promise((resolve, reject) => {
        mpu.getMotion6(function(err, data){
          console.log(data);
          resolve();
        });
      }).then(() => chain());
    }

    chain();
  }
});

process.on('SIGTERM', function () {
  console.log('go to sleep, sweet prince...');
  // Put the MPU6050 back to sleep.
  mpu.setSleepEnabled(1);
  process.exit(0);
});

process.on('SIGINT', function () {
  console.log('go to sleep, sweet prince...');
  // Put the MPU6050 back to sleep.
  mpu.setSleepEnabled(1);
  process.exit(0);
});
