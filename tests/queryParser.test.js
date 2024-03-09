const { parseJoinClause, parseSelectQuery } = require('../src/queryParser');


test('Parse SQL Query', () => {
    const query = 'SELECT id, name FROM student';
    const parsed = parseSelectQuery(query);
    expect(parsed).toEqual({
        fields: ['id', 'name'],
        table: 'student',
        whereClauses: [],
        joinCondition: null,
        joinTable: null,
        joinType: null,
        groupByFields: null,
        hasAggregateWithoutGroupBy: false,
        orderByFields: null,
        limit: null,
        isDistinct: false,
        isApproximateCount: false,
        isCountDistinct: false,
        distinctFields: []
    });
});

test('Parse SQL Query with WHERE Clause', () => {
    const query = 'SELECT id, name FROM student WHERE age = 25';
    const parsed = parseSelectQuery(query);
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
        orderByFields: null,
        limit: null,
        isDistinct: false,
        isApproximateCount: false,
        isCountDistinct: false,
        distinctFields: []
    });
});

test('Parse SQL Query with Multiple WHERE Clauses', () => {
    const query = 'SELECT id, name FROM student WHERE age = 30 AND name = John';
    const parsed = parseSelectQuery(query);
    expect(parsed).toEqual({
        fields: ['id', 'name'],
        table: 'student',
        whereClauses: [{
            field: "age",
            operator: "=",
            value: "30",
        }, {
            field: "name",
            operator: "=",
            value: "John",
        }],
        joinCondition: null,
        joinTable: null,
        joinType: null,
        groupByFields: null,
        hasAggregateWithoutGroupBy: false,
        orderByFields: null,
        limit: null,
        isDistinct: false,
        isApproximateCount: false,
        isCountDistinct: false,
        distinctFields: []
    });
});

test('Parse SQL Query with INNER JOIN', async () => {
    const query = 'SELECT student.name, enrollment.course FROM student INNER JOIN enrollment ON student.id=enrollment.student_id';
    const result = await parseSelectQuery(query);
    expect(result).toEqual({
        fields: ['student.name', 'enrollment.course'],
        table: 'student',
        whereClauses: [],
        joinTable: 'enrollment',
        joinType: "INNER",
        joinCondition: { left: 'student.id', right: 'enrollment.student_id' },
        groupByFields: null,
        hasAggregateWithoutGroupBy: false,
        orderByFields: null,
        limit: null,
        isDistinct: false,
        isApproximateCount: false,
        isCountDistinct: false,
        distinctFields: []
    })
});

test('Parse SQL Query with INNER JOIN and WHERE Clause', async () => {
    const query = 'SELECT student.name, enrollment.course FROM student INNER JOIN enrollment ON student.id = enrollment.student_id WHERE student.age > 20';
    const result = await parseSelectQuery(query);
    expect(result).toEqual({
        fields: ['student.name', 'enrollment.course'],
        table: 'student',
        whereClauses: [{ field: 'student.age', operator: '>', value: '20' }],
        joinTable: 'enrollment',
        joinType: "INNER",
        joinCondition: { left: 'student.id', right: 'enrollment.student_id' },
        groupByFields: null,
        hasAggregateWithoutGroupBy: false,
        orderByFields: null,
        limit: null,
        isDistinct: false,
        isApproximateCount: false,
        isCountDistinct: false,
        distinctFields: []
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
    const result = parseSelectQuery(query);
    expect(result).toEqual({
        fields: ['student.name', 'enrollment.course'],
        table: 'student',
        whereClauses: [],
        joinType: 'LEFT',
        joinTable: 'enrollment',
        joinCondition: { left: 'student.id', right: 'enrollment.student_id' },
        groupByFields: null,
        hasAggregateWithoutGroupBy: false,
        orderByFields: null,
        limit: null,
        isDistinct: false,
        isApproximateCount: false,
        isCountDistinct: false,
        distinctFields: []
    })
})

test('Parse LEFT Join Query Completely', () => {
    const query = 'SELECT student.name, enrollment.course FROM student RIGHT JOIN enrollment ON student.id=enrollment.student_id';
    const result = parseSelectQuery(query);
    expect(result).toEqual({
        fields: ['student.name', 'enrollment.course'],
        table: 'student',
        whereClauses: [],
        joinType: 'RIGHT',
        joinTable: 'enrollment',
        joinCondition: { left: 'student.id', right: 'enrollment.student_id' },
        groupByFields: null,
        hasAggregateWithoutGroupBy: false,
        orderByFields: null,
        limit: null,
        isDistinct: false,
        isApproximateCount: false,
        isCountDistinct: false,
        distinctFields: []
    })
})

test('Parse SQL Query with LEFT JOIN with a WHERE clause filtering the main table', async () => {
    const query = 'SELECT student.name, enrollment.course FROM student LEFT JOIN enrollment ON student.id=enrollment.student_id WHERE student.age > 22';
    const result = await parseSelectQuery(query);
    expect(result).toEqual({
        fields: ["student.name", "enrollment.course"],
        joinCondition: { "left": "student.id", "right": "enrollment.student_id" },
        joinTable: "enrollment",
        joinType: "LEFT",
        table: "student",
        whereClauses: [{ "field": "student.age", "operator": ">", "value": "22" }],
        groupByFields: null,
        hasAggregateWithoutGroupBy: false,
        orderByFields: null,
        limit: null,
        isDistinct: false,
        isApproximateCount: false,
        isCountDistinct: false,
        distinctFields: []
    });
});

test('Parse SQL Query with LEFT JOIN with a WHERE clause filtering the join table', async () => {
    const query = `SELECT student.name, enrollment.course FROM student LEFT JOIN enrollment ON student.id=enrollment.student_id WHERE enrollment.course = 'Physics'`;
    const result = await parseSelectQuery(query);
    expect(result).toEqual({
        fields: ["student.name", "enrollment.course"],
        joinCondition: { "left": "student.id", "right": "enrollment.student_id" },
        joinTable: "enrollment",
        joinType: "LEFT",
        table: "student",
        whereClauses: [{ "field": "enrollment.course", "operator": "=", "value": "'Physics'" }],
        groupByFields: null,
        hasAggregateWithoutGroupBy: false,
        orderByFields: null,
        limit: null,
        isDistinct: false,
        isApproximateCount: false,
        isCountDistinct: false,
        distinctFields: []
    });
});

test('Parse SQL Query with RIGHT JOIN with a WHERE clause filtering the main table', async () => {
    const query = 'SELECT student.name, enrollment.course FROM student RIGHT JOIN enrollment ON student.id=enrollment.student_id WHERE student.age < 25';
    const result = await parseSelectQuery(query);
    expect(result).toEqual({
        fields: ["student.name", "enrollment.course"],
        joinCondition: { "left": "student.id", "right": "enrollment.student_id" },
        joinTable: "enrollment",
        joinType: "RIGHT",
        table: "student",
        whereClauses: [{ "field": "student.age", "operator": "<", "value": "25" }],
        groupByFields: null,
        hasAggregateWithoutGroupBy: false,
        orderByFields: null,
        limit: null,
        isDistinct: false,
        isApproximateCount: false,
        isCountDistinct: false,
        distinctFields: []
    });
});

test('Parse SQL Query with RIGHT JOIN with a WHERE clause filtering the join table', async () => {
    const query = `SELECT student.name, enrollment.course FROM student RIGHT JOIN enrollment ON student.id=enrollment.student_id WHERE enrollment.course = 'Chemistry'`;
    const result = await parseSelectQuery(query);
    expect(result).toEqual({
        fields: ["student.name", "enrollment.course"],
        joinCondition: { "left": "student.id", "right": "enrollment.student_id" },
        joinTable: "enrollment",
        joinType: "RIGHT",
        table: "student",
        whereClauses: [{ "field": "enrollment.course", "operator": "=", "value": "'Chemistry'" }],
        groupByFields: null,
        hasAggregateWithoutGroupBy: false,
        orderByFields: null,
        limit: null,
        isDistinct: false,
        isApproximateCount: false,
        isCountDistinct: false,
        distinctFields: []
    });
});


test('Parse COUNT Aggregate Query', () => {
    const query = 'SELECT COUNT(*) FROM student';
    const parsed = parseSelectQuery(query);
    expect(parsed).toEqual({
        fields: ['COUNT(*)'],
        table: 'student',
        whereClauses: [],
        groupByFields: null,
        hasAggregateWithoutGroupBy: true,
        joinCondition: null,
        joinTable: null,
        joinType: null,
        orderByFields: null,
        limit: null,
        isDistinct: false,
        isApproximateCount: false,
        isCountDistinct: false,
        distinctFields: []
    });
});


test('Parse SUM Aggregate Query', () => {
    const query = 'SELECT SUM(age) FROM student';
    const parsed = parseSelectQuery(query);
    expect(parsed).toEqual({
        fields: ['SUM(age)'],
        table: 'student',
        whereClauses: [],
        groupByFields: null,
        hasAggregateWithoutGroupBy: true,
        joinCondition: null,
        joinTable: null,
        joinType: null,
        orderByFields: null,
        limit: null,
        isDistinct: false,
        isApproximateCount: false,
        isCountDistinct: false,
        distinctFields: []
    });
});

test('Parse AVG Aggregate Query', () => {
    const query = 'SELECT AVG(age) FROM student';
    const parsed = parseSelectQuery(query);
    expect(parsed).toEqual({
        fields: ['AVG(age)'],
        table: 'student',
        whereClauses: [],
        groupByFields: null,
        hasAggregateWithoutGroupBy: true,
        joinCondition: null,
        joinTable: null,
        joinType: null,
        orderByFields: null,
        limit: null,
        isDistinct: false,
        isApproximateCount: false,
        isCountDistinct: false,
        distinctFields: []
    });
});

test('Parse MIN Aggregate Query', () => {
    const query = 'SELECT MIN(age) FROM student';
    const parsed = parseSelectQuery(query);
    expect(parsed).toEqual({
        fields: ['MIN(age)'],
        table: 'student',
        whereClauses: [],
        groupByFields: null,
        hasAggregateWithoutGroupBy: true,
        joinCondition: null,
        joinTable: null,
        joinType: null,
        orderByFields: null,
        limit: null,
        isDistinct: false,
        isApproximateCount: false,
        isCountDistinct: false,
        distinctFields: []
    });
});

test('Parse MAX Aggregate Query', () => {
    const query = 'SELECT MAX(age) FROM student';
    const parsed = parseSelectQuery(query);
    expect(parsed).toEqual({
        fields: ['MAX(age)'],
        table: 'student',
        whereClauses: [],
        groupByFields: null,
        hasAggregateWithoutGroupBy: true,
        joinCondition: null,
        joinTable: null,
        joinType: null,
        orderByFields: null,
        limit: null,
        isDistinct: false,
        isApproximateCount: false,
        isCountDistinct: false,
        distinctFields: []
    });
});

test('Parse basic GROUP BY query', () => {
    const query = 'SELECT age, COUNT(*) FROM student GROUP BY age';
    const parsed = parseSelectQuery(query);
    expect(parsed).toEqual({
        fields: ['age', 'COUNT(*)'],
        table: 'student',
        whereClauses: [],
        groupByFields: ['age'],
        joinType: null,
        joinTable: null,
        joinCondition: null,
        hasAggregateWithoutGroupBy: false,
        orderByFields: null,
        limit: null,
        isDistinct: false,
        isApproximateCount: false,
        isCountDistinct: false,
        distinctFields: []
    });
});

test('Parse GROUP BY query with WHERE clause', () => {
    const query = 'SELECT age, COUNT(*) FROM student WHERE age > 22 GROUP BY age';
    const parsed = parseSelectQuery(query);
    expect(parsed).toEqual({
        fields: ['age', 'COUNT(*)'],
        table: 'student',
        whereClauses: [{ field: 'age', operator: '>', value: '22' }],
        groupByFields: ['age'],
        joinType: null,
        joinTable: null,
        joinCondition: null,
        hasAggregateWithoutGroupBy: false,
        orderByFields: null,
        limit: null,
        isDistinct: false,
        isApproximateCount: false,
        isCountDistinct: false,
        distinctFields: []
    });
});

test('Parse GROUP BY query with multiple fields', () => {
    const query = 'SELECT student_id, course, COUNT(*) FROM enrollment GROUP BY student_id, course';
    const parsed = parseSelectQuery(query);
    expect(parsed).toEqual({
        fields: ['student_id', 'course', 'COUNT(*)'],
        table: 'enrollment',
        whereClauses: [],
        groupByFields: ['student_id', 'course'],
        joinType: null,
        joinTable: null,
        joinCondition: null,
        hasAggregateWithoutGroupBy: false,
        orderByFields: null,
        limit: null,
        isDistinct: false,
        isApproximateCount: false,
        isCountDistinct: false,
        distinctFields: []
    });
});

test('Parse GROUP BY query with JOIN and WHERE clauses', () => {
    const query = 'SELECT student.name, COUNT(*) FROM student INNER JOIN enrollment ON student.id = enrollment.student_id WHERE enrollment.course = "Mathematics" GROUP BY student.name';
    const parsed = parseSelectQuery(query);
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
        hasAggregateWithoutGroupBy: false,
        orderByFields: null,
        limit: null,
        isDistinct: false,
        isApproximateCount: false,
        isCountDistinct: false,
        distinctFields: []
    });
});

test('Parse SQL Query with ORDER BY', () => {
    const query = 'SELECT name FROM student ORDER BY name ASC';
    const parsed = parseSelectQuery(query);
    expect(parsed.orderByFields).toEqual([{ fieldName: 'name', order: 'ASC' }]);
});

test('Parse SQL Query with ORDER BY and WHERE', () => {
    const query = 'SELECT name FROM student WHERE age > 20 ORDER BY name DESC';
    const parsed = parseSelectQuery(query);
    expect(parsed.orderByFields).toEqual([{ fieldName: 'name', order: 'DESC' }]);
    expect(parsed.whereClauses.length).toBeGreaterThan(0);
});

test('Parse SQL Query with ORDER BY and GROUP BY', () => {
    const query = 'SELECT COUNT(id), age FROM student GROUP BY age ORDER BY age DESC';
    const parsed = parseSelectQuery(query);
    expect(parsed.orderByFields).toEqual([{ fieldName: 'age', order: 'DESC' }]);
    expect(parsed.groupByFields).toEqual(['age']);
});

test('Parse SQL Query with standard LIMIT clause', () => {
    const query = 'SELECT id, name FROM student LIMIT 2';
    const parsed = parseSelectQuery(query);
    expect(parsed.limit).toEqual(2);
});

test('Parse SQL Query with large number in LIMIT clause', () => {
    const query = 'SELECT id, name FROM student LIMIT 1000';
    const parsed = parseSelectQuery(query);
    expect(parsed.limit).toEqual(1000);
});

test('Parse SQL Query without LIMIT clause', () => {
    const query = 'SELECT id, name FROM student';
    const parsed = parseSelectQuery(query);
    expect(parsed.limit).toBeNull();
});

test('Parse SQL Query with LIMIT 0', () => {
    const query = 'SELECT id, name FROM student LIMIT 0';
    const parsed = parseSelectQuery(query);
    expect(parsed.limit).toEqual(0);
});

test('Parse SQL Query with negative number in LIMIT clause', () => {
    const query = 'SELECT id, name FROM student LIMIT -1';
    const parsed = parseSelectQuery(query);
    // Assuming the parser sets limit to null for invalid values
    expect(parsed.limit).toBeNull();
});

test('Error Handling with Malformed Query', async () => {
    const query = 'SELECT FROM table'; // intentionally malformed
    expect(() => parseSelectQuery(query)).toThrow("Query parsing error: Invalid SELECT format");
});

test('Parse SQL Query with Basic DISTINCT', () => {
    const query = 'SELECT DISTINCT age FROM student';
    const parsed = parseSelectQuery(query);
    expect(parsed).toEqual({
        fields: ['age'],
        table: 'student',
        isDistinct: true,
        isApproximateCount: false,
        whereClauses: [],
        groupByFields: null,
        joinType: null,
        joinTable: null,
        joinCondition: null,
        orderByFields: null,
        limit: null,
        hasAggregateWithoutGroupBy: false,
        isCountDistinct: false,
        distinctFields: []
    });
});

test('Parse SQL Query with DISTINCT and Multiple Columns', () => {
    const query = 'SELECT DISTINCT student_id, course FROM enrollment';
    const parsed = parseSelectQuery(query);
    expect(parsed).toEqual({
        fields: ['student_id', 'course'],
        table: 'enrollment',
        isDistinct: true,
        isApproximateCount: false,
        whereClauses: [],
        groupByFields: null,
        joinType: null,
        joinTable: null,
        joinCondition: null,
        orderByFields: null,
        limit: null,
        hasAggregateWithoutGroupBy: false,
        isCountDistinct: false,
        distinctFields: []
    });
});

test('Parse SQL Query with DISTINCT and WHERE Clause', () => {
    const query = 'SELECT DISTINCT course FROM enrollment WHERE student_id = "1"';
    const parsed = parseSelectQuery(query);
    expect(parsed).toEqual({
        fields: ['course'],
        table: 'enrollment',
        isDistinct: true,
        isApproximateCount: false,
        whereClauses: [{ field: 'student_id', operator: '=', value: '"1"' }],
        groupByFields: null,
        joinType: null,
        joinTable: null,
        joinCondition: null,
        orderByFields: null,
        limit: null,
        hasAggregateWithoutGroupBy: false,
        isCountDistinct: false,
        distinctFields: []
    });
});

test('Parse SQL Query with DISTINCT and JOIN Operations', () => {
    const query = 'SELECT DISTINCT student.name FROM student INNER JOIN enrollment ON student.id = enrollment.student_id';
    const parsed = parseSelectQuery(query);
    expect(parsed).toEqual({
        fields: ['student.name'],
        table: 'student',
        isDistinct: true,
        isApproximateCount: false,
        whereClauses: [],
        groupByFields: null,
        joinType: 'INNER',
        joinTable: 'enrollment',
        joinCondition: {
            left: 'student.id',
            right: 'enrollment.student_id'
        },
        orderByFields: null,
        limit: null,
        hasAggregateWithoutGroupBy: false,
        isCountDistinct: false,
        distinctFields: []
    });
});

test('Parse SQL Query with DISTINCT, ORDER BY, and LIMIT', () => {
    const query = 'SELECT DISTINCT age FROM student ORDER BY age DESC LIMIT 2';
    const parsed = parseSelectQuery(query);
    expect(parsed).toEqual({
        fields: ['age'],
        table: 'student',
        isDistinct: true,
        isApproximateCount: false,
        whereClauses: [],
        groupByFields: null,
        joinType: null,
        joinTable: null,
        joinCondition: null,
        orderByFields: [{ fieldName: 'age', order: 'DESC' }],
        limit: 2,
        hasAggregateWithoutGroupBy: false,
        isCountDistinct: false,
        distinctFields: []
    });
});

test('Parse SQL Query with DISTINCT on All Columns', () => {
    const query = 'SELECT DISTINCT * FROM student';
    const parsed = parseSelectQuery(query);
    expect(parsed).toEqual({
        fields: ['*'],
        table: 'student',
        isDistinct: true,
        isApproximateCount: false,
        whereClauses: [],
        groupByFields: null,
        joinType: null,
        joinTable: null,
        joinCondition: null,
        orderByFields: null,
        limit: null,
        hasAggregateWithoutGroupBy: false,
        isCountDistinct: false,
        distinctFields: []
    });
});

test('Parse SQL Query with LIKE Clause', () => {
    const query = "SELECT name FROM student WHERE name LIKE '%Jane%'";
    const parsed = parseSelectQuery(query);
    expect(parsed).toEqual({
        fields: ['name'],
        table: 'student',
        whereClauses: [{ field: 'name', operator: 'LIKE', value: '%Jane%' }],
        isDistinct: false,
        isApproximateCount: false,
        groupByFields: null,
        joinType: null,
        joinTable: null,
        joinCondition: null,
        orderByFields: null,
        limit: null,
        hasAggregateWithoutGroupBy: false,
        isCountDistinct: false,
        distinctFields: []
    });
});

test('Parse SQL Query with LIKE Clause and Wildcards', () => {
    const query = "SELECT name FROM student WHERE name LIKE 'J%'";
    const parsed = parseSelectQuery(query);
    expect(parsed).toEqual({
        fields: ['name'],
        table: 'student',
        whereClauses: [{ field: 'name', operator: 'LIKE', value: 'J%' }],
        isDistinct: false,
        isApproximateCount: false,
        groupByFields: null,
        joinType: null,
        joinTable: null,
        joinCondition: null,
        orderByFields: null,
        limit: null,
        hasAggregateWithoutGroupBy: false,
        isCountDistinct: false,
        distinctFields: []
    });
});

test('Parse SQL Query with Multiple LIKE Clauses', () => {
    const query = "SELECT name FROM student WHERE name LIKE 'J%' AND age LIKE '2%'";
    const parsed = parseSelectQuery(query);
    expect(parsed).toEqual({
        fields: ['name'],
        table: 'student',
        whereClauses: [
            { field: 'name', operator: 'LIKE', value: 'J%' },
            { field: 'age', operator: 'LIKE', value: '2%' }
        ],
        isDistinct: false,
        isApproximateCount: false,
        groupByFields: null,
        joinType: null,
        joinTable: null,
        joinCondition: null,
        orderByFields: null,
        limit: null,
        hasAggregateWithoutGroupBy: false,
        isCountDistinct: false,
        distinctFields: []
    });
});

test('Parse SQL Query with LIKE and ORDER BY Clauses', () => {
    const query = "SELECT name FROM student WHERE name LIKE '%e%' ORDER BY age DESC";
    const parsed = parseSelectQuery(query);
    expect(parsed).toEqual({
        fields: ['name'],
        table: 'student',
        whereClauses: [{ field: 'name', operator: 'LIKE', value: '%e%' }],
        orderByFields: [{ fieldName: 'age', order: 'DESC' }],
        isDistinct: false,
        isApproximateCount: false,
        groupByFields: null,
        joinType: null,
        joinTable: null,
        joinCondition: null,
        limit: null,
        hasAggregateWithoutGroupBy: false,
        isCountDistinct: false,
        distinctFields: []
    });
});

test('Parse SQL Query with APPROXIMATE_COUNT Function', () => {
    const query = "SELECT APPROXIMATE_COUNT(id) FROM student";
    const parsed = parseSelectQuery(query);
    expect(parsed).toEqual({
        fields: ['COUNT(id)'], // Assuming APPROXIMATE_COUNT is replaced with COUNT for simplicity
        table: 'student',
        whereClauses: [],
        isDistinct: false,
        isApproximateCount: true, // This flag should be true when APPROXIMATE_COUNT is used
        groupByFields: null,
        joinType: null,
        joinTable: null,
        joinCondition: null,
        orderByFields: null,
        limit: null,
        hasAggregateWithoutGroupBy: true,
        isCountDistinct: false,
        distinctFields: []
    });
});

test('Parse SQL Query with APPROXIMATE_COUNT and GROUP BY Clauses', () => {
    const query = "SELECT APPROXIMATE_COUNT(id), course FROM enrollment GROUP BY course";
    const parsed = parseSelectQuery(query);
    expect(parsed).toEqual({
        fields: ['COUNT(id)', 'course'], // Assuming APPROXIMATE_COUNT is replaced with COUNT for simplicity
        table: 'enrollment',
        whereClauses: [],
        isDistinct: false,
        isApproximateCount: true, // This flag should be true when APPROXIMATE_COUNT is used
        groupByFields: ['course'],
        joinType: null,
        joinTable: null,
        joinCondition: null,
        orderByFields: null,
        limit: null,
        hasAggregateWithoutGroupBy: false,
        isCountDistinct: false,
        distinctFields: []
    });
});

test('Parse SQL Query with APPROXIMATE_COUNT, WHERE, and ORDER BY Clauses', () => {
    const query = "SELECT APPROXIMATE_COUNT(id) FROM student WHERE age > 20 ORDER BY age DESC";
    const parsed = parseSelectQuery(query);
    expect(parsed).toEqual({
        fields: ['COUNT(id)'],
        table: 'student',
        whereClauses: [
            { field: 'age', operator: '>', value: '20' }
        ],
        orderByFields: [{ fieldName: 'age', order: 'DESC' }],
        isDistinct: false,
        isApproximateCount: true,
        groupByFields: null,
        joinType: null,
        joinTable: null,
        joinCondition: null,
        limit: null,
        hasAggregateWithoutGroupBy: true,
        isCountDistinct: false,
        distinctFields: []
    });
});

test('Parse SQL Query with APPROXIMATE_COUNT with DISTINCT on a column', () => {
    const query = "SELECT APPROXIMATE_COUNT(DISTINCT (name)) FROM student";
    const parsed = parseSelectQuery(query);
    expect(parsed).toEqual({
        fields: ['COUNT(DISTINCT (name))'],
        table: 'student',
        whereClauses: [],
        orderByFields: null,
        isDistinct: false,
        distinctFields: ['name'],
        isCountDistinct: true,
        isApproximateCount: true,
        groupByFields: null,
        joinType: null,
        joinTable: null,
        joinCondition: null,
        limit: null,
        hasAggregateWithoutGroupBy: false
    });
});

test('Parse SQL Query with COUNT with DISTINCT on a column', () => {
    const query = "SELECT COUNT(DISTINCT (name)) FROM student";
    const parsed = parseSelectQuery(query);
    expect(parsed).toEqual({
        fields: ['COUNT(DISTINCT (name))'],
        table: 'student',
        whereClauses: [],
        orderByFields: null,
        isDistinct: false,
        distinctFields: ['name'],
        isCountDistinct: true,
        isApproximateCount: false,
        groupByFields: null,
        joinType: null,
        joinTable: null,
        joinCondition: null,
        limit: null,
        hasAggregateWithoutGroupBy: false
    });
});

test('Parse SQL Query with COUNT with DISTINCT on multiple column', () => {
    const query = "SELECT COUNT(DISTINCT (name, age)) FROM student";
    const parsed = parseSelectQuery(query);
    expect(parsed).toEqual({
        fields: ['COUNT(DISTINCT (name, age))'],
        table: 'student',
        whereClauses: [],
        orderByFields: null,
        isDistinct: false,
        distinctFields: ['name', 'age'],
        isCountDistinct: true,
        isApproximateCount: false,
        groupByFields: null,
        joinType: null,
        joinTable: null,
        joinCondition: null,
        limit: null,
        hasAggregateWithoutGroupBy: false
    });
});

