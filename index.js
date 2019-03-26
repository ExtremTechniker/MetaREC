const SERVER_PORT = 42702;
const MODE_COMMAND = "mode";
const HIGHLIGHT_COMMAND = "highlight";
const express = require("express");
const keys = require("./keys.json");

/*  Premiere Colors:
    0: VIOLET           4: LIGHT BLUE       8:  PURPLE      12: BEIGE
    1: BLUE             5: LIGHT GREEN      9:  DARK BLUE   13: GREEN
    2: MINT             6: ROSE             10: CYAN        14: BROWN
    3: LAVENDER         7: MANGO            11: FUCHSIA     15: YELLOW
  */


// Start everything
main();

function main() {
    console.log("MetaREC by sebinside.");
    console.log(`StartStopKey is ${keys.startStopKey}.`)
    setupServer();
}

function setupServer() {
    console.log("Starting server...");

    // Setup server
    const app = express();
    const router = express.Router();

    router.get("/" + MODE_COMMAND, function (req, res) {
        handleCommand(req, res, modeKeyPressed);
    });

    router.get("/" + HIGHLIGHT_COMMAND, function (req, res) {
        handleCommand(req, res, highlightKeyPressed);
    });

    // Start server
    app.use('/', router);
    app.listen(SERVER_PORT);
    console.log(`Server running on port ${SERVER_PORT}.`);
}

function handleCommand(req, res, handlingFunction) {
    if (!req.query.hasOwnProperty("key")) {
        console.log("Error: Key not specified.");
        res.json({message: 'error. key not specified.'});
    } else {
        let key = req.query["key"];
        handlingFunction(key);
        res.json({message: 'ok.'});
    }
}

function modeKeyPressed(key) {
    console.log(`Mode key pressed: ${key}.`)
}

function highlightKeyPressed(key) {
    console.log(`Highlight key pressed: ${key}.`)
}