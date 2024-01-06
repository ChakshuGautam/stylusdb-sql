/*
Creating a Query Parser which can parse SQL `SELECT` Queries only.
*/
function parseQuery(query) {
    // First, let's trim the query to remove any leading/trailing whitespaces
    query = query.trim();

    // Initialize variables for different parts of the query
    let selectPart, fromPart;

    // Split the query at the WHERE clause if it exists
    const whereSplit = query.split(/\sWHERE\s/i);
    query = whereSplit[0]; // Everything before WHERE clause

    // WHERE clause is the second part after splitting, if it exists
    const whereClause = whereSplit.length > 1 ? whereSplit[1].trim() : null;

    // Split the remaining query at the JOIN clause if it exists
    const joinSplit = query.split(/\sINNER JOIN\s/i);
    selectPart = joinSplit[0].trim(); // Everything before JOIN clause

    // JOIN clause is the second part after splitting, if it exists
    const joinPart = joinSplit.length > 1 ? joinSplit[1].trim() : null;

    // Parse the SELECT part
    const selectRegex = /^SELECT\s(.+?)\sFROM\s(.+)/i;
    const selectMatch = selectPart.match(selectRegex);
    if (!selectMatch) {
        throw new Error('Invalid SELECT format');
    }

    const [, fields, table] = selectMatch;

    // Parse the JOIN part if it exists
    let joinTable = null, joinCondition = null;
    if (joinPart) {
        const joinRegex = /^(.+?)\sON\s([\w.]+)\s*=\s*([\w.]+)/i;
        const joinMatch = joinPart.match(joinRegex);
        if (!joinMatch) {
            throw new Error('Invalid JOIN format');
        }

        joinTable = joinMatch[1].trim();
        joinCondition = {
            left: joinMatch[2].trim(),
            right: joinMatch[3].trim()
        };
    }

    // Parse the WHERE part if it exists
    let whereClauses = [];
    if (whereClause) {
        whereClauses = parseWhereClause(whereClause);
    }

    return {
        fields: fields.split(',').map(field => field.trim()),
        table: table.trim(),
        whereClauses,
        joinTable,
        joinCondition
    };
}

function parseWhereClause(whereString) {
    const conditionRegex = /(.*?)(=|!=|>|<|>=|<=)(.*)/;
    return whereString.split(/ AND | OR /i).map(conditionString => {
        const match = conditionString.match(conditionRegex);
        if (match) {
            const [, field, operator, value] = match;
            return { field: field.trim(), operator, value: value.trim() };
        }
        throw new Error('Invalid WHERE clause format');
    });
}

module.exports = parseQuery;