import express, { Request, Response } from 'express';
import { votedNoCount, votedAyeCount, totalVotes, votedNo } from "../databases/neoManager";
const logger = require('../logger');

const votingSummaryNeoRouter = express.Router();

votingSummaryNeoRouter.get('/', async (req: Request, res: Response) => {

  const id: any = req?.query?.id;

  // @ts-ignore
  const fromDate: string = req?.query?.fromDate;

  // @ts-ignore
  const toDate: string = req?.query?.toDate;

  // @ts-ignore
  const category: string = req?.query?.category;

  logger.info("Getting voting summary from NEO for MP with id " + id);

  const totalVotesResponse: any = await totalVotes(id, fromDate, toDate, category);
  const votedAyeResponse = await votedAyeCount(id, fromDate, toDate, category);
  const votedNoResponse = await votedNoCount(id, fromDate, toDate, category);

  const votingSummary = {
    total: totalVotesResponse.records[0]._fields[0].low,
    votedAye: votedAyeResponse.records[0]._fields[0].low,
    votedNo: votedNoResponse.records[0]._fields[0].low
  }

  res.json(votingSummary);
});

export default votingSummaryNeoRouter;
