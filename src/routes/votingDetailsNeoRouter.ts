import { log } from 'console';
import express, { Request, Response } from 'express';
import { votedNo, votedAye, voted } from "../databases/neoManager";

const logger = require('../logger');

const votingDetailsNeoRouter = express.Router();

votingDetailsNeoRouter.get('/', async (req: Request, res: Response) => {

  const id: any = Number(req?.query?.id);
  const type = req?.query?.type;

  logger.info('get voting details for ', id, type);

  let result: any;
  if (type === 'votedAye') {
    result = await votedAye(id);
  } else if (type === 'votedNo') {
    result = await votedNo(id);
  } else {
    result = await voted(id);
  }

  res.json(result);

});


export default votingDetailsNeoRouter;
