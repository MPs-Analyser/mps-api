import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import statusRouter from './src/routes/statusRouter';
import indexRouter from './src/routes/indexRouter';
import mpStatsRouter from './src/routes/mpStatsRouter';
import mpNamesRouter from './src/routes/mpNamesRouter';
import divisionNamesRouter from './src/routes/divisionNamesRouter';
import mostSimilarVotingRecordRouter from './src/routes/mostSimilarVotingRecordRouter';
import votingSummary from './src/routes/votingSummary';
import votingDetails from './src/routes/votingDetails';

dotenv.config()

const app: Express = express();
const port = process.env.PORT;

app.use(cors());
app.use("/", indexRouter);
app.use("/status", statusRouter);
app.use("/mps", mpStatsRouter);  
app.use("/mpnames", mpNamesRouter);  
app.use("/divisionnames", divisionNamesRouter);  
app.use("/votingSimilarity", mostSimilarVotingRecordRouter);  
app.use("/votingSummary", votingSummary);  
app.use("/votingDetails", votingDetails);  

app.listen(port, () => {  
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});