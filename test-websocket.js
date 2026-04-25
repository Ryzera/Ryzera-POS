const io = require('socket.io-client');

const socket = io('http://localhost:3000', {
  transports: ['websocket'],
});

socket.on('connect', () => {
  console.log('✅ Connected to WebSocket server!');
  console.log('Socket ID:', socket.id);
});

socket.on('new-notification', (data) => {
  console.log('📨 New notification received:', data);
});

socket.on('disconnect', () => {
  console.log('❌ Disconnected from server');
});

// Keep connection alive
setTimeout(() => {
  console.log('Testing connection...');
}, 1000);