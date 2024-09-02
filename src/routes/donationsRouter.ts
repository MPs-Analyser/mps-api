import express, { Request, Response } from 'express';
import { getDonationSummary, getParties, getDonorsForParty, getDonorDetails, getMultiPartyDonars } from "../databases/neoManager";
import { getQueryParam } from "../utils/restUtils"

const donationsRouter = express.Router();

donationsRouter.get('/', async (req: Request, res: Response) => {

  const partyName = getQueryParam(req.query, 'partyname', "") as string | undefined;
  const donarName = getQueryParam(req.query, 'donar', "") as string | undefined;
  const multiParty = getQueryParam(req.query, 'multiparty', false) as boolean || getQueryParam(req.query, 'multiParty', false) as boolean;

  const formattedResult:Array<any> = [];

  if (multiParty) {

    const result = await getMultiPartyDonars();

    if (result && result.records && Array.isArray(result.records)) {

      // @ts-ignore
      result.records.forEach(i => {
        const record = {
          donor: i._fields[i._fieldLookup.donor],
          numberOfPartiesDonated: i._fields[i._fieldLookup.numberOfPartiesDonated].low,
          partyNames: i._fields[i._fieldLookup.partyNames],
        }
        // @ts-ignore
        formattedResult.push(record);
      });
    }

    res.json(formattedResult)
  } else if (donarName) {

    const result = await getDonorDetails({ donarName });

    if (result && result.records && Array.isArray(result.records)) {

      // @ts-ignore
      result.records.forEach(i => {

        const record = {
          donar: i._fields[i._fieldLookup.donar],
          accountingUnitName: i._fields[i._fieldLookup.accountingUnitName],
          postcode: i._fields[i._fieldLookup.postcode],
          donorStatus: i._fields[i._fieldLookup.donorStatus],
          amount: i._fields[i._fieldLookup.amount].low ? i._fields[i._fieldLookup.amount].low : i._fields[i._fieldLookup.amount],
          donationType: i._fields[i._fieldLookup.donationType],
          receivedDate: i._fields[i._fieldLookup.receivedDate],
          partyName: i._fields[i._fieldLookup.partyName],
        }
        // @ts-ignore
        formattedResult.push(record);
      });
    }

    res.json(formattedResult)

  } else if (partyName) {

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

        // @ts-ignore
        formattedResult.push(record);
      });
    }
    
    res.json(formattedResult)

  } else {

    const partiesResult = await getParties();
    
    const parties: Array<any> = [];

    if (partiesResult && partiesResult.records && Array.isArray(partiesResult.records)) {
      
      // @ts-ignore
      partiesResult.records.forEach(i => {
        // @ts-ignore
        parties.push({ name: i._fields[0].properties.partyName, mpsCount: i._fields[0].properties.mpsCount.low });
      });
    }

    const result = await getDonationSummary();

    if (result && result.records && Array.isArray(result.records)) {
      // @ts-ignore
      result.records.forEach(item => {

        // @ts-ignore
        const record = parties.find(p => p.name === item._fields[0])
        const memberCount = record ? record.mpsCount : 0;
      
        // @ts-ignore
        formattedResult.push({
          partyName: item._fields[0],
          memberCount: memberCount,
          donationCount: item._fields[1].low,
          totalDonationValue: item._fields[2].low ? item._fields[2].low : item._fields[2]
        });
      });
    }
    
    res.json(formattedResult)
  }

});

export default donationsRouter;
