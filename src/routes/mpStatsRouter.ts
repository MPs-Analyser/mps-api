import { log } from 'console';
import express, { Request, Response } from 'express';
import { appStatus } from '../models/appStatus'

const mpStatsRouter = express.Router();

mpStatsRouter.get('/', (req: Request, res: Response) => {

  const mps = 'https://members-api.parliament.uk/api/Members/Search?skip=0&take=20'

  res.json({ mps });
});

export default mpStatsRouter;
