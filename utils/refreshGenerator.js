const jwt = require("jsonwebtoken")
require('dotenv').config();


function refreshGenerator(admin_id){
    const payload = {
    admin: admin_id
    }
   

    return jwt.sign(payload,process.env.jwtRefresh,{expiresIn:"30d"})

}
module.exports = refreshGenerator;
 