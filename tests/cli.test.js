const child_process = require('child_process');
const path = require('path');

function convertToJson(str) {
    // Regular expression to find unquoted keys
    const regexKeys = /(\b\w+\b)(?=:)/g;
    // Regular expression to strip ANSI color codes
    const regexAnsi = /\x1B\[\d+m/g;

    str = str.replace(/'/g, '"').replace(/(\w+):/g, '"$1":')
    // Replace unquoted keys with quoted keys and remove ANSI color codes
    const jsonString = str.replace(regexKeys, '"$1"').replace(regexAnsi, '');

    try {
        // Parse the corrected string into JSON
        const json = JSON.parse(jsonString);
        return json;
    } catch (e) {
        // If an error occurs, log it and return null
        console.error("Error parsing JSON:", e);
        return null;
    }
}



test('DISTINCT with Multiple Columns via CLI', (done) => {
    const cliPath = path.join(__dirname, '..', 'src', 'cli.js');
    const cliProcess = child_process.spawn('node', [cliPath]);

    let outputData = "";
    cliProcess.stdout.on('data', (data) => {
        outputData += data.toString();
    });

    cliProcess.on('exit', () => {
        // Define a regex pattern to extract the JSON result
        const cleanedOutput = outputData.replace(/\s+/g, ' ');

        const resultRegex = /Result: (\[.+\])/s;
        const match = cleanedOutput.match(resultRegex);

        if (match && match[1]) {
            // Parse the captured JSON string
            const results = convertToJson(match[1]);

            // Validation logic
            expect(results).toEqual([
                { student_id: '1', course: 'Mathematics' },
                { student_id: '1', course: 'Physics' },
                { student_id: '2', course: 'Chemistry' },
                { student_id: '3', course: 'Mathematics' },
                { student_id: '5', course: 'Biology' },
                { student_id: '5', course: 'Physics' }
            ]);
        } else {
            done();
            throw new Error('Failed to parse CLI output');
        }

        done();
    });

    // Introduce a delay before sending the query
    setTimeout(() => {
        cliProcess.stdin.write("SELECT DISTINCT student_id, course FROM enrollment\n");
        setTimeout(() => {
            cliProcess.stdin.write("exit\n");
        }, 1000); // 1 second delay
    }, 1000); // 1 second delay
}, 10000);