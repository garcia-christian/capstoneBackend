const router = require("express").Router();
const pool = require("../db");

router.post("/", async (req, res) => {

    try {
        const { admin } = req.body;
        const { pharmacy } = req.body;
        //date
        const { total_price } = req.body;//fix
        const { supplier } = req.body;
       

        const purchase = `INSERT INTO public.tbl_purchase_invoice(
             admin_id, pharmacy_id, supplier_id, "Date", total_price)
            VALUES ($1, $2, $3,CURRENT_TIMESTAMP, $4) returning *`;
         const rs = await pool.query(purchase, [admin,pharmacy,supplier,total_price]);

        res.json(rs)
        console.log(rs);               
    } catch (err) {   
        console.error(err.message);   
    }


})

router.post("/save-stored", async (req, res) => {

    try {
        const { med_id } = req.body;
        const { admin } = req.body;
        const { pharmacy } = req.body;
        const { exp_date } = req.body;
        const { quantity } = req.body;
        
        const { purchase_invoice } = req.body;
        
     
        const purchase = `INSERT INTO public.tbl_stored_med(
             med_id, admin_id, pharmacy_id, "expiryDate", quantity, "dateofEntry","purchaseInvoice_id")
            VALUES ( $1, $2, $3, $4, $5, CURRENT_TIMESTAMP, $6) returning *`;
         const rs = await pool.query(purchase, [med_id,admin,pharmacy,exp_date,quantity,purchase_invoice]);

        res.json(rs)
        console.log(rs);
    } catch (err) {
        console.error(err.message);
    } 
 

})

router.post("/save", async (req, res) => {

    try {
        const { med_id } = req.body;
        const { purchase_invoice } = req.body;
        const { batch_id } = req.body;
        const { quantity } = req.body;
        const { listing_price } = req.body;
        const { retail_price } = req.body;
        const { date_exp } = req.body;
        const { date_man } = req.body;
     
        const purchase = `INSERT INTO public."tbl_onPurchaseInvoice"(
             med_id, "purchaseInvoice_id", quantity, listing_price, retail_price, expiry_date, "manufactureDate")
            VALUES ( $1, $2, $3, $4, $5, $6, $7) returning *`;
         const rs = await pool.query(purchase, [med_id,purchase_invoice,quantity,listing_price,retail_price,date_exp,date_man]);

        res.json(rs)
        console.log(rs);
    } catch (err) {
        console.error(err.message);
    } 
 

})

router.post("/add-suppliers", async (req, res) => {

    try {
        const { company_name } = req.body;
        const { contact } = req.body;
        const { email } = req.body;
        const { address } = req.body;
        const { pharmacy } = req.body;

     
        const purchase = `INSERT INTO public.tbl_supplier(
             "companyName", contact, email, address, pharmacy_id)
            VALUES ( $1, $2, $3, $4, $5) returning *`;
         const rs = await pool.query(purchase, [company_name,contact,email,address, pharmacy]);

        res.json(rs)
        console.log(rs); 
    } catch (err) {
        console.error(err.message);
    } 
 

})
router.get("/get-suppliers/:id", async (req, res) => {

    try {
        const sql = `SELECT * FROM public.tbl_supplier where pharmacy_id = $1;`;
        const rs = await pool.query(sql,[req.params.id]); 
        res.json(rs.rows)
    } catch (err) {
        console.error(err.message);
    }

});

module.exports = router;