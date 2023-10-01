import express, { Request, Response } from 'express';
import { mostSimilarVotingRecord, mostSimilarVotingRecordPartyExcludes, mostSimilarVotingRecordPartyIncludes } from "../databases/neoManager";
import { log } from 'console';

const mostSimilarVotingRecordRouter = express.Router();

mostSimilarVotingRecordRouter.get('/', async (req: Request, res: Response) => {

  console.log('Checking node similariy ', req.query);

  // @ts-ignore
  const name: string = req?.query?.name;

  // @ts-ignore
  const partyIncludes = req?.query?.partyIncludes;

  // @ts-ignore
  const partyExcludes = req?.query?.partyExcludes;

  let result;
  if (partyIncludes) {
    // @ts-ignore
    result = await mostSimilarVotingRecordPartyIncludes(name, partyIncludes);
  } else if (partyExcludes) {
    // @ts-ignore
    result = await mostSimilarVotingRecordPartyExcludes(name, partyExcludes);
  } else {
    // @ts-ignore
    result = await mostSimilarVotingRecord(name);    
  }
  
  // @ts-ignore
  const formattedResult = []
  if (result && result.records && Array.isArray(result.records)) {
      // @ts-ignore
    result.records.forEach(i => {  
      formattedResult.push(
        { name: i._fields[0], party: i._fields[1], score: i._fields[4]}
      )
    })
  }
  
  // @ts-ignore
  res.json(formattedResult);
});

export default mostSimilarVotingRecordRouter;
