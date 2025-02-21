// src/app.js
const express = require('express');
const http = require('http');
const { initDb } = require('./config/db');
const { initKafka } = require('./config/kafka');
const WebSocketManager = require('./websocket/WebSocketManager');
const pollRoutes = require('./routes/polls');
const leaderboardRoutes = require('./routes/leaderboard');
const KafkaConsumerService = require('./services/kafkaConsumer');

const app = express();
const server = http.createServer(app);
const wsManager = new WebSocketManager(server);

app.use(express.json());

// Routes
app.use('/polls', pollRoutes(wsManager));
app.use('/leaderboard', leaderboardRoutes(wsManager));

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        await initDb();
        await initKafka();
        
        // Initialize Kafka consumer only once
        const kafkaConsumer = new KafkaConsumerService(wsManager);
        await kafkaConsumer.start();
        
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();