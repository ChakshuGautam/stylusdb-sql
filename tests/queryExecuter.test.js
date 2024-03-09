const { executeSELECTQuery } = require('../src/queryExecuter');

test('Execute SQL Query', async () => {
    const query = 'SELECT id, name FROM student';
    const result = await executeSELECTQuery(query);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty('id');
    expect(result[0]).toHaveProperty('name');
    expect(result[0]).not.toHaveProperty('age');
    expect(result[0]).toEqual({ id: '1', name: 'John' });
});

test('Execute SQL Query with WHERE Clause', async () => {
    const query = 'SELECT id, name FROM student WHERE age = 25';
    const result = await executeSELECTQuery(query);
    expect(result.length).toBe(1);
    expect(result[0]).toHaveProperty('id');
    expect(result[0]).toHaveProperty('name');
    expect(result[0].id).toBe('2');
});

test('Execute SQL Query with Complex WHERE Clause', async () => {
    const query = 'SELECT id, name FROM student WHERE age = 30 AND name = John';
    const result = await executeSELECTQuery(query);
    expect(result.length).toBe(1);
    expect(result[0]).toEqual({ id: '1', name: 'John' });
});

test('Execute SQL Query with Greater Than', async () => {
    const queryWithGT = 'SELECT id FROM student WHERE age > 22';
    const result = await executeSELECTQuery(queryWithGT);
    expect(result.length).toEqual(3);
    expect(result[0]).toHaveProperty('id');
});

test('Execute SQL Query with Not Equal to', async () => {
    const queryWithGT = 'SELECT name FROM student WHERE age != 25';
    const result = await executeSELECTQuery(queryWithGT);
    expect(result.length).toEqual(4);
    expect(result[0]).toHaveProperty('name');
});

test('Execute SQL Query with INNER JOIN', async () => {
    const query = 'SELECT student.name, enrollment.course FROM student INNER JOIN enrollment ON student.id=enrollment.student_id';
    const result = await executeSELECTQuery(query);
    expect(result.length).toEqual(6);
    // toHaveProperty is not working here due to dot in the property name
    expect(result[0]).toEqual(expect.objectContaining({
        "enrollment.course": "Mathematics",
        "student.name": "John"
    }));
});

test('Execute SQL Query with INNER JOIN and a WHERE Clause', async () => {
    const query = 'SELECT student.name, enrollment.course, student.age FROM student INNER JOIN enrollment ON student.id = enrollment.student_id WHERE student.age > 25';
    const result = await executeSELECTQuery(query);
    /*
    result =  [
      {
        'student.name': 'John',
        'enrollment.course': 'Mathematics',
        'student.age': '30'
      },
      {
        'student.name': 'John',
        'enrollment.course': 'Physics',
        'student.age': '30'
      }
    ]
    */
    expect(result.length).toEqual(2);
    // toHaveProperty is not working here due to dot in the property name
    expect(result[0]).toEqual(expect.objectContaining({
        "enrollment.course": "Mathematics",
        "student.name": "John"
    }));
});

test('Execute SQL Query with LEFT JOIN', async () => {
    const query = 'SELECT student.name, enrollment.course FROM student LEFT JOIN enrollment ON student.id=enrollment.student_id';
    const result = await executeSELECTQuery(query);
    expect(result).toEqual(expect.arrayContaining([
        expect.objectContaining({ "student.name": "Alice", "enrollment.course": null }),
        expect.objectContaining({ "student.name": "John", "enrollment.course": "Mathematics" })
    ]));
    expect(result.length).toEqual(7); // 4 students, but John appears twice
});

test('Execute SQL Query with RIGHT JOIN', async () => {
    const query = 'SELECT student.name, enrollment.course FROM student RIGHT JOIN enrollment ON student.id=enrollment.student_id';
    const result = await executeSELECTQuery(query);
    expect(result).toEqual(expect.arrayContaining([
        expect.objectContaining({ "enrollment.course": "Mathematics", "student.name": "John" }),
        expect.objectContaining({ "student.name": "John", "enrollment.course": "Mathematics" })
    ]));
    expect(result.length).toEqual(6); // 4 courses, but Mathematics appears twice
});

test('Execute SQL Query with LEFT JOIN with a WHERE clause filtering the main table', async () => {
    const query = 'SELECT student.name, enrollment.course FROM student LEFT JOIN enrollment ON student.id=enrollment.student_id WHERE student.age > 22';
    const result = await executeSELECTQuery(query);
    expect(result).toEqual(expect.arrayContaining([
        expect.objectContaining({ "enrollment.course": "Mathematics", "student.name": "John" }),
        expect.objectContaining({ "enrollment.course": "Physics", "student.name": "John" })
    ]));
    expect(result.length).toEqual(4);
});

test('Execute SQL Query with LEFT JOIN with a WHERE clause filtering the join table', async () => {
    const query = `SELECT student.name, enrollment.course FROM student LEFT JOIN enrollment ON student.id=enrollment.student_id WHERE enrollment.course = 'Physics'`;
    const result = await executeSELECTQuery(query);
    expect(result).toEqual(expect.arrayContaining([
        expect.objectContaining({ "student.name": "John", "enrollment.course": "Physics" })
    ]));
    expect(result.length).toEqual(2);
});

test('Execute SQL Query with RIGHT JOIN with a WHERE clause filtering the main table', async () => {
    const query = 'SELECT student.name, enrollment.course FROM student RIGHT JOIN enrollment ON student.id=enrollment.student_id WHERE student.age < 25';
    const result = await executeSELECTQuery(query);
    expect(result).toEqual(expect.arrayContaining([
        expect.objectContaining({ "enrollment.course": "Mathematics", "student.name": "Bob" }),
        expect.objectContaining({ "enrollment.course": "Biology", "student.name": "Jane" })
    ]));
    expect(result.length).toEqual(3);
});

test('Execute SQL Query with RIGHT JOIN with a WHERE clause filtering the join table', async () => {
    const query = `SELECT student.name, enrollment.course FROM student RIGHT JOIN enrollment ON student.id=enrollment.student_id WHERE enrollment.course = 'Chemistry'`;
    const result = await executeSELECTQuery(query);
    expect(result).toEqual(expect.arrayContaining([
        expect.objectContaining({ "enrollment.course": "Chemistry", "student.name": "Jane" }),
    ]));
    expect(result.length).toEqual(1);
});

test('Execute SQL Query with RIGHT JOIN with a multiple WHERE clauses filtering the join table and main table', async () => {
    const query = `SELECT student.name, enrollment.course FROM student RIGHT JOIN enrollment ON student.id=enrollment.student_id WHERE enrollment.course = 'Chemistry' AND student.age = 26`;
    const result = await executeSELECTQuery(query);
    expect(result).toEqual([]);
});

test('Execute COUNT Aggregate Query', async () => {
    const query = 'SELECT COUNT(*) FROM student';
    const result = await executeSELECTQuery(query);
    expect(result).toEqual([{ 'COUNT(*)': 5 }]);
});

test('Execute SUM Aggregate Query', async () => {
    const query = 'SELECT SUM(age) FROM student';
    const result = await executeSELECTQuery(query);
    expect(result).toEqual([{ 'SUM(age)': 123 }]);
});

test('Execute AVG Aggregate Query', async () => {
    const query = 'SELECT AVG(age) FROM student';
    const result = await executeSELECTQuery(query);
    // Assuming AVG returns a single decimal point value
    expect(result).toEqual([{ 'AVG(age)': 24.6 }]);
});

test('Execute MIN Aggregate Query', async () => {
    const query = 'SELECT MIN(age) FROM student';
    const result = await executeSELECTQuery(query);
    expect(result).toEqual([{ 'MIN(age)': 22 }]);
});

test('Execute MAX Aggregate Query', async () => {
    const query = 'SELECT MAX(age) FROM student';
    const result = await executeSELECTQuery(query);
    expect(result).toEqual([{ 'MAX(age)': 30 }]);
});

test('Count students per age', async () => {
    const query = 'SELECT age, COUNT(*) FROM student GROUP BY age';
    const result = await executeSELECTQuery(query);
    expect(result).toEqual([
        { age: '22', 'COUNT(*)': 2 },
        { age: '24', 'COUNT(*)': 1 },
        { age: '25', 'COUNT(*)': 1 },
        { age: '30', 'COUNT(*)': 1 }
    ]);
});

test('Count enrollments per course', async () => {
    const query = 'SELECT course, COUNT(*) FROM enrollment GROUP BY course';
    const result = await executeSELECTQuery(query);
    expect(result).toEqual([
        { course: 'Mathematics', 'COUNT(*)': 2 },
        { course: 'Physics', 'COUNT(*)': 2 },
        { course: 'Chemistry', 'COUNT(*)': 1 },
        { course: 'Biology', 'COUNT(*)': 1 }
    ]);
});


test('Count courses per student', async () => {
    const query = 'SELECT student_id, COUNT(*) FROM enrollment GROUP BY student_id';
    const result = await executeSELECTQuery(query);
    expect(result).toEqual([
        { student_id: '1', 'COUNT(*)': 2 },
        { student_id: '2', 'COUNT(*)': 1 },
        { student_id: '3', 'COUNT(*)': 1 },
        { student_id: '5', 'COUNT(*)': 2 }
    ]);
});

test('Count students within a specific age range', async () => {
    const query = 'SELECT age, COUNT(*) FROM student WHERE age > 22 GROUP BY age';
    const result = await executeSELECTQuery(query);
    expect(result).toEqual([
        { age: '24', 'COUNT(*)': 1 },
        { age: '25', 'COUNT(*)': 1 },
        { age: '30', 'COUNT(*)': 1 }
    ]);
});

test('Count enrollments for a specific course', async () => {
    const query = 'SELECT course, COUNT(*) FROM enrollment WHERE course = "Mathematics" GROUP BY course';
    const result = await executeSELECTQuery(query);
    expect(result).toEqual([
        { course: 'Mathematics', 'COUNT(*)': 2 }
    ]);
});

test('Count courses for a specific student', async () => {
    const query = 'SELECT student_id, COUNT(*) FROM enrollment WHERE student_id = 1 GROUP BY student_id';
    const result = await executeSELECTQuery(query);
    expect(result).toEqual([
        { student_id: '1', 'COUNT(*)': 2 }
    ]);
});

test('Average age of students above a certain age', async () => {
    const query = 'SELECT AVG(age) FROM student WHERE age > 22';
    const result = await executeSELECTQuery(query);
    const expectedAverage = (25 + 30 + 24) / 3; // Average age of students older than 22
    expect(result).toEqual([{ 'AVG(age)': expectedAverage }]);
});

test('Execute SQL Query with ORDER BY', async () => {
    const query = 'SELECT name FROM student ORDER BY name ASC';
    const result = await executeSELECTQuery(query);

    expect(result).toStrictEqual([
        { name: 'Alice' },
        { name: 'Bob' },
        { name: 'Jane' },
        { name: 'Jane' },
        { name: 'John' }
    ]);
});

test('Execute SQL Query with ORDER BY and WHERE', async () => {
    const query = 'SELECT name FROM student WHERE age > 24 ORDER BY name DESC';
    const result = await executeSELECTQuery(query);

    expect(result).toStrictEqual([
        { name: 'John' },
        { name: 'Jane' },
    ]);
});
test('Execute SQL Query with ORDER BY and GROUP BY', async () => {
    const query = 'SELECT COUNT(id) as count, age FROM student GROUP BY age ORDER BY age DESC';
    const result = await executeSELECTQuery(query);

    expect(result).toStrictEqual([
        { age: '30', 'COUNT(id) as count': 1 },
        { age: '25', 'COUNT(id) as count': 1 },
        { age: '24', 'COUNT(id) as count': 1 },
        { age: '22', 'COUNT(id) as count': 2 }
    ]);
});

test('Execute SQL Query with standard LIMIT clause', async () => {
    const query = 'SELECT id, name FROM student LIMIT 2';
    const result = await executeSELECTQuery(query);
    expect(result.length).toEqual(2);
});

test('Execute SQL Query with LIMIT clause equal to total rows', async () => {
    const query = 'SELECT id, name FROM student LIMIT 4';
    const result = await executeSELECTQuery(query);
    expect(result.length).toEqual(4);
});

test('Execute SQL Query with LIMIT clause exceeding total rows', async () => {
    const query = 'SELECT id, name FROM student LIMIT 10';
    const result = await executeSELECTQuery(query);
    expect(result.length).toEqual(5); // Total rows in student.csv
});

test('Execute SQL Query with LIMIT 0', async () => {
    const query = 'SELECT id, name FROM student LIMIT 0';
    const result = await executeSELECTQuery(query);
    expect(result.length).toEqual(0);
});

test('Execute SQL Query with LIMIT and ORDER BY clause', async () => {
    const query = 'SELECT id, name FROM student ORDER BY age DESC LIMIT 2';
    const result = await executeSELECTQuery(query);
    expect(result.length).toEqual(2);
    expect(result[0].name).toEqual('John');
    expect(result[1].name).toEqual('Jane');
});

test('Error Handling with Malformed Query', async () => {
    const query = 'SELECT FROM table'; // intentionally malformed
    await expect(executeSELECTQuery(query)).rejects.toThrow("Error executing query: Query parsing error: Invalid SELECT format");
});

test('Basic DISTINCT Usage', async () => {
    const query = 'SELECT DISTINCT age FROM student';
    const result = await executeSELECTQuery(query);
    expect(result).toEqual([{ age: '30' }, { age: '25' }, { age: '22' }, { age: '24' }]);
});

test('DISTINCT with Multiple Columns', async () => {
    const query = 'SELECT DISTINCT student_id, course FROM enrollment';
    const result = await executeSELECTQuery(query);
    // Expecting unique combinations of student_id and course
    expect(result).toEqual([
        { student_id: '1', course: 'Mathematics' },
        { student_id: '1', course: 'Physics' },
        { student_id: '2', course: 'Chemistry' },
        { student_id: '3', course: 'Mathematics' },
        { student_id: '5', course: 'Biology' },
        { student_id: '5', course: 'Physics' }
    ]);
});

// Not a good test right now
test('DISTINCT with WHERE Clause', async () => {
    const query = 'SELECT DISTINCT course FROM enrollment WHERE student_id = "1"';
    const result = await executeSELECTQuery(query);
    // Expecting courses taken by student with ID 1
    expect(result).toEqual([{ course: 'Mathematics' }, { course: 'Physics' }]);
});

test('DISTINCT with JOIN Operations', async () => {
    const query = 'SELECT DISTINCT student.name FROM student INNER JOIN enrollment ON student.id = enrollment.student_id';
    const result = await executeSELECTQuery(query);
    // Expecting names of students who are enrolled in any course
    expect(result).toEqual([{ "student.name": 'John' }, { "student.name": 'Jane' }, { "student.name": 'Bob' }]);
});

test('DISTINCT with ORDER BY and LIMIT', async () => {
    const query = 'SELECT DISTINCT age FROM student ORDER BY age DESC LIMIT 2';
    const result = await executeSELECTQuery(query);
    // Expecting the two highest unique ages
    expect(result).toEqual([{ age: '30' }, { age: '25' }]);
});

// Not supported yet; Add a TODO/fix here;
// test('DISTINCT on All Columns', async () => {
//     const query = 'SELECT DISTINCT * FROM student';
//     const result = await executeSELECTQuery(query);
//     // Expecting all rows from student.csv as they are all distinct
//     expect(result).toEqual([
//         { id: '1', name: 'John', age: '30' },
//         { id: '2', name: 'Jane', age: '25' },
//         { id: '3', name: 'Bob', age: '22' },
//         { id: '4', name: 'Alice', age: '24' }
//     ]);
// });

// Not supported yet; Add a TODO/fix here;
// test('Error with DISTINCT on Non-Existing Column', async () => {
//     const query = 'SELECT DISTINCT nonExistingColumn FROM student';
//     await expect(executeSELECTQuery(query)).rejects.toThrow("Invalid column name 'nonExistingColumn'");
// });

// BONUS if you can get this fixed
// test('Error with Malformed DISTINCT Query', async () => {
//     // Example of a syntactically incorrect use of DISTINCT
//     const query = 'SELECT name, DISTINCT age FROM student';
//     await expect(executeSELECTQuery(query)).rejects.toThrow("Syntax error in query near 'DISTINCT'");
// });

// BONUS if you can get this fixed
// test('Error with DISTINCT in JOIN without Table Prefix', async () => {
//     // This test assumes that columns in JOIN queries need table prefixes for clarity
//     const query = 'SELECT DISTINCT name FROM student INNER JOIN enrollment ON student.id = enrollment.student_id';
//     await expect(executeSELECTQuery(query)).rejects.toThrow("Ambiguous column name 'name' in JOIN query");
// });

test('Execute SQL Query with LIKE Operator for Name', async () => {
    const query = "SELECT name FROM student WHERE name LIKE '%Jane%'";
    const result = await executeSELECTQuery(query);
    // Expecting names containing 'Jane'
    expect(result).toEqual([{ name: 'Jane' }, { name: 'Jane' }]);
});

test('Execute SQL Query with LIKE Operator and Wildcards', async () => {
    const query = "SELECT name FROM student WHERE name LIKE 'J%'";
    const result = await executeSELECTQuery(query);
    // Expecting names starting with 'J'
    expect(result).toEqual([{ name: 'John' }, { name: 'Jane' }, { name: 'Jane' }]);
});

test('Execute SQL Query with LIKE Operator Case Insensitive', async () => {
    const query = "SELECT name FROM student WHERE name LIKE '%bob%'";
    const result = await executeSELECTQuery(query);
    // Expecting names 'Bob' (case insensitive)
    expect(result).toEqual([{ name: 'Bob' }]);
});

test('Execute SQL Query with LIKE Operator and DISTINCT', async () => {
    const query = "SELECT DISTINCT name FROM student WHERE name LIKE '%e%'";
    const result = await executeSELECTQuery(query);
    // Expecting unique names containing 'e'
    expect(result).toEqual([{ name: 'Jane' }, { name: 'Alice' }]);
});

test('LIKE with ORDER BY and LIMIT', async () => {
    const query = "SELECT name FROM student WHERE name LIKE '%a%' ORDER BY name ASC LIMIT 2";
    const result = await executeSELECTQuery(query);
    // Expecting the first two names alphabetically that contain 'a'
    expect(result).toEqual([{ name: 'Alice' }, { name: 'Jane' }]);
});


test('Execute SQL Query with APPROXIMATE_COUNT Function', async () => {
    const query = "SELECT APPROXIMATE_COUNT(id) FROM student";
    const result = await executeSELECTQuery(query);
    // Assuming APPROXIMATE_COUNT behaves like COUNT for testing
    // Expecting the count of all student records
    expect(result).toEqual([{ 'COUNT(id)': 5 }]); // Assuming there are 5 records in student.csv
});

test('Execute SQL Query with APPROXIMATE_COUNT and GROUP BY Clauses', async () => {
    const query = "SELECT APPROXIMATE_COUNT(id), course FROM enrollment GROUP BY course";
    const result = await executeSELECTQuery(query);
    // Assuming APPROXIMATE_COUNT behaves like COUNT for testing
    // Expecting the count of student records grouped by course
    expect(result).toEqual([
        { 'COUNT(id)': 2, course: 'Mathematics' }, // Assuming 2 students are enrolled in Mathematics
        { 'COUNT(id)': 2, course: 'Physics' }, // Assuming 1 student is enrolled in Physics
        { 'COUNT(id)': 1, course: 'Chemistry' }, // Assuming 1 student is enrolled in Chemistry
        { 'COUNT(id)': 1, course: 'Biology' } // Assuming 1 student is enrolled in Biology
    ]);
});

test('Execute SQL Query with APPROXIMATE_COUNT, WHERE, and ORDER BY Clauses', async () => {
    const query = "SELECT APPROXIMATE_COUNT(id) FROM student WHERE age > '20' ORDER BY age DESC";
    const result = await executeSELECTQuery(query);
    // Assuming APPROXIMATE_COUNT behaves like COUNT for testing
    // Expecting the count of students older than 20, ordered by age in descending order
    // Note: The ORDER BY clause does not affect the outcome for a single aggregated result
    expect(result).toEqual([{ 'COUNT(id)': 5 }]); // Assuming there are 4 students older than 20
});


test('Execute SQL Query with APPROXIMATE_COUNT only', async () => {
    const query = "SELECT APPROXIMATE_COUNT(*) FROM student";
    const result = await executeSELECTQuery(query);
    expect(result).toEqual([{ 'APPROXIMATE_COUNT(*)': 5 }]);
});

test('Execute SQL Query with APPROXIMATE_COUNT with DISTINCT on a column', async () => {
    const query = "SELECT APPROXIMATE_COUNT(DISTINCT (name)) FROM student";
    const result = await executeSELECTQuery(query);
    expect(result).toEqual([{ 'APPROXIMATE_COUNT(DISTINCT (name))': 4 }]);
});

test('Execute SQL Query with COUNT with DISTINCT on a column', async () => {
    const query = "SELECT COUNT(DISTINCT (name)) FROM student";
    const result = await executeSELECTQuery(query);
    expect(result).toEqual([{ 'COUNT(DISTINCT (name))': 4 }]);
});

test('Execute SQL Query with COUNT with DISTINCT on a column', async () => {
    const query = "SELECT COUNT(DISTINCT (name, age)) FROM student";
    const result = await executeSELECTQuery(query);
    expect(result).toEqual([{ 'COUNT(DISTINCT (name, age))': 5 }]);
});