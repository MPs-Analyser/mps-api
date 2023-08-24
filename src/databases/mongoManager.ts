import { log } from "console";

const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = "mongodb+srv://mongo:mooquackwoof@atlascluster.ofzo7oi.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

/**
 * Connect to mongo atlas
 */
export const setupMongo = async () => {

    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("mps").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } catch (e) {
        console.log('Error connecting to mongo ', e);

    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }

}


export const insertSimilarity = async (data:Array<any>) => {
    
    await client.connect();
    const myDB = client.db("mps");
    const myColl = myDB.collection("similarity1");
    try {
       const insertManyresult = await myColl.insertMany(data);
    //    let ids = insertManyresult.insertedIds;
       console.log(`${insertManyresult.insertedCount} documents were inserted.`);
    //    for (let id of Object.values(ids)) {
    //       console.log(`Inserted a document with id ${id}`);
    //    }
    } catch(e) {
       console.log(`A MongoBulkWriteException occurred, but there are successfully processed documents.`);
       console.log(e);    
       // @ts-ignore   
       console.log(`Number of documents inserted: ${e.result.result.nInserted}`);
    }

    
}

