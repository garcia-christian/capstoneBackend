const router = require("express").Router();
const pool = require("../db");


router.post("/", async (req, res) => {

    try {
        const { admin } = req.body;
        const { pharmacy } = req.body;
        //date
        const { total_price } = req.body;//fix
        const { discount } = req.body;
        const { payed_ammount } = req.body;
        const { change } = req.body;
        const { payment_type } = req.body;

        const sales = `INSERT INTO public.tbl_sales_invoice(
             admin_id, pharmacy_id, "Date", total_price, discount, payed_ammount, change, payment_type)
            VALUES ($1, $2, CURRENT_TIMESTAMP, $3, $4, $5, $6, $7) returning *`;
        const rs = await pool.query(sales, [admin, pharmacy, total_price, discount, payed_ammount, change, payment_type]);

        res.json(rs)
        console.log(rs);
    } catch (err) {
        console.error(err.message);
    }


})
router.post("/save", async (req, res) => {

    try {
        const { sales_id } = req.body;
        const { qty_purchased } = req.body;
        const { total_price } = req.body;

        const sales = `INSERT INTO public."tbl_onSalesInvoice"(
             sales_id, qty_purchased, total_price)
            VALUES ($1, $2, $3) returning *`;
        const rs = await pool.query(sales, [sales_id, qty_purchased, total_price]);

        res.json(rs)
        console.log(rs);
    } catch (err) {
        console.error(err.message);
    }


})
router.get("/discount/:id", async (req, res) => {

    try {
        const sql = `SELECT * FROM public.tbl_discount WHERE pharmacy_id = $1;`;
        const rs = await pool.query(sql, [req.params.id]);
        res.json(rs.rows)
    } catch (err) {
        console.error(err.message);
    }

});
router.get("/this-month-report/:id", async (req, res) => {

    try {
        const sql = `select extract( month from date_trunc('month', "Date")) as month, sum(total_price) as revenue
        FROM public.tbl_sales_invoice
        where pharmacy_id = $1
        group by date_trunc('month', "Date")
        order by month desc
        ;`;
        const rs = await pool.query(sql, [req.params.id]);
        res.json(rs.rows)
    } catch (err) {
        console.error(err.message);
    }

});
router.get("/get-sales/:id", async (req, res) => {

    try {
        const sql = `SELECT s.salesinvoice_id,  
        s."Date",
        round(s.total_price::numeric, 2) as total_price , 
        d.discount_desc, round(s.payed_ammount::numeric, 2) as payed_ammount, 
        round(s.change::numeric, 2) as change 
     
     FROM  public.tbl_sales_invoice s
     
       LEFT OUTER JOIN
          public."tbl_discount" d  ON d.discount_id = s.discount
         where s.pharmacy_id = $1
         ORDER BY s."Date" DESC`;
        const rs = await pool.query(sql, [req.params.id]);
        res.json(rs.rows)
    } catch (err) {
        console.error(err.message);
    }

});
router.get("/get-daily-sales/:id", async (req, res) => {

    try {
        const sql = `select extract( day from date_trunc('day', "Date")) AS day, extract( month from date_trunc('day', "Date")) AS month , sum(total_price) as revenue
        FROM public.tbl_sales_invoice
        where pharmacy_id = $1
        group by date_trunc('day', "Date")
        order by day desc;`;
        const rs = await pool.query(sql, [req.params.id]);
        res.json(rs.rows)
    } catch (err) {
        console.error(err.message);
    }

});
router.post("/add-discount", async (req, res) => {

    try {
        try {
            const { desc } = req.body;
            const { cost } = req.body;
            const { pharmacy } = req.body;

            const sql = `INSERT INTO public.tbl_discount(
                discount_desc, discount_cost, pharmacy_id)
               VALUES ( $1, $2, $3) returning *`;
            const rs = await pool.query(sql, [desc, cost, pharmacy]);

            res.json(rs)
            console.log(rs.rows);
        } catch (err) {
            console.error(err.message);
        }


    } catch (err) {
        console.error(err.message);
    }


})





module.exports = router;