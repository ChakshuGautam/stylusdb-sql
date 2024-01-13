const child_process = require('child_process');
const path = require('path');

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
        // Fix JSON outputput
        match[1] = match[1].replace(/'/g, '"').replace(/(\w+):/g, '"$1":');

        if (match && match[1]) {
          console.log(match[1]);
          console.log(typeof match[1])
            // Parse the captured JSON string
            // const results = JSON.parse(match[1]);

            // Validation logic
            expect(JSON.parse(match[1])).toEqual //("[ { \"student_id\": \"1\", \"course\": \"Mathematics\" }, { \"student_id\": \"1\", \"course\": \"Physics\" }, { \"student_id\": \"2\", \"course\": \"Chemistry\" }, { \"student_id\": \"3\", \"course\": \"Mathematics\" }, { \"student_id\": \"5\", \"course\": \"Biology\" } ]")
            ([
                { student_id: '1', course: 'Mathematics' },
                { student_id: '1', course: 'Physics' },
                { student_id: '2', course: 'Chemistry' },
                { student_id: '3', course: 'Mathematics' },
                { student_id: '5', course: 'Biology' },
            ]);
            console.log("Test passed successfully");
        } else {
          done()
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
});