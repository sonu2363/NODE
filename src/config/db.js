import { createConnection } from 'typeorm';
import { Poll } from '../models/Poll';
import { PollOption } from '../models/PollOption';
import { Vote } from '../models/Vote';

export const initializeDatabase = async () => {
  try {
    const connection = await createConnection({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'your_password',
      database: 'polling_system',
      entities: [Poll, PollOption, Vote],
      synchronize: true // Note: Disable in production
    });
    console.log('Database connection established');
    return connection;
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
};