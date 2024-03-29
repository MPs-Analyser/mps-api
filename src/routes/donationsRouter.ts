import express, { Request, Response } from 'express';
import { getDonationSummary, getParties, getDonorsForParty, getDonorDetails, getMultiPartyDonars } from "../databases/neoManager";

const donationsRouter = express.Router();

donationsRouter.get('/', async (req: Request, res: Response) => {

  console.log('Get Parties ', req.query);

  // @ts-ignore
  const partyName: string = req?.query?.partyname;

  // @ts-ignore
  const donarName: string = req?.query?.donar;

  // @ts-ignore
  const multiParty: string = Boolean(req?.query?.multiparty) || Boolean(req?.query?.multiParty);

  console.log("check ", donarName);
  
  // @ts-ignore
  const formattedResult = [];

  if (multiParty) {

        // @ts-ignore
        const result = await getMultiPartyDonars();        

        if (result && result.records && Array.isArray(result.records)) {                  
          
          // @ts-ignore
          result.records.forEach(i => {                
            const record = { 
              donor: i._fields[i._fieldLookup.donor], 
              numberOfPartiesDonated: i._fields[i._fieldLookup.numberOfPartiesDonated].low, 
              partyNames: i._fields[i._fieldLookup.partyNames],               
            }
    
            formattedResult.push(record);
          });
        }
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
        formattedResult.push(record);      
      });      
    }
    

  } else if (partyName) {

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
console.log("the end");

  // @ts-ignore
  res.json(formattedResult)


});

export default donationsRouter;
