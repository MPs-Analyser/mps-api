import express, { Request, Response } from 'express';
import { queryOrgsAndIndividuals, queryDonation, querySimilarNames, jaroWinklerSimilarity } from "../databases/neoManager";
import { standardizeCompanyName } from "../utils/companyUtils";
import { getQueryParam } from "../utils/restUtils"; // Import the getQueryParam function

const orgsRouter = express.Router();

orgsRouter.get('/', async (req: Request, res: Response) => {

  console.log('Get orgs ', req.query);

  const name = getQueryParam(req.query, 'name', "Any") as string;
  const awardedBy = getQueryParam(req.query, 'awardedBy', "Any Party") as string;
  const donatedTo = getQueryParam(req.query, 'donatedTo', "Any Party") as string;
  const matchType = getQueryParam(req.query, 'matchtype', "partial") as string;
  const limit = getQueryParam(req.query, 'limit', 10) as number;
  const minDonationCount = getQueryParam(req.query, 'minDonationCount', 0) as number;
  const minNumberOfPartiesDonated = getQueryParam(req.query, 'minNumberOfPartiesDonated', 0) as number;
  const minTotalDonationValue = getQueryParam(req.query, 'minTotalDonationValue', 0) as number;
  const minContractCount = getQueryParam(req.query, 'minContractCount', 0) as number;
  const orgType = getQueryParam(req.query, 'orgtype', "Any") as string;

  let result;

  console.log("check 1 ",minTotalDonationValue, minContractCount);
  console.log("check 2 ", donatedTo, awardedBy);
  

  if (minTotalDonationValue || minContractCount || donatedTo !== "Any Party" || awardedBy !== "Any Party") {
    result = await queryDonation({
      donarName: name,
      limit,
      minDonationCount,
      minNumberOfPartiesDonated,
      minTotalDonationValue,
      donatedTo,
      awardedBy,
      minContractCount,      
      matchType
    });
  } else {
    result = await queryOrgsAndIndividuals({
      name,
      awardedBy,
      donatedTo,
      limit,
      orgType,
      matchType
    });
  }

  if (result?.records) {
    res.json(result.records);
  } else {
    res.json([]);
  }
});

orgsRouter.get('/similar', async (req: Request, res: Response) => {

  console.log("step 1");

  const name = getQueryParam(req.query, 'name', "") as string | undefined;
  const similarityType = getQueryParam(req.query, 'type', "leven") as string | undefined;

  console.log('Find similar names to ', name);
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