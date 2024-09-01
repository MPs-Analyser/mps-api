import express, { Request, Response } from 'express';
import { mostOrLeastVotingMps } from "../databases/neoManager";
import { getQueryParam } from "../utils/restUtils"; 
import { constants } from "../constants";

const mpVotesRouter = express.Router();

mpVotesRouter.get('/', async (req: Request, res: Response) => {

  console.log('Get MP insights ', req.query);

  const limit = getQueryParam(req.query, 'limit', 100);
  const orderby = getQueryParam(req.query, 'orderby', "DESCENDING");
  const partyIncludes = getQueryParam(req.query, 'partyIncludes', "");
  const partyExcludes = getQueryParam(req.query, 'partyExcludes', "");
  const category = getQueryParam(req.query, 'category', "Any");
  const fromDate = getQueryParam(req.query, 'fromDate', constants.EARLIEST_FROM_DATE);
  const toDate = getQueryParam(req.query, 'toDate', new Date().toISOString().substring(0, 10));
  const name = getQueryParam(req.query, 'name', "Any");
  const matchType = getQueryParam(req.query, 'matchtype', "partial");

  const partyToQuery = partyIncludes || partyExcludes || "Any";

  let partyOperator = "=";
  if (partyExcludes) {
    partyOperator = "<>"
  }

  const result = await mostOrLeastVotingMps({
    partyName: partyToQuery as string, 
    category: category as string,      
    partyOperator,
    limit: limit as number,            
    orderBy: orderby as string,        
    fromDate: fromDate as string | undefined,
    toDate: toDate as string | undefined,
    name: name as string,
    matchType: matchType as string
  });

  if (result && result.records) {    
    res.json(result.records);
  } else {
    res.json({})
  }

});

export default mpVotesRouter;
