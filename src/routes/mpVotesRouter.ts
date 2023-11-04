import express, { Request, Response } from 'express';
import { mostOrLeastVotingMps } from "../databases/neoManager";

const mpVotesRouter = express.Router();

mpVotesRouter.get('/', async (req: Request, res: Response) => {

  console.log('Get MP insights ', req.query);

  // @ts-ignore
  const limit: string = req?.query?.limit;

  // @ts-ignore
  const orderby: string = req?.query?.orderby;

  // @ts-ignore
  const partyIncludes = req?.query?.partyIncludes;

  // @ts-ignore
  const partyExcludes = req?.query?.partyExcludes;

  // @ts-ignore
  const voteCategory = req?.query?.voteCategory;

  let partyToQuery = partyIncludes || partyExcludes;  
  
  // @ts-ignore
  if (partyToQuery.toLowerCase() === 'any') {
    partyToQuery = undefined;
  }

  let partyOperator = "=";
  if (partyExcludes) {
    partyOperator = "<>"
  }

  // @ts-ignore
  const result = await mostOrLeastVotingMps(partyToQuery, voteCategory, partyOperator, limit, orderby);

  console.log("reuslt ", result );
  
  if (result && result.records) {
    // @ts-ignore
    res.json(result.records);
  } else {
    res.json({})
  }

});

export default mpVotesRouter;
