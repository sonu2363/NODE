const WebSocket = require('ws');

class WebSocketManager {
    constructor(server) {
        this.wss = new WebSocket.Server({ server });
        this.clients = new Map();
        this.initialize();
    }

    initialize() {
        this.wss.on('connection', (ws, req) => {
            const pollId = this.getPollIdFromUrl(req.url);
            
            if (pollId) {
                if (!this.clients.has(pollId)) {
                    this.clients.set(pollId, new Set());
                }
                this.clients.get(pollId).add(ws);

                ws.on('close', () => {
                    this.clients.get(pollId).delete(ws);
                    if (this.clients.get(pollId).size === 0) {
                        this.clients.delete(pollId);
                    }
                });
            }
        });
    }

    broadcast(pollId, data) {
        const clients = this.clients.get(pollId);
        if (clients) {
            const message = JSON.stringify(data);
            clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(message);
                }
            });
        }
    }

    getPollIdFromUrl(url) {
        if (!url) return null;
        const match = url.match(/\/polls\/([^\/]+)/);
        return match ? match[1] : null;
    }
}

module.exports = WebSocketManager;