// Require
const express = require("express");
const fs = require('fs');
const moment = require('moment');
const keys = require("./keys.json");

// Constants
const SERVER_PORT = 42702;
const MODE_COMMAND = "mode";
const HIGHLIGHT_COMMAND = "highlight";

// Global variables
let currentFileName;
let currentStartDate;
let isRecording = false;

/*  Premiere Colors:
    0: VIOLET           4: LIGHT BLUE       8:  PURPLE      12: BEIGE
    1: BLUE             5: LIGHT GREEN      9:  DARK BLUE   13: GREEN
    2: MINT             6: ROSE             10: CYAN        14: BROWN
    3: LAVENDER         7: MANGO            11: FUCHSIA     15: YELLOW
  */


// Start everything
main();

/**
 * Software entry point.
 */
function main() {
    console.log("MetaREC by sebinside.");
    console.log(`StartStopKey is ${keys.startStopKey}.`);
    setupServer();
}

/**
 * Starting the REST Service.
 */
function setupServer() {
    console.log("Starting server...");

    // Testing start/stop key existence
    if (keys.keys.every(value => value.key !== keys.startStopKey)) {
        console.error("Start/Stop key not registered in keys!");
        process.exit(1);
    }

    // Setup server
    const app = express();
    const router = express.Router();

    // Register handling functions
    router.get("/" + MODE_COMMAND, function (req, res) {
        handleCommand(req, res, logMetaData, MODE_COMMAND);
    });

    router.get("/" + HIGHLIGHT_COMMAND, function (req, res) {
        handleCommand(req, res, logMetaData, HIGHLIGHT_COMMAND);
    });

    // Start server
    app.use('/', router);
    app.listen(SERVER_PORT);
    console.log(`Server running on port ${SERVER_PORT}.`);
}

/**
 * Indirection of incoming REST calls. Calls the handling function with given parameters.
 * @param req Web request
 * @param res Web response
 * @param handlingFunction takes a key string and a key type string
 * @param keyType the type key, e.g. a mode key
 */
function handleCommand(req, res, handlingFunction, keyType) {
    if (!req.query.hasOwnProperty("key")) {
        console.log("Error: Key not specified.");
        res.json({message: 'error. key not specified.'});
    } else {
        let key = req.query["key"];
        handlingFunction(key, keyType);
        res.json({message: 'ok.'});
    }
}

/**
 * Logs a key press in csv format. This includes key information.
 * @param key the key press to log
 * @param keyType the type key, e.g. a mode key
 */
function logMetaData(key, keyType) {
    console.log(`Pressed ${keyType} key: ${key}`);

    // Gets the key info from the JSON-file
    let keyInfo = keys.keys.filter(info => info.key === key);

    if (keyInfo.length !== 1) {
        console.error("Key not registered or registered more than once.");
        return
    }

    let message = `${keyType},${keyInfo[0].name},${keyInfo[0].color}`;

    if (isRecording) {
        // while recording, everything is logged
        if (key === keys.startStopKey) {
            isRecording = false;
            console.log("Ended recording.")
        }
        writeMetaData(message);
    } else {
        // Start recording, initialize everything
        if (key === keys.startStopKey) {
            isRecording = true;

            // Set current file name
            let date = moment().format(keys.metaFileNameFormat);
            currentFileName = `${keys.metaDataFolder}/${date}.csv`;

            // Set init date
            currentStartDate = moment();

            writeMetaData(message)
        } else {
            console.log("Warning: No current recording. Start with Start/Stop key.")
        }
    }
}

/**
 * Enhances the csv-style-message with the current timestamp and appends it to the metadata file.
 * @param message the message to log
 */
function writeMetaData(message) {

    // Time difference of starting timestamp and now
    let timeDiff = moment.duration(moment().diff(currentStartDate));
    let timeStamp = `${timeDiff.hours()},${timeDiff.minutes()},${timeDiff.seconds()},${timeDiff.milliseconds()}`;


    let content = `${timeStamp},${message}`;
    console.log(`Logging metadata: "${content}"`);
    fs.appendFileSync(currentFileName, `${content}\n`, err => {
        if (err) throw err
    });
}