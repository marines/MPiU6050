var mpu = require('mpu6050-dmp');
const {
    io
} = require('../../server');

if (mpu.initialize()) {
    chain();
}

function chain() {
    return new Promise((resolve, reject) => {
        const a = mpu.getAttitude();
        const r = mpu.getRotation();


        const output = {
            roll: a.roll,
            pitch: a.pitch,
            yaw: a.yaw,

            roll2: r.roll,
            pitch2: r.pitch,
            yaw2: r.yaw,
        };

        if (a.roll && a.pitch && a.yaw) {
            console.log(a);
            io.emit('motion2', output);
        }

        setTimeout(resolve, 100);
    }).then(() => chain());
}