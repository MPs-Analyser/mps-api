import { log } from 'console';
import express, { Request, Response } from 'express';
import { appStatus } from '../models/appStatus'
import { getDivisionNames } from "../databases/neoManager"

const divisionNamesRouter = express.Router();

divisionNamesRouter.get('/', async (req: Request, res: Response) => {

  console.log('Getting division names');

  const divisions = await getDivisionNames();

  // @ts-ignore
  const formattedResult = []
  
  // @ts-ignore
  divisions.records.forEach(i => {    
    formattedResult.push({ type: 'division', id: i._fields[1].low, name: i._fields[0]});
  });

  // const mps = { hello: true }
    // @ts-ignore
  res.json(formattedResult);
});

export default divisionNamesRouter;
