import express, { Request, Response } from 'express';
import { voteCounts } from "../databases/neoManager";
import { getQueryParam } from "../utils/restUtils";
import { constants } from "../constants";

const logger = require('../logger');

const voteCountsRouter = express.Router();

voteCountsRouter.get('/', async (req: Request, res: Response) => {

  try {

    const id = getQueryParam(req.query, 'id', undefined);
    const fromDate = getQueryParam(req.query, 'fromDate', constants.EARLIEST_FROM_DATE) as string | undefined;
    const toDate = getQueryParam(req.query, 'toDate', new Date().toISOString().substring(0, 10)) as string | undefined;
    const category = getQueryParam(req.query, 'category',"Any") as string | undefined;
    const name = getQueryParam(req.query, 'name', 'Any') as string;

    logger.info("Getting voting summary from NEO for MP with id " + id);

    //@ts-ignore
    const response: any = await voteCounts(id, fromDate, toDate, category, name);

    if (response?.records) {
      const votingSummary = {
        total: response.records[0]._fields[0].low,
        votedAye: response.records[0]._fields[1].low,
        votedNo: response.records[0]._fields[2].low
      }
      res.json(votingSummary);
    } else {
      res.json({ message: `Error with response ${response.toIString}` });
    }

  } catch (error) {
    // @ts-ignore
    res.json({ message: `Error getting vote counts ${error.message}` });
  }



});

export default voteCountsRouter;
