import { ColumnTypeEnum, Query } from "@prisma/driver-adapter-utils";

function adaptInsertQuery(query: Query): string [] {
    // Check if it's an INSERT query
    if (!query.sql.startsWith('INSERT INTO')) {
        // Remove schema ("public".) from the query
        let simplifiedQuery = query.sql
            .replace(/"public"\./g, '')
            .replace(/\sWHERE\s1=1/g, '')
            .replace(/\sOFFSET\s'0'/g, '')
            .replace(/\sOFFSET\s0/g, '')
            .replace(/"([^"]+)"/g, '$1')
            .replace(/"?\b\w+\b"?\."?(\w+)"?/g, '$1')
            .replace(/\bFROM\s+(\w+)/, (match, p1) => `FROM ${p1.toLowerCase()}`);
        return [evaluateQuery({sql: simplifiedQuery, args: query.args})];
    }

    // Remove schema ("public".) from the query
    let simplifiedQuery = query.sql.replace(/"public"\./g, '');

    // Extract the table name
    const tableName = simplifiedQuery.split(' ')[2].replace(/"/g, '');

    // Split the query into INSERT and SELECT parts
    const insertPart = simplifiedQuery;
    
    return [evaluateQuery({sql: insertPart, args: query.args})]
}

function convertToPrismaResultSetSELECTQuery(dbResponse) {
    // Ensure the response is in array format even if it's a single record
    const records = Array.isArray(dbResponse) ? dbResponse : [dbResponse];

    // Extract column names from the first record (assuming all records have the same structure)
    const columnNames = records.length > 0 ? Object.keys(records[0]) : [];

    // Assign 'Number' type to 'id' column, and 'String' to all other columns
    const columnTypes = columnNames.map(columnName => columnName === 'id' ? ColumnTypeEnum.Int32 : ColumnTypeEnum.Text);

    // Convert each record into an array of values
    const rows = records.map(record => 
        columnNames.map(columnName => 
            columnName === 'id' ? Number(record[columnName]) : record[columnName]
        )
    );

    // Construct the ResultSet
    const resultSet = {
        columnNames,
        columnTypes,
        rows,
        lastInsertId: undefined // Set this appropriately if your DB returns last insert ID
    };

    return resultSet;
}

function convertToPrismaResultSetINSERTQuery(dbResponse) {
    const { message, insertedId, returning } = dbResponse;

    // If no data is returned (i.e., no RETURNING clause), create an empty result set
    if (!returning || Object.keys(returning).length === 0) {
        return {
            columnNames: [],
            columnTypes: [],
            rows: [],
            lastInsertId: insertedId ? insertedId.toString() : undefined
        };
    }

    // Extract column names and values from the returning object
    const columnNames = Object.keys(returning);
    const values = Object.values(returning);

    // Assign 'Number' type to 'id' column, and 'String' to all other columns
    const columnTypes = columnNames.map(columnName => columnName === 'id' ? ColumnTypeEnum.Int32 : ColumnTypeEnum.Text);

    // The rows array will contain only one row (the inserted row)
    const rows = [values];

    // Construct the ResultSet
    const resultSet = {
        columnNames,
        columnTypes,
        rows,
        lastInsertId: insertedId ? insertedId.toString() : undefined
    };

    return resultSet;
}

function evaluateQuery(queryObject: Query) {
    let { sql, args } = queryObject;

    // Replace placeholders with the corresponding values from args
    args.forEach((arg, index) => {
        sql = sql.replace(`$${index + 1}`, `'${arg}'`);
    });

    return sql;
}

export { adaptInsertQuery, convertToPrismaResultSetSELECTQuery, convertToPrismaResultSetINSERTQuery, evaluateQuery }