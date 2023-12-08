import express, { Request, Response } from 'express';
import { searchMps } from "../databases/neoManager";

const searchMpsRouter = express.Router();

searchMpsRouter.get('/', async (req: Request, res: Response) => {

  console.log('Search MPs ', req.query);

  // @ts-ignore
  const result = await searchMps();

  if (result && result.records) {
    // @ts-ignore
    res.json(result.records);
  } else {
    res.json({})
  }

});

export default searchMpsRouter;
