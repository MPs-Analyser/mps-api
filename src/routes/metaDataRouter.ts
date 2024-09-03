import express, { Request, Response } from 'express';
import { getMetaData } from "../databases/neoManager";

const metaDataRouter = express.Router();

metaDataRouter.get('/', async (req: Request, res: Response) => {

  const result = await getMetaData();

  if (result && result.records) {
    const response =  result.records[0]._fields[0].properties;
    res.json(response);
  } else {
    res.json({})
  }

});

export default metaDataRouter;
