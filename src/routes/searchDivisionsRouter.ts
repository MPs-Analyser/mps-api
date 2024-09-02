import express, { Request, Response } from 'express';
import { searchDivisions } from "../databases/neoManager";
import { getQueryParam } from "../utils/restUtils";

const searchDivisionsRouter = express.Router();

searchDivisionsRouter.get('/', async (req: Request, res: Response) => {

  console.log('Search Divisions ', req.query);

  const category = getQueryParam(req.query, 'category', 'Any') as string;
  const name = getQueryParam(req.query, 'name', 'Any') as string;
  const year = getQueryParam(req.query, 'year', 'Any') as string;

  const result = await searchDivisions({ category, name, year });
  
  const formattedResult:Array<any> = []

  if (result && result.records && Array.isArray(result.records)) {
    // @ts-ignore
    result.records.forEach(i => {
      
      formattedResult.push(
        {
          category: i._fields[0],
          title: i._fields[1],
          id: i._fields[2].low,
          date: i._fields[3],
          ayeCount: i._fields[4].low,
          noCount: i._fields[5].low,
        }
      )
    })
  }
  
  res.json(formattedResult)

});

export default searchDivisionsRouter;
