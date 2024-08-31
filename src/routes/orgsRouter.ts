import express, { Request, Response } from 'express';
import { queryOrgsAndIndividuals, queryDonation, querySimilarNames, jaroWinklerSimilarity } from "../databases/neoManager";
import { standardizeCompanyName } from "../utils/companyUtils";

const orgsRouter = express.Router();

orgsRouter.get('/', async (req: Request, res: Response) => {

  console.log('Get orgs ', req.query);

  // @ts-ignore
  const name: string = req?.query?.name || "Any";

  // @ts-ignore
  const awardedBy: string = req?.query?.awardedBy || "Any Party";

  // @ts-ignore
  const donatedTo: string = req?.query?.donatedTo || "Any Party";

  // @ts-ignore
  const matchType: string = req?.query?.matchtype || "partial";

  const limit: number = Number(req?.query?.limit || 10);

  const minDonationCount: number = Number(req?.query?.minDonationCount || 0);
  const minNumberOfPartiesDonated: number = Number(req?.query?.minNumberOfPartiesDonated || 0);
  const minTotalDonationValue: number = Number(req?.query?.minTotalDonationValue || 0);
  const minContractCount: number = Number(req?.query?.minContractCount || 0);

  const orgType = req?.query?.orgtype || "Any";

  let result;

  //TODO check this.  Only callings the orgs query if we are not asking about donations or contracts awarded. In that case we are doing donation queries
  if (minTotalDonationValue || minContractCount || donatedTo !== "Any Party" || awardedBy !== "Any Party") {
    //@ts-ignore
    result = await queryDonation({ donarName: name, limit, minDonationCount, minNumberOfPartiesDonated, minTotalDonationValue, donatedTo, awardedBy, minContractCount, orgType, matchType });
  } else {
    //@ts-ignore
    result = await queryOrgsAndIndividuals({ name, awardedBy, donatedTo, limit, orgType, matchType });
  }

  if (result?.records) {
    res.json(result.records);
  } else {
    res.json([]);
  }
});

orgsRouter.get('/similar', async (req: Request, res: Response) => {

  console.log("step 1");
  
  //@ts-ignore
  const name: string = req?.query?.name;

  //@ts-ignore
  const similarityType: string = req?.query?.type;

  console.log('Find similar names to ', name); 
  const result = []
  if (name) {
    const shortName = standardizeCompanyName(name);
    const lowerName = name.toLowerCase();
    let names;
    if (similarityType === "jaro") {
      names = await jaroWinklerSimilarity(shortName, lowerName)
    } else {
      names = await querySimilarNames(shortName, lowerName)
    }        
    res.json(names.records);
  } else {
    res.json([]);
  }
});

export default orgsRouter;
