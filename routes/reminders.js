const router = require("express").Router();
const pool = require("../db");

router.post("/addmed", async (req, res) => {

    try {
        const { prod_id } = req.body;
        const { med_name } = req.body;
        const { type_id } = req.body;
        const { med_quantity } = req.body;

        const sql = `INSERT INTO public.med_table(prod_id, med_name, type_id, med_quantity)
            VALUES ( $1, $2, $3, $4) returning *  `;
        const rs = await pool.query(sql, [prod_id, med_name, type_id, med_quantity]);

        res.json(rs.rows)
    } catch (err) {
        console.error(err.message);
    }

});

router.post("/addrem", async (req, res) => {

    try {
        const { med_id } = req.body;
        const { dose } = req.body;
        const { mon } = req.body;
        const { tue } = req.body;
        const { wed } = req.body;
        const { thu } = req.body;
        const { fri } = req.body;
        const { sat } = req.body;
        const { sun } = req.body;
        const { notes } = req.body;
        const { active } = req.body;


        const sql = `INSERT INTO public.tbl_rem(med_id, dose, mon, tue, wed, thu, fri, sat, sun, notes, active, updatetime)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP) returning *  `;
        const rs = await pool.query(sql, [med_id, dose, mon, tue, wed, thu, fri, sat, sun, notes, active]);

        res.json(rs.rows)
    } catch (err) {
        console.error(err.message);
    }

});

router.post("/addtime", async (req, res) => {

    try {
        const { rem_id } = req.body;
        const { time } = req.body;


        const sql = `INSERT INTO public.tbl_time( rem_id, "time", timeupdated)
            VALUES ( $1, $2, CURRENT_TIMESTAMP) returning *  `;
        const rs = await pool.query(sql, [rem_id, time]);

        res.json(rs.rows)
    } catch (err) {
        console.error(err.message);
    }

});

router.post("/addlog", async (req, res) => {

    try {
        const { rem_id } = req.body;
        const { med_id } = req.body;
        const { time_id } = req.body;

        const { timetaken } = req.body;
        const { day } = req.body;
        const { datetaken } = req.body;

        const sql = `INSERT INTO public.tbl_remLog( rem_id, med_id, time_id, datecreated, timetaken, day, dateteken)
            VALUES ( $1, $2, $3, CURRENT_TIMESTAMP, $4, $5, $6) returning *  `;
        const rs = await pool.query(sql, [rem_id, med_id, time_id, timetaken, day, datetaken]);

        res.json(rs.rows)
    } catch (err) {
        console.error(err.message);
    }

});

router.get("/getmed", async (req, res) => {

    try {
        const sql = `SELECT custmed_id as med_id, prod_id as prod_id, med_name as med_name, med_quantity as med_quantity, type_id as type_id
        FROM public."tbl_custMed";`;
        const rs = await pool.query(sql);
        res.json(rs.rows)
    } catch (err) {
        console.error(err.message);
    }

});

router.get("/getmed/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const sql = `SELECT *
        FROM public."tbl_custMed" where custmed_id = $1;`;
        const rs = await pool.query(sql, [id]);
        res.json(rs.rows)
    } catch (err) {
        console.error(err.message);
    }

}); 


router.get("/getrem", async (req, res) => {

    try {
        const sql = `SELECT r.*, m.med_name, m.med_quantity,(SELECT ARRAY_AGG(time) from tbl_time where rem_id = r.rem_id) as "rem_time"from tbl_rem r
                    LEFT OUTER JOIN public."tbl_custMed" m ON m.custmed_id = r.med_id
                           
        
        ;`;
        const rs = await pool.query(sql);
        res.json(rs.rows)
    } catch (err) {
        console.error(err.message);
    }

});

router.get("/gettime", async (req, res) => {

    try {
        const sql = ` SELECT * from tbl_time
                           
    
        ;`;
        const rs = await pool.query(sql);


        res.json(rs.rows)
    } catch (err) {
        console.error(err.message);
    }

});

router.get("/gettime/:rem", async (req, res) => {
    const { rem } = req.params;

    try {
        const sql = ` SELECT * from tbl_time where rem_id = $1
                           
    
        ;`;
        const rs = await pool.query(sql, [rem]);


        res.json(rs.rows)
    } catch (err) {
        console.error(err.message);
    }

});
module.exports = router;