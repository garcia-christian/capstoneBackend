const router = require("express").Router();
const pool = require("../db");





router.get("/file/:path", async (req, res) => {

    try {
        res.download("./images/" + req.params.path)
    } catch (err) {
        console.error(err.message);
    }

});



module.exports = router;