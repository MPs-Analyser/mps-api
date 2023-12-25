import express, { Request, Response } from 'express';
import { getDonationSummary, getParties, getDonorsForParty } from "../databases/neoManager";

const donationsRouter = express.Router();

donationsRouter.get('/', async (req: Request, res: Response) => {

  console.log('Get Parties ', req.query);

  // @ts-ignore
  const partyName: string = req?.query?.partyname;

  // @ts-ignore
  const formattedResult = []

  if (partyName) {

    // @ts-ignore
    const result = await getDonorsForParty({ partyName });        

    if (result && result.records && Array.isArray(result.records)) {                  
      
      // @ts-ignore
      result.records.forEach(i => {                
        const record = { 
          partyName: i._fields[i._fieldLookup.partyName], 
          donar: i._fields[i._fieldLookup.donar], 
          donatedCout: i._fields[i._fieldLookup.donated].low, 
          totalDonationValue: i._fields[i._fieldLookup.totalDonationValue].low ? i._fields[i._fieldLookup.totalDonationValue].low : i._fields[i._fieldLookup.totalDonationValue]
        }

        formattedResult.push(record);
      });

    }

  } else {

    // @ts-ignore
    const partiesResult = await getParties();

    // @ts-ignore
    const parties = []

    if (partiesResult && partiesResult.records && Array.isArray(partiesResult.records)) {
      // @ts-ignore
      partiesResult.records.forEach(i => {
        parties.push({ name: i._fields[0].properties.partyName, mpsCount: i._fields[0].properties.mpsCount.low });
      });
    }

    // @ts-ignore
    const result = await getDonationSummary();

    if (result && result.records && Array.isArray(result.records)) {
      // @ts-ignore
      result.records.forEach((item, index) => {

        // @ts-ignore
        const record = parties.find(p => p.name === item._fields[0])
        const memberCount = record ? record.mpsCount : 0;

        formattedResult.push({
          partyName: item._fields[0],
          memberCount: memberCount,
          donationCount: item._fields[1].low,
          totalDonationValue: item._fields[2].low ? item._fields[2].low : item._fields[2]
        });
      });

    }

  }

  // @ts-ignore
  res.json(formattedResult)


});

export default donationsRouter;
