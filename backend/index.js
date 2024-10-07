const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
// const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
process.on("uncaughtException", function (err) {
  console.error(err);
  console.log("Node NOT Exiting...");
});

const db = mysql.createConnection({
  host: "localhost",
  user: "joshankhadka",
  password: "Dmk2989#",
  database: "inventory",
});

db.connect(function (err) {
  if (err) throw err;
  console.log("Connected");
});

app.get("/", (req, res) => {
  return res.json("From Backend");
});
//get products list
app.get("/products", (req, res) => {
  const sql = "SELECT * FROM products";
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});
//read products
app.get("/read/:ID", (req, res) => {
  const sql = "SELECT * FROM products WHERE ID = ?";
  const ID = req.params.ID;

  db.query(sql, [ID], (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});
//add new products
app.post("/addproducts", (req, res) => {
  const values = [
    req.body.Name,
    req.body.Price,
    req.body.Quantity,
    req.body.user_id,
  ];
  const sql = "INSERT INTO products (Name, Price, Quantity,user_id) VALUES (?)";
  db.query(sql, [values], (err, result) => {
    if (err) return res.json(err);
    return res.json(result);
  });
});
//update products
app.put("/update/:ID", (req, res) => {
  const sql =
    "UPDATE products SET `Name`=?, `Price`=?, `Quantity`=? WHERE ID = ?";
  const ID = req.params.ID;

  db.query(
    sql,
    [req.body.Name, req.body.Price, req.body.Quantity, ID],
    (err, data) => {
      if (err) return res.json(err);
      return res.json(data);
    }
  );
});

//update products quantity after billing
app.put("/updateAfterBill", (req, res) => {
  var inputBillData = req.body;
  for (let i = 0; i < inputBillData.length; i++) {
    const name = inputBillData[i].Name;
    const quant = inputBillData[i].Quantity;

    const sql =
      "UPDATE products SET Quantity= Quantity - " +
      quant +
      " WHERE Name = '" +
      name +
      "'";

    db.query(sql, [name, quant], (err, data) => {
      if (err) return res.json(err);
      return res.json(data);
    });
  }
});

// app.get("/getID", (req, res) => {
//   const sql = "SELECT * FROM products WHERE Name = ?";

//   db.query(sql, [req.body.Name], (err, data) => {
//     if (err) return res.json(err);
//     return res.json(data);
//   });
// });

//Add users
app.post("/addusers", (req, res) => {
  const values = [req.body.Name, req.body.Email];
  const sql = "INSERT INTO users (Name, Email) VALUES (?)";
  db.query(sql, [values], (err, result) => {
    if (err) return res.json(err);
    return res.json(result);
  });
});
//get user
app.post("/getusers", (req, res) => {
  const { Email } = req.body;
  const sql = "SELECT ID FROM users WHERE email = ?";

  db.query(sql, [Email], (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});
//check user is registered or not
app.post("/check-user", (req, res) => {
  const { Email } = req.body;

  const query = "SELECT * FROM users WHERE email = ?";
  db.query(query, [Email], (err, results) => {
    if (err) {
      console.error("Error querying database:", err);
      res.status(500).json({ error: "Database query error" });
    } else {
      if (results.length > 0) {
        res.json({ isRegistered: true });
      } else {
        res.json({ isRegistered: false });
      }
    }
  });
});
//authenticate and login user
// app.post("/login", (req, res) => {
//   const sql = "SELECT * FROM users WHERE `Email` = ? AND `Password` = ?";
//   db.query(sql, [req.body.Email, req.body.Password], (err, data) => {
//     if (err) {
//       return res.json("Error");
//     }
//     if (data.length > 0) {
//       const ID = data[0].ID;
//       const token = jwt.sign({ ID }, "jwtSecretKey", { expiresIn: 300 });
//       return res.json({ Login: true, token, data });
//     } else {
//       return res.json("Failed");
//     }
//   });
// });

//verify authentication
// const verifyJwt = (req, res, next) => {
//   const token = req.headers["access-token"];
//   if (!token) {
//     return res.json("We need token please provide it for next time");
//   } else {
//     jwt.verify(token, "jwtSecretKey", (err, decoded) => {
//       if (err) {
//         res.json("Not Authencated");
//       } else {
//         req.userID = decoded.ID;
//         next();
//       }
//     });
//   }
// };
// //checkauth
// app.get("/checkauth", verifyJwt, (req, res) => {
//   return res.json("Authenticated");
// });
// app.delete("/delete/:ID", (req, res) => {
//   const sql = "DELETE FROM products WHERE ID = ?";
//   const ID = req.params.ID;

//   db.query(sql, [ID], (err, data) => {
//     if (err) return res.json(err);
//     return res.json(data);
//   });
// });

app.listen(8081, () => {
  console.log("Listening on Port 8081");
});
