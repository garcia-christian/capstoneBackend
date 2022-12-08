module.exports = function (req, res, next) {
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

  function validEmail(userEmail) {
    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(userEmail);
  }

  if (req.path === "/register") {
    if (![email, name, password].every(Boolean)) {
      return res.status(401).json("Missing Credentials");
    } else if (!validEmail(email)) {
      return res.status(401).json("Invalid Email");
    }
  }



  else if (req.path === "/login") {
    if (![email, password].every(Boolean)) {
      return res.status(401).json("Missing Credentials");
    } else if (!validEmail(email)) {
      return res.status(401).json("Invalid Email");
    }
  }


  else if (req.path === "/registerm") {
    if (!validEmail(email)) {
      return res.status(403).json("Invalid Email");
    }
  }

  else if (req.path === "/register-staff") {
    console.log({ email, name, password });
    if (![email, name, password].every(Boolean)) {
      return res.status(401).json("Missing Credentials");
    } else if (!validEmail(email)) {
      return res.status(401).json("Invalid Email");
    }
  }

  next();
};