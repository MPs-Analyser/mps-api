import { log } from 'console';
import express, { Request, Response } from 'express';
import { appStatus } from '../models/appStatus'
// import { getMpNames } from "../databases/neoManager"
import { getAllMps } from "../databases/mongoManager"

const mpNamesRouter = express.Router();

mpNamesRouter.get('/', async (req: Request, res: Response) => {

  console.log('Getting mp names');

  const mps = await getAllMps();

  //@ts-ignore
  const formattedResult = []

  // @ts-ignore
  mps.forEach(i => {
    formattedResult.push({ type: 'mp', id: i.id, name: i.nameDisplayAs });
  });

  // @ts-ignore
  res.json(formattedResult);
});

export default mpNamesRouter;
