import express, { Request, Response } from 'express';
import { searchMps } from "../databases/neoManager";

const searchMpsRouter = express.Router();

searchMpsRouter.get('/', async (req: Request, res: Response) => {

  console.log('Search MPs ', req.query);

  // @ts-ignore
  const result = await searchMps();

  // @ts-ignore
  const formattedResult = []

  if (result && result.records && Array.isArray(result.records)) {
    console.log("check ", result.records);
    // @ts-ignore
    result.records.forEach(i => {
      // @ts-ignore          
      formattedResult.push(
        { name: i._fields[0], id: i._fields[1].low }
      )
    })
  }

  // @ts-ignore
  res.json(formattedResult)


});

export default searchMpsRouter;
