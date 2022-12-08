const express = require("express");
const app = express();
const pool = require("./db");
const cors = require("cors");
const { isObject } = require("util");
const { Server } = require("socket.io");
const { Socket } = require("dgram");


const server = require("http").createServer(app);


const io = new Server(server, {
    cors: 'http://192.168.1.2:3000'
})

//middle ware
app.use(cors());
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


//Routes
app.use("/auth", require("./routes/auth"));
app.use("/dashboard", require("./routes/dashboard"));
app.use("/medicine", require("./routes/medicine"));
app.use("/sell", require("./routes/sell"));
app.use("/purchase", require("./routes/purchase"));
app.use("/reminders", require("./routes/reminders"));
app.use("/images", require("./routes/images"));
app.use("/mobileshop", require("./routes/mobileshop"));
app.use("/orders", require("./routes/orders"));
app.use("/settings", require("./routes/web_settings"));

const addOnlineUsers = async (id, socketID) => {
    try {
        const sql1 = `DELETE FROM public."tbl_socketIO"
        WHERE pharmacy_id = $1;`;
        const rs1 = await pool.query(sql1, [id]);

        const sql = `INSERT INTO public."tbl_socketIO"(  
             socket, pharmacy_id, "timestamp")
            VALUES ($1, $2, CURRENT_TIMESTAMP);`;
        const rs = await pool.query(sql, [socketID, id]);
    } catch (err) {
        console.error(err.message);
    }
}
const removeOnlineUsers = async (socketID) => {
    try {
        const sql = `DELETE FROM public."tbl_socketIO"
        WHERE socket = $1;`;
        const rs = await pool.query(sql, [socketID]);
    } catch (err) {
        console.error(err.message);
    }
}
const getOnlineUser = async (id) => {
    try {
        const sql1 = `SELECT * FROM public."tbl_socketIO"
        WHERE pharmacy_id = $1;`;
        const rs1 = await pool.query(sql1, [id]);

        if (rs1.rowCount == 0) {
            return 0;
        }

        const sql = `SELECT "socketIO_id", socket, pharmacy_id, "timestamp"
        FROM public."tbl_socketIO"
        where pharmacy_id = $1;`;
        const rs = await pool.query(sql, [id]);
        return rs.rows[0].socket;
    } catch (err) {
        console.error(err.message);
    }
}

io.on('connection', (socket) => {

    console.log('New Acc connected: ' + socket.id);
    socket.on('login', (user) => {
        addOnlineUsers(user, socket.id);
        console.log("logged in");
    })

    socket.on("sendNotif", async ({ senderID, receiverID, type }) => {

        const reciever = await getOnlineUser(receiverID)
        console.log(reciever);
        io.to(reciever).emit("getNotification", "New Orders");
    })

    socket.on("statChange", async ({ senderID, receiverID, type }) => {

        const reciever = await getOnlineUser(receiverID)
        console.log(reciever);
        io.to(reciever).emit("changeStatus", type);
    })
    socket.on("disconnect", () => {
        removeOnlineUsers(socket.id)
        console.log("removed");
    })


});










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
        const rs1 = await pool.query(sql1, [name, location]);


        const sql = `INSERT INTO public."tbl_pharmaAdmin"(
             pharmacy_id, admin_id)
             VALUES ($1, $2) returning *`;
        const rs = await pool.query(sql, [rs1.rows[0].pharmacy_id, admin]);

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
        const rs = await pool.query(sql, [name, username, password]);

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
        const rs = await pool.query(sql, [pharma, admin]);

        res.json(rs)
    } catch (err) {
        console.error(err.message);
    }

});


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server started as localhost at Port: ${PORT}`)
})