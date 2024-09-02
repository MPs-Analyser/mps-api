import express, { Request, Response } from 'express';
import { searchMps } from "../databases/neoManager";
import { getQueryParam } from "../utils/restUtils";

const searchMpsRouter = express.Router();

searchMpsRouter.get('/', async (req: Request, res: Response) => {

  console.log('Search MPs ', req.query);

  const party = getQueryParam(req.query, 'party', 'Any') as string;
  const sex = getQueryParam(req.query, 'sex', 'Any') as string;
  const name = getQueryParam(req.query, 'name', 'Any') as string;
  const year = getQueryParam(req.query, 'year', 0) as number;
  const votes = getQueryParam(req.query, 'votes', ">0") as string;
  const status = getQueryParam(req.query, 'status', "All") as string;

  const result = await searchMps({ party, name, sex, year, votes, status });

  const formattedResult:Array<any> = []

  if (result && result.records && Array.isArray(result.records)) {

    // @ts-ignore
    result.records.forEach(i => {
      
      formattedResult.push(
        {
          name: i._fields[0],
          gender: i._fields[1],
          startDate: i._fields[2],
          party: i._fields[3],
          id: i._fields[4].low,
          totalVotes: i._fields[5].low,
          ayeVotes: i._fields[6].low,
          noVotes: i._fields[7].low,
          isActive: i._fields[8]
        }
      )
    })
  }
  
  res.json(formattedResult)

});

export default searchMpsRouter;
