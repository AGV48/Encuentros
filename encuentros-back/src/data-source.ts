// src/data-source.ts
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './users/entities/user.entity';

export const AppDataSource = new DataSource({
  type: 'oracle',
  host: 'localhost',
  port: 1521,
  username: 'C##ENCUENTROS_ADMIN',
  password: 'admin',
  sid: 'XE',
  entities: [User],
  migrations: ['dist/migrations/*.js'],
  synchronize: false,
});
