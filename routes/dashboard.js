const router = require("express").Router();
const pool = require("../db");
const authorization = require('../middleware/authorization')


router.get("/", authorization, async (req, res) => {

    try {

        const user = await pool.query("select admin_name,admin_id from tbl_administrator where admin_id = $1", [req.user.admin])
       
        res.json(user.rows[0])

    } catch (error) {
        console.error(error.message)
        res.status(500).json("Server Error")
    }



})
router.get("/get-pharma-admin/:id", async (req, res) => {
 

    try {
        const sql = `SELECT  *
        FROM public."tbl_pharmaAdmin"
        where admin_id = $1;`;
        const rs = await pool.query(sql,[req.params.id]);
        res.json(rs.rows[0])
        console.log(rs.rows); 
    } catch (err) {
        console.error(err.message+"5");
    }  
   
});
router.get("/get-pharma/:id", async (req, res) => {
   

    try {
        const sql = `SELECT *
        FROM public.tbl_pharmacy
        where pharmacy_id = $1;`;
        const rs = await pool.query(sql,[req.params.id]);
        res.json(rs.rows)
        console.log(rs.rows);
    } catch (err) {
        console.error(err.message+"6");
        
    }   

});

module.exports = router;    