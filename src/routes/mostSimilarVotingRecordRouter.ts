import { log } from 'console';
import express, { Request, Response } from 'express';
import { appStatus } from '../models/appStatus'
//import { mostSimilarVotingRecord } from "../databases/neoManager";
import { mostSimilarVotingRecord } from "../databases/mongoManager";

const mostSimilarVotingRecordRouter = express.Router();

mostSimilarVotingRecordRouter.get('/', async (req: Request, res: Response) => {

  console.log('Checking node similariy ', req.query);

  // @ts-ignore
  const result = await mostSimilarVotingRecord(req?.query?.name);

  // @ts-ignore
  res.json(result[0]);
});

export default mostSimilarVotingRecordRouter;
