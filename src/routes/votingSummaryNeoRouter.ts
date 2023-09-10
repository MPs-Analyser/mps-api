import express, { Request, Response } from 'express';
import { votedNoCount, votedAyeCount, totalVotes, votedNo } from "../databases/neoManager";


const votingSummaryNeoRouter = express.Router();

votingSummaryNeoRouter.get('/', async (req: Request, res: Response) => {

  const name: any = req?.query?.name;

  const totalVotesResponse: any = await totalVotes(name);
  const votedAyeResponse = await votedAyeCount(name);
  const votedNoResponse = await votedNoCount(name);

  console.log('totalVotes ', totalVotesResponse.records[0]._fields[0].low);
  console.log('votedAye ', votedAyeResponse);
  console.log('votedNo ', votedNoResponse);

  const votingSummary = {
    total: totalVotesResponse.records[0]._fields[0].low,
    votedAye: votedAyeResponse.records[0]._fields[0].low,
    votedNo: votedNoResponse.records[0]._fields[0].low
  }

  res.json(votingSummary);
});

export default votingSummaryNeoRouter;
