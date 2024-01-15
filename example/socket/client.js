const net = require('net');

class Client {
    socket = new net.Socket();
    isConnected = false;
    isWaitingForResponse = false;
    responseHandlers = {};

    constructor(url) {
        this.url = url;
    }

    connect() {
        this.setup();
    }

    disconnect() {
        this.socket.end();
    }

    setup() {
        this.socket.connect(this.url.split(":")[1], this.url.split(":")[0], () => {
            console.log('Attempting to connect to the server...');
        });

        let buffer = '';

        this.socket.on('data', (data) => {
            buffer += data.toString();
            let boundary = buffer.indexOf('\n');
            while (boundary !== -1) {
                const message = buffer.substring(0, boundary).trim();
                buffer = buffer.substring(boundary + 1);
                boundary = buffer.indexOf('\n');

                this.handleResponse(message);
            }
        });

        this.socket.on('close', () => {
            console.log('Connection closed');
            this.isConnected = false;
        });

        this.socket.on('error', (error) => {
            console.error('Error:', error.message);
            this.isConnected = false;
        });
    }

    execute = (query) => {
        return new Promise((resolve, reject) => {
            if (!this.isConnected) {
                reject(new Error('Not connected to the server.'));
                return;
            }
            if (this.isWaitingForResponse) {
                reject(new Error('Waiting for the previous query to be processed.'));
                return;
            }

            const queryId = this.generateQueryId();
            this.responseHandlers[queryId] = { resolve, reject };
            this.socket.write(`${queryId}:${query}`);
            this.isWaitingForResponse = true;
        });
    }

    handleResponse(response) {
        if (response === 'Connected') {
            this.isConnected = true;
            console.log('Successfully connected to the server.');
            return;
        }

        // Handle query response
        const [queryId, result] = response.split('<|>', 2);
        console.log('Received from server:', queryId, result);
        if (this.responseHandlers[queryId]) {
            try {
                const parsedResult = JSON.parse(result);
                this.responseHandlers[queryId].resolve(parsedResult);
            } catch (error) {
                this.responseHandlers[queryId].reject(error);
            }
            delete this.responseHandlers[queryId];
            this.isWaitingForResponse = false;
        }
    }

    generateQueryId() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }
}

module.exports = { Client };