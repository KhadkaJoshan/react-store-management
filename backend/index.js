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
//current Date
function getDate() {
  const today = new Date();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();
  const date = today.getDate();
  return `${year}-${month}-${date}`;
}
const currentDate = getDate();
//get products list
app.get("/products/:user_id", (req, res) => {
  const ID1 = req.params.user_id;
  const sql = "SELECT ID,Name,Price,Quantity FROM products WHERE user_id = ? ";
  db.query(sql, [ID1], (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});
//get sales list
app.get("/sales/:user_id", (req, res) => {
  const ID1 = req.params.user_id;
  const sql =
    "SELECT SalesID,SName,SPrice,SQuantity,DOS,Stotal FROM sales WHERE user_id = ? ";
  db.query(sql, [ID1], (err, data) => {
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
// app.put("/updateAfterBill", (req, res) => {
//   var inputBillData = req.body;
//   for (let i = 0; i < inputBillData.length; i++) {
//     const naam = inputBillData[i].Name;
//     const quant = inputBillData[i].Quantity;

//     const sql =
//       "UPDATE products SET Quantity= Quantity - " +
//       quant +
//       " WHERE Name = '" +
//       naam +
//       "'";
//     db.query(sql, [naam, quant], (err, data) => {
//       if (err) return res.json(err);
//       return res.json(data);
//     });
//   }
// });
//update
app.put("/updateAfterBill", (req, res) => {
  const products = req.body; // Expecting an array of objects with Name and Quantity

  let sql = "UPDATE products SET Quantity = CASE ";
  const names = [];

  products.forEach((product) => {
    sql += `WHEN Name = ${db.escape(product.Name)} THEN Quantity - ${db.escape(
      product.Quantity
    )} `;
    names.push(product.Name);
  });

  sql +=
    "END WHERE Name IN (" +
    names.map((name) => db.escape(name)).join(", ") +
    ")";

  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({
      message: "Product quantities updated successfully after bill generation",
      affectedRows: result.affectedRows,
    });
  });
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
//add sales
app.post("/addSales/:ID", (req, res) => {
  const salesData = req.body; // Expecting an array of objects with name, price, and quantity
  const ID = req.params.ID;

  // Convert received data to a format suitable for bulk insert
  const values = salesData.map((sale) => [
    sale.Name,
    sale.Price,
    sale.Quantity,
    ID,
    currentDate,
    sale.Total,
  ]);
  console.log(values);

  const sql =
    "INSERT INTO sales (SName, SPrice, SQuantity,user_id,DOS,Stotal) VALUES ?";

  db.query(sql, [values], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({
      message: "Sales records inserted successfully",
      affectedRows: result.affectedRows,
    });
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
app.delete("/delete/:ID", (req, res) => {
  const sql = "DELETE FROM products WHERE ID = ?";
  const ID = req.params.ID;

  db.query(sql, [ID], (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

app.listen(8081, () => {
  console.log("Listening on Port 8081");
});
