import express, { Request, Response } from 'express';
import { searchDivisions } from "../databases/neoManager";

const searchDivisionsRouter = express.Router();

searchDivisionsRouter.get('/', async (req: Request, res: Response) => {

  console.log('Search MPs ', req.query);

  // @ts-ignore
  const result = await searchDivisions();

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
          id: i._fields[2],
          date: i._fields[3],
          ayeCount: i._fields[4],
          noCount: i._fields[5],
        }
      )
    })
  }  
  
  // @ts-ignore
  res.json(formattedResult)

});

export default searchDivisionsRouter;
