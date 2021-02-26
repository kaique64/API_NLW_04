/* eslint-disable no-unreachable */
import 'reflect-metadata';
import express, { NextFunction, Request, Response } from 'express';
import 'express-async-errors';
import createConnection from './database';
import { route } from './routes';
import { AppError } from './errors/AppError';

createConnection();
const app = express();

app.use(express.json());
app.use(route);
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      msg: err.message,
    });
  }

  return res.status(500).json({
    status: 'Error',
    err: `Internat server error${err.message}`,
  });
});

export { app };
