import { log } from 'console';
import express, { Request, Response } from 'express';
import { appStatus } from '../models/appStatus'

const statusRouter = express.Router();

statusRouter.get('/', (req: Request, res: Response) => {

  const status: appStatus = {
    isUp: true,
    message: 'Server is up and running'
  }
  
  res.json(status);
});

export default statusRouter;
