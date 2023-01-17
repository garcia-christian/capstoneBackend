const router = require("express").Router();
const e = require("express");
const pool = require("../db");
const authorization = require('../middleware/authorization')
const validator = require("../middleware/validator")
router.use("/auth", require("./auth_mobile"));

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
        WHERE m.pharmacy_id = $1 and m.med_qty > 0
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
    var sql = `INSERT INTO public.tbl_mobile_cart(
        cart_med_id, cart_global_med_id, cart_pharmacy_id, cart_quantity, "userID")
       VALUES ( $1, $2, $3, $4, $5);`;

    var sd = 0;

    try {
        const checksql = `SELECT *
        FROM public.tbl_mobile_cart
        where "userID" = $1`
        const check = await pool.query(checksql, [userID])


        if (!check.rowCount == 0) { //naa sulod
            if (check.rows[0].cart_pharmacy_id != cart_pharmacy_id) { //ang sulod kay di pareho sa gi su
                return res.status(401).json("There are other items in the cart from other pharmacy")
            } else {
                check.rows.map((value, index) => {
                    if (value.cart_med_id == cart_med_id) {
                        sql = `UPDATE public.tbl_mobile_cart
                            SET  cart_quantity= cart_quantity + $3
                            WHERE cart_med_id = $1 and "userID" = $2`;
                        sd++;
                    }
                })
            }
        }

        if (sd == 0) {
            const rs = await pool.query(sql, [cart_med_id, cart_global_med_id, cart_pharmacy_id, cart_quantity, userID]);
            res.json(rs.rows)
        } else {
            const rs = await pool.query(sql, [cart_med_id, userID, cart_quantity]);
            res.json(rs.rows)
        }



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

router.get("/get-cart/:id", async (req, res) => {



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
     WHERE m."userID" = $1
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
        const rs = await pool.query(sql, [req.params.id]);
        res.json(rs.rows)
    } catch (err) {
        console.error(err.message);
    }

});
router.post("/save-order/", async (req, res) => {

    const { customer_id } = req.body;
    const { pharmacy_id } = req.body;
    const { order_totalprice } = req.body;
    const { order_status } = req.body;
    const { order_sales_id } = req.body;
    const { discount_type } = req.body;
    const { discount_cost } = req.body;
    const { subtotal } = req.body;

    try {

        const sql = `INSERT INTO public.tbl_orders(
            customer_id, pharmacy_id, order_totalprice, order_created, order_status, order_sales_id,  discount_type, discount_cost, subtotal)
            VALUES ($1, $2, $3, CURRENT_TIMESTAMP, $4, $5, $6, $7, $8) returning *;`;
        const rs = await pool.query(sql, [customer_id, pharmacy_id, order_totalprice, order_status, order_sales_id, discount_type, discount_cost, subtotal]);
        res.json(rs.rows[0])
        console.log(rs.rows[0]);
    } catch (err) {
        console.error(err.message);
    }

});
router.post("/save-items/", async (req, res) => {

    const { order_id } = req.body;
    const { med_id } = req.body;
    const { quantity } = req.body;


    try {

        const sql = `INSERT INTO public.tbl_order_items(
            order_id, med_id, quantity)
            VALUES ($1, $2, $3);`;
        const rs = await pool.query(sql, [order_id, med_id, quantity]);
        res.json(rs)

    } catch (err) {
        console.error(err.message);
    }

});

router.get("/get-pendingorder/:id", async (req, res) => {



    try {
        const sql = `SELECT *
        FROM public.tbl_orders
        where customer_id=$1 and order_status=$2 or order_status=$3`;
        const rs = await pool.query(sql, [req.params.id, 0, 1]);
        res.json(rs.rows)
    } catch (err) {
        console.error(err.message);
    }

});

router.get("/get-user", authorization, async (req, res) => {

    try {

        const user = await pool.query(`SELECT *
        FROM public.tbl_customer
        where customer_id = $1;`, [req.user.admin])
        console.log(user.rows[0]);
        res.json(user.rows[0])

    } catch (error) {
        console.error(error.message)
        res.status(500).json("Server Error")
    }

})
router.put("/put-userinfo/:id", async (req, res) => {
    const { firstname } = req.body;
    const { lastname } = req.body;
    const { sex } = req.body;
    const { age } = req.body;


    try {

        const user = await pool.query(`UPDATE public.tbl_customer
        SET  firstname=$2, lastname=$3, sex=$4, age=$5
        WHERE customer_id=$1 ;`, [req.params.id, firstname, lastname, sex, age])

        res.json(user)

    } catch (error) {
        console.error(error.message)
        res.status(500).json("Server Error")
    }

})

router.put("/increment-cart/:id/:uid", async (req, res) => {

    try {

        const user = await pool.query(`UPDATE public.tbl_mobile_cart
        SET  cart_quantity= cart_quantity + 1
        WHERE cart_med_id = $1 and "userID" = $2;`, [req.params.id, req.params.uid])

        res.json(user)

    } catch (error) {
        console.error(error.message)
        res.status(500).json("Server Error")
    }

})
router.put("/decrement-cart/:id/:uid", async (req, res) => {

    try {

        const user = await pool.query(`UPDATE public.tbl_mobile_cart
        SET  cart_quantity= cart_quantity - 1
        WHERE cart_med_id = $1 and "userID" = $2;`, [req.params.id, req.params.uid])

        res.json(user)

    } catch (error) {
        console.error(error.message)
        res.status(500).json("Server Error")
    }

})
router.get("/get-indivproducts", async (req, res) => {

    try {
        const sql = `SELECT  m.med_id,
        m.global_med_id,
        g.global_brand_name,
        g.global_generic_name,
        c.med_cat_desc, 
        l.class_desc,
        h.pharmacy_name,
        g.global_brand_name, 
        g.image,
        m.med_price,
        h.pharmacy_lat,
        h.pharmacy_lng
       
        
        
        FROM public.tbl_local_medicine m
            LEFT OUTER JOIN tbl_global_med g  ON g.global_med_id = m.global_med_id
            LEFT OUTER JOIN tbl_med_category c  ON g.global_med_category = c.med_cat_id
            LEFT OUTER JOIN "tbl_onSalesInvoice" s  ON s.med_id = m.med_id
            LEFT OUTER JOIN tbl_sales_invoice p  ON p.salesinvoice_id = s.sales_id
            LEFT OUTER JOIN tbl_classification l  ON l.class_id = g.global_classification
            LEFT OUTER JOIN tbl_pharmacy h  ON h.pharmacy_id = m.pharmacy_id
     
        GROUP BY 
        m.med_id,
        m.global_med_id,
        g.global_brand_name,
        g.global_generic_name,
        c.med_cat_desc, 
        l.class_desc,
        h.pharmacy_name,
        g.global_brand_name,
        g.image,
        h.pharmacy_lat,
        h.pharmacy_lng
        ORDER BY  m.med_id`;
        const rs = await pool.query(sql);
        res.json(rs.rows)
    } catch (err) {
        console.error(err.message);
    }

});

router.get("/order/:id", async (req, res) => {

    try {
        const sql = `SELECT order_id, customer_id, p.pharmacy_name, order_totalprice, order_created, order_status, order_sales_id, order_finished, discount_type, discount_cost, subtotal
        FROM public.tbl_orders o
        LEFT OUTER JOIN tbl_pharmacy p on p.pharmacy_id = o.pharmacy_id
        where order_id=$1`;
        const rs = await pool.query(sql, [req.params.id]);
        res.json(rs.rows)
    } catch (err) {
        console.error(err.message);
    }

});

router.get("/order-items/:id", async (req, res) => {

    try {
        const sql = `SELECT "orderItem_id", order_id, O.med_id, d.med_price, quantity,  g.global_brand_name, g.global_generic_name
        FROM public.tbl_order_items O
        LEFT OUTER JOIN tbl_local_medicine d  ON d.med_id = O.med_id
        LEFT OUTER JOIN tbl_global_med g  ON g.global_med_id = d.global_med_id
        where order_id=$1`;
        const rs = await pool.query(sql, [req.params.id]);
        res.json(rs.rows)
    } catch (err) {
        console.error(err.message);
    }

});
module.exports = router;