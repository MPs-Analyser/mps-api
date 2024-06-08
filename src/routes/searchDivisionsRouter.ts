import express, { Request, Response } from 'express';
import { searchDivisions } from "../databases/neoManager";

const searchDivisionsRouter = express.Router();

searchDivisionsRouter.get('/', async (req: Request, res: Response) => {

  console.log('Search Divisions ', req.query);

  // @ts-ignore
  const category: string = req?.query?.category || 'Any';

  // @ts-ignore
  const name: string = req?.query?.name || 'Any';

  // @ts-ignore
  const year: string = req?.query?.year || 'Any';

  // @ts-ignore
  const result = await searchDivisions({ category, name, year });

  // @ts-ignore
  const formattedResult = []

  if (result && result.records && Array.isArray(result.records)) {
    // @ts-ignore
    result.records.forEach(i => {
      // @ts-ignore          
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

  // @ts-ignore
  res.json(formattedResult)

});

export default searchDivisionsRouter;
