import express, { Request, Response } from 'express';
import { mostOrLeastVotedDivision } from "../databases/neoManager";
import { getQueryParam } from "../utils/restUtils"
import { constants } from "../constants";

const divisionVotesRouter = express.Router();

divisionVotesRouter.get('/', async (req: Request, res: Response) => {
  
  const limit = parseInt(getQueryParam(req.query, 'limit', 100) as string);
  const orderby = getQueryParam(req.query, 'orderby', "DESCENDING") as string;
  const ayeOrNo = getQueryParam(req.query, 'ayeorno', "aye") as string;
  const category = getQueryParam(req.query, 'category', "Any") as string;
  const fromDate = getQueryParam(req.query, 'fromDate', constants.EARLIEST_FROM_DATE) as string | undefined;
  const toDate = getQueryParam(req.query, 'toDate', new Date().toISOString().substring(0, 10)) as string | undefined;
  const name = getQueryParam(req.query, 'name', "Any") as string;
  const matchType = getQueryParam(req.query, 'matchtype', "partial") as string;

  const result = await mostOrLeastVotedDivision(ayeOrNo, category, limit, orderby, fromDate, toDate, name, matchType);

  if (result && result.records) {
    // @ts-ignore
    res.json(result.records);
  } else {
    res.json({})
  }

});

export default divisionVotesRouter;
