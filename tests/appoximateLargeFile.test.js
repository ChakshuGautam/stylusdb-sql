const fs = require('fs');
const { executeSELECTQuery } = require('../src/queryExecuter');
const jestConsole = console;

beforeEach(() => {
    global.console = require('console');
});

afterEach(() => {
    global.console = jestConsole;
});

test('Large File Count(*) - Approximate and Exact', async () => {
    // Test Exact Count

    const startMemoryUsageExact = process.memoryUsage().heapUsed;
    const startTimeExact = performance.now();

    const queryExact = "SELECT COUNT(*) FROM student_large";
    const resultExact = await executeSELECTQuery(queryExact);
    const exactResult = resultExact[0]['COUNT(*)'];

    const endTimeExact = performance.now();
    const endMemoryUsageExact = process.memoryUsage().heapUsed;

    console.log(`Execution Time for Exact Count: ${(endTimeExact - startTimeExact).toFixed(2)} ms`);
    console.log(`Start Memory for Exact Count: ${startMemoryUsageExact / 1024 / 1024} MB`);
    console.log(`End Memory for Exact Count: ${endMemoryUsageExact / 1024 / 1024} MB`);
    console.log(`Memory Used for Exact Count: ${(endMemoryUsageExact - startMemoryUsageExact) / 1024 / 1024} MB`);

    const startMemoryUsage = process.memoryUsage().heapUsed;
    const startTime = performance.now();

    const query = "SELECT APPROXIMATE_COUNT(*) FROM student_large";
    const result = await executeSELECTQuery(query);

    // Expect the approximate count to be within 5% of the actual count
    expect(result[0]['APPROXIMATE_COUNT(*)']).toBeGreaterThan(exactResult - 0.05 * exactResult);
    expect(result[0]['APPROXIMATE_COUNT(*)']).toBeLessThan(exactResult + 0.05 * exactResult);

    const endTime = performance.now();
    const endMemoryUsage = process.memoryUsage().heapUsed;

    console.log(`Execution Time for Approximate Count: ${(endTime - startTime).toFixed(2)} ms`);
    console.log(`Start Memory: ${startMemoryUsage / 1024 / 1024} MB`);
    console.log(`End Memory: ${endMemoryUsage / 1024 / 1024} MB`);
    console.log(`Memory Used for Approximate Count: ${(endMemoryUsage - startMemoryUsage) / 1024 / 1024} MB`);

}, 120000);

test('Execute SQL Query with COUNT with DISTINCT on a column', async () => {
    const queryExact = "SELECT COUNT(DISTINCT (name, age)) FROM student_large";
    const resultExact = await executeSELECTQuery(queryExact);
    console.log({ resultExact });
    const exactResult = resultExact[0]['COUNT(DISTINCT (name, age))'];

    const query = "SELECT APPROXIMATE_COUNT(DISTINCT (name, age)) FROM student_large";
    const result = await executeSELECTQuery(query);

    // Expect the approximate count to be within 2% of the actual count
    expect(result[0]['APPROXIMATE_COUNT(DISTINCT (name, age))']).toBeGreaterThan(exactResult - 0.05 * exactResult);
    expect(result[0]['APPROXIMATE_COUNT(DISTINCT (name, age))']).toBeLessThan(exactResult + 0.05 * exactResult);
}, 120000);