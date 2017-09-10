console.log(' - starting sensor node engine...');
const engineNode = require('./lib/node');
console.log(' - preparing exit handlers...');
const exitHandlers = require('./exit');

function gracefulExit(code) {
    return function () {
        console.log('Got ' + code + '. Shutting down...');
        exitHandlers.forEach(handler => handler());
    }
}

process.on('SIGTERM', gracefulExit('SIGTERM'));
process.on('SIGINT', gracefulExit('SIGINT'));
