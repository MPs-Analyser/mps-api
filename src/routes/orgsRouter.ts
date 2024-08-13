import express, { Request, Response } from 'express';
import { queryOrgsAndIndividuals, queryDonation } from "../databases/neoManager";

const orgsRouter = express.Router();

orgsRouter.get('/', async (req: Request, res: Response) => {

  console.log('Get orgs ', req.query);

  // @ts-ignore
  const name: string = req?.query?.name || "any";

  // @ts-ignore
  const awardedBy: string = req?.query?.awardedBy || "Any Party";

  // @ts-ignore
  const donatedTo: string = req?.query?.donatedTo || "Any Party";;

  const limit: number = Number(req?.query?.limit || 10);

  const minDonationCount: number = Number(req?.query?.minDonationCount || 0);
  const minNumberOfPartiesDonated: number = Number(req?.query?.minNumberOfPartiesDonated || 0);
  const minTotalDonationValue: number = Number(req?.query?.minTotalDonationValue || 0);

  let result;

  if (minTotalDonationValue) {
    //@ts-ignore
    result = await queryDonation({ donarName: name, limit, minDonationCount, minNumberOfPartiesDonated, minTotalDonationValue, party: donatedTo });    
  } else {
    //@ts-ignore
    result = await queryOrgsAndIndividuals({ name, awardedBy, donatedTo, limit });
  }


  if (result?.records) {
    res.json(result.records);
  } else {
    res.json([]);
  }


});


export default orgsRouter;
