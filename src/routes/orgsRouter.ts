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

  const limit = req?.query?.limit || 10;

  //@ts-ignore
  const result = await queryOrgsAndIndividuals({ name, awardedBy, donatedTo, limit: Number(limit) });

  if (result?.records) {
    res.json(result.records);
  } else {
    res.json([]);
  }



});


export default orgsRouter;
