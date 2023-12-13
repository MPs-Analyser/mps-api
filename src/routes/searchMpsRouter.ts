import express, { Request, Response } from 'express';
import { searchMps } from "../databases/neoManager";

const searchMpsRouter = express.Router();

searchMpsRouter.get('/', async (req: Request, res: Response) => {

  console.log('Search MPs ', req.query);

  // @ts-ignore
  const party: string = req?.query?.party || 'Any';

  // @ts-ignore
  const sex: string = req?.query?.sex || 'Any';

  // @ts-ignore
  const name: string = req?.query?.name || 'Any';
  
  const year = req?.query?.year || 0;

  const votes = req?.query?.votes || ">0";

  // @ts-ignore
  const result = await searchMps({ party, name, sex, year, votes });

  // @ts-ignore
  const formattedResult = []

  if (result && result.records && Array.isArray(result.records)) {

    // @ts-ignore
    result.records.forEach(i => {
      // @ts-ignore          
      formattedResult.push(
        {
          name: i._fields[0],
          gender: i._fields[1],
          startDate: i._fields[2],
          party: i._fields[3],
          id: i._fields[4].low,
          totalVotes: i._fields[5].low,
          ayeVotes: i._fields[6].low,
          noVotes: i._fields[7].low
        }
      )
    })
  }

  // @ts-ignore
  res.json(formattedResult)


});

export default searchMpsRouter;
