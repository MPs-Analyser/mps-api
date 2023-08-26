import { log } from 'console';
import express, { Request, Response } from 'express';
// import { votedNo, votedAye, voted } from "../databases/neoManager";
import { getMp, getVotesFromIds } from "../databases/mongoManager";

const votingDetails = express.Router();

votingDetails.get('/', async (req: Request, res: Response) => {

  const id: any = Number(req?.query?.id);
  const type = req?.query?.type;

  console.log('get voting details for ', id, type);
  
  const mp = await getMp(id, { votedAye: 1, votedNo: 1 });
  
  // @ts-ignore   
  let result = [];
    
  if (type === 'votedAye') {     
    // @ts-ignore   
    const aye = await getVotesFromIds(mp.votedAye);
    // @ts-ignore  
    const enrichedAye = aye.map(i => { return { 'memberVotedAye': true, ...i}});
    result.push(...enrichedAye);
  } else if (type === 'votedNo') {
    
    // @ts-ignore   
    const no = await getVotesFromIds(mp.votedAye);
    // @ts-ignore  
    const enrichedNo = no.map(i => { return { 'memberVotedAye': false, ...i}});
    result.push(...enrichedNo);
  } else {
    
    // @ts-ignore   
    const aye = await getVotesFromIds(mp.votedAye);
    // @ts-ignore  
    const enrichedAye = aye.map(i => { return { 'memberVotedAye': true, ...i}});
    result.push(...enrichedAye);

    // @ts-ignore   
    const no = await getVotesFromIds(mp.votedAye);
    // @ts-ignore  
    const enrichedNo = no.map(i => { return { 'memberVotedAye': false, ...i}});
    result.push(...enrichedNo);
  }

  res.json(result);
});

export default votingDetails;
