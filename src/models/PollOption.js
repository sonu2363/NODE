const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Poll = require('./Poll');

const PollOption = sequelize.define('PollOption', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    text: {
        type: DataTypes.STRING,
        allowNull: false
    },
    votes: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
});

// Define relationships
Poll.hasMany(PollOption);
PollOption.belongsTo(Poll);

module.exports = PollOption;