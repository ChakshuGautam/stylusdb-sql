const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { parse } = require('json2csv');
const hll = require('hll');
const { ValidationError, SecurityError, FileSystemError, TableNotFoundError } = require('./errors');

// Get the data directory - defaults to current directory
const DATA_DIR = path.resolve(process.env.DATA_DIR || '.');

/**
 * Validates and sanitizes a table name to prevent path traversal attacks
 * @param {string} tableName - The table name to validate
 * @returns {string} - The sanitized table name
 * @throws {Error} - If the table name is invalid
 */
function validateTableName(tableName) {
    // Remove .csv extension if present
    const cleanName = tableName.replace(/\.csv$/i, '');

    // Only allow alphanumeric characters, underscores, and hyphens
    if (!/^[a-zA-Z0-9_-]+$/.test(cleanName)) {
        throw new ValidationError(
            `Invalid table name: ${tableName}. Only alphanumeric characters, underscores, and hyphens are allowed.`,
            'tableName',
            tableName
        );
    }

    return cleanName;
}

/**
 * Gets a safe file path for a table, preventing path traversal
 * @param {string} filename - The filename (can include path traversal attempts)
 * @returns {string} - The safe, resolved file path
 * @throws {Error} - If path traversal is detected
 */
function getSafeFilePath(filename) {
    // Remove leading './' if present (common in relative paths)
    let cleanFilename = filename.replace(/^\.\//, '').replace(/^\.\\/, '');

    // Reject any remaining path traversal attempts
    if (cleanFilename.includes('..') || cleanFilename.includes('/') || cleanFilename.includes('\\')) {
        throw new SecurityError('Path traversal detected. Only simple table names are allowed.');
    }

    // Extract table name from filename
    const tableName = path.basename(cleanFilename, '.csv');

    // Validate the table name
    validateTableName(tableName);

    // Construct the safe path
    const safePath = path.resolve(DATA_DIR, `${tableName}.csv`);

    // Ensure the resolved path is within the data directory
    if (!safePath.startsWith(DATA_DIR + path.sep) && safePath !== path.resolve(DATA_DIR, `${tableName}.csv`)) {
        throw new SecurityError('Path traversal detected. Access denied.');
    }

    return safePath;
}

function readCSV(filePath) {
    const results = [];
    const safePath = getSafeFilePath(filePath);
    const tableName = path.basename(filePath, '.csv');

    return new Promise((resolve, reject) => {
        // Check if file exists first
        if (!fs.existsSync(safePath)) {
            return reject(new TableNotFoundError(tableName));
        }

        fs.createReadStream(safePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => {
                resolve(results);
            })
            .on('error', (error) => {
                if (error.code === 'ENOENT') {
                    reject(new TableNotFoundError(tableName, error));
                } else {
                    reject(new FileSystemError(
                        `Error reading CSV file: ${error.message}`,
                        safePath,
                        error
                    ));
                }
            });
    });
}

function readCSVForHLL(filePath, bitSampleSize = 12, digestSize = 128) {
    const results = [];
    const safePath = getSafeFilePath(filePath);
    const tableName = path.basename(filePath, '.csv');
    var h = hll({ bitSampleSize: bitSampleSize, digestSize: digestSize });

    return new Promise((resolve, reject) => {
        // Check if file exists first
        if (!fs.existsSync(safePath)) {
            return reject(new TableNotFoundError(tableName));
        }

        fs.createReadStream(safePath)
            .pipe(csv())
            .on('data', (data) => h.insert(JSON.stringify(data)))
            .on('end', () => {
                resolve(h);
            })
            .on('error', (error) => {
                if (error.code === 'ENOENT') {
                    reject(new TableNotFoundError(tableName, error));
                } else {
                    reject(new FileSystemError(
                        `Error reading CSV file: ${error.message}`,
                        safePath,
                        error
                    ));
                }
            });
    });
}

async function writeCSV(filename, data) {
    const safePath = getSafeFilePath(filename);
    const csv = parse(data);

    try {
        // Use async writeFile instead of blocking writeFileSync
        await fs.promises.writeFile(safePath, csv, 'utf8');
    } catch (error) {
        throw new FileSystemError(
            `Error writing CSV file: ${error.message}`,
            safePath,
            error
        );
    }
}

module.exports = { readCSV, readCSVForHLL, writeCSV, validateTableName, getSafeFilePath };