import express, { Request, Response } from 'express';
import { getDonationSummary } from "../databases/neoManager";

const donationsRouter = express.Router();

donationsRouter.get('/', async (req: Request, res: Response) => {

  console.log('Get Parties ', req.query);


  // @ts-ignore
  const result = await getDonationSummary();

  console.log("step 2");
  

  // @ts-ignore
  const formattedResult = []

  if (result && result.records && Array.isArray(result.records)) {
    // @ts-ignore
    result.records.forEach(i => {
      console.log("i > ", i);
      
      formattedResult.push({ 
        partyName: i._fields[0], 
        donationCount: i._fields[1].low, 
        totalDonationValue: i._fields[2] 
      });
    });
    
  }

  // @ts-ignore
  res.json(formattedResult)


});

export default donationsRouter;
