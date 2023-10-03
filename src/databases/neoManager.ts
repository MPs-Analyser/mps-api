import { log } from 'console';
import { Division } from '../models/divisions';
import { responseWrapper, responseValue, Mp } from '../models/mps';
import { VotedFor } from '../models/relationships';
import neo4j from "neo4j-driver";

const logger = require('../logger');
//hello
let CONNECTION_STRING = `bolt://${process.env.NEO_HOST}:7687`;
// let CONNECTION_STRING = `neo4j+s://bb90f2dc.databases.neo4j.io`;
let driver: any;

const runCypher = async (cypher: string, session: any) => {
    logger.trace(cypher);
    try {
        const result = await session.run(cypher);
        return result;
    } catch (error) {

    }
}

export const getMpNames = async () => {

    logger.debug('Getting MP Names...');

    CONNECTION_STRING = `bolt://${process.env.NEO_HOST}:7687`;
    // CONNECTION_STRING = `neo4j+s://bb90f2dc.databases.neo4j.io`;
    driver = neo4j.driver(CONNECTION_STRING, neo4j.auth.basic(process.env.NEO4J_USER || '', process.env.NEO4J_PASSWORD || ''));
    const session = driver.session();

    try {
        const result = await runCypher(`MATCH (n:Mp) RETURN n.nameDisplayAs, n.id`, session);
        return result;
    } finally {
        session.close();
    }
}

export const getDivisionNames = async () => {

    logger.debug('Getting DIVISION Names...');

    CONNECTION_STRING = `bolt://${process.env.NEO_HOST}:7687`;
    // CONNECTION_STRING = `neo4j+s://bb90f2dc.databases.neo4j.io`;
    driver = neo4j.driver(CONNECTION_STRING, neo4j.auth.basic(process.env.NEO4J_USER || '', process.env.NEO4J_PASSWORD || ''));
    const session = driver.session();

    try {
        const result = await runCypher(`MATCH (n:Division) RETURN n.Title, n.DivisionId`, session);
        return result;
    } finally {
        session.close();
    }
}

export const totalVotes = async (id: number) => {
    const cypher = `MATCH (s:Mp)-[r:VOTED_FOR]-(d) WHERE (s.id = ${id}) RETURN COUNT(d)`;

    CONNECTION_STRING = `bolt://${process.env.NEO_HOST}:7687`;
    // CONNECTION_STRING = `neo4j+s://bb90f2dc.databases.neo4j.io`;
    driver = neo4j.driver(CONNECTION_STRING, neo4j.auth.basic(process.env.NEO4J_USER || '', process.env.NEO4J_PASSWORD || ''));
    const session = driver.session();

    try {
        const result = await runCypher(cypher, session);
        return result;
    } finally {
        session.close();
    }
}

export const votedAyeCount = async (id: number) => {
    const cypher = `MATCH (s:Mp)-[r:VOTED_FOR]-(d) WHERE (s.id = ${id} AND r.votedAye) RETURN COUNT(*)`;

    CONNECTION_STRING = `bolt://${process.env.NEO_HOST}:7687`;
    // CONNECTION_STRING = `neo4j+s://bb90f2dc.databases.neo4j.io`;
    driver = neo4j.driver(CONNECTION_STRING, neo4j.auth.basic(process.env.NEO4J_USER || '', process.env.NEO4J_PASSWORD || ''));
    const session = driver.session();

    try {
        const result = await runCypher(cypher, session);
        return result;
    } finally {
        session.close();
    }
}

export const votedNoCount = async (id: number) => {
    const cypher = `MATCH (s:Mp)-[r:VOTED_FOR]-(d) WHERE (s.id = ${id} AND NOT r.votedAye) RETURN COUNT(*)`;

    CONNECTION_STRING = `bolt://${process.env.NEO_HOST}:7687`;
    // CONNECTION_STRING = `neo4j+s://bb90f2dc.databases.neo4j.io`;
    driver = neo4j.driver(CONNECTION_STRING, neo4j.auth.basic(process.env.NEO4J_USER || '', process.env.NEO4J_PASSWORD || ''));
    const session = driver.session();

    try {
        const result = await runCypher(cypher, session);
        return result;
    } finally {
        session.close();
    }
}

export const voted = async (id: number) => {

    const cypher = `MATCH (s:Mp)-[r:VOTED_FOR]-(d) WHERE (s.id = ${id}) RETURN d.DivisionId, d.Title, d.Date, r.votedAye`;

    CONNECTION_STRING = `bolt://${process.env.NEO_HOST}:7687`;
    // CONNECTION_STRING = `neo4j+s://bb90f2dc.databases.neo4j.io`;
    driver = neo4j.driver(CONNECTION_STRING, neo4j.auth.basic(process.env.NEO4J_USER || '', process.env.NEO4J_PASSWORD || ''));
    const session = driver.session();

    try {
        const result = await runCypher(cypher, session);
        return result;
    } finally {
        session.close();
    }
}

export const votedAye = async (id: number) => {

    const cypher = `MATCH (s:Mp)-[r:VOTED_FOR]-(d) WHERE (s.id = ${id} AND r.votedAye) RETURN d.DivisionId, d.Title, d.Date`;

    CONNECTION_STRING = `bolt://${process.env.NEO_HOST}:7687`;
    // CONNECTION_STRING = `neo4j+s://bb90f2dc.databases.neo4j.io`;
    driver = neo4j.driver(CONNECTION_STRING, neo4j.auth.basic(process.env.NEO4J_USER || '', process.env.NEO4J_PASSWORD || ''));
    const session = driver.session();

    try {
        const result = await runCypher(cypher, session);
        return result;
    } finally {
        session.close();
    }
}

export const votedNo = async (id: number) => {

    const cypher = `MATCH (s:Mp)-[r:VOTED_FOR]-(d) WHERE (s.id = ${id} AND NOT r.votedAye) RETURN d.DivisionId, d.Title, d.Date`;

    CONNECTION_STRING = `bolt://${process.env.NEO_HOST}:7687`;
    // CONNECTION_STRING = `neo4j+s://bb90f2dc.databases.neo4j.io`;
    driver = neo4j.driver(CONNECTION_STRING, neo4j.auth.basic(process.env.NEO4J_USER || '', process.env.NEO4J_PASSWORD || ''));
    const session = driver.session();

    try {
        const result = await runCypher(cypher, session);
        return result;
    } finally {
        session.close();
    }
}

export const votingSimilarity = async (nameDisplayAs: string, limit: number = 40, orderBy: string = "DESCENDING") => {
    
    const cypher = `CALL gds.nodeSimilarity.stream('g1', {
        relationshipWeightProperty: 'votedAyeNumeric',
        topK: 500
    })
    YIELD node1, node2, similarity
    WITH gds.util.asNode(node1) AS mp1, gds.util.asNode(node2) AS mp2, similarity    
    WHERE (mp1.nameDisplayAs = "${nameDisplayAs}")    
    RETURN mp1.nameDisplayAs, mp2.nameDisplayAs, mp2.partyName, similarity
    ORDER BY similarity ${orderBy}, mp1.nameDisplayAs, mp2.nameDisplayAs
    LIMIT ${limit}`;

    CONNECTION_STRING = `bolt://${process.env.NEO_HOST}:7687`;
    // CONNECTION_STRING = `neo4j+s://bb90f2dc.databases.neo4j.io`;
    driver = neo4j.driver(CONNECTION_STRING, neo4j.auth.basic(process.env.NEO4J_USER || '', process.env.NEO4J_PASSWORD || ''));
    const session = driver.session();

    try {
        const result = await runCypher(cypher, session);
        return result;
    } finally {
        session.close();
    }

}

export const votingSimilarityPartyIncludes = async (nameDisplayAs: string, partyName: string, limit: number = 40, orderBy: string = "DESCENDING") => {

    const cypher = `CALL gds.nodeSimilarity.stream('g1', {
        relationshipWeightProperty: 'votedAyeNumeric',
        topK: 500
    })
    YIELD node1, node2, similarity
    WITH gds.util.asNode(node1) AS mp1, gds.util.asNode(node2) AS mp2, similarity  
    WHERE (mp1.nameDisplayAs = "${nameDisplayAs}")
    AND((mp1.nameDisplayAs <> "${nameDisplayAs}" AND mp1.partyName = "${partyName}")  
    OR (mp2.nameDisplayAs <> "${nameDisplayAs}" AND mp2.partyName = "${partyName}") )
    RETURN mp1.nameDisplayAs, mp1.partyName, mp2.nameDisplayAs, mp2.partyName, similarity
    ORDER BY similarity ${orderBy}, mp1.nameDisplayAs, mp2.nameDisplayAs
    LIMIT ${limit}`;

    CONNECTION_STRING = `bolt://${process.env.NEO_HOST}:7687`;
    // CONNECTION_STRING = `neo4j+s://bb90f2dc.databases.neo4j.io`;
    driver = neo4j.driver(CONNECTION_STRING, neo4j.auth.basic(process.env.NEO4J_USER || '', process.env.NEO4J_PASSWORD || ''));
    const session = driver.session();

    try {
        const result = await runCypher(cypher, session);
        return result;
    } finally {
        session.close();
    }
}

export const VotingSimilarityPartyExcludes = async (nameDisplayAs: string, partyName: string, limit: number = 40, orderBy: string = "DESCENDING") => {
    
    const cypher = `CALL gds.nodeSimilarity.stream('g1', {
        relationshipWeightProperty: 'votedAyeNumeric',
        topK: 500
    })
    YIELD node1, node2, similarity
    WITH gds.util.asNode(node1) AS mp1, gds.util.asNode(node2) AS mp2, similarity  
    WHERE (mp1.nameDisplayAs = "${nameDisplayAs}")
    AND((mp1.nameDisplayAs <> "${nameDisplayAs}" AND mp1.partyName <> "${partyName}" )  
    OR (mp2.nameDisplayAs <> "${nameDisplayAs}" AND mp2.partyName <> "${partyName}" ) )
    RETURN mp1.nameDisplayAs, mp1.partyName, mp2.nameDisplayAs, mp2.partyName, similarity
    ORDER BY similarity ${orderBy}, mp1.nameDisplayAs, mp2.nameDisplayAs
    LIMIT ${limit}`;

    CONNECTION_STRING = `bolt://${process.env.NEO_HOST}:7687`;
    // CONNECTION_STRING = `neo4j+s://bb90f2dc.databases.neo4j.io`;
    driver = neo4j.driver(CONNECTION_STRING, neo4j.auth.basic(process.env.NEO4J_USER || '', process.env.NEO4J_PASSWORD || ''));
    const session = driver.session();

    try {
        const result = await runCypher(cypher, session);
        return result;
    } finally {
        session.close();
    }
}

export const setupDataScience = async () => {

    CONNECTION_STRING = `bolt://${process.env.NEO_HOST}:7687`;
    // CONNECTION_STRING = `neo4j+s://bb90f2dc.databases.neo4j.io`;

    driver = neo4j.driver(CONNECTION_STRING, neo4j.auth.basic(process.env.NEO4J_USER || '', process.env.NEO4J_PASSWORD || ''));
    const session = driver.session();

    try {
        await runCypher(`CALL gds.graph.drop('g1',false) YIELD graphName`, session);
        await runCypher(`CALL gds.graph.project('g1', ['Mp', 'Division'], ['VOTED_FOR'],  { relationshipProperties: ['votedAyeNumeric'] })`, session);
    } catch (error) {
        //contraint already exists so proceed
    }

    session.close();

}

export const cleanUp = () => {
    driver.close();
}

export const createMpNode = async (mp: Mp) => {

    const cypher: string =
        `CREATE (mp:Mp {
        id: ${mp.id},
        nameListAs: "${mp.nameListAs}",
        nameDisplayAs: "${mp.nameDisplayAs}",
        nameFullTitle: "${mp.nameFullTitle}",
        nameAddressAs: "${mp.nameAddressAs}",        
        partyId: "${mp.latestParty.id}",
        partyName: "${mp.latestParty.name}",
        gender: "${mp.gender}",
        partyAbbreviation: "${mp.latestParty.abbreviation}",
        partyBackgroundColour: "${mp.latestParty.backgroundColour}",
        partyForegroundColour: "${mp.latestParty.foregroundColour}",
        partyIsLordsMainParty: "W${mp.latestParty.isLordsMainParty}",
        partyIsLordsSpiritualParty: "${mp.latestParty.isLordsSpiritualParty}",
        partyGovernmentType: "${mp.latestParty.governmentType}",
        partyIsIndependentParty: "${mp.latestParty.isIndependentParty}",
        house: ${mp.latestHouseMembership.house},
        membershipFrom: "${mp.latestHouseMembership.membershipFrom}",        
        membershipStartDate: "${mp.latestHouseMembership.membershipStartDate}"
      });`

    try {
        const session = driver.session();
        const result = await session.run(cypher);
        // logger.debug('created ', result);

    } catch (error: any) {
        if (error.code !== "Neo.ClientError.Schema.ConstraintValidationFailed") {
            logger.debug('Error adding Club: ', error);
        }
    }

}

export const createDivisionNode = async (division: Division) => {

    const cypher: string = `CREATE (division:Division {
        DivisionId: ${division.DivisionId},
        Date: "${division.Date}",
        PublicationUpdated: "${division.PublicationUpdated}",
        Number: ${division.Number},
        IsDeferred: ${division.IsDeferred},
        EVELType: "${division.EVELType}",
        EVELCountry: "${division.EVELCountry}",
        Title: "${division.Title}",
        AyeCount: ${division.AyeCount},
        NoCount: ${division.NoCount}
        })`;

    try {
        const session = driver.session();
        const result = await session.run(cypher);

    } catch (error: any) {
        if (error.code !== "Neo.ClientError.Schema.ConstraintValidationFailed") {
            logger.debug('Error adding Club: ', error);
        }
    }

}

export const createVotedForDivision = async (votedFor: VotedFor) => {

    const cypher: string = `MATCH (mp:Mp {id: ${votedFor.mpId}}), (division:Division {DivisionId: ${votedFor.divisionId}}) CREATE (mp)-[:VOTED_FOR {votedAye: ${votedFor.votedAye}, votedAyeNumeric: ${Number(votedFor.votedAye)} }]->(division);`;

    try {
        const session = driver.session();
        // logger.debug(cypher);            
        const result = await session.run(cypher);

    } catch (error: any) {
        if (error.code !== "Neo.ClientError.Schema.ConstraintValidationFailed") {
            logger.debug('Error adding Club: ', error);
        }
    }

}