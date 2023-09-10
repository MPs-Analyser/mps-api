import express, { Request, Response } from 'express';

const mpStatsRouter = express.Router();

mpStatsRouter.get('/', (req: Request, res: Response) => {

  const mps = 'https://members-api.parliament.uk/api/Members/Search?skip=0&take=20'

  res.json({ mps });
});

export default mpStatsRouter;
