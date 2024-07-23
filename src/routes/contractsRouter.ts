import express, { Request, Response } from 'express';
import { getContractsAwardedByCount, getContractsforOrg, queryContracts } from "../databases/neoManager";

const contractsRouter = express.Router();

contractsRouter.get('/', async (req: Request, res: Response) => {

  const awardedCount: number = Number(req?.query?.awardedCount);

  const orgName = req?.query?.orgName;

  const awardedBy = req?.query?.awardedBy;

  let result;

  // @ts-ignore
  result = await queryContracts({ awardedCount, orgName, awardedBy });

  // @ts-ignore
  if (result && result.records) {
    // @ts-ignore
    res.json(result.records);
  } else {
    res.json({})
  }

});


export default contractsRouter;
