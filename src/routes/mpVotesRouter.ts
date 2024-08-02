import express, { Request, Response } from 'express';
import { mostOrLeastVotingMps } from "../databases/neoManager";

const mpVotesRouter = express.Router();

mpVotesRouter.get('/', async (req: Request, res: Response) => {

  console.log('Get MP insights ', req.query);
  
  const limit = req?.query?.limit || 100;
  
  const orderby = req?.query?.orderby || "DESC";

  const partyIncludes = req?.query?.partyIncludes;

  const partyExcludes = req?.query?.partyExcludes;
  
  const category = req?.query?.category || "Any";
  
  const fromDate = req?.query?.fromDate;

  const toDate = req?.query?.toDate;

  const name = req?.query?.name || "Any";

  const partyToQuery = partyIncludes || partyExcludes || "Any";

  let partyOperator = "=";
  if (partyExcludes) {
    partyOperator = "<>"
  }

  // @ts-ignore
  const result = await mostOrLeastVotingMps(partyToQuery, category, partyOperator, limit, orderby, fromDate, toDate, name);

  if (result && result.records) {
    // @ts-ignore
    res.json(result.records);
  } else {
    res.json({})
  }

});

export default mpVotesRouter;
