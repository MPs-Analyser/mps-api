import { Division } from '../models/divisions';
import { Mp } from '../models/mps';
import { VotedFor } from '../models/relationships';
import neo4j from "neo4j-driver";
import { cyphers } from "./cyphers";
import { constants } from "../constants";
import { P } from 'pino';

const logger = require('../logger');

let CONNECTION_STRING = `bolt://${process.env.NEO_HOST}:7687`;
let driver: any;

const setDriver = () => neo4j.driver(CONNECTION_STRING, neo4j.auth.basic(process.env.NEO4J_USER || '', process.env.NEO4J_PASSWORD || ''), { encrypted: 'ENCRYPTION_OFF', trust: 'TRUST_ALL_CERTIFICATES' });

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
    driver = setDriver();
    const session = driver.session();

    try {
        const result = await runCypher(`MATCH (n:Mp) RETURN n.nameDisplayAs, n.id`, session);
        return result;
    } finally {
        session.close();
    }
}

export const searchMps = async ({ party = "Any", name = "Any", sex = "Any", year = 0, votes = ">0", status = "All" }) => {
    logger.debug("Searching MPs");

    CONNECTION_STRING = `bolt://${process.env.NEO_HOST}:7687`;
    driver = setDriver();
    const session = driver.session();

    const isActive = status === "Active" ? true : false;

    const cypher = `
      MATCH (s:Mp)
      WHERE (s.partyName = "${party}" OR "${party}" = "Any")
      AND (s.isActive = ${isActive} OR "${status}" = "All")
      AND (s.nameDisplayAs =~ '(?i).*${name}.*' OR "${name}" = "Any")
      AND (s.gender = "${sex}" OR "${sex}" = "Any")
      AND (datetime(s.membershipStartDate).year = ${year} OR ${year} = 0)             
      OPTIONAL MATCH (s)-[r:VOTED_FOR]->(d)  
      WITH s, 
           COUNT(d) as totalVotes,
           COUNT(CASE WHEN r.votedAye THEN d END) as ayeVotes,
           COUNT(CASE WHEN NOT r.votedAye THEN d END) as nayVotes
      // Filter based on votes if specified
      WHERE (totalVotes ${votes} OR "${votes}" = ">0") 
      RETURN 
        s.nameDisplayAs,
        s.gender, 
        s.membershipStartDate as startDate, 
        s.partyName as party,
        s.id,        
        totalVotes,
        ayeVotes,
        nayVotes,
        s.isActive`;

    try {
        const result = await runCypher(cypher, session);
        return result;
    } finally {
        session.close();
    }
};

export const getParties = async () => {

    logger.debug('Getting parties');

    CONNECTION_STRING = `bolt://${process.env.NEO_HOST}:7687`;

    driver = setDriver();
    const session = driver.session();

    try {
        const result = await runCypher(`MATCH (p:Party) RETURN p`, session);
        return result;
    } finally {
        session.close();
    }
}

function escapeRegexSpecialChars(text: string) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const querySimilarNames = async (shortName: string, name: string) => {

    logger.debug(`Query similar names to  ${name}`);

    CONNECTION_STRING = `bolt://${process.env.NEO_HOST}:7687`;

    driver = setDriver();
    const session = driver.session();

    let params = { shortName, name }

    let cypher = `MATCH (c:Organisation)
    WHERE c.Name CONTAINS $shortName
    OR apoc.text.levenshteinDistance(c.Name, $name) < 5
    RETURN c.Name, c.accountingUnitName AS \`Accounting Unit\`, c.postcode, c.hasHadContract
    ORDER BY apoc.text.levenshteinDistance(c.Name, $name)
    LIMIT 100
    `

    try {
        const result = await runCypherWithParams(cypher, session, params);
        return result;
    } finally {
        session.close();
    }

}


export const jaroWinklerSimilarity = async (shortName: string, name: string) => {

    logger.debug(`Query JARO similar names to  ${name}`);

    CONNECTION_STRING = `bolt://${process.env.NEO_HOST}:7687`;

    driver = setDriver();
    const session = driver.session();

    let params = { shortName, name }

    let cypher = `
    MATCH (c:Organisation)
    WHERE c.Name CONTAINS $shortName
    OR apoc.text.jaroWinklerDistance(c.Name, $name) < 0.15 
    RETURN c.Name, c.accountingUnitName AS \`Accounting Unit\`, c.postcode, c.hasHadContract
    ORDER BY apoc.text.jaroWinklerDistance(c.Name, $name) 
    LIMIT 100
    `

    try {
        const result = await runCypherWithParams(cypher, session, params);
        return result;
    } finally {
        session.close();
    }

}

export const queryOrgsAndIndividuals = async ({ name = "Any", awardedBy = "Any Party", donatedTo = "Any Party", limit = 10, orgType = "Any" }) => {

    logger.debug(`Query orgs and individuals no numeric checks for ${name} ${awardedBy} ${donatedTo}`);

    CONNECTION_STRING = `bolt://${process.env.NEO_HOST}:7687`;

    driver = setDriver();
    const session = driver.session();

    let cypher;
    let params = {
        name: escapeRegexSpecialChars(name),
        awardedBy: escapeRegexSpecialChars(awardedBy),
        donatedTo: escapeRegexSpecialChars(donatedTo),
        limit
    }; // Create a params object

    if (awardedBy === "Any Party" && donatedTo === "Any Party") {
        logger.info("Query just org or individual details");

        if (orgType === "Any") {
            cypher = `MATCH (org)
            WHERE (toLower(org.Name) CONTAINS toLower($name) OR $name = "Any")
            AND org.Name <> ""
            RETURN org.Name, org.donorStatus AS type, org.accountingUnitName AS accounting, org.postcode AS \`Post Code\`
            ORDER BY org.Name
            LIMIT toInteger($limit)`;
        } else { //query just individual or organisation types 
            cypher = `MATCH (org:${orgType})
            WHERE (toLower(org.Name) CONTAINS toLower($name) OR $name = "Any")
            AND org.Name <> ""
            RETURN org.Name, org.donorStatus AS type, org.accountingUnitName AS accounting, org.postcode AS \`Post Code\`
            ORDER BY org.Name
            LIMIT toInteger($limit)`;
        }


    } else if (awardedBy !== "Any Party" && donatedTo === "Any Party") {
        logger.info("Query org details for contract awarded but not donations");

        cypher = `
        MATCH (party:Party)-[:TENDERED]->(c:Contract)-[awarded:AWARDED]->(org)
        WHERE (toLower(org.Name) CONTAINS toLower($name) OR $name = "Any")
        AND (party.partyName = $awardedBy OR $awardedBy = "Any Party")
        WITH org, COUNT(c) AS contractCount        
        WHERE (toLower(org.Name) CONTAINS toLower($name) OR $name = "Any")
        RETURN org.Name AS \`Awarded to\`, contractCount
        ORDER BY contractCount DESC
        LIMIT toInteger($limit)`;

    } else if (awardedBy === "Any Party" && donatedTo !== "Any Party") {
        logger.info("Query org details for donations but not contracts awarded");

        cypher = `
        MATCH (d)-[r:DONATED_TO]-(p:Party)
        WHERE (p.partyName = $donatedTo OR $donatedTo = "Any")
        AND (toLower(d.Name) CONTAINS toLower($name) OR $name = "Any")
        AND d.Name <> ""
          RETURN
          d.Name as name,
          p.partyName AS \`Donated To\`,        
          COUNT(r) AS \`Donated Count\`,
          SUM(r.amount) AS \`Total Value\`
          ORDER BY SUM(r.amount) DESC
          LIMIT toInteger($limit)`;

    } else {
        //TODO not done this one properly yet 
        logger.info("Query org details for donations AND contracts awarded");

        cypher = `MATCH (org:Organisation)-[:DONATED_TO]->(party:Party)-[:TENDERED]->(c:Contract)-[:AWARDED]->(org)
        WHERE (org.Name =~ '(?i).*$name.*' OR $name = "any")
        AND (party.partyName = $donatedTo or $donatedTo = "Any Party")
        WITH org, party, collect(c) AS contracts
        UNWIND contracts AS c
        WITH org, party, c ORDER BY c.AwardedDate DESC
        WITH org.Name AS name, party.partyName AS donatedTo, party.partyName AS awardedBy, c.Title AS title, collect(c.AwardedDate) AS awardedDates
        RETURN name, donatedTo, awardedBy, title, head(awardedDates) AS date
        LIMIT toInteger($limit)`;
    }

    try {
        const result = await runCypherWithParams(cypher, session, params); // Pass the params object
        return result;
    } finally {
        session.close();
    }
}

export const topXdonars = async ({ limit = 10 }) => {

    const params = { limit };

    const cypher = `
      MATCH (d)-[r:DONATED_TO]->(p:Party)
      WITH d, 
           COLLECT(DISTINCT p.partyName) AS uniquePartyNames,
           SUM(r.amount) AS totalDonationValue,
           COUNT(r) AS donationCount 
      RETURN 
          d.Name AS donor,
          SIZE(uniquePartyNames) AS numberOfPartiesDonated,
          totalDonationValue,
          donationCount
      ORDER BY totalDonationValue DESC
      LIMIT toInteger($limit)
    `;

    CONNECTION_STRING = `bolt://${process.env.NEO_HOST}:7687`;

    driver = setDriver();
    const session = driver.session();

    try {
        const result = await runCypherWithParams(cypher, session, params);
        return result;
    } finally {
        session.close();
    }
}

export const queryDonation = async ({
    limit = 10,
    donarName = "any",
    minNumberOfPartiesDonated = 0,
    minTotalDonationValue = 0,
    minDonationCount = 0,
    donatedTo = "Any Party",
    awardedBy = "Any Party",
    minContractCount = 0
}) => {

    const formattedName = escapeRegexSpecialChars(donarName);

    const params = {
        name: formattedName,
        minTotalDonationValue,
        minDonationCount,
        minNumberOfPartiesDonated,
        donatedTo,
        awardedBy,
        minContractCount,
        limit
    }
    let cypher;

    if (minContractCount && minTotalDonationValue) { //contracts awarded to org by party they donated to
        logger.debug("q1: contracts awarded to org by party they donated to");

        cypher = `
        MATCH (d)-[r:DONATED_TO]->(p:Party)-[:TENDERED]->(c:Contract)-[:AWARDED]->(d)
        WHERE (p.partyName = $donatedTo OR $donatedTo = "Any Party")
        AND (toLower(d.Name) CONTAINS toLower($name) OR $name = "any") 
        WITH d, p, r, collect(c) AS contracts
        WITH d.Name AS name, p.partyName AS donatedTo, p.partyName AS awardedBy, size(contracts) AS contractCount, toInteger(SUM(r.amount)) AS totalDonationValue, COUNT(r) AS donationCount 
        WHERE contractCount > $minContractCount
        RETURN name, donatedTo AS \`Donated to\`, totalDonationValue AS \`Donation Value\`, donationCount, awardedBy AS \`Awarded Contract by\`, contractCount AS \`Contracts awarded\`
        ORDER BY name
        LIMIT toInteger($limit)        
        `
    } else if (minContractCount && !minTotalDonationValue) { //min contracts recieved by org but not interested in 

        logger.debug("q2: min contracts recieved by org but not interested in ");

        cypher = `
        MATCH (p:Party)-[:TENDERED]->(c:Contract)-[awarded:AWARDED]->(d)
        WHERE (toLower(d.Name) CONTAINS toLower($name) OR $name = "Any")
        AND (p.partyName = $awardedBy OR $awardedBy = "Any Party")
        AND d.Name <> ""
        WITH d, COUNT(c) AS contractCount, toInteger(SUM(c.AwardedValue)) AS awardedValue
        WHERE contractCount > $minContractCount
        RETURN d.Name AS \`Awarded to\`, contractCount AS \`Awarded count\`, awardedValue AS \`Awarded Value\`
        ORDER BY contractCount DESC 
        LIMIT toInteger($limit)
        `;


    } else { //donations made to party 
        logger.debug("q3: donations made to party ");

        cypher = `
        MATCH (d)-[r:DONATED_TO]->(p:Party)     
        WHERE (p.partyName = $donatedTo OR $donatedTo = "Any Party")
        WITH d, 
        COLLECT(DISTINCT p.partyName) AS uniquePartyNames,
        SUM(r.amount) AS totalDonationValue,
        COUNT(r) AS donationCount 
        WHERE (toLower(d.Name) CONTAINS toLower($name) OR $name = "Any") 
        AND (totalDonationValue >= $minTotalDonationValue OR $minTotalDonationValue = 0) 
        AND (donationCount >= $minDonationCount OR $minDonationCount = 0)             
        AND (SIZE(uniquePartyNames) >= $minNumberOfPartiesDonated OR $minNumberOfPartiesDonated = 0)     
        RETURN 
        d.Name AS donor,
        totalDonationValue AS \`Donated Amount\`,     
        donationCount AS \`Donations Made\`,    
        uniquePartyNames AS \`Donated To\`     
        ORDER BY totalDonationValue DESC
        LIMIT toInteger($limit)
       `
    }

    CONNECTION_STRING = `bolt://${process.env.NEO_HOST}:7687`;

    driver = setDriver();
    const session = driver.session();

    try {
        const result = await runCypherWithParams(cypher, session, params);
        return result;
    } finally {
        session.close();
    }

}

export const getDonorDetails = async ({ donarName = "" }) => {

    logger.debug(`Getting donations for donar name ${donarName}`);

    CONNECTION_STRING = `bolt://${process.env.NEO_HOST}:7687`;

    driver = setDriver();
    const session = driver.session();

    const formattedName = escapeRegexSpecialChars(donarName);

    const cypher = `MATCH (d)-[r:DONATED_TO]-(p:Party)
    WHERE d.Name =~ '(?i).*${formattedName}.*'
    RETURN 
    d.Name as donar, 
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

    driver = setDriver();
    const session = driver.session();

    const cypher = `
    MATCH (d)-[r:DONATED_TO]->(p:Party)
    WITH d, COLLECT(DISTINCT p.partyName) AS uniquePartyNames
    WHERE SIZE(uniquePartyNames) > 1
    RETURN
      d.Name AS donor,
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

    driver = setDriver();
    const session = driver.session();

    const cypher = `
    MATCH (d)-[r:DONATED_TO]-(p:Party)
    WHERE (p.partyName = "${partyName}" OR "${partyName}" = "Any")
       RETURN
       p.partyName AS partyName,
       d.Name as donar,
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

interface QueryContractsParams {
    awardedCount?: number;
    orgName?: string;
    awardedBy?: string;
    limit?: number;
    groupByContractCount?: boolean;
    contractFromDate?: string;
    contractToDate?: string;
    title?: string;
    industry?: string;
    valueFrom?: number;
    valueTo?: number;
}

export const queryContracts = async ({
    awardedCount = 0,
    orgName = "Any",
    awardedBy = "Any Party",
    limit = 1000,
    groupByContractCount = false,
    contractFromDate = constants.EARLIEST_FROM_DATE,
    contractToDate = new Date().toISOString().substring(0, 10),
    title = "Any",
    industry = "Any",
    valueFrom = 0,
    valueTo = 9999999999
}: QueryContractsParams) => {


    CONNECTION_STRING = `bolt://${process.env.NEO_HOST}:7687`;
    driver = setDriver();
    const session = driver.session();

    const params = {
        orgName,
        awardedBy,
        awardedCount,
        contractFromDate,
        contractToDate,
        title,
        industry,
        valueFrom,
        valueTo,
        limit
    }

    const commonQuery = `
    MATCH (party:Party)-[:TENDERED]->(c:Contract)-[awarded:AWARDED]->(org)
    WHERE (toLower(org.Name) CONTAINS toLower($orgName) OR $orgName = "Any")
    AND (ANY(category IN c.Categories WHERE toLower(category) CONTAINS toLower($industry)) OR $industry = "Any")   
    AND (party.partyName = $awardedBy OR $awardedBy = "Any Party")
    AND org.Name <> ""
    AND c.AwardedDate >= date($contractFromDate)
    AND c.AwardedDate <= date($contractToDate)
    AND c.AwardedValue >= toInteger($valueFrom)
    AND c.AwardedValue <= toInteger($valueTo)`

    let result, cypher;

    if (groupByContractCount) {

        logger.debug('queryContracts group by count');

        cypher = `
        ${commonQuery}
        WITH org, COUNT(c) AS contractCount
        WHERE contractCount > toInteger($awardedCount)
        RETURN org.Name AS \`Awarded to\`, contractCount AS \`Awarded count\`
        ORDER BY contractCount DESC 
        LIMIT toInteger($limit)`;

    } else {

        logger.debug('queryContracts no group by');

        cypher = `
        ${commonQuery}
        WITH c, org, collect(party.partyName) AS awardedByParties, c.AwardedValue AS value
        RETURN c.Title AS contract, org.Name AS \`Awarded to\`, awardedByParties AS \`Awarded by\`, c.AwardedValue AS value, c.Industry As Industry, c.Categories AS Categories
        ORDER BY value DESC
        LIMIT toInteger($limit)`;

    }

    result = await runCypherWithParams(cypher, session, params);
    session.close();
    return result;
};


const runCypherWithParams = async (cypher: string, session: any, params: object) => {

    const logQuery = cypher.replace(/\$(\w+)/g, (_, paramName) => {
        //@ts-ignore
        const value = params[paramName];

        // Check if the value is a number before wrapping it in quotes
        return typeof value === 'string' ? `'${value}'` : value;
    });

    logger.debug(`Final Cypher Query:\n${logQuery}`);

    try {
        const result = await session.run(cypher, params);
        return result;
    } catch (error) {
        logger.error("ERROR RUNNING CYPHER: " + error);
    }
}

export const getContractsAwardedByCount = async ({ awardedCount = 1000 }) => {

    logger.debug('getContractsAwardedByCount');

    CONNECTION_STRING = `bolt://${process.env.NEO_HOST}:7687`;

    driver = setDriver();
    const session = driver.session();

    const cypher = `
    MATCH (party:Party)-[:TENDERED]->(c:Contract)-[awarded:AWARDED]->(org)
    WITH org, COUNT(c) AS contractCount
    WHERE contractCount > ${awardedCount}
    AND org.Name <> ""
    RETURN org.Name AS orgName, contractCount
    ORDER BY contractCount
    `
    try {
        const result = await runCypher(cypher, session);
        return result;
    } finally {
        session.close();
    }
}

export const getContractDetails = async ({ value = 0, title = "", supplier = "" }) => {

    logger.debug('getContractsAwardedByCount');

    CONNECTION_STRING = `bolt://${process.env.NEO_HOST}:7687`;

    driver = setDriver();
    const session = driver.session();

    const cypher = `
    MATCH (con:Contract)    
    WHERE con.Title = "${title}"    
    AND con.AwardedValue = ${value}    
    RETURN con    
    `
    try {
        const result = await runCypher(cypher, session);
        return result;
    } finally {
        session.close();
    }

}

export const getContractsforOrg = async ({ orgName = "", limit = 1000 }) => {

    logger.debug('getContractsAwardedByCount');

    CONNECTION_STRING = `bolt://${process.env.NEO_HOST}:7687`;

    driver = setDriver();
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
        LIMIT ${limit}
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

    driver = setDriver();
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

export const searchDivisions = async ({ category = "Any", name = "Any", year = "Any" }) => {

    logger.debug('Searching Divisions');

    const formattedYear: number = year === "Any" ? 0 : Number(year);

    CONNECTION_STRING = `bolt://${process.env.NEO_HOST}:7687`;

    driver = setDriver();
    const session = driver.session();

    try {
        const result = await runCypher(`
        MATCH (n:Division) 
        WHERE (n.Category = "${category}" OR "${category}" = "Any")
        AND (n.Title =~ '(?i).*${name}.*' OR "${name}" = "Any")
        AND (datetime(n.Date).year = ${formattedYear} OR ${formattedYear} = 0)    
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
    driver = setDriver();
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
        toDate = new Date().toISOString().substring(0, 10);
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
    driver = setDriver();
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
        toDate = new Date().toISOString().substring(0, 10);
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
    driver = setDriver();
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
        toDate = new Date().toISOString().substring(0, 10);
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

    driver = setDriver();
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
        toDate = new Date().toISOString().substring(0, 10);
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
    driver = setDriver();
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
    driver = setDriver();
    const session = driver.session();

    const neoIdCypher = `MATCH (n:Mp {id: ${id}}) RETURN ID(n)`;
    let neoId, result;
    try {

        const neoIdResult = await runCypher(neoIdCypher, session);
        logger.info("check me out >>> " + JSON.stringify(neoIdResult.records));

        if (!neoIdResult.records.length) {
            result = []
        } else {

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

            result = await runCypher(cypher, session);
        }

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
    driver = setDriver();
    const session = driver.session();

    const neoIdCypher = `MATCH (n:Mp {id: ${id}}) RETURN ID(n)`;

    try {

        //set to date to today if not provided 
        if (!toDate) {
            toDate = new Date().toISOString().substring(0, 10);
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

export const mostOrLeastVotingMps = async (partyName: string, category: string, partyOperator: string = "=", limit: number = 40, orderBy: string = "DESC", fromDate: string = constants.EARLIEST_FROM_DATE, toDate: string, name = "Any") => {

    //set to date to today if not provided 
    if (!toDate) {
        toDate = new Date().toISOString().substring(0, 10);
    }

    const fromDateValue = objectToStringWithoutQuotes({ year: Number(fromDate.split("-")[0]), month: Number(fromDate.split("-")[1]), day: Number(fromDate.split("-")[2]) });
    const toDateValue = objectToStringWithoutQuotes({ year: Number(toDate.split("-")[0]), month: Number(toDate.split("-")[1]), day: Number(toDate.split("-")[2]) });

    const cypher =
        `MATCH (mp:Mp)-[]-(d:Division)
        WHERE (mp.partyName ${partyOperator} "${partyName}" OR "${partyName}" ${partyOperator} "Any")
        AND (toLower(d.Category) = toLower("${category}") OR "${category}" = "Any")
        AND d.Date > datetime(${fromDateValue}) 
        AND d.Date < datetime(${toDateValue}) 
        AND (mp.nameDisplayAs =~ '(?i).*${name}.*' OR "${name}" = "Any")
        WITH mp, COUNT(*) AS voteCount
        ORDER BY voteCount ${orderBy}
        RETURN mp.nameDisplayAs AS name, mp.partyName AS party, voteCount, mp.id
        LIMIT ${limit}`;

    CONNECTION_STRING = `bolt://${process.env.NEO_HOST}:7687`;
    driver = setDriver();
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
        toDate = new Date().toISOString().substring(0, 10);
    }

    const fromDateValue = objectToStringWithoutQuotes({ year: Number(fromDate.split("-")[0]), month: Number(fromDate.split("-")[1]), day: Number(fromDate.split("-")[2]) });
    const toDateValue = objectToStringWithoutQuotes({ year: Number(toDate.split("-")[0]), month: Number(toDate.split("-")[1]), day: Number(toDate.split("-")[2]) });

    if (ayeOrNo) {

        let ayeOrNoBool = ayeOrNo === "aye" ? true : false;

        cypher = `MATCH (d:Division)-[r:VOTED_FOR]-(mps:Mp)
            WHERE r.votedAye = ${ayeOrNoBool}
            AND d.Date > datetime(${fromDateValue}) 
            AND d.Date < datetime(${toDateValue}) 
            AND (toLower(d.Category) = toLower("${category}") OR "${category}" = "Any")            
            AND (d.Title =~ '(?i).*${name}.*' OR "${name}" = "Any")
            WITH d, COUNT(*) AS voteCount
            ORDER BY voteCount ${orderBy}
            RETURN d.Title, voteCount, d.DivisionId
            LIMIT ${limit}`;

    } else {

        cypher = `MATCH (d:Division)-[r:VOTED_FOR]-(mps:Mp)                    
            WHERE d.Date > datetime(${fromDateValue}) 
            AND (toLower(d.Category) = toLower("${category}") OR "${category}" = "Any")
            AND d.Date < datetime(${toDateValue}) 
            AND (d.Title =~ '(?i).*${name}.*' OR "${name}" = "Any")
            WITH d, COUNT(*) AS voteCount
            ORDER BY voteCount ${orderBy}
            RETURN d.Title, voteCount, d.DivisionId
            LIMIT ${limit}`;

    }


    CONNECTION_STRING = `bolt://${process.env.NEO_HOST}:7687`;
    // CONNECTION_STRING = `neo4j+s://bb90f2dc.databases.neo4j.io`;
    driver = setDriver();
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