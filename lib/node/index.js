const { io } = require('../../server');
const exitHandlers = require('../../exit');
var mpu6050 = require('./mpu6050');

// Instantiate and initialize.
var mpu = new mpu6050();
mpu.initialize();

let dt;
let last;

// Test the connection before using.
mpu.testConnection(function (err, testPassed) {
  if (!testPassed) {
    console.log('Connection failed!');
    return;
  }

  last = (new Date()).getTime();
  dt = 0;

  loop();
});

let n_accX, n_accY, n_accZ;
let n_gyrX, n_gyrY, n_gyrZ;
let pitch, roll, yaw;


function round(n) {
  return Math.round(n * 1000) / 1000;
}

function loop() {
  return new Promise((resolve, reject) => {
    mpu.getMotion6((err, data) => {
      const [aX, aY, aZ, gX, gY, gZ] = data;

      const offset = {
        aX: -450,
        aY: -190,
        aZ: 1680,
        gX: -410,
        gY: 255,
        gZ: 595,
      };

      const gain = {
        aX: 16384,
        aY: 16384,
        aZ: 16384,
        gX: 16.4,
        gY: 16.4,
        gZ: 16.4,
      };

      const calculated = [
        round((aX - offset.aX) / gain.aX),
        round((aY - offset.aY) / gain.aY),
        round((aZ - offset.aZ) / gain.aZ) - 1,
        round((gX - offset.gX) / gain.gX),
        round((gY - offset.gY) / gain.gY),
        round((gZ - offset.gZ) / gain.gZ),
      ];
/**
 * atan2
 *
 */
      const now = (new Date()).getTime();
      dt = 0.01; //now - last;
      last = now;
      // calculated.unshift(dt)
      // console.log(calculated.map(n => `                                   ${n}`.slice(-8)).join(', '));
/*
      if (pitch === undefined) {
        pitch = calculated[3] * dt;
      } else {
        pitch += calculated[3] * dt;
      }

      if (roll === undefined) {
        roll = calculated[4] * dt;
      } else {
        roll -= calculated[4] * dt;
      }


      let approx = Math.abs(calculated[0]) + Math.abs(calculated[1]) + Math.abs(calculated[2]);
      if (approx > 0.5 && approx < 2) {
        console.log('APPROX ' + approx);
        let pitchAcc = Math.atan2(calculated[1], calculated[2]) * 180 / Math.PI;
        pitch = pitch * 0.98 + pitchAcc * 0.02;

        let rollAcc = Math.atan2(calculated[0], calculated[2]) * 180 / Math.PI;
        roll = roll * 0.98 + rollAcc * 0.02;
      }

      // console.log([round(pitch), round(roll)].map(n => `                                   ${n}`.slice(-8)).join(', '));
*/
/**
 * arduino
 * http://www.geekmomprojects.com/mpu-6050-redux-dmp-data-fusion-vs-complementary-filter/
 */
      let gyro_x = (gX - offset.gX) / 131; // gain.gX;
      let gyro_y = (gY - offset.gY) / 131; // gain.gY;
      let gyro_z = (gZ - offset.gZ) / 131; // gain.gZ;
      let accel_x = aX;
      let accel_y = aY;
      let accel_z = aZ;

      // console.log([gyro_x, gyro_y, gyro_z, accel_x, accel_y, accel_z]);

      let accel_angle_y = Math.atan(-1 * accel_x / Math.sqrt(Math.pow(accel_y, 2) + Math.pow(accel_z, 2))) * 180 / Math.PI;
      let accel_angle_x = Math.atan(accel_y / Math.sqrt(Math.pow(accel_x, 2) + Math.pow(accel_z, 2))) * 180 / Math.PI;
      let accel_angle_z = 0;

      // console.log([accel_angle_x, accel_angle_y, accel_angle_z]);

      let gyro_angle_x = gyro_x * dt + get_last_x_angle();
      let gyro_angle_y = gyro_y * dt + get_last_y_angle();
      let gyro_angle_z = gyro_z * dt + get_last_z_angle();

      // console.log([gyro_angle_x, gyro_angle_y, gyro_angle_z]);

      let unfiltered_gyro_angle_x = gyro_x*dt + get_last_gyro_x_angle();
      let unfiltered_gyro_angle_y = gyro_y*dt + get_last_gyro_y_angle();
      let unfiltered_gyro_angle_z = gyro_z*dt + get_last_gyro_z_angle();

      // Apply the complementary filter to figure out the change in angle - choice of alpha is
      // estimated now.  Alpha depends on the sampling rate...
      let alpha = 0.96;
      let angle_x = alpha*gyro_angle_x + (1.0 - alpha)*accel_angle_x;
      let angle_y = alpha*gyro_angle_y + (1.0 - alpha)*accel_angle_y;
      let angle_z = gyro_angle_z;  //Accelerometer doesn't give z-angle

      setLastRead(null, angle_x, angle_y, angle_z, unfiltered_gyro_angle_x, unfiltered_gyro_angle_y, unfiltered_gyro_angle_z);

      // console.log([round(angle_x), round(angle_y), round(-angle_z)].map(n => `                                   ${n}`.slice(-10)).join(', '));


      io.emit('motion', [round(angle_x), round(angle_y), round(-angle_z)]);
      setTimeout(resolve, 16); // 33 ~= 30FPS
    });
  }).then(() => loop());
}

let last_read_time, last_x_angle, last_y_angle, last_z_angle, last_gyro_x_angle, last_gyro_y_angle, last_gyro_z_angle;

function setLastRead(time, x, y, z, x_gyro, y_gyro, z_gyro) {
  last_read_time = time;
  last_x_angle = x;
  last_y_angle = y;
  last_z_angle = z;
  last_gyro_x_angle = x_gyro;
  last_gyro_y_angle = y_gyro;
  last_gyro_z_angle = z_gyro;
}
function get_last_x_angle() {return last_x_angle || 0;}
function get_last_y_angle() {return last_y_angle || 0;}
function get_last_z_angle() {return last_z_angle || 0;}
function get_last_gyro_x_angle() {return last_gyro_x_angle || 0;}
function get_last_gyro_y_angle() {return last_gyro_y_angle || 0;}
function get_last_gyro_z_angle() {return last_gyro_z_angle || 0;}

exitHandlers.push(() => {
  console.log('go to sleep, sweet prince...');
  // Put the MPU6050 back to sleep.
  mpu.setSleepEnabled(1);
  process.exit(0);
});