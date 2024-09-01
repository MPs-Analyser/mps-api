import express, { Request, Response } from 'express';
import { mostOrLeastVotedDivision } from "../databases/neoManager";



const divisionVotesRouter = express.Router();

divisionVotesRouter.get('/', async (req: Request, res: Response) => {

  // @ts-ignore
  const limit: string = req?.query?.limit;

  // @ts-ignore
  const orderby: string = req?.query?.orderby;

  // @ts-ignore
  const ayeOrNo = req?.query?.ayeorno;

  // @ts-ignore
  const category: string = req?.query?.category;

  // @ts-ignore
  const fromDate = req?.query?.fromDate;

  // @ts-ignore
  const toDate = req?.query?.toDate;

  // @ts-ignore
  const name = req?.query?.name || "Any";

  const matchType = req?.query?.matchtype || "partial";
  
  // @ts-ignore
  const result = await mostOrLeastVotedDivision(ayeOrNo, category, limit, orderby, fromDate, toDate, name, matchType);

  if (result && result.records) {
    // @ts-ignore
    res.json(result.records);
  } else {
    res.json({})
  }

});

export default divisionVotesRouter;
