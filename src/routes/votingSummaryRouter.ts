import { log } from 'console';
import express, { Request, Response } from 'express';
import { votedNoCount, votedAyeCount, totalVotes } from "../databases/neoManager";
import { getMp } from "../databases/mongoManager"

const votingSummaryRouter = express.Router();

votingSummaryRouter.get('/', async (req: Request, res: Response) => {

  const id: any = req?.query?.id;
  let mpDetialsResponse = {};
  try {
    mpDetialsResponse = await getMp(Number(id), {
      votedAye: 1,
      votedNo: 1,
     });
  } catch (e) {
    console.error(e)
  }

  res.json(mpDetialsResponse);
});

export default votingSummaryRouter;
