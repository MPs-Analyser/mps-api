import express, { Request, Response } from 'express';
import { mostOrLeastVotedDivision } from "../databases/neoManager";

 

const divisionVotesRouter = express.Router();

divisionVotesRouter.get('/', async (req: Request, res: Response) => {

  console.log('Get divisionj insights ', req.query);

  // @ts-ignore
  const limit: string = req?.query?.limit;

  // @ts-ignore
  const orderby: string = req?.query?.orderby;

  // @ts-ignore
  const ayeOrNo = req?.query?.ayeorno;

  // @ts-ignore
  const result = await mostOrLeastVotedDivision(ayeOrNo, limit, orderby);

  console.log("reuslt ", result );
  
  if (result && result.records) {
    // @ts-ignore
    res.json(result.records);
  } else {
    res.json({})
  }

});

export default divisionVotesRouter;