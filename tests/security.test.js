const { validateTableName, getSafeFilePath } = require('../src/csvStorage');
const path = require('path');

describe('Security - Input Validation', () => {
    describe('validateTableName', () => {
        test('Should accept valid alphanumeric table names', () => {
            expect(() => validateTableName('student')).not.toThrow();
            expect(() => validateTableName('Student123')).not.toThrow();
            expect(() => validateTableName('my_table')).not.toThrow();
            expect(() => validateTableName('test-table')).not.toThrow();
        });

        test('Should accept table names with .csv extension', () => {
            expect(() => validateTableName('student.csv')).not.toThrow();
            expect(validateTableName('student.csv')).toBe('student');
        });

        test('Should reject table names with path traversal attempts', () => {
            expect(() => validateTableName('../etc/passwd')).toThrow('Invalid table name');
            expect(() => validateTableName('../../secret')).toThrow('Invalid table name');
            expect(() => validateTableName('../student')).toThrow('Invalid table name');
        });

        test('Should reject table names with special characters', () => {
            expect(() => validateTableName('student;DROP TABLE')).toThrow('Invalid table name');
            expect(() => validateTableName('student.txt')).toThrow('Invalid table name');
            expect(() => validateTableName('student/table')).toThrow('Invalid table name');
            expect(() => validateTableName('student\\table')).toThrow('Invalid table name');
        });

        test('Should reject empty or whitespace table names', () => {
            expect(() => validateTableName('')).toThrow('Invalid table name');
            expect(() => validateTableName('   ')).toThrow('Invalid table name');
        });
    });

    describe('getSafeFilePath', () => {
        test('Should return safe path for valid table names', () => {
            const safePath = getSafeFilePath('student.csv');
            expect(safePath).toContain('student.csv');
            expect(safePath).not.toContain('..');
        });

        test('Should prevent path traversal with ../', () => {
            expect(() => getSafeFilePath('../../etc/passwd.csv')).toThrow();
        });

        test('Should prevent absolute paths from escaping data directory', () => {
            // Absolute paths should be rejected
            expect(() => getSafeFilePath('/etc/passwd.csv')).toThrow('Path traversal detected');
        });

        test('Should handle filenames without .csv extension', () => {
            const safePath = getSafeFilePath('student');
            expect(safePath).toContain('student.csv');
        });

        test('Should normalize paths and prevent traversal', () => {
            expect(() => getSafeFilePath('./student/../../../etc/passwd')).toThrow();
        });
    });
});
