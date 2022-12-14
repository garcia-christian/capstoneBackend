const router = require("express").Router();
const pool = require("../db");

router.get("/pending/:id", async (req, res) => {

    try {
        const sql = `SELECT order_id,
        c.username, 
        o.customer_id,
        p.pharmacy_name, 
        o.order_totalprice, 
        o.order_created, 
        s.status_desc, 
        o.order_sales_id
        
     FROM public.tbl_orders o
     LEFT OUTER JOIN tbl_customer c  ON c.customer_id = o.customer_id
     LEFT OUTER JOIN tbl_pharmacy p  ON p.pharmacy_id = o.pharmacy_id
     LEFT OUTER JOIN tbl_order_status s  ON s.order_status_id = o.order_status
     where o.order_status =0 and o.pharmacy_id=$1
     order by order_created desc;
     ;`;
        const rs = await pool.query(sql, [req.params.id]);
        res.json(rs.rows)
    } catch (err) {
        console.error(err.message);
    }

});

router.put("/pending-confirm/:id", async (req, res) => {

    try {
        const sql = `UPDATE public.tbl_orders
        SET  order_status=1
        WHERE order_id=$1`;
        const rs = await pool.query(sql, [req.params.id]);
        adjust(req.params.id, 1);

        res.json(rs)
    } catch (err) {
        console.error(err.message);
    }

});
router.put("/pending-cancel/:id", async (req, res) => {

    try {
        const sql = `UPDATE public.tbl_orders
        SET  order_status=2
        WHERE order_id=$1`;
        const rs = await pool.query(sql, [req.params.id]);
        res.json(rs)
    } catch (err) {
        console.error(err.message);
    }

});

router.get("/confirmed/:id", async (req, res) => {

    try {
        const sql = `SELECT order_id,
        c.username, 
        o.customer_id,
        p.pharmacy_name, 
        o.order_totalprice, 
        o.order_created, 
        s.status_desc, 
        o.order_sales_id
        
     FROM public.tbl_orders o
     LEFT OUTER JOIN tbl_customer c  ON c.customer_id = o.customer_id
     LEFT OUTER JOIN tbl_pharmacy p  ON p.pharmacy_id = o.pharmacy_id
     LEFT OUTER JOIN tbl_order_status s  ON s.order_status_id = o.order_status
     where o.order_status =1 and o.pharmacy_id=$1
     order by order_created desc;
     ;`;
        const rs = await pool.query(sql, [req.params.id]);
        res.json(rs.rows)
    } catch (err) {
        console.error(err.message);
    }

});

const adjust = async (id, mode) => {
    let pharmaID = 0;
    let items = [];
    try {
        const sql1 = `SELECT  pharmacy_id
             FROM public.tbl_orders
            where order_id = $1;`;
        const rs1 = await pool.query(sql1, [id]);
        pharmaID = rs1.rows[0].pharmacy_id;

        const sql2 = `SELECT *
        FROM public.tbl_order_items
        where order_id = $1;`;
        const rs2 = await pool.query(sql2, [id]);
        items = rs2.rows;

        await items.map(async (value, index) => {
            if (mode == 1) {
                executeDeduct(value.med_id, pharmaID, value.quantity)
            } else {
                executeAdd(value.med_id, pharmaID, value.quantity)
            }
        })



    } catch (err) {
        console.error(err.message + 0);
    }
}
const executeAdd = async (id, pharmacy, qty) => {

    try {


        const sql = `UPDATE public.tbl_local_medicine
        SET med_qty= coalesce(med_qty, 0) + $3
        WHERE pharmacy_id = $2 AND   med_id = $1 `;
        const rs = await pool.query(sql, [id, pharmacy, qty]);


        console.log("added");
    } catch (err) {
        console.error(err.message);
    }
}
const executeDeduct = async (id, pharmacy, qty) => {

    try {


        const sql = `UPDATE public.tbl_local_medicine
        SET med_qty= coalesce(med_qty, 0) - $3
        WHERE pharmacy_id = $2 AND   med_id = $1 `;
        const rs = await pool.query(sql, [id, pharmacy, qty]);


        console.log("deducted");
    } catch (err) {
        console.error(err.message);
    }
}




router.put("/confirmed-confirm/:id", async (req, res) => {

    try {
        const sql = `UPDATE public.tbl_orders
        SET  order_status=3, order_finished = CURRENT_TIMESTAMP
        WHERE order_id=$1`;
        const rs = await pool.query(sql, [req.params.id]);



        res.json(rs)
    } catch (err) {
        console.error(err.message);
    }

});


router.put("/confirmed-purchase", async (req, res) => {
    const { sid } = req.body;
    const { oid } = req.body;
    try {
        const sql = `UPDATE public.tbl_orders
        SET  order_sales_id = $1
        WHERE order_id = $2;`;
        const rs = await pool.query(sql, [sid, oid]);
        res.json(rs)
        adjust(req.params.id, 2)
    } catch (err) {
        console.error(err.message);
    }

});

router.put("/confirmed-cancel/:id", async (req, res) => {

    try {
        const sql = `UPDATE public.tbl_orders
        SET  order_status=2, order_finished = CURRENT_TIMESTAMP
        WHERE order_id=$1`;
        const rs = await pool.query(sql, [req.params.id]);
        res.json(rs)
        adjust(req.params.id, 2)
    } catch (err) {
        console.error(err.message);
    }

});
router.get("/completed/:id", async (req, res) => {

    try {
        const sql = `SELECT order_id,
        c.username, 
        o.customer_id,
        p.pharmacy_name, 
        o.order_totalprice, 
        o.order_created, 
        s.status_desc, 
        o.order_sales_id,
        o.order_finished
        
     FROM public.tbl_orders o
     LEFT OUTER JOIN tbl_customer c  ON c.customer_id = o.customer_id
     LEFT OUTER JOIN tbl_pharmacy p  ON p.pharmacy_id = o.pharmacy_id
     LEFT OUTER JOIN tbl_order_status s  ON s.order_status_id = o.order_status
     where o.order_status =3 and o.pharmacy_id=$1
     order by order_created desc;
     ;`;
        const rs = await pool.query(sql, [req.params.id]);
        res.json(rs.rows)
    } catch (err) {
        console.error(err.message);
    }

});
router.get("/canceled/:id", async (req, res) => {

    try {
        const sql = `SELECT order_id,
        c.username, 
        o.customer_id,
        p.pharmacy_name, 
        o.order_totalprice, 
        o.order_created, 
        s.status_desc, 
        o.order_sales_id,
        o.order_finished
        
     FROM public.tbl_orders o
     LEFT OUTER JOIN tbl_customer c  ON c.customer_id = o.customer_id
     LEFT OUTER JOIN tbl_pharmacy p  ON p.pharmacy_id = o.pharmacy_id
     LEFT OUTER JOIN tbl_order_status s  ON s.order_status_id = o.order_status
     where o.order_status =2 and o.pharmacy_id=$1
     order by order_created desc;
     ;`;
        const rs = await pool.query(sql, [req.params.id]);
        res.json(rs.rows)
    } catch (err) {
        console.error(err.message);
    }

});
router.get("/get-items/:id", async (req, res) => {

    try {
        const sql = `SELECT o."orderItem_id",
        o.order_id, 
        o.med_id, 
        o.quantity,
        g.global_brand_name, 
        g.global_generic_name,
        l.med_price
	FROM public.tbl_order_items o
    LEFT OUTER JOIN tbl_local_medicine l  ON l.med_id = o.med_id
    LEFT OUTER JOIN tbl_global_med g  ON g.global_med_id = l.global_med_id
    where order_id = $1;`;
        const rs = await pool.query(sql, [req.params.id]);
        res.json(rs.rows)
    } catch (err) {
        console.error(err.message);
    }

});
router.get("/get-order/:id", async (req, res) => {

    try {
        const sql = `SELECT order_id,
        c.username, 
        o.customer_id,
        p.pharmacy_name, 
        o.order_totalprice, 
        o.order_created, 
        s.status_desc, 
        o.order_sales_id,
        d.discount_desc,
        d.discount_cost,
        d.discount_id
     FROM public.tbl_orders o
     LEFT OUTER JOIN tbl_customer c  ON c.customer_id = o.customer_id
     LEFT OUTER JOIN tbl_pharmacy p  ON p.pharmacy_id = o.pharmacy_id
     LEFT OUTER JOIN tbl_order_status s  ON s.order_status_id = o.order_status
     LEFT OUTER JOIN tbl_discount d  ON d.discount_id = o.discount_type
     where order_id=$1

     ;`;
        const rs = await pool.query(sql, [req.params.id]);
        res.json(rs.rows[0])
    } catch (err) {
        console.error(err.message);
    }

});

router.post("/save-customer-meds/", async (req, res) => {

    const { customer, local_med, qty } = req.body;




    try {
        const sql1 = `SELECT  global_med_id
        FROM public.tbl_local_medicine
        where med_id = $1`;
        const rs1 = await pool.query(sql1, [local_med]);
        const global_med = rs1.rows[0].global_med_id

        const sql = `INSERT INTO public.tbl_customer_med(
            customer, global_med, qty)
            VALUES (?, ?, ?, ?);`;
        const rs = await pool.query(sql, [customer, global_med, qty]);
        res.json(rs)

    } catch (err) {
        console.error(err.message);
    }

});
module.exports = router;