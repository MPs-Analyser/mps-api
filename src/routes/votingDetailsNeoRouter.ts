import { log } from 'console';
import express, { Request, Response } from 'express';
import { votedNo, votedAye, voted } from "../databases/neoManager";

const logger = require('../logger');

const votingDetailsNeoRouter = express.Router();

votingDetailsNeoRouter.get('/', async (req: Request, res: Response) => {

  const id: any = Number(req?.query?.id);
  const type = req?.query?.type;

  // @ts-ignore
  const fromDate: string = req?.query?.fromDate;
  // @ts-ignore
  const toDate: string = req?.query?.toDate;

  // @ts-ignore
  const category: string = req?.query?.category;

  // @ts-ignore
  const name: string = req?.query?.name || 'Any';

  console.log("query type ", type, name);
  

  let result: any;
  if (type === 'votedAye') {
    result = await votedAye(id, fromDate, toDate, category, name);
  } else if (type === 'votedNo') {
    result = await votedNo(id, fromDate, toDate, category, name);
  } else {
    result = await voted(id, fromDate, toDate, category, name);
  }

  res.json(result);

});


export default votingDetailsNeoRouter;
