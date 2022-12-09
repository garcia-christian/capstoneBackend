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
        const { med } = req.body;

        const sales = `INSERT INTO public."tbl_onSalesInvoice"(
             sales_id, qty_purchased, total_price, med_id)
            VALUES ($1, $2, $3, $4) returning *`;
        const rs = await pool.query(sales, [sales_id, qty_purchased, total_price, med]);

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
router.get("/month-report/:id", async (req, res) => {

    try {
        const sql = `select  extract( year from date_trunc('year', "Date")) as year, extract( month from date_trunc('month', "Date")) as month, count(salesinvoice_id) as transactions , sum(total_price) as revenue
        FROM public.tbl_sales_invoice
        where pharmacy_id = $1
        group by date_trunc('month', "Date"),
        year
        order by month desc
        ;`;
        const rs = await pool.query(sql, [req.params.id]);
        var months = [];
        const moment = require('moment');
        moment.locale('en');
        var year = moment().format('YYYY')
        moment.months().map((value, index) => {
            let cnt = 0
            rs.rows.map((data) => {
                if (data.month == index + 1 && data.year == year) {
                    months.push({
                        month: index + 1,
                        monthlong: value,
                        revenue: data.revenue,
                        transactions: data.transactions
                    })
                    cnt++
                }
            })
            if (cnt == 0) {
                months.push({
                    month: index + 1,
                    monthlong: value,
                    revenue: 0,
                    transactions: 0
                })
            }

        });


        res.json(months)
    } catch (err) {
        console.error(err.message);
    }

});

router.get("/this-year-report/:id", async (req, res) => {

    try {
        const sql = `select extract( year from date_trunc('year', "Date")) as year, sum(total_price) as revenue
        FROM public.tbl_sales_invoice
        where pharmacy_id = $1
        group by date_trunc('year', "Date")
        order by year desc  ;`;
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

router.get("/get-sales-meds/:id", async (req, res) => {

    try {
        const sql = `SELECT m.med_id, g.global_brand_name,g.global_generic_name, c.med_cat_desc, sum(coalesce(s.qty_purchased,0)) as purchased, sum(coalesce(s.total_price,0)) as revenue
        FROM public.tbl_local_medicine m
        LEFT OUTER JOIN
            tbl_global_med g  ON g.global_med_id = m.global_med_id
        LEFT OUTER JOIN
            "tbl_onSalesInvoice" s  ON s.med_id = m.med_id
        LEFT OUTER JOIN
            tbl_med_category c  ON g.global_med_category = c.med_cat_id
        where m.pharmacy_id= $1
        group by
            m.med_id,
            c.med_cat_desc,
            g.global_generic_name,
            g.global_brand_name
        order by
            revenue desc`
            ;
        const rs = await pool.query(sql, [req.params.id]);
        res.json(rs.rows)
    } catch (err) {
        console.error(err.message);
    }

});



module.exports = router;