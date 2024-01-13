const { executeINSERTQuery } = require('../src/queryExecuter');
const { readCSV, writeCSV } = require('../src/csvStorage');
const fs = require('fs');

// Helper function to create grades.csv with initial data
async function createGradesCSV() {
    const initialData = [
        { student_id: '1', course: 'Mathematics', grade: 'A' },
        { student_id: '2', course: 'Chemistry', grade: 'B' },
        { student_id: '3', course: 'Mathematics', grade: 'C' }
    ];
    await writeCSV('grades.csv', initialData);
}

// Test to INSERT a new grade and verify
test('Execute INSERT INTO Query for grades.csv', async () => {
    // Create grades.csv with initial data
    await createGradesCSV();

    // Execute INSERT statement
    const insertQuery = "INSERT INTO grades (student_id, course, grade) VALUES ('4', 'Physics', 'A')";
    await executeINSERTQuery(insertQuery);

    // Verify the new entry
    const updatedData = await readCSV('grades.csv');
    const newEntry = updatedData.find(row => row.student_id === '4' && row.course === 'Physics');
    console.log(updatedData)
    expect(newEntry).toBeDefined();
    expect(newEntry.grade).toEqual('A');

    // Cleanup: Delete grades.csv
    fs.unlinkSync('grades.csv');
});