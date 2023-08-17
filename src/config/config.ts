import * as path from 'path';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

export const config = () => ({
  app: {
    port: parseInt(process.env.PORT) || 3000,
  },
  db: {
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'student',
    password: 'student',
    database: 'kupipodariday',
    entities: [path.resolve(`${__dirname}/../../**/*.entity{.ts,.js}`)],
    migrations: [
      path.resolve(`${__dirname}/../../src/database/migrations/*{.ts,.js}`),
    ],
    synchronize: false,
  } as PostgresConnectionOptions,
  jwt: {
    secret: 'secretkey',
  },
});
