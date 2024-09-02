import express, { Request, Response } from 'express';
import { votingSimilarity, votingSimilarityFiltered } from "../databases/neoManager";
import { constants } from "../constants";
import { getQueryParam } from "../utils/restUtils"


const mostSimilarVotingRecordRouter = express.Router();

mostSimilarVotingRecordRouter.get('/', async (req: Request, res: Response) => {

  console.log('Checking node similariy ', req.query);

  const limit = parseInt(getQueryParam(req.query, 'limit', 100) as string);
  const orderby = getQueryParam(req.query, 'orderby', "DESCENDING") as string;
  const name = getQueryParam(req.query, 'name', "") as string | undefined;
  const partyIncludes = getQueryParam(req.query, 'partyIncludes', "") as string | undefined;
  const partyExcludes = getQueryParam(req.query, 'partyExcludes', "") as string | undefined;
  const id = getQueryParam(req.query, 'id', 0) as number | undefined;
  const fromDate = getQueryParam(req.query, 'fromDate', "") as string | undefined;
  const toDate = getQueryParam(req.query, 'toDate', "") as string | undefined;

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
