// Import the Client class
const { Client } = require('./client');

const client = new Client('127.0.0.1:5432');
client.connect();


setTimeout(() => {
    client.execute('SELECT id FROM student')
        .then(response => {
            console.log('Response:', response);
        })
        .catch(error => {
            console.error('Error:', error.message);
        })
        .finally(() => {
            client.disconnect();
        });
}, 3000);