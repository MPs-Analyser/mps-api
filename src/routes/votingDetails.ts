import { log } from 'console';
import express, { Request, Response } from 'express';
import { votedNo, votedAye, voted } from "../databases/neoManager";

const votingDetails = express.Router();

votingDetails.get('/', async (req: Request, res: Response) => {

  const name: any = req?.query?.name;
  const type = req?.query?.type;

  let result: any;
  if (type === 'votedAye') {
    result = await votedAye(name);
  } else if (type === 'votedNo') {
    result = await votedNo(name);
  } else {
    result = await voted(name);
  }

  res.json(result);
});

export default votingDetails;
