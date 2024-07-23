import express, { Request, Response } from 'express';
import { getMpNames } from "../databases/neoManager"

const mpNamesRouter = express.Router();

mpNamesRouter.get('/', async (req: Request, res: Response) => {

  const mps = await getMpNames();

  const formattedResult:Array<any> = []

  // @ts-ignore
  mps.records.forEach(i => {    
    formattedResult.push({ type: 'mp', id: i._fields[1].low, name: i._fields[0] });
  });

  res.json(formattedResult);
});

export default mpNamesRouter;
