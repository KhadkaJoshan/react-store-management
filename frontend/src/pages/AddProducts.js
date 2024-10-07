import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AddProducts() {
  const [values, setValues] = useState({
    Name: "",
    Price: "",
    Quantity: "",
  });
  const navigate = useNavigate();
  function handleSubmit(e) {
    e.preventDefault();
    axios
      .post("http://localhost:8081/addproducts", values)
      .then((res) => {
        console.log(res);
        navigate("/viewproducts");
      })
      .catch((err) => console.log(err));
  }

  return (
    <div className="d-flex vh-100 bg-primary justify-content-center align-items-center">
      <div className="w-50 bg-white rounded p-3">
        <form onSubmit={handleSubmit}>
          <h2>Add Products</h2>
          <div className="mb-2">
            <label htmlFor="">Name</label>
            <input
              type="text"
              placeholder="Enter Product Name"
              className="form-control"
              onChange={(e) => setValues({ ...values, Name: e.target.value })}
            />
          </div>
          <div className="mb-2">
            <label htmlFor="">Price</label>
            <input
              type="number"
              placeholder="Enter Price"
              className="form-control"
              onChange={(e) => setValues({ ...values, Price: e.target.value })}
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
          <button className="btn btn-success">Submit</button>
        </form>
      </div>
    </div>
  );
}

export default AddProducts;
