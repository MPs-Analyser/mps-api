import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import statusRouter from './src/routes/statusRouter';
import indexRouter from './src/routes/indexRouter';
import mpStatsRouter from './src/routes/mpStatsRouter';
import mpNamesRouter from './src/routes/mpNamesRouter';
import divisionNamesRouter from './src/routes/divisionNamesRouter';

import mostSimilarVotingRecordRouter from './src/routes/mostSimilarVotingRecordRouter';
import mostSimilarVotingRecordNeoRouter from './src/routes/mostSimilarVotingRecordNeoRouter';

import votingDetails from './src/routes/votingDetails';
import votingDetailsNeoRouter from './src/routes/votingDetailsNeoRouter';

import mpDetailsRouter from './src/routes/mpDetailsRouter';

import votingSummaryRouter from './src/routes/votingSummaryRouter';
import votingSummaryNeoRouter from './src/routes/votingSummaryNeoRouter';

const logger = require('./src/logger');

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
app.use("/votingSimilarityNeo", mostSimilarVotingRecordNeoRouter);  

app.use("/mpDetails", mpDetailsRouter);  

app.use("/votingDetails", votingDetails);  
app.use("/votingDetailsNeo", votingDetailsNeoRouter);  

app.use("/votingSummary", votingSummaryRouter);  
app.use("/votingSummaryNeo", votingSummaryNeoRouter);  

app.listen(port, () => {  
  logger.info(`Server is running at http://localhost:${port}`);  
});