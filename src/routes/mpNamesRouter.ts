import { log } from 'console';
import express, { Request, Response } from 'express';
import { appStatus } from '../models/appStatus'
import { getMpNames } from "../databases/neoManager"

const mpNamesRouter = express.Router();

mpNamesRouter.get('/', async (req: Request, res: Response) => {

  console.log('Getting mp names');

  const mps = await getMpNames();

  // @ts-ignore
  const formattedResult = []
  
  // @ts-ignore
  mps.records.forEach(i => {    
    formattedResult.push({ type: 'mp', id: i._fields[1].low, name: i._fields[0]});
  });

  // const mps = { hello: true }
    // @ts-ignore
  res.json(formattedResult);
});

export default mpNamesRouter;
