const pino = require("pino");
const pretty = require('pino-pretty');

// Customize pino-pretty to remove newlines
const prettyStream = pretty({
    translateTime: 'SYS:standard', 
    singleLine: true, 
    colorize: false, 
});

// Remove the file write streams
const streams = [
    { level: 'trace', stream: process.stdout }, // Log everything to stdout
    { stream: prettyStream }, 
];

module.exports = pino(
    {
        level: "trace", 
    },
    pino.multistream(streams)
);