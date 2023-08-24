const pino = require("pino");
const fs = require("fs");
var pretty = require('pino-pretty')

const streams = [
    {level: 'trace', stream: process.stdout},
    {
        level: "debug", // log INFO and above
        stream: fs.createWriteStream("./app.log", { flags: "a" }),
    },
    {stream: pretty() },
    {
        level: "error", // log INFO and above
        stream: fs.createWriteStream("./error.log", { flags: "a" }),
    },
];

module.exports = pino(
    {
        level: "trace",
    },
    pino.multistream(streams)
);

