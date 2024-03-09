const fs = require('fs');
const csv = require('csv-parser');
const { parse } = require('json2csv');
const hll = require('hll');

function readCSV(filePath) {
    const results = [];
    var h = hll();

    return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => {
                resolve(results);
            })
            .on('error', (error) => {
                reject(error);
            });
    });
}

function readCSVForHLL(filePath, bitSampleSize = 12, digestSize = 128) {
    const results = [];
    var h = hll({ bitSampleSize: bitSampleSize, digestSize: digestSize });

    return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => h.insert(JSON.stringify(data)))
            .on('end', () => {
                resolve(h);
            })
            .on('error', (error) => {
                reject(error);
            });
    });
}

async function writeCSV(filename, data) {
    const csv = parse(data);
    fs.writeFileSync(filename, csv);
}

module.exports = { readCSV, readCSVForHLL, writeCSV };