const moment = require('moment');
const fs = require('fs');

console.log('lul');
var lineReader = require('readline').createInterface({
    input: require('fs').createReadStream('log.csv'),
});
console.log('lul');
const data = {};

let i = 0;

lineReader.on('line', function (line) {
    const [time, ...reads] = line.split(';\t');
    const Time = moment(time, 'YYYY-MM-DD HH:mm:ss:SSS');
    Time.set('ms', 0);
    const iso = Time.toISOString();
    if (!data[iso]) {
        data[iso] = {
            sum: reads.map(val => parseFloat(val)),
            n: 1,
        };
    } else {
        data[iso].sum = data[iso].sum.map((val, i) => val + parseFloat(reads[i]));
        data[iso].n++;
    }

    if (i++ % 1000) {
        console.log(i);
    }
    // console.log(data);
});

lineReader.on('close', function () {
    console.log(data.length);
});

console.log(data.length)
console.log('lul');
/*
const contents = fs.readFileSync('log.csv').toString();

const log = contents.split('\n')
    .map(line => line.split(';\t'));
//    .reduce

const grouppedData = log.reduce((acc, curr) => {
    const time = moment(curr[0], 'YYYY-MM-DD HH:mm:ss:SSS');
    time.set('ms', 0);
    // console.log(time);
    if (!acc[time]) acc[time] = [];
    acc[time].push(curr);
    return acc;
}, {});

Object.keys(grouppedData).forEach(second => {
    grouppedData[second] = grouppedData[second].reduce((avgs, curr) => {
        if (!avgs) return curr;
        return avgs.map((avg, i) => avg + curr[i]);
    }).map(val => val / grouppedData[second].length).unshift(second).join(';\t');
});


console.log(Object.values(grouppedData).map(d => d.join('\n')));*/