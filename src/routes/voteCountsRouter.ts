import express, { Request, Response } from 'express';
import { voteCounts } from "../databases/neoManager";
const logger = require('../logger');

const voteCountsRouter = express.Router();

voteCountsRouter.get('/', async (req: Request, res: Response) => {

  try {

    const id: any = req?.query?.id;

    // @ts-ignore
    const fromDate: string = req?.query?.fromDate;
  
    // @ts-ignore
    const toDate: string = req?.query?.toDate;
  
    // @ts-ignore
    const category: string = req?.query?.category;
  
    // @ts-ignore
    const name: string = req?.query?.name || 'Any';
  
    logger.info("Getting voting summary from NEO for MP with id " + id);
  
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
