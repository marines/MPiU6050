const { io } = require('./server');
// const engineNode = require('./lib/node');
// const engineCpp = require('./lib/cpp');
const engineInvensense = require('./lib/invensense');
const exitHandlers = require('./exit');

function gracefulExit() {
    console.log('Shutting down...');
    exitHandlers.forEach(handler => handler());
}

process.on('SIGTERM', gracefulExit);
process.on('SIGINT', gracefulExit);
