import express, { Request, Response } from 'express';
import { votedNo, votedAye, voted } from "../databases/neoManager";
import { getQueryParam } from "../utils/restUtils"; 
import { constants } from "../constants";

const logger = require('../logger');

const votingDetailsRouter = express.Router();

votingDetailsRouter.get('/', async (req: Request, res: Response) => {

  const id = getQueryParam(req.query, 'id', 0) as number; 
  const type = getQueryParam(req.query, 'type', "voted") as string | undefined;
  const fromDate = getQueryParam(req.query, 'fromDate', constants.EARLIEST_FROM_DATE) as string; 
  const toDate = getQueryParam(req.query, 'toDate', new Date().toISOString().substring(0, 10)) as string; 
  const category = getQueryParam(req.query, 'category', 'Any') as string;
  const name = getQueryParam(req.query, 'name', 'Any') as string;

  logger.debug(`Query voting details for MP with id ${id}`)

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

export default votingDetailsRouter;
