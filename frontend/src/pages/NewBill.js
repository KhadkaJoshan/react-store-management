import axios from "axios";
import React, { useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import Table from "react-bootstrap/Table";
import "bootstrap/dist/css/bootstrap.css";
import Button from "react-bootstrap/Button";
// import LogoutButton from "./logout";

import { useAuth0 } from "@auth0/auth0-react";

const NewBilling = () => {
  const { user, isAuthenticated } = useAuth0();
  const [products, setProducts] = useState([
    { Name: "", Price: "", Quantity: "" },
  ]);
  const [productName, setProductName] = React.useState([]);
  const tableRef = useRef();

  const addRow = () => {
    setProducts([...products, { Name: "", Price: "", Quantity: "" }]);
  };
  async function getProductNames() {
    await axios.get("http://localhost:8081/products").then((response) => {
      let data = response.data;

      let finalArray = [];
      //Storing values in the form of array as response will be in the form of objects
      finalArray = data.map(function (obj) {
        return obj.Name;
      });
      console.log(finalArray);
      setProductName([...finalArray]);
    });
  }
  function handleSubmit(e) {
    e.preventDefault();
    axios
      .put("http://localhost:8081/updateAfterBill/", products)
      .then((res) => {
        console.log(res);
      })
      .catch((err) => console.log(err));
  }
  const handleInputChange = (index, event) => {
    const { name, value } = event.target;
    const updatedProducts = [...products];
    updatedProducts[index][name] = value;
    setProducts(updatedProducts);
    console.log(products);
  };

  const handlePrint = useReactToPrint({
    content: () => tableRef.current,
    documentTitle: "Products Table",
  });

  return (
    isAuthenticated && (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          maxWidth: 800,
          alignItems: "center",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        <h2 style={{ color: "green" }}>Billing</h2>
        <h5 style={{ alignSelf: "start" }}>{user.name}</h5>
        <p style={{ alignSelf: "start" }}>{user.email}</p>
        {/* <LogoutButton /> */}

        <Table striped border hover style={{ marginLeft: 20 }} ref={tableRef}>
          <thead>
            <tr>
              <th style={{ color: "Red" }}>Product Name</th>
              <th style={{ color: "Red" }}>Price</th>
              <th style={{ color: "Red" }}>Quantity</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr key={index}>
                <td>
                  <input
                    list="suggestion"
                    type="text"
                    name="Name"
                    value={product.Name}
                    onSelect={getProductNames}
                    onChange={(e) => handleInputChange(index, e)}
                    placeholder="Enter product name"
                  />
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
                </td>
                <td>
                  <input
                    type="number"
                    name="Price"
                    value={product.Price}
                    onChange={(e) => handleInputChange(index, e)}
                    placeholder="Enter price"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    name="Quantity"
                    value={product.Quantity}
                    onChange={(e) => handleInputChange(index, e)}
                    placeholder="Enter quantity"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        <div>
          <Button onClick={addRow}>Add Row</Button>
          <Button onClick={handlePrint} style={{ marginLeft: "10px" }}>
            Print
          </Button>
          <Button onClick={handleSubmit} style={{ marginLeft: "10px" }}>
            Update
          </Button>
        </div>
      </div>
    )
  );
};

export default NewBilling;
