// const net = require('net');
// const { EventEmitter } = require('events');
// const { executeSELECTQuery, executeINSERTQuery, executeDELETEQuery } = require('./queryExecuter');

// class QueryQueue extends EventEmitter {
//     constructor() {
//         super();
//         this.queue = [];
//         this.isProcessing = false;
//     }

//     addQuery(query, callback) {
//         const queryId = Date.now() + Math.random().toString(16);
//         this.queue.push({ query, callback, queryId });
//         this.emit('newQuery');
//         return queryId;
//     }

//     processQueue() {
//         if (this.isProcessing || this.queue.length === 0) {
//             return;
//         }
//         this.isProcessing = true;
//         const { query, callback, queryId } = this.queue.shift();
//         this.execute(query)
//             .then(result => callback(null, { queryId, result }))
//             .catch(error => callback(error, { queryId }))
//             .finally(() => {
//                 this.isProcessing = false;
//                 this.processQueue();
//             });
//     }

//     async execute(query) {
//         if (query.toLowerCase().startsWith('select')) {
//             return await executeSELECTQuery(query);
//         } else if (query.toLowerCase().startsWith('insert into')) {
//             return await executeINSERTQuery(query);
//         } else if (query.toLowerCase().startsWith('delete from')) {
//             return await executeDELETEQuery(query);
//         } else {
//             throw new Error('Unsupported command');
//         }
//     }
// }

// const queryQueue = new QueryQueue();
// queryQueue.on('newQuery', () => queryQueue.processQueue());

// const server = net.createServer();
// let activeConnection = false;

// server.on('connection', (socket) => {
//     if (activeConnection) {
//         socket.end('Another connection is already active.');
//         return;
//     }
//     activeConnection = true;

//     socket.write('Connected\n');

//     socket.on('data', (data) => {
//         const query = data.toString().trim();
//         const queryId = queryQueue.addQuery(query, (error, response) => {
//             if (error) {
//                 socket.write(`Error: ${error.message}\n`);
//             } else {
//                 socket.write(`Result for Query ID ${response.queryId}: ${JSON.stringify(response.result)}\n`);
//             }
//         });
//         socket.write(`Query received with ID: ${queryId}\n`);
//     });

//     socket.on('close', () => {
//         activeConnection = false;
//     });
// });

// server.listen(5432, () => {
//     console.log('Server listening on port 5432');
// });

const net = require('net');
const { EventEmitter } = require('events');
const { executeSELECTQuery, executeINSERTQuery, executeDELETEQuery } = require('./queryExecuter');

class QueryQueue extends EventEmitter {
    constructor() {
        super();
        this.queue = [];
        this.isProcessing = false;
    }

    addQuery(queryId, query, callback) {
        this.queue.push({ query, callback, queryId });
        this.emit('newQuery');
    }

    processQueue() {
        if (this.isProcessing || this.queue.length === 0) {
            return;
        }
        this.isProcessing = true;
        const { query, callback, queryId } = this.queue.shift();
        this.execute(query)
            .then(result => callback(null, queryId, result))
            .catch(error => callback(error, queryId))
            .finally(() => {
                this.isProcessing = false;
                this.processQueue();
            });
    }

    async execute(query) {
        if (query.toLowerCase().startsWith('select')) {
            return await executeSELECTQuery(query);
        } else if (query.toLowerCase().startsWith('insert into')) {
            return await executeINSERTQuery(query);
        } else if (query.toLowerCase().startsWith('delete from')) {
            return await executeDELETEQuery(query);
        } else {
            throw new Error('Unsupported command');
        }
    }
}

const queryQueue = new QueryQueue();
queryQueue.on('newQuery', () => queryQueue.processQueue());

const server = net.createServer();
let activeConnection = false;

server.on('connection', (socket) => {
    if (activeConnection) {
        socket.end('Another connection is already active.');
        return;
    }
    activeConnection = true;

    socket.write('Connected\n');

    socket.on('data', (data) => {
        const [queryId, query] = data.toString().trim().split(':', 2);
        queryQueue.addQuery(queryId, query, (error, queryId, result) => {
            let response;
            if (error) {
                response = `${queryId}<|>Error: ${error.message}`;
            } else {
                response = `${queryId}<|>${JSON.stringify(result)}`;
            }
            socket.write(response + '\n');
        });
    });

    socket.on('close', () => {
        activeConnection = false;
    });
});

server.listen(5432, () => {
    console.log('Server listening on port 5432');
});
