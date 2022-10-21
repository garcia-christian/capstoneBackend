const router = require("express").Router();
const pool = require("../db");

router.get("/get-pharmaproducts/:id", async (req, res) => {

    try {
        const sql = `SELECT  m.med_id,
        m.global_med_id,
        g.global_brand_name,
        g.global_generic_name,
        c.med_cat_desc, 
        l.class_desc,
        g.global_brand_name, 
        g.image,
        m.med_qty,
        m.med_price
        
        
        FROM public.tbl_local_medicine m
            LEFT OUTER JOIN tbl_global_med g  ON g.global_med_id = m.global_med_id
            LEFT OUTER JOIN tbl_med_category c  ON g.global_med_category = c.med_cat_id
            LEFT OUTER JOIN "tbl_onSalesInvoice" s  ON s.med_id = m.med_id
            LEFT OUTER JOIN tbl_sales_invoice p  ON p.salesinvoice_id = s.sales_id
             LEFT OUTER JOIN tbl_classification l  ON l.class_id = g.global_classification
        WHERE m.pharmacy_id = $1
        GROUP BY 
        m.med_id,
        m.global_med_id,
        g.global_brand_name,
        g.global_generic_name,
        c.med_cat_desc, 
        l.class_desc,
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
        l.class_desc,
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
            LEFT OUTER JOIN tbl_classification l  ON l.class_id = g.global_classification
     
        GROUP BY m.global_med_id,
        g.global_brand_name,
        g.global_generic_name,
        c.med_cat_desc, 
        l.class_desc,
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
        l.class_desc,
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
            LEFT OUTER JOIN tbl_classification l  ON l.class_id = g.global_classification

     
        GROUP BY m.global_med_id,
        g.global_brand_name,
        g.global_generic_name,
        c.med_cat_desc, 
        l.class_desc,
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
        const sql = `SELECT  p.*,
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
router.post("/add-cart/", async (req, res) => {

    const { cart_med_id } = req.body;
    const { cart_global_med_id } = req.body;
    const { cart_pharmacy_id } = req.body;
    const { cart_quantity } = req.body;
    const { userID } = req.body;

    try {
        const checksql = `SELECT cart_med_id, cart_global_med_id, cart_pharmacy_id, cart_quantity, "userID"
        FROM public.tbl_mobile_cart`
        const check = await pool.query(checksql)

        if (!check.rowCount == 0) {
            if (check.rows[0].cart_pharmacy_id != cart_pharmacy_id) {
                return res.status(401).json("There are other items in the cart from other pharmacy")
            }
        }

        const sql = `INSERT INTO public.tbl_mobile_cart(
             cart_med_id, cart_global_med_id, cart_pharmacy_id, cart_quantity, "userID")
            VALUES ( $1, $2, $3, $4, $5);`;
        const rs = await pool.query(sql, [cart_med_id, cart_global_med_id, cart_pharmacy_id, cart_quantity, userID]);
        res.json(rs.rows)
        console.log("Added");
    } catch (err) {
        console.error(err.message);
    }

});
router.delete("/clear-cart/:id", async (req, res) => {



    try {
        const sql = `DELETE FROM public.tbl_mobile_cart
        WHERE "userID" = $1;`;
        const rs = await pool.query(sql, [req.params.id]);
        res.json(rs.rows)
        console.log("Added");
    } catch (err) {
        console.error(err.message);
    }

});

router.get("/get-cart/", async (req, res) => {



    try {
        const sql = `SELECT m.cart_med_id, 
        g.global_brand_name,
        g.global_generic_name,
        c.med_cat_desc, 
        l.class_desc,
        m.cart_pharmacy_id, 
        d.med_price,
        SUM(m.cart_quantity) as cart_qty, 
        m."userID",
        d.med_qty,
        g.image
     FROM public.tbl_mobile_cart m
         LEFT OUTER JOIN tbl_local_medicine d  ON d.med_id = m.cart_med_id
         LEFT OUTER JOIN tbl_global_med g  ON g.global_med_id = d.global_med_id
         LEFT OUTER JOIN tbl_classification l  ON l.class_id = g.global_classification
         LEFT OUTER JOIN tbl_med_category c  ON g.global_med_category = c.med_cat_id
     WHERE m."userID" = 1
     GROUP BY 
        m.cart_med_id, 
        g.global_brand_name,
        g.global_generic_name,
        c.med_cat_desc, 
        l.class_desc,
        m.cart_pharmacy_id, 
         d.med_price,
        m."userID",
        d.med_qty,
        g.image;`;
        const rs = await pool.query(sql);
        res.json(rs.rows)
    } catch (err) {
        console.error(err.message);
    }

});
module.exports = router;