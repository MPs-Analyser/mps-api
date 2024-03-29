import { log } from 'console';
import express, { Request, Response } from 'express';
import { appStatus } from '../models/appStatus'
// import { getDivisionNames } from "../databases/neoManager";
import { getDivisionNames } from "../databases/mongoManager";

const divisionNamesRouter = express.Router();

divisionNamesRouter.get('/', async (req: Request, res: Response) => {

  console.log('Getting division names');

  const divisions = await getDivisionNames();
  
  // @ts-ignore
  const formattedResult = []
  
  // @ts-ignore
  divisions.forEach(i => {    
    formattedResult.push({ type: 'division', id: i.DivisionId, name: i.Title});
  });

    // @ts-ignore
  res.json(formattedResult);
});

export default divisionNamesRouter;
