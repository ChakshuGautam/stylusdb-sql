const readCSV = require('../src/csvReader');
const {parseQuery, parseJoinClause} = require('../src/queryParser');
const executeSELECTQuery = require('../src/index');

test('Read CSV File', async () => {
    const data = await readCSV('./student.csv');
    expect(data.length).toBeGreaterThan(0);
    expect(data.length).toBe(4);
    expect(data[0].name).toBe('John');
    expect(data[0].age).toBe('30'); //ignore the string type here, we will fix this later
});

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
    expect(result.length).toEqual(3);
    expect(result[0]).toHaveProperty('name');
});

test('Execute SQL Query with INNER JOIN', async () => {
    const query = 'SELECT student.name, enrollment.course FROM student INNER JOIN enrollment ON student.id=enrollment.student_id';
    const result = await executeSELECTQuery(query);
    /*
    result = [
      { 'student.name': 'John', 'enrollment.course': 'Mathematics' },
      { 'student.name': 'John', 'enrollment.course': 'Physics' },
      { 'student.name': 'Jane', 'enrollment.course': 'Chemistry' },
      { 'student.name': 'Bob', 'enrollment.course': 'Mathematics' }
    ]
    */
    expect(result.length).toEqual(4);
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
    expect(result.length).toEqual(5); // 4 students, but John appears twice
});

test('Execute SQL Query with RIGHT JOIN', async () => {
    const query = 'SELECT student.name, enrollment.course FROM student RIGHT JOIN enrollment ON student.id=enrollment.student_id';
    const result = await executeSELECTQuery(query);
    expect(result).toEqual(expect.arrayContaining([
        expect.objectContaining({ "student.name": null, "enrollment.course": "Biology" }),
        expect.objectContaining({ "student.name": "John", "enrollment.course": "Mathematics" })
    ]));
    expect(result.length).toEqual(5); // 4 courses, but Mathematics appears twice
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
    expect(result.length).toEqual(1);
});

test('Execute SQL Query with RIGHT JOIN with a WHERE clause filtering the main table', async () => {
    const query = 'SELECT student.name, enrollment.course FROM student RIGHT JOIN enrollment ON student.id=enrollment.student_id WHERE student.age < 25';
    const result = await executeSELECTQuery(query);
    expect(result).toEqual(expect.arrayContaining([
        expect.objectContaining({ "enrollment.course": "Mathematics", "student.name": "Bob" }),
        expect.objectContaining({ "enrollment.course": "Biology", "student.name": null })
    ]));
    expect(result.length).toEqual(2);
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
    expect(result).toEqual([{ 'COUNT(*)': 4 }]);
});

test('Execute SUM Aggregate Query', async () => {
    const query = 'SELECT SUM(age) FROM student';
    const result = await executeSELECTQuery(query);
    expect(result).toEqual([{ 'SUM(age)': 101 }]);
});

test('Execute AVG Aggregate Query', async () => {
    const query = 'SELECT AVG(age) FROM student';
    const result = await executeSELECTQuery(query);
    // Assuming AVG returns a single decimal point value
    expect(result).toEqual([{ 'AVG(age)': 25.25 }]);
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
        { age: '22', 'COUNT(*)': 1 },
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
        { course: 'Physics', 'COUNT(*)': 1 },
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
        { student_id: '5', 'COUNT(*)': 1 }
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

test('Parse SQL Query', () => {
    const query = 'SELECT id, name FROM student';
    const parsed = parseQuery(query);
    expect(parsed).toEqual({
        fields: ['id', 'name'],
        table: 'student',
        whereClauses: [],
        joinCondition: null,
        joinTable: null,
        joinType: null,
        groupByFields: null,
        hasAggregateWithoutGroupBy: false,
    });
});

test('Parse SQL Query with WHERE Clause', () => {
    const query = 'SELECT id, name FROM student WHERE age = 25';
    const parsed = parseQuery(query);
    expect(parsed).toEqual({
        fields: ['id', 'name'],
        table: 'student',
        whereClauses: [{
            "field": "age",
            "operator": "=",
            "value": "25",
        }],
        joinCondition: null,
        joinTable: null,
        joinType: null,
        groupByFields: null,
        hasAggregateWithoutGroupBy: false,
    });
});

test('Parse SQL Query with Multiple WHERE Clauses', () => {
    const query = 'SELECT id, name FROM student WHERE age = 30 AND name = John';
    const parsed = parseQuery(query);
    expect(parsed).toEqual({
        fields: ['id', 'name'],
        table: 'student',
        whereClauses: [{
            "field": "age",
            "operator": "=",
            "value": "30",
        }, {
            "field": "name",
            "operator": "=",
            "value": "John",
        }],
        joinCondition: null,
        joinTable: null,
        joinType: null,
        groupByFields: null,
        hasAggregateWithoutGroupBy: false,
    });
});

test('Parse SQL Query with INNER JOIN', async () => {
    const query = 'SELECT student.name, enrollment.course FROM student INNER JOIN enrollment ON student.id=enrollment.student_id';
    const result = await parseQuery(query);
    expect(result).toEqual({
        fields: ['student.name', 'enrollment.course'],
        table: 'student',
        whereClauses: [],
        joinTable: 'enrollment',
        joinType: "INNER",
        joinCondition: { left: 'student.id', right: 'enrollment.student_id' },
        groupByFields: null,
        hasAggregateWithoutGroupBy: false,
    })
});

test('Parse SQL Query with INNER JOIN and WHERE Clause', async () => {
    const query = 'SELECT student.name, enrollment.course FROM student INNER JOIN enrollment ON student.id = enrollment.student_id WHERE student.age > 20';
    const result = await parseQuery(query);
    expect(result).toEqual({
        fields: ['student.name', 'enrollment.course'],
        table: 'student',
        whereClauses: [{ field: 'student.age', operator: '>', value: '20' }],
        joinTable: 'enrollment',
        joinType: "INNER",
        joinCondition: { left: 'student.id', right: 'enrollment.student_id' },
        groupByFields: null,
        hasAggregateWithoutGroupBy: false,
    })
});

test('Parse INNER JOIN clause', () => {
    const query = 'SELECT * FROM table1 INNER JOIN table2 ON table1.id = table2.ref_id';
    const result = parseJoinClause(query);
    expect(result).toEqual({
        joinType: 'INNER',
        joinTable: 'table2',
        joinCondition: { left: 'table1.id', right: 'table2.ref_id' },
    });
});

test('Parse LEFT JOIN clause', () => {
    const query = 'SELECT * FROM table1 LEFT JOIN table2 ON table1.id = table2.ref_id';
    const result = parseJoinClause(query);
    expect(result).toEqual({
        joinType: 'LEFT',
        joinTable: 'table2',
        joinCondition: { left: 'table1.id', right: 'table2.ref_id' }
    });
});

test('Parse RIGHT JOIN clause', () => {
    const query = 'SELECT * FROM table1 RIGHT JOIN table2 ON table1.id = table2.ref_id';
    const result = parseJoinClause(query);
    expect(result).toEqual({
        joinType: 'RIGHT',
        joinTable: 'table2',
        joinCondition: { left: 'table1.id', right: 'table2.ref_id' }
    });
});

test('Returns null for queries without JOIN', () => {
    const query = 'SELECT * FROM table1';
    const result = parseJoinClause(query);
    expect(result).toEqual(
        {
            joinType: null,
            joinTable: null,
            joinCondition: null
        }
    );
});

test('Parse LEFT Join Query Completely', () => {
    const query = 'SELECT student.name, enrollment.course FROM student LEFT JOIN enrollment ON student.id=enrollment.student_id';
    const result = parseQuery(query);
    expect(result).toEqual({
        fields: ['student.name', 'enrollment.course'],
        table: 'student',
        whereClauses: [],
        joinType: 'LEFT',
        joinTable: 'enrollment',
        joinCondition: { left: 'student.id', right: 'enrollment.student_id' },
        groupByFields: null,
        hasAggregateWithoutGroupBy: false,
    })
})

test('Parse LEFT Join Query Completely', () => {
    const query = 'SELECT student.name, enrollment.course FROM student RIGHT JOIN enrollment ON student.id=enrollment.student_id';
    const result = parseQuery(query);
    expect(result).toEqual({
        fields: ['student.name', 'enrollment.course'],
        table: 'student',
        whereClauses: [],
        joinType: 'RIGHT',
        joinTable: 'enrollment',
        joinCondition: { left: 'student.id', right: 'enrollment.student_id' },
        groupByFields: null,
        hasAggregateWithoutGroupBy: false,
    })
})

test('Parse SQL Query with LEFT JOIN with a WHERE clause filtering the main table', async () => {
    const query = 'SELECT student.name, enrollment.course FROM student LEFT JOIN enrollment ON student.id=enrollment.student_id WHERE student.age > 22';
    const result = await parseQuery(query);
    expect(result).toEqual({
        "fields": ["student.name", "enrollment.course"],
        "joinCondition": { "left": "student.id", "right": "enrollment.student_id" },
        "joinTable": "enrollment",
        "joinType": "LEFT",
        "table": "student",
        "whereClauses": [{ "field": "student.age", "operator": ">", "value": "22" }],
        groupByFields: null,
        hasAggregateWithoutGroupBy: false,
    });
});

test('Parse SQL Query with LEFT JOIN with a WHERE clause filtering the join table', async () => {
    const query = `SELECT student.name, enrollment.course FROM student LEFT JOIN enrollment ON student.id=enrollment.student_id WHERE enrollment.course = 'Physics'`;
    const result = await parseQuery(query);
    expect(result).toEqual({
        "fields": ["student.name", "enrollment.course"],
        "joinCondition": { "left": "student.id", "right": "enrollment.student_id" },
        "joinTable": "enrollment",
        "joinType": "LEFT",
        "table": "student",
        "whereClauses": [{ "field": "enrollment.course", "operator": "=", "value": "'Physics'" }],
        groupByFields: null,
        hasAggregateWithoutGroupBy: false,
    });
});

test('Parse SQL Query with RIGHT JOIN with a WHERE clause filtering the main table', async () => {
    const query = 'SELECT student.name, enrollment.course FROM student RIGHT JOIN enrollment ON student.id=enrollment.student_id WHERE student.age < 25';
    const result = await parseQuery(query);
    expect(result).toEqual({
        "fields": ["student.name", "enrollment.course"],
        "joinCondition": { "left": "student.id", "right": "enrollment.student_id" },
        "joinTable": "enrollment",
        "joinType": "RIGHT",
        "table": "student",
        "whereClauses": [{ "field": "student.age", "operator": "<", "value": "25" }],
        groupByFields: null,
        hasAggregateWithoutGroupBy: false,
    });
});

test('Parse SQL Query with RIGHT JOIN with a WHERE clause filtering the join table', async () => {
    const query = `SELECT student.name, enrollment.course FROM student RIGHT JOIN enrollment ON student.id=enrollment.student_id WHERE enrollment.course = 'Chemistry'`;
    const result = await parseQuery(query);
    expect(result).toEqual({
        "fields": ["student.name", "enrollment.course"],
        "joinCondition": { "left": "student.id", "right": "enrollment.student_id" },
        "joinTable": "enrollment",
        "joinType": "RIGHT",
        "table": "student",
        "whereClauses": [{ "field": "enrollment.course", "operator": "=", "value": "'Chemistry'" }],
        groupByFields: null,
        hasAggregateWithoutGroupBy: false,
    });
});


test('Parse COUNT Aggregate Query', () => {
    const query = 'SELECT COUNT(*) FROM student';
    const parsed = parseQuery(query);
    expect(parsed).toEqual({
        fields: ['COUNT(*)'],
        table: 'student',
        whereClauses: [],
        groupByFields: null,
        hasAggregateWithoutGroupBy: true,
        "joinCondition": null,
        "joinTable": null,
        "joinType": null,
    });
});


test('Parse SUM Aggregate Query', () => {
    const query = 'SELECT SUM(age) FROM student';
    const parsed = parseQuery(query);
    expect(parsed).toEqual({
        fields: ['SUM(age)'],
        table: 'student',
        whereClauses: [],
        groupByFields: null,
        hasAggregateWithoutGroupBy: true,
        "joinCondition": null,
        "joinTable": null,
        "joinType": null,
    });
});

test('Parse AVG Aggregate Query', () => {
    const query = 'SELECT AVG(age) FROM student';
    const parsed = parseQuery(query);
    expect(parsed).toEqual({
        fields: ['AVG(age)'],
        table: 'student',
        whereClauses: [],
        groupByFields: null,
        hasAggregateWithoutGroupBy: true,
        "joinCondition": null,
        "joinTable": null,
        "joinType": null,
    });
});

test('Parse MIN Aggregate Query', () => {
    const query = 'SELECT MIN(age) FROM student';
    const parsed = parseQuery(query);
    expect(parsed).toEqual({
        fields: ['MIN(age)'],
        table: 'student',
        whereClauses: [],
        groupByFields: null,
        hasAggregateWithoutGroupBy: true,
        "joinCondition": null,
        "joinTable": null,
        "joinType": null,
    });
});

test('Parse MAX Aggregate Query', () => {
    const query = 'SELECT MAX(age) FROM student';
    const parsed = parseQuery(query);
    expect(parsed).toEqual({
        fields: ['MAX(age)'],
        table: 'student',
        whereClauses: [],
        groupByFields: null,
        hasAggregateWithoutGroupBy: true,
        "joinCondition": null,
        "joinTable": null,
        "joinType": null,
    });
});

test('Parse basic GROUP BY query', () => {
    const query = 'SELECT age, COUNT(*) FROM student GROUP BY age';
    const parsed = parseQuery(query);
    expect(parsed).toEqual({
        fields: ['age', 'COUNT(*)'],
        table: 'student',
        whereClauses: [],
        groupByFields: ['age'],
        joinType: null,
        joinTable: null,
        joinCondition: null,
        hasAggregateWithoutGroupBy: false
    });
});

test('Parse GROUP BY query with WHERE clause', () => {
    const query = 'SELECT age, COUNT(*) FROM student WHERE age > 22 GROUP BY age';
    const parsed = parseQuery(query);
    expect(parsed).toEqual({
        fields: ['age', 'COUNT(*)'],
        table: 'student',
        whereClauses: [{ field: 'age', operator: '>', value: '22' }],
        groupByFields: ['age'],
        joinType: null,
        joinTable: null,
        joinCondition: null,
        hasAggregateWithoutGroupBy: false
    });
});

test('Parse GROUP BY query with multiple fields', () => {
    const query = 'SELECT student_id, course, COUNT(*) FROM enrollment GROUP BY student_id, course';
    const parsed = parseQuery(query);
    expect(parsed).toEqual({
        fields: ['student_id', 'course', 'COUNT(*)'],
        table: 'enrollment',
        whereClauses: [],
        groupByFields: ['student_id', 'course'],
        joinType: null,
        joinTable: null,
        joinCondition: null,
        hasAggregateWithoutGroupBy: false
    });
});

test('Parse GROUP BY query with JOIN and WHERE clauses', () => {
    const query = 'SELECT student.name, COUNT(*) FROM student INNER JOIN enrollment ON student.id = enrollment.student_id WHERE enrollment.course = "Mathematics" GROUP BY student.name';
    const parsed = parseQuery(query);
    expect(parsed).toEqual({
        fields: ['student.name', 'COUNT(*)'],
        table: 'student',
        whereClauses: [{ field: 'enrollment.course', operator: '=', value: '"Mathematics"' }],
        groupByFields: ['student.name'],
        joinType: 'INNER',
        joinTable: 'enrollment',
        joinCondition: {
            left: 'student.id',
            right: 'enrollment.student_id'
        },
        hasAggregateWithoutGroupBy: false
    });
});