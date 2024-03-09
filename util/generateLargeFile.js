const fs = require('fs');
const { faker, da } = require('@faker-js/faker');
const { parse } = require('json2csv');

async function generateLargeCSV(filename) {
    let data = [];
    for (let i = 1; i <= 10_000_000; i++) {
        const record = {
            id: i,
            name: faker.person.firstName(),
            age: faker.number.int({ min: 18, max: 100 }),
        };
        data.push(record);

        let rows;
        if (i % 500_000 === 0) {
            console.log(`Generated ${i} records`);
            if (!fs.existsSync(filename)) {
                rows = parse(data, { header: true });
            } else {
                // Rows without headers.
                rows = parse(data, { header: false });
            }
            fs.appendFileSync(filename, rows);
            data = [];
        }

    }
    // Append file function can create new file too.

    // Always add new line if file already exists.
    fs.appendFileSync(filename, "\r\n");
}

generateLargeCSV('student_large.csv')