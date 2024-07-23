import express, { Request, Response } from 'express';
import { getDivisionNames } from "../databases/neoManager";

const divisionNamesRouter = express.Router();

divisionNamesRouter.get('/', async (req: Request, res: Response) => {

  const divisions = await getDivisionNames();

  const formattedResult: Array<any> = []

  // @ts-ignore
  divisions.records.forEach(i => {
    formattedResult.push({ type: 'division', id: i._fields[1].low, name: i._fields[0] });
  });

  res.json(formattedResult);
});

export default divisionNamesRouter;
