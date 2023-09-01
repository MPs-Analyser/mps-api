require("dotenv").config();

const { MongoClient, ServerApiVersion } = require("mongodb");

const logger = require("../logger");

const uri = process.env.MONGO_CONNECTION_STRING;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	},
});

interface MongoError {
	result: {
		result: {
			nInserted: number;
		};
	};
}

/**
 * Connect to mongo atlas
 */
export const setupMongo = async () => {
	try {
		// Connect the client to the server	(optional starting in v4.7)
		await client.connect();
		// Send a ping to confirm a successful connection
		await client.db("mps").command({ ping: 1 });
		console.log(
			"Pinged your deployment. You successfully connected to MongoDB!"
		);
	} catch (e) {
		console.log("Error connecting to mongo ", e);
	} finally {
		// Ensures that the client will close when you finish/error
		await client.close();
	}
};

export const insertSimilarity = async (data: Array<any>) => {

    await client.connect();
    const myDB = client.db("mps");
    const myColl = myDB.collection("similarity1");
    try {
        const insertManyresult = await myColl.insertMany(data);
        console.log(`${insertManyresult.insertedCount} documents were inserted.`);
    } catch (e) {
        console.log(`A MongoBulkWriteException occurred, but there are successfully processed documents.`);
        console.log(e);
        // @ts-ignore   
        console.log(`Number of documents inserted: ${e.result.result.nInserted}`);
    }


}

export const getDivisionNames = async () => {
	logger.debug("Getting DIVISION Names from mongo...");

    await client.connect();
    const myDB = client.db("mps");
    const myColl = myDB.collection("divisionNames");
    let allDivision = [];
    try {
        allDivision = await myColl.find({}).toArray();

    } catch (e) {
        console.log(`A MongoBulkWriteException occurred, but there are successfully processed documents.`);
        console.log(e);
    }

	return allDivision;
};

export const getMpNames = async () => {

    logger.debug('Getting MP Names from mongo...');

    await client.connect();
    const myDB = client.db("mps");
    const myColl = myDB.collection("mpNames");
    // @ts-ignore   
    let allMps = [];
    try {
        allMps = await myColl.find({}).toArray();        
    } catch (e) {
        console.log(`A MongoBulkWriteException occurred, but there are successfully processed documents.`);
        console.log(e);
    }

    // @ts-ignore   
    return allMps;
}

export const mostSimilarVotingRecord = async (name: string) => {
	logger.debug("Getting mostSimilarVotingRecord from mongo...");

    await client.connect();
    const myDB = client.db("mps");
    const myColl = myDB.collection("similarity1");
    // @ts-ignore   
    let mostSimilarVoting = [];
    try {
        mostSimilarVoting = await myColl.find({ name }).toArray();        
    } catch (e) {
        console.log(`A MongoBulkWriteException occurred, but there are successfully processed documents.`);
        console.log(e);
    }

	// @ts-ignore
	return mostSimilarVoting;
};

export const getVotesFromIds = async (ids: Array<number>) => {
	logger.debug(`Getting divisions >> ${ids}`);

	await client.connect();
	const myDB = client.db("mps");
	const myColl = myDB.collection("divisions");
	// @ts-ignore
	let divisions = [];
	try {
		divisions = await myColl.find({ DivisionId: { $in: ids } }).toArray();
	} catch (e) {
		console.log(
			`A MongoBulkWriteException occurred, but there are successfully processed documents.`
		);
		console.log(e);
	}
}

