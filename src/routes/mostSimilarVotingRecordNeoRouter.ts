import express, { Request, Response } from 'express';
import { mostSimilarVotingRecord } from "../databases/neoManager";

const mostSimilarVotingRecordRouter = express.Router();

mostSimilarVotingRecordRouter.get('/', async (req: Request, res: Response) => {

  console.log('Checking node similariy ', req.query);

  // @ts-ignore
  const result = await mostSimilarVotingRecord(req?.query?.name);
  
  // @ts-ignore
  res.json(result.records);
});

export default mostSimilarVotingRecordRouter;
