const router = require("express").Router();
const pool = require("../db");
const validator = require("../middleware/validator")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt");
const tokenGenerator = require("../utils/tokenGenerator");
const refreshGenerator = require("../utils/refreshGenerator");
router.get("/get-pharma/:id", async (req, res) => {


    try {
        const sql = `SELECT *
        FROM public.tbl_pharmacy
        where pharmacy_id = $1;`;
        const rs = await pool.query(sql, [req.params.id]);
        res.json(rs.rows[0])
        console.log(rs.rows);
    } catch (err) {
        console.error(err.message + "6");

    }

});

router.put("/edit-pharma/", async (req, res) => {
    const { id } = req.body;
    const { name } = req.body;
    const { loc } = req.body;
    const { open } = req.body;
    const { close } = req.body;
    try {

        const sql = `UPDATE public.tbl_pharmacy
        SET  pharmacy_name=$2, pharmacy_location=$3,   pharamcy_closingtime=$4, pharamcy_openingtime=$5
        WHERE pharmacy_id=$1;`;

        const rs = await pool.query(sql, [id, name, loc, close, open]);
        res.json(rs)

    } catch (error) {
        console.error(error.message)
        res.status(500).json("Server Error")
    }

})
router.get("/get-staff/:id", async (req, res) => {


    try {
        const sql = `SELECT a.admin_id, a.admin_name, a.admin_email, p.pharmacy_name, l.*
        FROM public.tbl_administrator a
        LEFT OUTER JOIN
                "tbl_pharmaAdmin" l  ON l.admin_id = a.admin_id
        LEFT OUTER JOIN        
                tbl_pharmacy p on p.pharmacy_id = l.pharmacy_id
        where l.pharmacy_id = $1;`;
        const rs = await pool.query(sql, [req.params.id]);

        rs.rows.map((value, index) => {
            let access = 0
            if (value.pos)
                access++
            if (value.inventory)
                access++
            if (value.orders)
                access++
            if (value.purchased)
                access++
            if (value.settings)
                access++
            if (value.sales)
                access++
            rs.rows[index].access = access
        })
        res.json(rs.rows)
        console.log(rs.rows);
    } catch (err) {
        console.error(err.message);

    }

});

router.put("/edit-discount/", async (req, res) => {
    const { id } = req.body;
    const { name } = req.body;
    const { cost } = req.body;

    try {

        const sql = `UPDATE public.tbl_discount
        SET discount_desc=$2, discount_cost=$3
        WHERE  discount_id=$1;`;

        const rs = await pool.query(sql, [id, name, cost]);
        res.json(rs)

    } catch (error) {
        console.error(error.message)
        res.status(500).json("Server Error")
    }

})
router.delete("/delete-discount/:id", async (req, res) => {

    try {
        const sql = `DELETE FROM public.tbl_discount
        WHERE discount_id=$1;`;
        const rs = await pool.query(sql, [req.params.id]);
        res.json(rs)

    } catch (error) {
        console.error(error.message)
        res.status(500).json("Server Error")
    }

})

function exp(ref) {
    const payloadBase64 = ref.split('.')[1];
    const decodedJson = Buffer.from(payloadBase64, 'base64').toString();
    const decoded = JSON.parse(decodedJson)
    const exp = decoded.exp;

    return toDateTime(exp)
}
function toDateTime(secs) {
    var t = new Date(1970, 0, 1); // Epoch
    t.setSeconds(secs);
    return t;
}
router.post("/register-staff", validator, async (req, res) => {

    try {

        // decon

        const { name,
            email,
            password,
            pharmacy,
            pos,
            inventory,
            orders,
            purchased,
            sales,
            settings,
            role } = req.body;

        // check

        const user = await pool.query(`select * from tbl_administrator where admin_email = $1`, [email]);


        if (user.rows.length !== 0) {
            return res.status(401).json("Admin already exist")
        }

        //encrypt password

        const round = 10;
        const salt = await bcrypt.genSalt(round);

        const encryptedPassword = await bcrypt.hash(password, salt);

        // Insert new user
        const newUser = await pool.query(`INSERT INTO public.tbl_administrator(
        admin_name, admin_email, admin_password)
        VALUES ( $1, $2, $3) returning *`,
            [name, email, encryptedPassword]);

        // generate token
        const newPa = await pool.query(`  INSERT INTO public."tbl_pharmaAdmin"(
            pharmacy_id, admin_id, pos, inventory, orders, purchased, settings, sales, "roleDesc")
           VALUES ( $1, $2, $3, $4, $5, $6, $7, $8, $9);`,
            [pharmacy, newUser.rows[0].admin_id, pos, inventory, orders, purchased, settings, sales, role]);

        const access = tokenGenerator(newUser.rows[0].admin_id);
        const refresh = refreshGenerator(newUser.rows[0].admin_id);


        const saveRef = await pool.query(`INSERT INTO public.tbl_tokens(
             token, "dateCreated", "dateExpired")
            VALUES ($1, CURRENT_TIMESTAMP, $2)`, [refresh, exp(refresh)])

        res.json({ access, refresh })

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server Error")
    }


});
router.put("/edit-staff/", validator, async (req, res) => {
    const { name,
        email,
        password,
        pos,
        inventory,
        orders,
        purchased,
        sales,
        settings,
        role,
        pa_id,
        admin_id } = req.body;

    try {

        const sql1 = `UPDATE public."tbl_pharmaAdmin"
        SET pos=$2, inventory=$3, orders=$4, purchased=$5, settings=$6, sales=$7, "roleDesc"=$8
        WHERE pa_id=$1;`;
        const rs1 = await pool.query(sql1, [pa_id, pos, inventory, orders, purchased, settings, sales, role]);

        const sql2 = `UPDATE public.tbl_administrator
        SET  admin_name=$2, admin_email=$3
        WHERE admin_id=$1;`;
        const rs2 = await pool.query(sql2, [admin_id, name, email]);

        if (password) {
            const round = 10;
            const salt = await bcrypt.genSalt(round);
            const encryptedPassword = await bcrypt.hash(password, salt);
            const sql3 = `UPDATE public.tbl_administrator
                SET  admin_password=$2
                WHERE admin_id=$1;`;
            const rs3 = await pool.query(sql3, [admin_id, encryptedPassword]);
        }

        res.json(rs1)

    } catch (error) {
        console.error(error.message)
        res.status(500).json("Server Error")
    }

})
router.delete("/delete-staff/", async (req, res) => {
    const { pa_id, admin_id } = req.body;
    try {
        const sql2 = `DELETE FROM public."tbl_pharmaAdmin"
            WHERE pa_id=$1;`;
        const rs2 = await pool.query(sql2, [pa_id]);
        const sql = `DELETE FROM public.tbl_administrator
        WHERE admin_id=$1;`;
        const rs = await pool.query(sql, [admin_id]);

        res.json(rs)

    } catch (error) {
        console.error(error.message)
        res.status(500).json("Server Error")
    }

})

router.put("/edit-pharma-timelimit/", async (req, res) => {
    const { pharmacy } = req.body;
    const { time } = req.body;

    try {

        const sql = `UPDATE public.tbl_pharmacy
        SET  pharmacy_timelimit=$2
        WHERE pharmacy_id=$1;`;

        const rs = await pool.query(sql, [pharmacy, time]);
        res.json(rs)

    } catch (error) {
        console.error(error.message)    
        res.status(500).json("Server Error")
    }

})
module.exports = router;     