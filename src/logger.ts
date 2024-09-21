const pino = require("pino");
const fs = require("fs");
const pretty = require('pino-pretty');

// Customize pino-pretty to remove newlines
const prettyStream = pretty({
    translateTime: 'SYS:standard', // Add timestamp in human-readable format
    singleLine: true, // Output logs on a single line
    colorize: false, // Disable colorization for CloudWatch logs
    // Add other customizations if needed
});

const streams = [
    { level: 'trace', stream: process.stdout },
    {
        level: "debug",
        stream: fs.createWriteStream("./app.log", { flags: "a" }),
    },
    { stream: prettyStream }, // Use the customized pretty stream
    {
        level: "error",
        stream: fs.createWriteStream("./error.log", { flags: "a" }),
    },
];

module.exports = pino(
    {
        level: "trace",
    },
    pino.multistream(streams)
);