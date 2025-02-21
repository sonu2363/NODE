const { Kafka, CompressionTypes, logLevel } = require('kafkajs');

/**
 * KafkaProducer configuration
 * @typedef {Object} KafkaConfig
 * @property {string[]} brokers - Kafka broker addresses
 * @property {string} clientId - Client identifier
 * @property {number} retryAttempts - Number of retry attempts
 * @property {number} retryInitialDelay - Initial retry delay in ms
 */
const DEFAULT_CONFIG = {
    brokers: ['localhost:9092'],
    clientId: 'polling-producer',
    retryAttempts: 8,
    retryInitialDelay: 100,
    topic: 'votes'
};

class KafkaProducer {
    /**
     * @param {Partial<KafkaConfig>} config
     */
    constructor(config = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.kafka = new Kafka({
            clientId: this.config.clientId,
            brokers: this.config.brokers,
            retry: {
                initialRetryTime: this.config.retryInitialDelay,
                retries: this.config.retryAttempts
            },
            logLevel: logLevel.ERROR
        });

        this.producer = this.kafka.producer({
            allowAutoTopicCreation: true,
            idempotent: true, // Ensures exactly-once delivery
            maxInFlightRequests: 1
        });
        this.isConnected = false;
    }

    async connect() {
        if (this.isConnected) return;

        try {
            await this.producer.connect();
            this.isConnected = true;
            console.log(`Producer connected to ${this.config.brokers.join(', ')}`);
        } catch (error) {
            this.isConnected = false;
            const message = `Failed to connect to Kafka: ${error.message}`;
            console.error(message);
            throw new Error(message);
        }
    }

    /**
     * @param {string} pollId
     * @param {string} optionId
     * @param {Object} [metadata={}]
     */
    async sendVote(pollId, optionId, metadata = {}) {
        if (!this.isConnected) {
            throw new Error('Producer not connected. Call connect() first.');
        }

        if (!pollId || !optionId) {
            throw new Error('Poll ID and Option ID are required');
        }

        const message = {
            pollId,
            optionId,
            timestamp: new Date().toISOString(),
            ...metadata
        };

        try {
            const result = await this.producer.send({
                topic: this.config.topic,
                compression: CompressionTypes.GZIP,
                messages: [{
                    key: pollId,
                    value: JSON.stringify(message),
                    headers: {
                        source: Buffer.from('polling-system'),
                        timestamp: Buffer.from(Date.now().toString()),
                        messageType: Buffer.from('vote')
                    },
                    timestamp: Date.now()
                }]
            });

            console.log(`Vote sent for poll ${pollId}, option ${optionId}`, {
                topic: this.config.topic,
                partition: result[0].partition,
                offset: result[0].baseOffset
            });

            return result;
        } catch (error) {
            const message = `Failed to send vote: ${error.message}`;
            console.error(message);
            throw new Error(message);
        }
    }

    async disconnect() {
        if (!this.isConnected) return;

        try {
            await this.producer.disconnect();
            this.isConnected = false;
            console.log('Producer disconnected successfully');
        } catch (error) {
            const message = `Failed to disconnect producer: ${error.message}`;
            console.error(message);
            throw new Error(message);
        }
    }

    /**
     * Gracefully handle cleanup
     */
    async cleanup() {
        if (this.isConnected) {
            await this.disconnect();
        }
    }
}

module.exports = KafkaProducer;