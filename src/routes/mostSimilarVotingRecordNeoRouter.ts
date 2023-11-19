import express, { Request, Response } from 'express';
import { votingSimilarity, votingSimilarityFiltered } from "../databases/neoManager";
import { constants } from "../constants";

const mostSimilarVotingRecordRouter = express.Router();

mostSimilarVotingRecordRouter.get('/', async (req: Request, res: Response) => {

  console.log('Checking node similariy ', req.query);

  // @ts-ignore
  const limit: string = req?.query?.limit;

  // @ts-ignore
  const orderby: string = req?.query?.orderby;

  // @ts-ignore
  const name: string = req?.query?.name;

  // @ts-ignore
  const partyIncludes = req?.query?.partyIncludes;

  // @ts-ignore
  const partyExcludes = req?.query?.partyExcludes;

  const id: number = Number(req?.query?.id);

  // @ts-ignore
  const fromDate: string = req?.query?.fromDate;

  // @ts-ignore
  const toDate: string = req?.query?.toDate;

  const today = new Date();
  const formattedToday = today.toISOString().split('T')[0];

  let isFilteredgraphRequired = true;
  if (constants.EARLIEST_FROM_DATE === fromDate && toDate === formattedToday) {
    //full date range applied so we dont need to create a filtered graph;
    isFilteredgraphRequired = false;
  }


  let result;
  let type;
  let partyName;
  if (partyIncludes) {
    type = "includeParty";
    partyName = partyIncludes;
  } else if (partyExcludes) {
    type = "excludeParty";
    partyName = partyExcludes;
  }

  if (isFilteredgraphRequired) {
    // @ts-ignore
    result = await votingSimilarityFiltered(id, partyName, limit, orderby, type, fromDate, toDate);
  } else {
    // @ts-ignore
    result = await votingSimilarity(id, partyName, limit, orderby, type);
  }

  // @ts-ignore
  const formattedResult = []
  if (result && result.records && Array.isArray(result.records)) {

    if (partyIncludes || partyExcludes) {
      // @ts-ignore
      result.records.forEach(i => {
        // @ts-ignore          
        formattedResult.push(
          { name: i._fields[2], party: i._fields[3], score: i._fields[i._fields.length - 1] }
        )
      })

    } else {
      // @ts-ignore
      result.records.forEach(i => {
        //the query retuns 2 rows for each result so skip every other row for now        
        formattedResult.push(
          { name: i._fields[1], party: i._fields[2], score: i._fields[i._fields.length - 1] }
        )
      })
    }
  }

  // @ts-ignore
  res.json(formattedResult);
});

export default mostSimilarVotingRecordRouter;
