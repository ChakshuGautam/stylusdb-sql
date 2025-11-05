const {
    StylusDBError,
    QuerySyntaxError,
    TableNotFoundError,
    ColumnNotFoundError,
    FileSystemError,
    SecurityError,
    QueryExecutionError,
    ValidationError,
    findSimilarStrings,
    levenshteinDistance
} = require('../src/errors');

describe('Error Classes', () => {
    describe('StylusDBError', () => {
        test('Should create base error with message', () => {
            const error = new StylusDBError('Test error');
            expect(error.message).toBe('Test error');
            expect(error.name).toBe('StylusDBError');
            expect(error).toBeInstanceOf(Error);
        });
    });

    describe('TableNotFoundError', () => {
        test('Should include table name in message', () => {
            const error = new TableNotFoundError('student');
            expect(error.message).toContain('student');
            expect(error.tableName).toBe('student');
            expect(error.name).toBe('TableNotFoundError');
        });

        test('Should store original error if provided', () => {
            const originalError = new Error('File not found');
            const error = new TableNotFoundError('student', originalError);
            expect(error.originalError).toBe(originalError);
        });
    });

    describe('ColumnNotFoundError', () => {
        test('Should include column name in message', () => {
            const error = new ColumnNotFoundError('invalid_column');
            expect(error.message).toContain('invalid_column');
            expect(error.columnName).toBe('invalid_column');
        });

        test('Should list available columns', () => {
            const error = new ColumnNotFoundError('invalid_column', 'student', ['id', 'name', 'age']);
            expect(error.message).toContain('id, name, age');
            expect(error.availableColumns).toEqual(['id', 'name', 'age']);
        });

        test('Should suggest similar column names', () => {
            const error = new ColumnNotFoundError('naem', 'student', ['id', 'name', 'age']);
            expect(error.message).toContain('Did you mean');
            expect(error.message).toContain('name');
        });

        test('Should include table name if provided', () => {
            const error = new ColumnNotFoundError('invalid_column', 'student');
            expect(error.message).toContain('student');
            expect(error.tableName).toBe('student');
        });
    });

    describe('ValidationError', () => {
        test('Should store field and value', () => {
            const error = new ValidationError('Invalid table name', 'tableName', '../etc/passwd');
            expect(error.field).toBe('tableName');
            expect(error.value).toBe('../etc/passwd');
            expect(error.message).toBe('Invalid table name');
        });
    });

    describe('QueryExecutionError', () => {
        test('Should store query and original error', () => {
            const query = 'SELECT * FROM student';
            const originalError = new Error('Column not found');
            const error = new QueryExecutionError('Query failed', query, originalError);
            expect(error.query).toBe(query);
            expect(error.originalError).toBe(originalError);
        });
    });

    describe('SecurityError', () => {
        test('Should create security error', () => {
            const error = new SecurityError('Path traversal detected');
            expect(error.message).toBe('Path traversal detected');
            expect(error.name).toBe('SecurityError');
        });
    });
});

describe('Helper Functions', () => {
    describe('levenshteinDistance', () => {
        test('Should calculate distance correctly', () => {
            expect(levenshteinDistance('', '')).toBe(0);
            expect(levenshteinDistance('abc', 'abc')).toBe(0);
            expect(levenshteinDistance('abc', 'ab')).toBe(1);
            expect(levenshteinDistance('abc', 'abd')).toBe(1);
            expect(levenshteinDistance('abc', 'xyz')).toBe(3);
        });

        test('Should be case sensitive', () => {
            expect(levenshteinDistance('ABC', 'abc')).toBe(3);
        });
    });

    describe('findSimilarStrings', () => {
        test('Should find similar strings', () => {
            const candidates = ['name', 'age', 'id', 'email'];
            const similar = findSimilarStrings('naem', candidates);
            expect(similar).toContain('name');
        });

        test('Should return empty array if no similar strings', () => {
            const candidates = ['name', 'age', 'id'];
            const similar = findSimilarStrings('completely_different', candidates);
            expect(similar).toEqual([]);
        });

        test('Should limit results to top 3', () => {
            const candidates = ['name1', 'name2', 'name3', 'name4', 'name5'];
            const similar = findSimilarStrings('name', candidates);
            expect(similar.length).toBeLessThanOrEqual(3);
        });

        test('Should sort by distance', () => {
            const candidates = ['student_name', 'name', 'student_id'];
            const similar = findSimilarStrings('naem', candidates);
            expect(similar[0]).toBe('name'); // Closest match should be first
        });
    });
});

describe('Error Integration with Query Execution', () => {
    const { executeSELECTQuery } = require('../src/queryExecuter');

    test('Should throw TableNotFoundError for non-existent table', async () => {
        await expect(executeSELECTQuery('SELECT * FROM nonexistent_table'))
            .rejects.toThrow(TableNotFoundError);
    });

    test('Should throw ColumnNotFoundError for invalid column in WHERE', async () => {
        await expect(executeSELECTQuery('SELECT * FROM student WHERE invalid_column = 1'))
            .rejects.toThrow(ColumnNotFoundError);
    });

    test('ColumnNotFoundError should suggest similar column names', async () => {
        try {
            await executeSELECTQuery('SELECT * FROM student WHERE agee = 25');
            fail('Should have thrown an error');
        } catch (error) {
            expect(error).toBeInstanceOf(ColumnNotFoundError);
            expect(error.message).toContain('Did you mean');
            expect(error.message).toContain('age');
        }
    });
});
