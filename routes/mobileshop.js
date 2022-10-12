const router = require("express").Router();
const pool = require("../db");

router.get("/get-pharmaproducts/:id", async (req, res) => {

    try {
        const sql = `SELECT  m.med_id,
        m.global_med_id,
        g.global_brand_name,
        g.global_generic_name,
        c.med_cat_desc, 
        g.global_brand_name, 
        g.image,
        m.med_qty,
        m.med_price
        
        
        FROM public.tbl_local_medicine m
            LEFT OUTER JOIN tbl_global_med g  ON g.global_med_id = m.global_med_id
            LEFT OUTER JOIN tbl_med_category c  ON g.global_med_category = c.med_cat_id
            LEFT OUTER JOIN "tbl_onSalesInvoice" s  ON s.med_id = m.med_id
            LEFT OUTER JOIN tbl_sales_invoice p  ON p.salesinvoice_id = s.sales_id
        WHERE m.pharmacy_id = $1
        GROUP BY 
        m.med_id,
        m.global_med_id,
        g.global_brand_name,
        g.global_generic_name,
        c.med_cat_desc, 
        g.global_brand_name,
        g.image
        ORDER BY m.med_id`;
        const rs = await pool.query(sql, [req.params.id]);
        res.json(rs.rows)
    } catch (err) {
        console.error(err.message);
    }

});

router.get("/get-products", async (req, res) => {

    try {
        const sql = `SELECT  m.global_med_id,
        g.global_brand_name,
        g.global_generic_name,
        c.med_cat_desc, 
        g.global_brand_name, 
        g.image,
        COUNT(s.*) as total,
        MAX(m.med_price) as max,
        MIN(m.med_price) as min
        
        
        FROM public.tbl_local_medicine m
            LEFT OUTER JOIN tbl_global_med g  ON g.global_med_id = m.global_med_id
            LEFT OUTER JOIN tbl_med_category c  ON g.global_med_category = c.med_cat_id
            LEFT OUTER JOIN "tbl_onSalesInvoice" s  ON s.med_id = m.med_id
            LEFT OUTER JOIN tbl_sales_invoice p  ON p.salesinvoice_id = s.sales_id
     
        GROUP BY m.global_med_id,
        g.global_brand_name,
        g.global_generic_name,
        c.med_cat_desc, 
        g.global_brand_name,
        g.image
        ORDER BY total DESC`;
        const rs = await pool.query(sql);
        res.json(rs.rows)
    } catch (err) {
        console.error(err.message);
    }

});
router.get("/get-allproducts", async (req, res) => {

    try {
        const sql = `SELECT  m.global_med_id,
        g.global_brand_name,
        g.global_generic_name,
        c.med_cat_desc, 
        g.global_brand_name, 
        g.image,
        COUNT(s.*) as total,
        MAX(m.med_price) as max,
        MIN(m.med_price) as min
        
        
        FROM public.tbl_local_medicine m
            LEFT OUTER JOIN tbl_global_med g  ON g.global_med_id = m.global_med_id
            LEFT OUTER JOIN tbl_med_category c  ON g.global_med_category = c.med_cat_id
            LEFT OUTER JOIN "tbl_onSalesInvoice" s  ON s.med_id = m.med_id
            LEFT OUTER JOIN tbl_sales_invoice p  ON p.salesinvoice_id = s.sales_id
     
        GROUP BY m.global_med_id,
        g.global_brand_name,
        g.global_generic_name,
        c.med_cat_desc, 
        g.global_brand_name,
        g.image
        ORDER BY g.global_brand_name ASC`;
        const rs = await pool.query(sql);
        res.json(rs.rows)
    } catch (err) {
        console.error(err.message);
    }

});
router.get("/get-pharmacies/:id", async (req, res) => {



    try {
        const sql = `SELECT  p.pharmacy_id,
        p.pharmacy_name,
        m.med_price
        
        FROM public.tbl_pharmacy p
        LEFT OUTER JOIN tbl_local_medicine m ON m.pharmacy_id = p.pharmacy_id
        LEFT OUTER JOIN tbl_global_med g ON g.global_med_id = m.global_med_id
        where g.global_med_id = $1`;
        const rs = await pool.query(sql, [req.params.id]);
        res.json(rs.rows)
    } catch (err) {
        console.error(err.message);
    }

});
router.get("/get-pharmacy/:id", async (req, res) => {



    try {
        const sql = `SELECT *
        FROM public.tbl_pharmacy
        WHERE pharmacy_id = $1`;
        const rs = await pool.query(sql, [req.params.id]);
        res.json(rs.rows)
    } catch (err) {
        console.error(err.message);
    }

});
router.get("/get-pharmacy/", async (req, res) => {



    try {
        const sql = `SELECT * FROM public.tbl_pharmacy
        ORDER BY pharmacy_id ASC`;
        const rs = await pool.query(sql);
        res.json(rs.rows)
    } catch (err) {
        console.error(err.message);
    }

});



module.exports = router;