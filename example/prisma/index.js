import { PrismaClient } from '@prisma/client';
import { PrismaStylusDBSQL } from 'stylusdb-sql-prisma-adapter';
import net from 'net';


const connectionString = `127.0.0.1:5432`

class Client {
    socket = new net.Socket();
    isConnected = false;
    isWaitingForResponse = false;
    responseHandlers = {};

    constructor(url) {
        this.url = url;
    }

    connect() {
        return new Promise((resolve, reject) => {
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

            this.socket.on('connect', () => {
                this.isConnected = true;
                resolve();
            });

            this.socket.on('error', (error) => {
                console.error('Error:', error.message);
                this.isConnected = false;
                reject(error);
            });

            this.socket.on('close', () => {
                console.log('Connection closed');
                this.isConnected = false;
            });
        });
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

const client = new Client(connectionString)
const adapter = new PrismaStylusDBSQL(client, {})
const prisma = new PrismaClient({ adapter })

async function main() {
    await client.connect();
    const rawQueryData = await prisma.$queryRaw`SELECT id from student`;
    console.log({ rawQueryData });
    const student = await prisma.student.create({
        data: {
            name: 'test',
            age: '28',
        },
    }).catch((e) => {
        console.log(e)
    });
    console.log(student);

    const students = await prisma.student.findMany();
    console.log(students);
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })

