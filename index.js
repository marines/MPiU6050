console.log('Starting the app...');
const { mpu, start } = require('./app');

function gracefulExit(code) {
    return function () {
        console.log(`Got ${code}.`);
        console.log('Go to sleep, sweet prince...');
        // Put the MPU6050 back to sleep.
        mpu.setSleepEnabled(1);
        process.exit(0);
    }
}

process.on('SIGTERM', gracefulExit('SIGTERM'));
process.on('SIGINT', gracefulExit('SIGINT'));

start();