import { DataSource } from 'typeorm';

import { config } from './src/config/config';

export const AppDataSource = new DataSource(config().db);
