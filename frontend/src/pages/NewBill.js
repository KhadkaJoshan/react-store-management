import axios from "axios";
import React, { useState, useRef, useEffect } from "react";
import { useReactToPrint } from "react-to-print";
import Table from "react-bootstrap/Table";
import "bootstrap/dist/css/bootstrap.css";
import Button from "react-bootstrap/Button";
// import LogoutButton from "./logout";

import { useAuth0 } from "@auth0/auth0-react";

const NewBilling = () => {
  //current Date
  function getDate() {
    const today = new Date();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    const date = today.getDate();
    return `${month}/${date}/${year}`;
  }
  const currentDate = getDate();

  const [products, setProducts] = useState([
    { Name: "", Price: 0, Quantity: 0, Total: 0 },
  ]);
  const [productName, setProductName] = React.useState([]);
  const tableRef = useRef();
  const { user, isAuthenticated } = useAuth0();
  //add new empty row
  const addRow = () => {
    setProducts([...products, { Name: "", Price: 0, Quantity: 0, Total: 0 }]);
  };
  const [localUserId, setLocalUserId] = useState([{}]);
  const localID = localUserId[0].ID;
  const [totalPrice, setTotalPrice] = useState(0);
  //get userID
  useEffect(() => {
    if (isAuthenticated && user) {
      axios
        .post("http://localhost:8081/getusers", { Email: user.email })
        .then((res) => {
          setLocalUserId(res.data);
          console.log(localID);
        })
        .catch((err) => console.log(err));
    }
  }, [user, isAuthenticated, localID]);
  //get Product names from database
  async function getProductNames() {
    await axios
      .get("http://localhost:8081/products/" + localID)
      .then((response) => {
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

  //update after billing
  function handleSubmit(e) {
    e.preventDefault();
    axios
      .put("http://localhost:8081/updateAfterBill/", products)
      .then((res) => {
        console.log(res);
      })
      .catch((err) => console.log(err));
    axios
      .post("http://localhost:8081/addSales/" + localID, products)
      .then((res) => {
        console.log(res);
      })
      .catch((err) => console.log(err));

    window.location.reload();
  }
  // //add sales
  // function addSales() {
  //   axios
  //     .post("http://localhost:8081/addSales/" + localID, products)
  //     .then((res) => {
  //       console.log(res);
  //     })
  //     .catch((err) => console.log(err));
  //   console.log(products);
  // }
  //handle input changes

  const handleInputChange = (index, event) => {
    const { name, value } = event.target;
    const updatedProducts = [...products];
    updatedProducts[index][name] = value;
    setProducts(updatedProducts);
    calculateTotal(updatedProducts);

    console.log(updatedProducts);
  };

  //handle print
  const handlePrint = useReactToPrint({
    content: () => tableRef.current,
    documentTitle: "Products Table",
  });
  //calculate total
  const calculateTotal = (updatedRows) => {
    const totalValue = updatedRows.reduce(
      (acc, row) => acc + row.Price * row.Quantity,
      0
    );
    setTotalPrice(totalValue);
  };

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
              <th></th>
              <th style={{ color: "Blue" }}>Bill Details</th>
              <th>Date: {currentDate}</th>
            </tr>

            <tr>
              <th style={{ color: "Red" }}>Product Name</th>
              <th style={{ color: "Red" }}>Price</th>
              <th style={{ color: "Red" }}>Quantity</th>
              <th style={{ color: "Red" }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => {
              const Price = parseFloat(product.Price);
              const Quantity = parseFloat(product.Quantity);
              product.Total = Price * Quantity;
              return (
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
                  <td>
                    <input
                      type="number"
                      name="Total"
                      value={product.Total}
                      readOnly
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
        <div style={{ alignSelf: "end" }}>
          <h3>Total: {totalPrice}</h3>
        </div>
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
