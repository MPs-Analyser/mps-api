import { Division } from '../models/divisions';
import { Mp } from '../models/mps';
import { VotedFor } from '../models/relationships';
import neo4j from "neo4j-driver";
import { cyphers } from "./cyphers";
import { constants } from "../constants";

const logger = require('../logger');
//hello
let CONNECTION_STRING = `bolt://${process.env.NEO_HOST}:7687`;
// let CONNECTION_STRING = `neo4j+s://bb90f2dc.databases.neo4j.io`;
let driver: any;

const objectToStringWithoutQuotes = (obj: any) => {
    let result = '{';

    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            result += key + ':' + JSON.stringify(obj[key]) + ',';
        }
    }

    // Remove the trailing comma if there are properties
    if (result.length > 1) {
        result = result.slice(0, -1);
    }

    result += '}';
    return result;
}

const runCypher = async (cypher: string, session: any) => {
    logger.trace(cypher);
    try {
        const result = await session.run(cypher);
        return result;
    } catch (error) {
        logger.error("ERROR RUNNING CYPHER: " + error);
    }
}

export const getMpNames = async () => {

    logger.debug('Getting MP Names...');

    CONNECTION_STRING = `bolt://${process.env.NEO_HOST}:7687`;
    driver = neo4j.driver(CONNECTION_STRING, neo4j.auth.basic(process.env.NEO4J_USER || '', process.env.NEO4J_PASSWORD || ''));
    const session = driver.session();

    try {
        const result = await runCypher(`MATCH (n:Mp) RETURN n.nameDisplayAs, n.id`, session);
        return result;
    } finally {
        session.close();
    }
}

export const searchMps = async ({ party = "Any", name = "Any", sex = "Any", year = 0, votes = ">0" }) => {

    logger.debug('Searching MPs');

    CONNECTION_STRING = `bolt://${process.env.NEO_HOST}:7687`;

    driver = neo4j.driver(CONNECTION_STRING, neo4j.auth.basic(process.env.NEO4J_USER || '', process.env.NEO4J_PASSWORD || ''));
    const session = driver.session();

    const cypher = `
    MATCH (s:Mp)-[r:VOTED_FOR]-(d) 
    WHERE (s.partyName = "${party}" OR "${party}" = "Any")
    AND (s.nameDisplayAs =~ '(?i).*${name}.*' OR "${name}" = "Any")
    AND (s.gender = "${sex}" OR "${sex}" = "Any")
    AND (datetime(s.membershipStartDate).year = ${year} OR ${year} = 0)    
    WITH s, d, r    
    RETURN 
    s.nameDisplayAs,
    s.gender, 
    s.membershipStartDate as startDate, 
    s.partyName as party,
    s.id,
    COUNT(d) as totalVotes,
    COUNT(CASE WHEN r.votedAye THEN d END) as ayeVotes,
    COUNT(CASE WHEN NOT r.votedAye THEN d END) as nayVotes
    `;

    try {
        const result = await runCypher(cypher, session);
        return result;
    } finally {
        session.close();
    }
}

export const getParties = async () => {

    logger.debug('Getting parties');

    CONNECTION_STRING = `bolt://${process.env.NEO_HOST}:7687`;

    driver = neo4j.driver(CONNECTION_STRING, neo4j.auth.basic(process.env.NEO4J_USER || '', process.env.NEO4J_PASSWORD || ''));
    const session = driver.session();

    try {
        const result = await runCypher(`MATCH (p:Party) RETURN p`, session);
        return result;
    } finally {
        session.close();
    }
}

export const getDonorDetails = async ({ donarName = "" }) => {

    logger.debug(`Getting donations for donar name ${donarName}`);

    CONNECTION_STRING = `bolt://${process.env.NEO_HOST}:7687`;

    driver = neo4j.driver(CONNECTION_STRING, neo4j.auth.basic(process.env.NEO4J_USER || '', process.env.NEO4J_PASSWORD || ''));
    const session = driver.session();

    const cypher = `MATCH (d)-[r:DONATED_TO]-(p:Party)
    WHERE d.donar =~ '(?i).*${donarName}.*'
    RETURN 
    d.donar as donar, 
    d.accountingUnitName as accountingUnitName, 
    d.postcode as postcode,
    d.donorStatus as donorStatus, 
    r.amount as amount, 
    r.donationType as donationType,
    r.receivedDate as receivedDate, 
    p.partyName as partyName`;

    try {
        const result = await runCypher(cypher, session);
        return result;
    } finally {
        session.close();
    }

}

export const getMultiPartyDonars = async () => {

    logger.debug(`Getting getMultiPartyDonars`);

    CONNECTION_STRING = `bolt://${process.env.NEO_HOST}:7687`;

    driver = neo4j.driver(CONNECTION_STRING, neo4j.auth.basic(process.env.NEO4J_USER || '', process.env.NEO4J_PASSWORD || ''));
    const session = driver.session();

    const cypher = `
    MATCH (d)-[r:DONATED_TO]->(p:Party)
    WITH d, COLLECT(DISTINCT p.partyName) AS uniquePartyNames
    WHERE SIZE(uniquePartyNames) > 1
    RETURN
      d.donar AS donor,
      SIZE(uniquePartyNames) AS numberOfPartiesDonated,
      uniquePartyNames AS partyNames
    ORDER BY numberOfPartiesDonated DESC;
    `

    try {
        const result = await runCypher(cypher, session);
        return result;
    } finally {
        session.close();
    }

}



export const getDonorsForParty = async ({ partyName = "Any" }) => {

    logger.debug(`Getting donations for party ${partyName}`);

    CONNECTION_STRING = `bolt://${process.env.NEO_HOST}:7687`;

    driver = neo4j.driver(CONNECTION_STRING, neo4j.auth.basic(process.env.NEO4J_USER || '', process.env.NEO4J_PASSWORD || ''));
    const session = driver.session();

    const cypher = `
    MATCH (d)-[r:DONATED_TO]-(p:Party)
    WHERE p.partyName = "${partyName}" OR "${partyName}" = "Any"
       RETURN
       p.partyName AS partyName,
       d.donar as donar,
       COUNT(r) AS donated,
       SUM(r.amount) AS totalDonationValue
       ORDER BY totalDonationValue DESC;
    `

    try {
        const result = await runCypher(cypher, session);
        return result;
    } finally {
        session.close();
    }

}

export const getContractsAwardedByCount = async ({ awardedCount = 1000 }) => {

    logger.debug('getContractsAwardedByCount');

    CONNECTION_STRING = `bolt://${process.env.NEO_HOST}:7687`;

    driver = neo4j.driver(CONNECTION_STRING, neo4j.auth.basic(process.env.NEO4J_USER || '', process.env.NEO4J_PASSWORD || ''));
    const session = driver.session();

    const cypher = `
    MATCH (party:Party)-[:TENDERED]->(c:Contract)-[awarded:AWARDED]->(org)
    WITH org, COUNT(c) AS contractCount
    WHERE contractCount > ${awardedCount}
    AND org.Name <> ""
    RETURN org.Name, contractCount
    ORDER BY contractCount
    `

    try {
        const result = await runCypher(cypher, session);
        return result;
    } finally {
        session.close();
    }

}

export const getContractsforOrg = async ({ orgName="" }) => {

    logger.debug('getContractsAwardedByCount');

    CONNECTION_STRING = `bolt://${process.env.NEO_HOST}:7687`;

    driver = neo4j.driver(CONNECTION_STRING, neo4j.auth.basic(process.env.NEO4J_USER || '', process.env.NEO4J_PASSWORD || ''));
    const session = driver.session();

    const cypher = `
    MATCH (org:Organisation)-[:AWARDED]-(con:Contract)-[:TENDERED]-(party:Party)
    WHERE toLower(org.Name) CONTAINS toLower("${orgName}")
    RETURN 
        party.partyName AS Awarded_By,
        con.AwardedDate AS Awarded_Date,
        con.Title AS Contract_Title,
        con.AwardedValue AS Awarded_Value,        
        con.Description AS Contract_Description,
        con.Link AS Contract_Link       
    `

    try {
        const result = await runCypher(cypher, session);
        return result;
    } finally {
        session.close();
    }

}


export const getDonationSummary = async () => {

    logger.debug('Getting donation summary');

    CONNECTION_STRING = `bolt://${process.env.NEO_HOST}:7687`;

    driver = neo4j.driver(CONNECTION_STRING, neo4j.auth.basic(process.env.NEO4J_USER || '', process.env.NEO4J_PASSWORD || ''));
    const session = driver.session();

    const cypher = `
    MATCH (d)-[r:DONATED_TO]-(p:Party)
    RETURN
    p.partyName AS partyName,
    COUNT(r) AS donationCount,
    SUM(r.amount) AS totalDonationValue
    ORDER BY totalDonationValue DESC;
    `

    try {
        const result = await runCypher(cypher, session);
        return result;
    } finally {
        session.close();
    }

}

export const searchDivisions = async ({ category = "Any", name = "Any" }) => {

    logger.debug('Searching MPs');

    CONNECTION_STRING = `bolt://${process.env.NEO_HOST}:7687`;

    driver = neo4j.driver(CONNECTION_STRING, neo4j.auth.basic(process.env.NEO4J_USER || '', process.env.NEO4J_PASSWORD || ''));
    const session = driver.session();

    try {
        const result = await runCypher(`
        MATCH (n:Division) 
        WHERE (n.Category = "${category}" OR "${category}" = "Any")
        AND (n.Title =~ '(?i).*${name}.*' OR "${name}" = "Any")
        RETURN n.Category as category, n.Title as title, n.DivisionId as id, n.Date as date, n.AyeCount as ayeCount, n.NoCount as noCount`,
            session);
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

/**
 * 
 * @param value expected format 2002-09-22
 * @returns 
 */
const dateStringToNeo = (value: string) => {
    return objectToStringWithoutQuotes({ year: Number(value.split("-")[0]), month: Number(value.split("-")[1]), day: Number(value.split("-")[2]) });
}

export const voteCounts = async (id: number, fromDate: string = constants.EARLIEST_FROM_DATE, toDate: string, category: string, name = "Any") => {

    //set to date to today if not provided 
    if (!toDate) {
        toDate = new Date().toISOString().substr(0, 10);
    }

    const fromDateValue = dateStringToNeo(fromDate);
    const toDateValue = dateStringToNeo(toDate);

    const cypher = `
    MATCH (s:Mp)-[r:VOTED_FOR]-(d) 
    WHERE s.id = ${id} 
    AND d.Date > datetime(${fromDateValue}) 
    AND d.Date < datetime(${toDateValue}) 
    AND (d.Category= "${category}" OR "${category}"="Any")
    AND (d.Title =~ '(?i).*${name}.*' OR "${name}" = "Any")
    WITH d, r
    RETURN 
    COUNT(d) as totalVotes, 
    COUNT(CASE WHEN r.votedAye THEN d END) as ayeVotes,
    COUNT(CASE WHEN NOT r.votedAye THEN d END) as nayVotes`

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

export const voted = async (id: number, fromDate: string = constants.EARLIEST_FROM_DATE, toDate: string, category: string, name = "Any") => {

    //set to date to today if not provided 
    if (!toDate) {
        toDate = new Date().toISOString().substr(0, 10);
    }

    const fromDateValue = dateStringToNeo(fromDate);
    const toDateValue = dateStringToNeo(toDate);

    const cypher = `MATCH (s:Mp)-[r:VOTED_FOR]-(d) 
    WHERE (s.id = ${id}) 
    AND d.Date > datetime(${fromDateValue}) 
    AND d.Date < datetime(${toDateValue}) 
    AND (d.Category= "${category}" OR "${category}"="Any")
    AND (d.Title =~ '(?i).*${name}.*' OR "${name}" = "Any")
    RETURN d.DivisionId, d.Title, d.Date, r.votedAye`;

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

export const votedAye = async (id: number, fromDate: string = constants.EARLIEST_FROM_DATE, toDate: string, category: string, name = "Any") => {

    //set to date to today if not provided 
    if (!toDate) {
        toDate = new Date().toISOString().substr(0, 10);
    }

    const fromDateValue = dateStringToNeo(fromDate);
    const toDateValue = dateStringToNeo(toDate);

    const cypher = `MATCH (s:Mp)-[r:VOTED_FOR]-(d) 
    WHERE (s.id = ${id} AND r.votedAye) 
    AND d.Date > datetime(${fromDateValue}) 
    AND d.Date < datetime(${toDateValue})     
    AND (d.Category= "${category}" OR "${category}"="Any")
    AND (d.Title =~ '(?i).*${name}.*' OR "${name}" = "Any")    
    RETURN d.DivisionId, d.Title, d.Date`;

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

export const votedNo = async (id: number, fromDate: string = constants.EARLIEST_FROM_DATE, toDate: string, category: string, name = "Any") => {

    //set to date to today if not provided 
    if (!toDate) {
        toDate = new Date().toISOString().substr(0, 10);
    }

    const fromDateValue = dateStringToNeo(fromDate);
    const toDateValue = dateStringToNeo(toDate);

    const cypher = `MATCH (s:Mp)-[r:VOTED_FOR]-(d) 
    WHERE (s.id = ${id} AND NOT r.votedAye) 
    AND d.Date > datetime(${fromDateValue}) 
    AND d.Date < datetime(${toDateValue}) 
    AND (d.Category= "${category}" OR "${category}"="Any")
    AND (d.Title =~ '(?i).*${name}.*' OR "${name}" = "Any")
    RETURN d.DivisionId, d.Title, d.Date`;

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

/**
 * find mps with most or least similar voting records
 * TODO - want to include voting types parameter (eg. immigration, EU) and date range (cant work out how to do dates as they are stored on divisions not mps)
 * @param id 
 * @param partyName 
 * @param limit 
 * @param orderBy 
 * @param type 
 * @returns 
 */
export const votingSimilarity = async (id: number, partyName: string, limit: number = 40, orderBy: string = "DESCENDING", type: string) => {

    CONNECTION_STRING = `bolt://${process.env.NEO_HOST}:7687`;
    driver = neo4j.driver(CONNECTION_STRING, neo4j.auth.basic(process.env.NEO4J_USER || '', process.env.NEO4J_PASSWORD || ''));
    const session = driver.session();

    const neoIdCypher = `MATCH (n:Mp {id: ${id}}) RETURN ID(n)`;
    let neoId;
    try {

        const neoIdResult = await runCypher(neoIdCypher, session);
        logger.info("check me out >>> " + JSON.stringify(neoIdResult.records));
        neoId = neoIdResult.records[0]._fields[0].low;
        logger.info("reult is " + neoId)

        let cypher;
        if (type === "excludeParty") {
            cypher = cyphers.votingSimilarityParty("similarityGraph", neoId, partyName, orderBy, limit, "<>");
        } else if (type === "includeParty") {
            cypher = cyphers.votingSimilarityParty("similarityGraph", neoId, partyName, orderBy, limit, "=");
        } else {
            cypher = cyphers.votingSimilarity("similarityGraph", neoId, orderBy, limit);
        }

        const result = await runCypher(cypher, session);
        return result;
    } finally {
        session.close();
    }
}

export const generateGraphName = () => {
    const length = 6;
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
        result += characters[Math.floor(Math.random() * characters.length)];
    }

    return result;
}

export const votingSimilarityFiltered = async (id: number, partyName: string, limit: number = 40, orderBy: string = "DESCENDING", type: string, fromDate: string = constants.EARLIEST_FROM_DATE, toDate: string) => {

    CONNECTION_STRING = `bolt://${process.env.NEO_HOST}:7687`;
    driver = neo4j.driver(CONNECTION_STRING, neo4j.auth.basic(process.env.NEO4J_USER || '', process.env.NEO4J_PASSWORD || ''));
    const session = driver.session();

    const neoIdCypher = `MATCH (n:Mp {id: ${id}}) RETURN ID(n)`;

    try {

        //set to date to today if not provided 
        if (!toDate) {
            toDate = new Date().toISOString().substr(0, 10);
        }

        const fromDateValue = new Date(fromDate).getTime();
        const toDateValue = new Date(toDate).getTime();

        const graphName = generateGraphName();

        //create filterd graph containing only divisions within the specified date range 
        const filteredCypher = `CALL gds.graph.filter('${graphName}','similarityGraph', 'n:Mp OR (n:Division AND n.DateNumeric > ${fromDateValue} AND n.DateNumeric < ${toDateValue})', 'r:VOTED_FOR')`
        // const filteredCypher = `CALL gds.graph.filter('${graphName}','similarityGraph', 'n:Division AND n.DateNumeric > ${fromDateValue} AND n.DateNumeric < ${toDateValue}', '*')`
        const filterdGraphResult = await runCypher(filteredCypher, session);

        //find the neo id of the MP we querying
        const neoIdResult = await runCypher(neoIdCypher, session);
        const neoId = neoIdResult.records[0]._fields[0].low;

        let cypher;
        if (type === "excludeParty") {
            cypher = cyphers.votingSimilarityParty(graphName, neoId, partyName, orderBy, limit, "<>");
        } else if (type === "includeParty") {
            cypher = cyphers.votingSimilarityParty(graphName, neoId, partyName, orderBy, limit, "=");
        } else {
            cypher = cyphers.votingSimilarity(graphName, neoId, orderBy, limit);
        }

        const result = await runCypher(cypher, session);

        //drop the filterd graph we just created. No need to wait for this step to finish
        await runCypher(`CALL gds.graph.drop('${graphName}',false) YIELD graphName`, session);

        return result;
    } finally {
        session.close();
    }
}

export const mostOrLeastVotingMps = async (partyName: string, voteCategory: string, partyOperator: string = "=", limit: number = 40, orderBy: string = "DESCENDING", fromDate: string = constants.EARLIEST_FROM_DATE, toDate: string, name = "Any") => {

    //set to date to today if not provided 
    if (!toDate) {
        toDate = new Date().toISOString().substr(0, 10);
    }

    const fromDateValue = objectToStringWithoutQuotes({ year: Number(fromDate.split("-")[0]), month: Number(fromDate.split("-")[1]), day: Number(fromDate.split("-")[2]) });
    const toDateValue = objectToStringWithoutQuotes({ year: Number(toDate.split("-")[0]), month: Number(toDate.split("-")[1]), day: Number(toDate.split("-")[2]) });

    let cypher;

    if (partyName) {

        if (voteCategory) {
            cypher = `MATCH (mp:Mp)-[]-(d:Division)
            WHERE mp.partyName ${partyOperator} "${partyName}"
            AND d.Category = "${voteCategory}"
            AND d.Date > datetime(${fromDateValue}) 
            AND d.Date < datetime(${toDateValue}) 
            AND (mp.nameDisplayAs =~ '(?i).*${name}.*' OR "${name}" = "Any")
            WITH mp, COUNT(*) AS voteCount
            ORDER BY voteCount ${orderBy}
            RETURN mp.nameDisplayAs, mp.partyName, voteCount, mp.id
            LIMIT ${limit}`;
        } else {
            cypher = `MATCH (mp:Mp)-[]-(d:Division)
            WHERE mp.partyName ${partyOperator} "${partyName}"
            AND d.Date > datetime(${fromDateValue}) 
            AND d.Date < datetime(${toDateValue}) 
            AND (mp.nameDisplayAs =~ '(?i).*${name}.*' OR "${name}" = "Any")
            WITH mp, COUNT(*) AS voteCount
            ORDER BY voteCount ${orderBy}
            RETURN mp.nameDisplayAs, mp.partyName, voteCount, mp.id
            LIMIT ${limit}`;
        }
    } else {
        if (voteCategory) {
            cypher = `MATCH (mp:Mp)-[]-(d:Division)        
            WHERE d.Category = "${voteCategory}"
            AND d.Date > datetime(${fromDateValue}) 
            AND d.Date < datetime(${toDateValue}) 
            AND (mp.nameDisplayAs =~ '(?i).*${name}.*' OR "${name}" = "Any")
            WITH mp, COUNT(*) AS voteCount
            ORDER BY voteCount ${orderBy}
            RETURN mp.nameDisplayAs, mp.partyName, voteCount, mp.id
            LIMIT ${limit}`;
        } else {
            cypher = `MATCH (mp:Mp)-[]-(d:Division)        
            WHERE d.Date > datetime(${fromDateValue}) 
            AND d.Date < datetime(${toDateValue}) 
            AND (mp.nameDisplayAs =~ '(?i).*${name}.*' OR "${name}" = "Any")
            WITH mp, COUNT(*) AS voteCount
            ORDER BY voteCount ${orderBy}
            RETURN mp.nameDisplayAs, mp.partyName, voteCount, mp.id
            LIMIT ${limit}`;
        }
    }

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

export const mostOrLeastVotedDivision = async (ayeOrNo: string, category: string, limit: number = 40, orderBy: string = "DESCENDING", fromDate: string = constants.EARLIEST_FROM_DATE, toDate: string, name = "Any") => {

    let cypher;

    //set to date to today if not provided 
    if (!toDate) {
        toDate = new Date().toISOString().substr(0, 10);
    }

    const fromDateValue = objectToStringWithoutQuotes({ year: Number(fromDate.split("-")[0]), month: Number(fromDate.split("-")[1]), day: Number(fromDate.split("-")[2]) });
    const toDateValue = objectToStringWithoutQuotes({ year: Number(toDate.split("-")[0]), month: Number(toDate.split("-")[1]), day: Number(toDate.split("-")[2]) });

    if (ayeOrNo) {

        let ayeOrNoBool = ayeOrNo === "aye" ? true : false;

        cypher = `MATCH (d:Division)-[r:VOTED_FOR]-(mps:Mp)
            WHERE r.votedAye = ${ayeOrNoBool}
            AND d.Date > datetime(${fromDateValue}) 
            AND d.Date < datetime(${toDateValue}) 
            AND (d.Category= "${category}" OR "${category}"="Any")
            AND (d.Title =~ '(?i).*${name}.*' OR "${name}" = "Any")
            WITH d, COUNT(*) AS edgeCount
            ORDER BY edgeCount ${orderBy}
            RETURN d.Title, edgeCount, d.DivisionId
            LIMIT ${limit}`;

    } else {

        cypher = `MATCH (d:Division)-[r:VOTED_FOR]-(mps:Mp)                    
            WHERE d.Date > datetime(${fromDateValue}) 
            AND (d.Category= "${category}" OR "${category}"="Any")
            AND d.Date < datetime(${toDateValue}) 
            AND (d.Title =~ '(?i).*${name}.*' OR "${name}" = "Any")
            WITH d, COUNT(*) AS edgeCount
            ORDER BY edgeCount ${orderBy}
            RETURN d.Title, edgeCount, d.DivisionId
            LIMIT ${limit}`;

    }


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