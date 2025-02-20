const Poll = require('../models/Poll');
const PollOption = require('../models/PollOption');
const { producer } = require('../config/kafka');

class PollController {
    constructor(wsManager) {
        this.wsManager = wsManager;
    }

    async createPoll(req, res) {
        try {
            const { question, options } = req.body;

            const poll = await Poll.create({ question });
            
            const pollOptions = await Promise.all(
                options.map(text => 
                    PollOption.create({ text, PollId: poll.id })
                )
            );

            res.status(201).json({
                ...poll.toJSON(),
                options: pollOptions
            });
        } catch (error) {
            console.error('Create poll error:', error);
            res.status(500).json({ error: 'Failed to create poll' });
        }
    }

    async vote(req, res) {
        try {
            const { pollId, optionId } = req.params;

            await producer.send({
                topic: 'votes',
                messages: [{
                    key: pollId,
                    value: JSON.stringify({
                        pollId,
                        optionId,
                        timestamp: new Date().toISOString()
                    })
                }]
            });

            res.status(202).json({ message: 'Vote registered' });
        } catch (error) {
            console.error('Vote error:', error);
            res.status(500).json({ error: 'Failed to process vote' });
        }
    }

    async getPoll(req, res) {
        try {
            const { id } = req.params;
            
            const poll = await Poll.findByPk(id, {
                include: [PollOption]
            });

            if (!poll) {
                return res.status(404).json({ error: 'Poll not found' });
            }

            res.json(poll);
        } catch (error) {
            console.error('Get poll error:', error);
            res.status(500).json({ error: 'Failed to fetch poll' });
        }
    }
}

module.exports = PollController;