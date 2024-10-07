import axios from "axios";
import Button from "react-bootstrap/Button";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import Table from "react-bootstrap/Table";

import { useRef } from "react";
import generatePDF from "react-to-pdf";

function Billing() {
  const [productName, setProductName] = React.useState([]);
  const [rows, setRows] = useState([]);
  const targetRef = useRef();

  const [values, setValues] = useState({
    Name: "",
    Price: "",
    Quantity: "",
  });

  React.useEffect(() => {
    axios.get("http://localhost:8081/products").then((response) => {
      let data = response.data;

      let finalArray = [];
      //Storing values in the form of array as response will be in the form of objects
      finalArray = data.map(function (obj) {
        return obj.Name;
      });
      console.log(finalArray);
      setProductName([...finalArray]);
    });
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    axios
      .put("http://localhost:8081/updateAfterBill/", values)
      .then((res) => {
        console.log(res);
      })
      .catch((err) => console.log(err));
    setRows([...rows, values]); // Add the new row to the existing rows
  }

  return (
    <div>
      <div className="d-flex vh-100 bg-primary justify-content-center align-items-center">
        <div className="w-50 bg-white rounded p-3">
          <form onSubmit={handleSubmit}>
            <h2>Billing</h2>
            <div className="mb-2">
              <label htmlFor="">Name</label>
              <input
                type="text"
                placeholder="Enter Product Name"
                className="form-control"
                list="suggestion"
                onChange={(e) => setValues({ ...values, Name: e.target.value })}
              ></input>
              <datalist id="suggestion">
                {productName.map((make, index) => {
                  //Parsing the array and displaying suggestion with option tag
                  return (
                    <option key={index} value={make}>
                      {make}
                    </option>
                  );
                })}
              </datalist>
            </div>
            <div className="mb-2">
              <label htmlFor="">Price</label>
              <input
                type="number"
                placeholder="Enter Price"
                className="form-control"
                onChange={(e) =>
                  setValues({ ...values, Price: e.target.value })
                }
              />
            </div>
            <div className="mb-2">
              <label htmlFor="">Quantity</label>
              <input
                type="number"
                placeholder="Enter Quantity"
                className="form-control"
                onChange={(e) =>
                  setValues({ ...values, Quantity: e.target.value })
                }
              />
            </div>
            <button className="btn btn-success">
              <i class="fa fa-plus-square" aria-hidden="true"></i> Add
            </button>
          </form>
          <Link to="/viewproducts">
            <Button style={{ marginTop: 10 }} variant="primary">
              Go Back
            </Button>
          </Link>
          {"    "}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          justifyItems: "center",
          marginBottom: 30,
        }}
      >
        <h1 style={{ textAlign: "center" }}>Bill Details</h1>
        <div ref={targetRef}>
          <Table striped border hover style={{ marginLeft: 20 }}>
            <thead>
              <tr>
                <th style={{ paddingLeft: 20, fontSize: 40 }}>Name</th>
                <th style={{ paddingLeft: 20, fontSize: 40 }}>Price</th>
                <th style={{ paddingLeft: 20, fontSize: 40 }}>Quantity</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index}>
                  <td style={{ paddingLeft: 20, fontSize: 40 }}>{row.Name}</td>
                  <td style={{ paddingLeft: 20, fontSize: 40 }}>{row.Price}</td>
                  <td style={{ paddingLeft: 20, fontSize: 40 }}>
                    {row.Quantity}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
        <button
          style={{ alignSelf: "center" }}
          onClick={() => generatePDF(targetRef, { filename: "page.pdf" })}
        >
          Download PDF
        </button>
      </div>
    </div>
  );
}

export default Billing;
