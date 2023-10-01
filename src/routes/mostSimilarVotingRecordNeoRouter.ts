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

    if (partyIncludes || partyExcludes) {
      // @ts-ignore
      result.records.forEach(i => {        
        //the query retuns 2 rows for each result so skip every other row for now
        if (i._fields[0] === name) {
          formattedResult.push(
            { name: i._fields[2], party: i._fields[3], score: i._fields[i._fields.length - 1] }
          )
        }

      })

    } else {
      // @ts-ignore
      result.records.forEach(i => {      
        //the query retuns 2 rows for each result so skip every other row for now
        if (i._fields[0] === name) {
          formattedResult.push(
            { name: i._fields[1], party: i._fields[2], score: i._fields[i._fields.length - 1] }
          )
        }

      })
    }
  }
 
  // @ts-ignore
  res.json(formattedResult);
});

export default mostSimilarVotingRecordRouter;
