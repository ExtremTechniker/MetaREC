const SERVER_PORT = 42702;

const express = require("express");
console.log("Hello World!");

// Setup server
const app = express();
const router = express.Router();

router.get("/test", function (req, res) {
    console.log("Test!");
    res.json({message: 'ok.'});
});

// Start server
app.use('/', router);
app.listen(SERVER_PORT);