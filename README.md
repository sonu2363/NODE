Real-Time Polling System with Kafka
A high-concurrency polling system built with Node.js, Kafka, PostgreSQL, and WebSockets.

Features
1. Real-time poll updates using WebSocket
2. Message queuing with Apache Kafka
3. PostgreSQL database for persistence
4. RESTful APIs for poll management
5. Global leaderboard functionality

Prerequisites
1. Node.js (v14 or higher)
2. PostgreSQL (v13 or higher)
3. Apache Kafka (v3.0 or higher)


##Installation 

1. Clone the repository:
git clone https://github.com/yourusername/polling-system.git
cd polling-system

2. Install Dependencis
npm install

3. Configure environment variables:
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=polling_system
PORT=3000

4. Create PostgreSQL database:
CREATE DATABASE polling_system;

##Starting Services

1. Starting Zookeeper:
cd /path/to/kafka
bin\windows\zookeeper-server-start.bat config\zookeeper.properties

2. Start Kafka
cd /path/to/kafka
bin\windows\kafka-server-start.bat config\server.properties

3. Create Kafka topic:
cd /path/to/kafka
bin\windows\kafka-topics.bat --create --topic votes --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1

4. Start the application:
npm run dev

##API Endpoints

#Create Poll

POST /polls
Content-Type: application/json

{
    "question": "What's your favorite programming language?"
    "options":["JavaScript","Python","Java","C++"]
}

#Vote on Poll
POST /polls/{pollId}/vote/{optionId}

#Get Poll Results
GET /polls/{pollId}

#Get Leaderboard
GET /leaderboard

#WebSocket Usage
Connect to a poll's real-time updates:

const ws = new WebSocket('ws://localhost:3000/polls/{pollId}');

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('Received update:', data);
};

#Testing
1. Create a poll:
curl -X POST http://localhost:3000/polls ^
-H "Content-Type: application/json" ^
-d "{\"question\":\"Favorite color?\",\"options\":[\"Red\",\"Blue\",\"Green\"]}"

2. Connect to WebSocket updates(using wscat):
npm install -g wscat
wscat -c ws://localhost:3000/polls/your-poll-id

3. Cast votes and observe real-time updates.

##Error Handling
The system includes comprehensive error handling for:

1. Invalid poll IDs
2. Connection failures
3. Database errors
4. Message processing errors

#Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

#License
This project is licensed under the MIT License.