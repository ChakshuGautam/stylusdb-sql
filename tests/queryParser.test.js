const { parseJoinClause, parseQuery } = require('../src/queryParser');

describe('parseJoinClause', () => {

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
            joinCondition: { left: 'student.id', right: 'enrollment.student_id' }
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
            joinCondition: { left: 'student.id', right: 'enrollment.student_id' }
        })
    });

    test('Parse INNER JOIN clause', () => {
        const query = 'SELECT * FROM table1 INNER JOIN table2 ON table1.id = table2.ref_id';
        const result = parseJoinClause(query);
        expect(result).toEqual({
            joinType: 'INNER',
            joinTable: 'table2',
            joinCondition: { left: 'table1.id', right: 'table2.ref_id' }
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
        console.log({ result });
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
            joinCondition: { left: 'student.id', right: 'enrollment.student_id' }
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
            joinCondition: { left: 'student.id', right: 'enrollment.student_id' }
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
            "whereClauses": [{ "field": "student.age", "operator": ">", "value": "22" }]
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
            "whereClauses": [{ "field": "enrollment.course", "operator": "=", "value": "'Physics'" }]
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
            "whereClauses": [{ "field": "student.age", "operator": "<", "value": "25" }]
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
            "whereClauses": [{ "field": "enrollment.course", "operator": "=", "value": "'Chemistry'" }]
        });
    });
});
