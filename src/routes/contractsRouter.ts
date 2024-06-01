import express, { Request, Response } from 'express';
import { getContractsAwardedByCount } from "../databases/neoManager";

const contractsRouter = express.Router();

contractsRouter.get('/', async (req: Request, res: Response) => {

  const awardedCount: number = Number(req?.query?.awardedCount);

  const result = await getContractsAwardedByCount({ awardedCount });

  if (result && result.records) {
    // @ts-ignore
    res.json(result.records);
  } else {
    res.json({})
  }

});


export default contractsRouter;
