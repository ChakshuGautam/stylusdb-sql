/*
Creating a Query Parser which can parse SQL `SELECT` Queries only.
*/
function parseQuery(query) {
    // Trim the query to remove any leading/trailing whitespaces
    query = query.trim();

    // Updated regex to capture ORDER BY clause
    const orderByRegex = /\sORDER BY\s(.+)/i;
    const orderByMatch = query.match(orderByRegex);

    let orderByFields = null;
    if (orderByMatch) {
        orderByFields = orderByMatch[1].split(',').map(field => {
            const [fieldName, order] = field.trim().split(/\s+/);
            return { fieldName, order: order ? order.toUpperCase() : 'ASC' };
        });
    }

    // Remove ORDER BY clause from the query for further processing
    query = query.replace(orderByRegex, '');

    // Split the query at the GROUP BY clause if it exists
    const groupByRegex = /\sGROUP BY\s(.+)/i;
    const groupByMatch = query.match(groupByRegex);

    let groupByFields = null;
    if (groupByMatch) {
        groupByFields = groupByMatch[1].split(',').map(field => field.trim());
    }

    // Remove GROUP BY clause from the query for further processing
    query = query.replace(groupByRegex, '');

    // Split the query at the WHERE clause if it exists
    const whereSplit = query.split(/\sWHERE\s/i);
    const queryWithoutWhere = whereSplit[0]; // Everything before WHERE clause

    // WHERE clause is the second part after splitting, if it exists
    const whereClause = whereSplit.length > 1 ? whereSplit[1].trim() : null;

    // Split the remaining query at the JOIN clause if it exists
    const joinSplit = queryWithoutWhere.split(/\s(INNER|LEFT|RIGHT) JOIN\s/i);
    const selectPart = joinSplit[0].trim(); // Everything before JOIN clause

    // Parse the SELECT part
    const selectRegex = /^SELECT\s(.+?)\sFROM\s(.+)/i;
    const selectMatch = selectPart.match(selectRegex);
    if (!selectMatch) {
        throw new Error('Invalid SELECT format');
    }

    const [, fields, table] = selectMatch;

    // Extract JOIN information
    const { joinType, joinTable, joinCondition } = parseJoinClause(queryWithoutWhere);

    // Parse the WHERE part if it exists
    let whereClauses = [];
    if (whereClause) {
        whereClauses = parseWhereClause(whereClause);
    }

    // Check for the presence of aggregate functions without GROUP BY
    const aggregateFunctionRegex = /(\bCOUNT\b|\bAVG\b|\bSUM\b|\bMIN\b|\bMAX\b)\s*\(\s*(\*|\w+)\s*\)/i;
    const hasAggregateWithoutGroupBy = aggregateFunctionRegex.test(query) && !groupByFields;

    return {
        fields: fields.split(',').map(field => field.trim()),
        table: table.trim(),
        whereClauses,
        joinType,
        joinTable,
        joinCondition,
        groupByFields,
        orderByFields,
        hasAggregateWithoutGroupBy
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

module.exports = { parseQuery, parseJoinClause };