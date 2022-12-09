const pool = require("../db");

const router = require("express").Router();
const bcrypt = require("bcrypt");
const tokenGenerator = require("../utils/tokenGenerator");
const refreshGenerator = require("../utils/refreshGenerator");
const validator = require("../middleware/validator")
const authorization = require("../middleware/authorization")
const jwt = require("jsonwebtoken")
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

//reg
router.post("/register", validator, async (req, res) => {

    try {

        // decon

        const { name, email, password } = req.body;

        // check

        const user = await pool.query(`select * from public.tbl_administrator where admin_email = $1`, [email]);

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

// login

router.post("/login", validator, async (req, res) => {

    try {
        // reconstruct req.body
        const { email, password } = req.body;

        //check if exist
        const user = await pool.query(`select * from public.tbl_administrator where admin_email = $1`, [email])

        if (user.rows.length === 0) {
            return res.status(401).json("User Not found");
        }


        // check if password is correct
        const validPassword = await bcrypt.compare(password, user.rows[0].admin_password);

        if (!validPassword) {
            return res.status(401).json("Invalid Password");
        }

        // give token
        console.log(user.rows[0].admin_id);
        const access = tokenGenerator(user.rows[0].admin_id);
        const refresh = refreshGenerator(user.rows[0].admin_id);


        const saveRef = await pool.query(`INSERT INTO public.tbl_tokens(
             token, "dateCreated", "dateExpired")
            VALUES ($1, CURRENT_TIMESTAMP, $2)`, [refresh, exp(refresh)])

        res.json({ access, refresh })

    } catch (error) {
        console.error(error.message)
        res.status(500).send("Server Error")
    }

  
});

router.get("/is-verify", authorization, async (req, res) => {
    try {
        console.log(true);
        res.json(true);

    } catch (error) {
        console.error(error.message)
        res.status(500).send("Server Error")
    }


});



router.post("/token", async (req, res) => {
    const reftoken = req.body.reftoken;

    if (!reftoken) {
        return res.status(401).json("Invalid Token");
    }
    const tokens = await pool.query(`select * from public.tbl_tokens where token = $1`, [reftoken])
  
   if(tokens.rowCount === 0){
    return res.status(401).json("User Not found");
   }
        
    try {
        const usertoken = await jwt.verify(
          reftoken, 
          process.env.jwtRefresh
        );
        console.log(usertoken);
        // user = { admin_id: '1', iat: 1633586290, exp: 1633586350 }
        const { admin_id } = usertoken;
        console.log(admin_id);
        const newAccess = tokenGenerator(admin_id);
        res.json({ newAccess })
  

      } catch (error) { 
        res.status(403).json({
          errors: [
            {
              msg: "Invalid token",
            },
          ],
        });
      }


    
    

});

//deauth
router.delete("/logout",async (req,res) => {
    const reftoken = req.header("reftoken");

    try {
        const deltoken = await pool.query(`DELETE FROM public.tbl_tokens
	WHERE token = $1;`, [reftoken])
    res.sendStatus(204);
    } catch (error) {
        res.status(401).json("User Not found");
    }

 
})


module.exports = router;