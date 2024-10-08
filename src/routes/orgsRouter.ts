import express, { Request, Response } from 'express';
import { queryOrgsAndIndividuals, queryDonation, querySimilarNames, jaroWinklerSimilarity } from "../databases/neoManager";
import { standardizeCompanyName } from "../utils/companyUtils";
import { getQueryParam } from "../utils/restUtils"; // Import the getQueryParam function
import { constants } from "../constants";

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
  const donationFromDate = getQueryParam(req.query, 'donationFromDate', constants.EARLIEST_FROM_DATE) as string;
  const donationToDate = getQueryParam(req.query, 'donationToDate', new Date().toISOString().substring(0, 10)) as string;
  const contractFromDate = getQueryParam(req.query, 'contractFromDate', constants.EARLIEST_FROM_DATE) as string;
  const contractToDate = getQueryParam(req.query, 'contractToDate', new Date().toISOString().substring(0, 10)) as string;

  let result;
  
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
      matchType,
      orgType,
      donationFromDate,
      donationToDate,
      contractFromDate,
      contractToDate
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

  const name = getQueryParam(req.query, 'name', "") as string | undefined;
  const similarityType = getQueryParam(req.query, 'type', "leven") as string | undefined;
  
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