const router = require("express").Router();
const pool = require("../db");

router.post("/add-global", async (req, res) => {

    try {
        const { brand } = req.body;
        const { brand_name } = req.body;
        const { generic_name } = req.body;
        const { category } = req.body;


        const sql = `INSERT INTO public.tbl_global_med(
            global_brand, global_brand_name, global_generic_name, global_med_category)
            VALUES ( $1, $2, $3, $4) returning *`;
        const rs = await pool.query(sql, [brand, brand_name, generic_name, category]);

        res.json(rs)
        console.log(rs.rows);
    } catch (err) {
        console.error(err.message);
    }


})
router.post("/add-category", async (req, res) => {

    try {
        const { desc } = req.body;
 


        const sql = `INSERT INTO public.tbl_med_category(
            med_cat_desc)
           VALUES ($1) returning *`;
        const rs = await pool.query(sql, [desc]);

        res.json(rs)
        console.log(rs.rows);
    } catch (err) {
        console.error(err.message);
    }


})
router.post("/add-class", async (req, res) => {

    try {
        const { desc } = req.body;
 


        const sql = `INSERT INTO public.tbl_classification(
            class_desc)
            VALUES ($1) returning *`;
        const rs = await pool.query(sql, [desc]);

        res.json(rs)
        console.log(rs.rows);
    } catch (err) {
        console.error(err.message);
    }



})
router.put("/add-qty", async (req, res) => {

    try {
        const { id } = req.body;
        const { qty } = req.body;



        const sql = `UPDATE public.tbl_local_medicine
        SET med_qty= coalesce(med_qty, 0) + $2
        WHERE med_id = $1;`;
        const rs = await pool.query(sql, [id,qty]);

        res.json(rs)
        console.log(rs.rows);
    } catch (err) {
        console.error(err.message);
    }


})
router.put("/deduct-qty", async (req, res) => {

    try {
        const { id } = req.body;
        const { qty } = req.body;



        const sql = `UPDATE public.tbl_local_medicine
        SET med_qty= coalesce(med_qty, 0) - $2
        WHERE med_id = $1;`;
        const rs = await pool.query(sql, [id,qty]);

        res.json(rs)
        console.log(rs.rows);
    } catch (err) {
        console.error(err.message);
    }


})

router.post("/add-local", async (req, res) => {

    try {
        const { pharmacy } = req.body;
        const { global_med } = req.body;
        const { price } = req.body;
        const { storage } = req.body;
        const { notes } = req.body;

        const duplicate = await pool.query(`select * from tbl_local_medicine where global_med_id = $1`, [global_med]);

        if (duplicate.rows.length !== 0) {
            return res.status(401).json("Medicine already added")
        }


        const sql = `INSERT INTO public.tbl_local_medicine(
            pharmacy_id, global_med_id, med_price, med_storage, med_notes, med_qty)
            VALUES ($1, $2, $3, $4, $5, 0) returning *`;
        const rs = await pool.query(sql, [pharmacy, global_med, price, storage, notes]);

        res.json(rs)
        console.log(rs.rows);
    } catch (err) {
        console.error(err.message);
    }


})
router.get("/get-stock/:id", async (req, res) => {

    try {

        const sql = `SELECT
        m.med_id,
        g.global_generic_name,
        g.global_brand_name,
        g.global_brand,
        c.med_cat_desc,
        m.med_price,
        m.med_notes,
        COUNT (a.med_id) AS batches,
        m.med_qty AS total
    FROM
        tbl_local_medicine m
    
    LEFT OUTER JOIN
         public."tbl_onPurchaseInvoice" a  ON a.med_id = m.med_id
    LEFT OUTER JOIN
        tbl_global_med g  ON g.global_med_id = m.global_med_id
    LEFT OUTER JOIN
        tbl_med_category c  ON g.global_med_category = c.med_cat_id
    WHERE 
        m.pharmacy_id = $1
    GROUP BY
        m.med_id,
        g.global_generic_name,
        g.global_brand_name,
        g.global_brand,
        c.med_cat_desc,
        m.med_price,
        m.med_notes
    ORDER BY
        med_id ASC`;
        const rs = await pool.query(sql,[req.params.id]);

        res.json(rs.rows)

    } catch (err) {
        console.error(err.message);
    }

})
router.get("/get-local-med/:id", async (req, res) => {

    try {
        const sql = `SELECT m.med_id,  g.global_generic_name, c.med_cat_desc, g.global_brand_name, m.med_price 
        FROM public.tbl_local_medicine m
        LEFT OUTER JOIN tbl_global_med g  ON g.global_med_id = m.global_med_id
        LEFT OUTER JOIN tbl_med_category c  ON g.global_med_category = c.med_cat_id
        WHERE m.pharmacy_id = $1;
        `;
        const rs = await pool.query(sql,[req.params.id]);
        res.json(rs.rows)
    } catch (err) {
        console.error(err.message+"2");
    }

});
router.get("/get-stock-list/:id", async (req, res) => {

    try {
        const sql = `SELECT
        a."onPurhcaseInv_id",
        g.global_generic_name,
        g.global_brand_name, 
        a."manufactureDate",
        a.expiry_date,
        a.quantity as listedqty,
        m.med_price  
        
        
    FROM
        public."tbl_onPurchaseInvoice" a
    LEFT OUTER JOIN
         tbl_local_medicine m  ON a.med_id = m.med_id
    LEFT OUTER JOIN
        tbl_global_med g  ON g.global_med_id = m.global_med_id
    LEFT OUTER JOIN
        tbl_purchase_invoice p  ON p."purchaseInvoice_id" = a."onPurhcaseInv_id"
    WHERE 
        p.pharmacy_id = $1
    GROUP BY
        a."onPurhcaseInv_id",
        g.global_generic_name,
        g.global_brand_name,
        a."manufactureDate",
        a.expiry_date,
        a.quantity,
        a.quantity,
        m.med_price
    ORDER BY
        a."onPurhcaseInv_id" ASC;`;
        const rs = await pool.query(sql,[req.params.id]);
        res.json(rs.rows)
    } catch (err) {
        console.error(err.message+"1"); 
    }  
});
router.get("/get-global-med/:word", async (req, res) => {

    try {
        const sql = `SELECT  *
        FROM public.tbl_global_med
        where concat(global_brand_name, ' ', global_generic_name)  ilike '%`+req.params.word+`%';`;
        const rs = await pool.query(sql);
        res.json(rs.rows)
        console.log(rs.rows);
    } catch (err) {
        console.error(err.message);
    } 

});
module.exports = router;