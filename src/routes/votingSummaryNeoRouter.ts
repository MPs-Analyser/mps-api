import express, { Request, Response } from 'express';
import { votedNoCount, votedAyeCount, totalVotes, votedNo } from "../databases/neoManager";
const logger = require('../logger');

const votingSummaryNeoRouter = express.Router();

votingSummaryNeoRouter.get('/', async (req: Request, res: Response) => {

  logger.info("Getting voting summary from NEO")

  const name: any = req?.query?.name;

  logger.info("Using MP name of " + name)

  const totalVotesResponse: any = await totalVotes(name);
  const votedAyeResponse = await votedAyeCount(name);
  const votedNoResponse = await votedNoCount(name);

  const votingSummary = {
    total: totalVotesResponse.records[0]._fields[0].low,
    votedAye: votedAyeResponse.records[0]._fields[0].low,
    votedNo: votedNoResponse.records[0]._fields[0].low
  }

  res.json(votingSummary);
});

export default votingSummaryNeoRouter;
