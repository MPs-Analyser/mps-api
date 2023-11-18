export const cyphers = {
    votingSimilarity: (neoId:number, orderBy:string, limit:number) => `CALL gds.nodeSimilarity.filtered.stream('g1', {
        relationshipWeightProperty: 'votedAyeNumeric',
        topK: 500,
        sourceNodeFilter: ${neoId}
        })
        YIELD node1, node2, similarity
        WITH gds.util.asNode(node1) AS mp1, gds.util.asNode(node2) AS mp2, similarity    
        RETURN mp1.nameDisplayAs, mp2.nameDisplayAs, mp2.partyName, similarity
        ORDER BY similarity ${orderBy}, mp1.nameDisplayAs, mp2.nameDisplayAs
        LIMIT ${limit}`,
    votingSimilarityParty: (neoId:number, partyName:string, orderBy:string, limit:number, operator:string) => `CALL gds.nodeSimilarity.filtered.stream('g1', {
        relationshipWeightProperty: 'votedAyeNumeric',
        topK: 500,
        sourceNodeFilter: ${neoId}
        })
        YIELD node1, node2, similarity
        WITH gds.util.asNode(node1) AS mp1, gds.util.asNode(node2) AS mp2, similarity      
        WHERE mp2.partyName ${operator} "${partyName}"
        RETURN mp1.nameDisplayAs, mp1.partyName, mp2.nameDisplayAs, mp2.partyName, similarity
        ORDER BY similarity ${orderBy}, mp1.nameDisplayAs, mp2.nameDisplayAs
        LIMIT ${limit}`,

    votingSimilarityIncludeParty: (neoId:number, partyName:string, orderBy:string, limit:number) => `CALL gds.nodeSimilarity.filtered.stream('g1', {
            relationshipWeightProperty: 'votedAyeNumeric',
            topK: 500,
            sourceNodeFilter: ${neoId}
        })
        YIELD node1, node2, similarity
        WITH gds.util.asNode(node1) AS mp1, gds.util.asNode(node2) AS mp2, similarity  
        WHERE mp2.partyName <> "${partyName}"
        RETURN mp1.nameDisplayAs, mp1.partyName, mp2.nameDisplayAs, mp2.partyName, similarity
        ORDER BY similarity ${orderBy}, mp1.nameDisplayAs, mp2.nameDisplayAs
        LIMIT ${limit}`
}

