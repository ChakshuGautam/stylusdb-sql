const net = require('net');

const client = new net.Socket();
const port = 5432;
const host = '127.0.0.1';

client.connect(port, host, () => {
  console.log('Attempting to connect to the server...');
});

const queries = [
  'SELECT id, name FROM student WHERE age = 25',
  'SELECT student.name, enrollment.course, student.age FROM student INNER JOIN enrollment ON student.id = enrollment.student_id WHERE student.age > 25',
  'SELECT FROM table',
  'SELECT DISTINCT student_id, course FROM enrollment'
];

client.on('data', (data) => {
  const message = data.toString().trim();
  console.log('Received from server:', message);

  if (message === 'Connected') {
    isConnected = true;
    sendQueries();
  }
});

client.on('close', () => {
  console.log('Connection closed');
  isConnected = false;
});

client.on('error', (error) => {
  console.error('Error:', error.message);
  isConnected = false;
});

function sendQueries() {
  if (!isConnected) {
    console.log('Not connected to the server.');
    return;
  }

  queries.forEach((query, index) => {
    setTimeout(() => {
      console.log(`Sending: ${query}`);
      client.write(query);
    }, index * 1000);
  });
}