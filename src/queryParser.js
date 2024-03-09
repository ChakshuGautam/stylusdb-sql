/*
Creating a Query Parser which can parse SQL `SELECT` Queries only.
// */
function parseSelectQuery(query) {
    try {

        // Trim the query to remove any leading/trailing whitespaces
        query = query.trim();

        // Initialize distinct flag
        let isDistinct = false; // Global DISTINCT, not within COUNT
        let isCountDistinct = false; // New flag for DISTINCT within COUNT
        let distinctFields = []; // Array to hold fields after DISTINCT within COUNT or APPROXIMATE_COUNT


        // Detect APPROXIMATE_COUNT
        let isApproximateCount = false;
        const approximateCountRegex = /APPROXIMATE_COUNT\((DISTINCT\s)?(.+?)\)/i;
        const approximateCountMatch = query.match(approximateCountRegex);
        if (approximateCountMatch) {
            isApproximateCount = true;
            // If DISTINCT is used within APPROXIMATE_COUNT, capture the fields
            if (approximateCountMatch[1]) {
                isCountDistinct = true;
                // distinctFields.push(approximateCountMatch[2].trim());
            }
            // Simplify further processing by normalizing to COUNT (adjust as necessary for your logic)
            query = query.replace(approximateCountRegex, `COUNT(${approximateCountMatch[1] || ''}${approximateCountMatch[2]})`);
        }

        // Check for DISTINCT keyword and update the query
        if (query.toUpperCase().includes('SELECT DISTINCT')) {
            isDistinct = true;
            query = query.replace('SELECT DISTINCT', 'SELECT');
        }

        // Updated regex to capture LIMIT clause and remove it for further processing
        const limitRegex = /\sLIMIT\s(\d+)/i;
        const limitMatch = query.match(limitRegex);

        let limit = null;
        if (limitMatch) {
            limit = parseInt(limitMatch[1], 10);
            query = query.replace(limitRegex, ''); // Remove LIMIT clause
        }

        // Process ORDER BY clause and remove it for further processing
        const orderByRegex = /\sORDER BY\s(.+)/i;
        const orderByMatch = query.match(orderByRegex);
        let orderByFields = null;
        if (orderByMatch) {
            orderByFields = orderByMatch[1].split(',').map(field => {
                const [fieldName, order] = field.trim().split(/\s+/);
                return { fieldName, order: order ? order.toUpperCase() : 'ASC' };
            });
            query = query.replace(orderByRegex, '');
        }

        // Process GROUP BY clause and remove it for further processing
        const groupByRegex = /\sGROUP BY\s(.+)/i;
        const groupByMatch = query.match(groupByRegex);
        let groupByFields = null;
        if (groupByMatch) {
            groupByFields = groupByMatch[1].split(',').map(field => field.trim());
            query = query.replace(groupByRegex, '');
        }

        // Process WHERE clause
        const whereSplit = query.split(/\sWHERE\s/i);
        const queryWithoutWhere = whereSplit[0]; // Everything before WHERE clause
        const whereClause = whereSplit.length > 1 ? whereSplit[1].trim() : null;

        // Process JOIN clause
        const joinSplit = queryWithoutWhere.split(/\s(INNER|LEFT|RIGHT) JOIN\s/i);
        const selectPart = joinSplit[0].trim(); // Everything before JOIN clause

        // Extract JOIN information
        const { joinType, joinTable, joinCondition } = parseJoinClause(queryWithoutWhere);

        const countDistinctRegex = /COUNT\((DISTINCT\s\((.*?)\))\)/gi;
        let countDistinctMatch;
        while ((countDistinctMatch = countDistinctRegex.exec(query)) !== null) {
            isCountDistinct = true;
            if (isApproximateCount) {
                distinctFields.push(...countDistinctMatch[2].trim().split(',').map(field => field.trim()));
            } else {
                distinctFields.push(...countDistinctMatch[2].trim().split(',').map(field => field.trim()));
            }
        }

        // Parse SELECT part
        const selectRegex = /^SELECT\s(.+?)\sFROM\s(.+)/i;
        const selectMatch = selectPart.match(selectRegex);
        if (!selectMatch) {
            throw new Error('Invalid SELECT format');
        }
        let [, fields, table] = selectMatch;

        // Parse WHERE part if it exists
        let whereClauses = [];
        if (whereClause) {
            whereClauses = parseWhereClause(whereClause);
        }

        // Check for aggregate functions without GROUP BY
        const hasAggregateWithoutGroupBy = checkAggregateWithoutGroupBy(query, groupByFields);

        // Temporarily replace commas within parentheses to avoid incorrect splitting
        const tempPlaceholder = '__TEMP_COMMA__'; // Ensure this placeholder doesn't appear in your actual queries
        fields = fields.replace(/\(([^)]+)\)/g, (match) => match.replace(/,/g, tempPlaceholder));

        // Now split fields and restore any temporary placeholders
        const parsedFields = fields.split(',').map(field =>
            field.trim().replace(new RegExp(tempPlaceholder, 'g'), ','));


        return {
            fields: parsedFields,
            table: table.trim(),
            whereClauses,
            joinType,
            joinTable,
            joinCondition,
            groupByFields,
            orderByFields,
            hasAggregateWithoutGroupBy,
            isApproximateCount,
            isCountDistinct,
            limit,
            distinctFields,
            isDistinct
        };
    } catch (error) {
        throw new Error(`Query parsing error: ${error.message}`);
    }
}

function checkAggregateWithoutGroupBy(query, groupByFields) {
    const aggregateFunctionRegex = /(\bCOUNT\b|\bAVG\b|\bSUM\b|\bMIN\b|\bMAX\b)\s*\(\s*(\*|\w+)\s*\)/i;
    return aggregateFunctionRegex.test(query) && !groupByFields;
}

function parseWhereClause(whereString) {
    const conditionRegex = /(.*?)(=|!=|>=|<=|>|<)(.*)/;
    return whereString.split(/ AND | OR /i).map(conditionString => {
        if (conditionString.includes(' LIKE ')) {
            const [field, pattern] = conditionString.split(/\sLIKE\s/i);
            return { field: field.trim(), operator: 'LIKE', value: pattern.trim().replace(/^'(.*)'$/, '$1') };
        } else {
            const match = conditionString.match(conditionRegex);
            if (match) {
                const [, field, operator, value] = match;
                return { field: field.trim(), operator, value: value.trim() };
            }
            throw new Error('Invalid WHERE clause format');
        }
    });
}

function parseJoinClause(query) {
    const joinRegex = /\s(INNER|LEFT|RIGHT) JOIN\s(.+?)\sON\s([\w.]+)\s*=\s*([\w.]+)/i;
    const joinMatch = query.match(joinRegex);

    if (joinMatch) {
        return {
            joinType: joinMatch[1].trim(),
            joinTable: joinMatch[2].trim(),
            joinCondition: {
                left: joinMatch[3].trim(),
                right: joinMatch[4].trim()
            }
        };
    }

    return {
        joinType: null,
        joinTable: null,
        joinCondition: null
    };
}

function parseInsertQuery(query) {
    // Simplify the query by removing schema names and table references from column names
    let simplifiedQuery = query.replace(/"?\w+"?\."(\w+)"?/g, '$1');

    // Parse the INSERT INTO part
    const insertRegex = /INSERT INTO "?(\w+)"?\s\(([^)]+)\)\sVALUES\s\(([^)]+)\)/i;
    const match = simplifiedQuery.match(insertRegex);

    if (!match) {
        throw new Error("Invalid INSERT INTO syntax.");
    }

    const [, table, columns, values] = match;

    // Function to clean and remove surrounding quotes from column names
    const cleanColumnName = (name) => {
        return name.trim().replace(/^"?(.+?)"?$/g, '$1');
    };

    // Function to clean and remove surrounding single quotes from values
    const cleanValue = (value) => {
        return value.trim().replace(/^'(.*)'$/g, '$1').replace(/^"(.*)"$/g, '$1');
    };

    // Function to clean returning column names by removing table prefixes and quotes
    const cleanReturningColumn = (name) => {
        return name.trim().replace(/\w+\./g, '').replace(/^"?(.+?)"?$/g, '$1');
    };

    // Parse and clean columns and values
    const parsedColumns = columns.split(',').map(cleanColumnName);
    const parsedValues = values.split(',').map(cleanValue);

    // Parse the RETURNING part if present
    const returningMatch = simplifiedQuery.match(/RETURNING\s(.+)$/i);
    const returningColumns = returningMatch
        ? returningMatch[1].split(',').map(cleanReturningColumn)
        : [];
    return {
        type: 'INSERT',
        table: cleanColumnName(table),
        columns: parsedColumns,
        values: parsedValues,
        returningColumns
    };
}

function parseDeleteQuery(query) {
    const deleteRegex = /DELETE FROM (\w+)( WHERE (.*))?/i;
    const match = query.match(deleteRegex);

    if (!match) {
        throw new Error("Invalid DELETE syntax.");
    }

    const [, table, , whereString] = match;
    let whereClauses = [];
    if (whereString) {
        whereClauses = parseWhereClause(whereString);
    }

    return {
        type: 'DELETE',
        table: table.trim(),
        whereClauses
    };
}


module.exports = { parseSelectQuery, parseJoinClause, parseInsertQuery, parseDeleteQuery };