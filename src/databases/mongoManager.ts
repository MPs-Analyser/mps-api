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

export const insertSimilarity = async (data: Array<any>) => {
	await client.connect();
	const myDB = client.db("mps");
	const myColl = myDB.collection("similarity1");
	try {
		const insertManyresult = await myColl.insertMany(data);
		console.log(
			`${insertManyresult.insertedCount} documents were inserted.`
		);
	} catch (e) {
		console.log(
			`A MongoBulkWriteException occurred, but there are successfully processed documents.`
		);
		console.log(e as MongoError);
		// @ts-ignore
		console.log(
			`Number of documents inserted: ${
				(e as MongoError).result.result.nInserted
			}`
		);
	}
};

export const getDivisionNames = async () => {
	logger.debug("Getting DIVISION Names from mongo...");

	await client.connect();
	const myDB = client.db("mps");
	const myColl = myDB.collection("divisions");
	let allDivision = [];
	try {
		allDivision = await myColl.find({}).toArray();
	} catch (e) {
		console.log(
			`A MongoBulkWriteException occurred, but there are successfully processed documents.`
		);
		console.log(e);
	}

	return allDivision;
};

export const getAllMps = async () => {
	logger.debug("Getting MPs from mongo...");

	await client.connect();
	const myDB = client.db("mps");
	const myColl = myDB.collection("mps");
	// @ts-ignore
	let allMps = [];
	try {
		allMps = await myColl
			.find({})
			.project({ nameDisplayAs: 1, id: 1 })
			.toArray();
	} catch (e) {
		console.log(
			`A MongoBulkWriteException occurred, but there are successfully processed documents.`
		);
		console.log(e);
	}

	// @ts-ignore
	return allMps;
};

export const getMp = async (id: number, project: any) => {
	logger.debug(`Getting MP details from mongo for ${id}`);

	await client.connect();
	const myDB = client.db("mps");
	const myColl = myDB.collection("mps");
	// @ts-ignore
	let mp = [];
	try {
		if (project) {
			const result = await myColl
				.find({ id })
				.project(project)
				.toArray();
			mp = result[0];
		} else {
			mp = await myColl.findOne({ id });
		}

		console.log("found ", mp);
	} catch (e) {
		console.log(
			`A MongoBulkWriteException occurred, but there are successfully processed documents.`
		);
		console.log(e);
	}

	// @ts-ignore
	return mp;
};

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
		console.log(
			`A MongoBulkWriteException occurred, but there are successfully processed documents.`
		);
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

	console.log("found divisions ", divisions[0]);

	// @ts-ignore
	return divisions;
};
