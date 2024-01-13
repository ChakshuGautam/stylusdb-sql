const { executeDELETEQuery } = require('../src/queryExecuter');
const { readCSV, writeCSV } = require('../src/csvStorage');
const fs = require('fs');

// Helper function to create courses.csv with initial data
async function createCoursesCSV() {
    const initialData = [
        { course_id: '1', course_name: 'Mathematics', instructor: 'Dr. Smith' },
        { course_id: '2', course_name: 'Chemistry', instructor: 'Dr. Jones' },
        { course_id: '3', course_name: 'Physics', instructor: 'Dr. Taylor' }
    ];
    await writeCSV('courses.csv', initialData);
}

// Test to DELETE a course and verify
test('Execute DELETE FROM Query for courses.csv', async () => {
    // Create courses.csv with initial data
    await createCoursesCSV();

    // Execute DELETE statement
    const deleteQuery = "DELETE FROM courses WHERE course_id = '2'";
    await executeDELETEQuery(deleteQuery);

    // Verify the course was removed
    const updatedData = await readCSV('courses.csv');
    const deletedCourse = updatedData.find(course => course.course_id === '2');
    expect(deletedCourse).toBeUndefined();

    // Cleanup: Delete courses.csv
    fs.unlinkSync('courses.csv');
});
