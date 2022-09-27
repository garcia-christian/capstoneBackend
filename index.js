const express = require("express");
const app = express();
const pool = require("./db");
const cors = require("cors");


//middle ware
app.use(cors());
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


//Routes
app.use("/auth",require("./routes/auth"));
app.use("/dashboard",require("./routes/dashboard"));
app.use("/medicine",require("./routes/medicine"));
app.use("/sell",require("./routes/sell"));
app.use("/purchase",require("./routes/purchase"));





app.get("/", (req, res) => {

    res.send(`<h1>HEREMI/h1>`)

});
//get all pharmacy
app.get("/getpharma", async (req, res) => {

    try {
        const sql = `SELECT *
        FROM public.tbl_pharmacy;`;
        const rs = await pool.query(sql); 
        res.json(rs.rows)
    } catch (err) {
        console.error(err.message);
    }

});
//add pharmacy
app.post("/addpharma", async (req, res) => {

    try {
        const { name } = req.body;
        const { location } = req.body;
        const { admin } = req.body;
        
        const sql1 = `INSERT INTO public.tbl_pharmacy(
            pharmacy_name, pharmacy_location)
            VALUES ($1, $2) returning *`;
         const rs1 = await pool.query(sql1, [name,location]);


         const sql = `INSERT INTO public."tbl_pharmaAdmin"(
             pharmacy_id, admin_id)
             VALUES ($1, $2) returning *`;
          const rs = await pool.query(sql, [rs1.rows[0].pharmacy_id,admin]);

        res.json(rs)
    } catch (err) {
        console.error(err.message);
    }
  
});
//getadmin
app.get("/getadmin", async (req, res) => {

    try {
        const sql = `SELECT *
        FROM public.tbl_administrator;`;
        const rs = await pool.query(sql); 
        res.json(rs.rows)
    } catch (err) {
        console.error(err.message);
    }

});
//add admin
app.post("/addadmin", async (req, res) => {

    try {
        const { name } = req.body;
        const { username } = req.body;
        const { password } = req.body;
      
       
        const sql = `INSERT INTO public.tbl_administrator(
             admin_name, admin_username, admin_password)
            VALUES ( $1, $2, $3) returning *`;
         const rs = await pool.query(sql, [name,username,password]);

        res.json(rs)
    } catch (err) {
        console.error(err.message);
    }
 
});
app.post("/assignAdmin", async (req, res) => {

    try {
        const { pharma } = req.body;
        const { admin } = req.body;
     
        const sql = `INSERT INTO public."tbl_pharmaAdmin"(
            pharmacy_id, admin_id)
            VALUES ($1, $2) returning *`;
         const rs = await pool.query(sql, [pharma,admin]);

        res.json(rs)
    } catch (err) {
        console.error(err.message);
    }
 
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server started as localhost at Port: ${PORT}`)
})