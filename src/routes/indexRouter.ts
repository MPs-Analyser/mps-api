import { log } from 'console';
import express, { Express, Request, Response } from 'express';

const app: Express = express();
const indexRouter = express.Router();

indexRouter.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server Nice one 123');
});

export default indexRouter;