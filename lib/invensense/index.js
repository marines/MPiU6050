const addon = require('bindings')('ms_open.node');
const {
    io
} = require('../../server');

addon.ms_open();

chain();

function chain() {
    return new Promise((resolve, reject) => {
        addon.ms_update();

        const roll = addon.roll();
        const pitch = addon.pitch();
        const yaw = addon.yaw();

        const output = {
            roll,
            pitch,
            yaw,
        };

        // console.log(output);
        io.emit('motion2', output);

        setTimeout(resolve, 5);
    }).then(() => chain());
}