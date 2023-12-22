import express, { Request, Response } from 'express';
import { getParties } from "../databases/neoManager";

const getPartiessRouter = express.Router();

getPartiessRouter.get('/', async (req: Request, res: Response) => {

  console.log('Get Parties ', req.query);


  // @ts-ignore
  const result = await getParties();

  // @ts-ignore
  const formattedResult = []

  if (result && result.records && Array.isArray(result.records)) {
    // @ts-ignore
    res.json(result.records)
  }

  // @ts-ignore
  res.json({})


});

export default getPartiessRouter;
