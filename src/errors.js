/**
 * Custom error classes for StylusDB SQL
 * Provides better error handling and more informative error messages
 */

/**
 * Base error class for all StylusDB errors
 */
class StylusDBError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Thrown when SQL query syntax is invalid
 */
class QuerySyntaxError extends StylusDBError {
    constructor(message, query = null) {
        super(message);
        this.query = query;
    }
}

/**
 * Thrown when a table is not found or cannot be accessed
 */
class TableNotFoundError extends StylusDBError {
    constructor(tableName, originalError = null) {
        super(`Table '${tableName}' not found or cannot be accessed.`);
        this.tableName = tableName;
        this.originalError = originalError;
    }
}

/**
 * Thrown when a column doesn't exist in a table
 */
class ColumnNotFoundError extends StylusDBError {
    constructor(columnName, tableName = null, availableColumns = []) {
        let message = `Column '${columnName}' does not exist`;
        if (tableName) {
            message += ` in table '${tableName}'`;
        }
        if (availableColumns.length > 0) {
            message += `.\nAvailable columns: ${availableColumns.join(', ')}`;

            // Suggest similar column names using Levenshtein distance
            const suggestions = findSimilarStrings(columnName, availableColumns);
            if (suggestions.length > 0) {
                message += `\nDid you mean: ${suggestions.join(', ')}?`;
            }
        }
        super(message);
        this.columnName = columnName;
        this.tableName = tableName;
        this.availableColumns = availableColumns;
    }
}

/**
 * Thrown when there's an error reading or writing CSV files
 */
class FileSystemError extends StylusDBError {
    constructor(message, filePath = null, originalError = null) {
        super(message);
        this.filePath = filePath;
        this.originalError = originalError;
    }
}

/**
 * Thrown when a security violation is detected (e.g., path traversal)
 */
class SecurityError extends StylusDBError {
    constructor(message) {
        super(message);
    }
}

/**
 * Thrown when query execution fails
 */
class QueryExecutionError extends StylusDBError {
    constructor(message, query = null, originalError = null) {
        super(message);
        this.query = query;
        this.originalError = originalError;
    }
}

/**
 * Thrown when invalid data is provided
 */
class ValidationError extends StylusDBError {
    constructor(message, field = null, value = null) {
        super(message);
        this.field = field;
        this.value = value;
    }
}

/**
 * Helper function to find similar strings using Levenshtein distance
 * @param {string} target - The target string to match
 * @param {string[]} candidates - Array of candidate strings
 * @param {number} maxDistance - Maximum Levenshtein distance to consider (default: 3)
 * @returns {string[]} - Array of similar strings, sorted by distance
 */
function findSimilarStrings(target, candidates, maxDistance = 3) {
    const distances = candidates.map(candidate => ({
        string: candidate,
        distance: levenshteinDistance(target.toLowerCase(), candidate.toLowerCase())
    }));

    return distances
        .filter(item => item.distance <= maxDistance && item.distance > 0)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 3) // Return top 3 suggestions
        .map(item => item.string);
}

/**
 * Calculate Levenshtein distance between two strings
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {number} - The Levenshtein distance
 */
function levenshteinDistance(a, b) {
    const matrix = [];

    // Initialize matrix
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    // Fill matrix
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    matrix[i][j - 1] + 1,     // insertion
                    matrix[i - 1][j] + 1      // deletion
                );
            }
        }
    }

    return matrix[b.length][a.length];
}

module.exports = {
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
};
