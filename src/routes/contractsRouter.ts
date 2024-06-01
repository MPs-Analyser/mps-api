import express, { Request, Response } from 'express';
import { getContractsAwardedByCount, getContractsforOrg } from "../databases/neoManager";

const contractsRouter = express.Router();

contractsRouter.get('/', async (req: Request, res: Response) => {

  const awardedCount: number = Number(req?.query?.awardedCount);

  const orgName = req?.query?.orgName;

  let result;

  if (orgName && orgName?.length) {
    // @ts-ignore
    result = await getContractsforOrg({ orgName });
  } else if (awardedCount) {
    result = await getContractsAwardedByCount({ awardedCount });
  }

  console.log(result);
  
  
  // @ts-ignore
  if (result && result.records) {    
    // @ts-ignore
    res.json(result.records);
  } else {
    res.json({})
  }

});


export default contractsRouter;
