import express, { Express } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import statusRouter from './src/routes/statusRouter';
import indexRouter from './src/routes/indexRouter';
import mpStatsRouter from './src/routes/mpStatsRouter';
import mpNamesRouter from './src/routes/mpNamesRouter';
import divisionNamesRouter from './src/routes/divisionNamesRouter';

import mostSimilarVotingRecordRouter from './src/routes/mostSimilarVotingRecordRouter';

import votingDetailsRouter from './src/routes/votingDetailsRouter';

import searchMpsRouter from './src/routes/searchMpsRouter';
import searchDivisionsRouter from './src/routes/searchDivisionsRouter';

import mpVotesRouter from './src/routes/mpVotesRouter';
import divisionVotesRouter from './src/routes/divisionVotesRouter';

import voteCountsRouter from './src/routes/voteCountsRouter';

import donationsRouter from "./src/routes/donationsRouter";
import contractsRouter from "./src/routes/contractsRouter";
import orgsRouter from "./src/routes/orgsRouter";
import metaDataRouter from "./src/routes/metaDataRouter";

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

app.use("/searchMps", searchMpsRouter);  
app.use("/searchDivisions", searchDivisionsRouter);  

app.use("/votingDetails", votingDetailsRouter);  

app.use("/votecounts", voteCountsRouter);  

app.use("/donations", donationsRouter);  
app.use("/orgs", orgsRouter);  

app.use("/insights/mpvotes", mpVotesRouter);  
app.use("/insights/divisionvotes", divisionVotesRouter);  

app.use("/contracts", contractsRouter);  
app.use("/metadata", metaDataRouter);  

/**
 * Lambda specific enrtypoint
 */
export const handler = async (event: any, context: any) => {
  
  // Create a serverless function to wrap the Express app
  const serverless = require('serverless-http');
  const serverlessApp = serverless(app);

  // Return the response from the serverless function
  return await serverlessApp(event, context);
};


//TODO add this back in if not running in lambda
// app.listen(port, () => {  
//   logger.info(`Server is running at http://localhost:${port}`);  
// });