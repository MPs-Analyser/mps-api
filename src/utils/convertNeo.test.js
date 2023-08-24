import { mpNamesArray } from './convertNeo'

const neoResult = {"mps":{"records":[{"keys":["n.nameDisplayAs","n.id"],"length":2,"_fields":["Ms Diane Abbott",{"low":172,"high":0}],"_fieldLookup":{"n.nameDisplayAs":0,"n.id":1}},{"keys":["n.nameDisplayAs","n.id"],"length":2,"_fields":["Debbie Abrahams",{"low":4212,"high":0}],"_fieldLookup":{"n.nameDisplayAs":0,"n.id":1}}],"summary":{"query":{"text":"MATCH (n:Mp) RETURN n.nameDisplayAs, n.id","parameters":{}},"queryType":"r","counters":{"_stats":{"nodesCreated":0,"nodesDeleted":0,"relationshipsCreated":0,"relationshipsDeleted":0,"propertiesSet":0,"labelsAdded":0,"labelsRemoved":0,"indexesAdded":0,"indexesRemoved":0,"constraintsAdded":0,"constraintsRemoved":0},"_systemUpdates":0},"updateStatistics":{"_stats":{"nodesCreated":0,"nodesDeleted":0,"relationshipsCreated":0,"relationshipsDeleted":0,"propertiesSet":0,"labelsAdded":0,"labelsRemoved":0,"indexesAdded":0,"indexesRemoved":0,"constraintsAdded":0,"constraintsRemoved":0},"_systemUpdates":0},"plan":false,"profile":false,"notifications":[],"server":{"address":"localhost:7687","agent":"Neo4j/5.6.0","protocolVersion":5.1},"resultConsumedAfter":{"low":0,"high":0},"resultAvailableAfter":{"low":10,"high":0},"database":{"name":"neo4j"}}}}

const expectedResult =  [
    {
        "keys": [
            "n.nameDisplayAs",
            "n.id"
        ],
        "length": 2,
        "_fields": [
            "Ms Diane Abbott",
            {
                "low": 172,
                "high": 0
            }
        ],
        "_fieldLookup": {
            "n.nameDisplayAs": 0,
            "n.id": 1
        }
    },
    {
        "keys": [
            "n.nameDisplayAs",
            "n.id"
        ],
        "length": 2,
        "_fields": [
            "Debbie Abrahams",
            {
                "low": 4212,
                "high": 0
            }
        ],
        "_fieldLookup": {
            "n.nameDisplayAs": 0,
            "n.id": 1
        }
    }
  ]

test("equality matchers", () => {

    const result = mpNamesArray(neoResult);

    // expect(result).toEqual(expectedResult);

 })


