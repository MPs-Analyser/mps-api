import express, { Request, Response } from 'express';
import { queryOrgsAndIndividuals } from "../databases/neoManager";

const orgsRouter = express.Router();

orgsRouter.get('/', async (req: Request, res: Response) => {

  console.log('Get orgs ', req.query);

  // @ts-ignore
  const name: string = req?.query?.name || "any";

  // @ts-ignore
  const awardedBy: string = req?.query?.awardedBy || "Any Party";

  // @ts-ignore
  const donatedTo: string = req?.query?.donatedTo || "Any Party";;

  const limit = req?.query?.limit;

  //@ts-ignore
  const result = await queryOrgsAndIndividuals({ name, awardedBy, donatedTo, limit });

  // @ts-ignore
  res.json(result.records);
  
});


export default orgsRouter;
