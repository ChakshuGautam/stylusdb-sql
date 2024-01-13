#!/usr/bin/env node

const readline = require('readline');
const { executeSELECTQuery, executeINSERTQuery, executeDELETEQuery } = require('./index');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.setPrompt('SQL> ');
console.log('SQL Query Engine CLI. Enter your SQL commands, or type "exit" to quit.');

rl.prompt();

rl.on('line', async (line) => {
    if (line.toLowerCase() === 'exit') {
        rl.close();
        return;
    }

    try {
        if (line.toLowerCase().startsWith('select')) {
            const result = await executeSELECTQuery(line);
            console.log('Result:', result);
        } else if (line.toLowerCase().startsWith('insert into')) {
            const result = await executeINSERTQuery(line);
            console.log(result.message);
        } else if (line.toLowerCase().startsWith('delete from')) {
            const result = await executeDELETEQuery(line);
            console.log(result.message);
        } else {
            console.log('Unsupported command');
        }
    } catch (error) {
        console.error('Error:', error.message);
    }

    rl.prompt();
}).on('close', () => {
    console.log('Exiting SQL CLI');
    process.exit(0);
});