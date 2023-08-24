import { log } from 'console';
import express, { Request, Response } from 'express';
import { appStatus } from '../models/appStatus'
import { mostSimilarVotingRecord } from "../databases/neoManager"

const mostSimilarVotingRecordRouter = express.Router();

mostSimilarVotingRecordRouter.get('/', async (req: Request, res: Response) => {

  console.log('Checking node similariy ', req.query);

  // @ts-ignore
  const result = await mostSimilarVotingRecord(req?.query?.name);

  // @ts-ignore
  res.json(result);
});

export default mostSimilarVotingRecordRouter;
