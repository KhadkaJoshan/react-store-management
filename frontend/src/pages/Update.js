import axios from "axios";
import Button from "react-bootstrap/Button";
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

function Update() {
  const { ID } = useParams();
  const navigate = useNavigate();

  const [values, setValues] = useState({
    Name: "",
    Price: "",
    Quantity: "",
  });

  useEffect(() => {
    axios
      .get("http://localhost:8081/read/" + ID)
      .then((res) => {
        console.log(res);
        setValues({
          Name: res.data[0].Name,
          Price: res.data[0].Price,
          Quantity: res.data[0].Quantity,
        });
      })
      .catch((err) => console.log(err));
  }, [ID]);

  function handleSubmit(e) {
    e.preventDefault();
    axios
      .put("http://localhost:8081/update/" + ID, values)
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
          <h2>Update Product</h2>
          <div className="mb-2">
            <label htmlFor="">Name</label>
            <input
              type="text"
              placeholder="Enter Product Name"
              className="form-control"
              value={values.Name}
              onChange={(e) => setValues({ ...values, Name: e.target.value })}
            />
          </div>
          <div className="mb-2">
            <label htmlFor="">Price</label>
            <input
              type="number"
              placeholder="Enter Price"
              className="form-control"
              value={values.Price}
              onChange={(e) => setValues({ ...values, Price: e.target.value })}
            />
          </div>
          <div className="mb-2">
            <label htmlFor="">Quantity</label>
            <input
              type="number"
              placeholder="Enter Quantity"
              className="form-control"
              value={values.Quantity}
              onChange={(e) =>
                setValues({ ...values, Quantity: e.target.value })
              }
            />
          </div>
          <button className="btn btn-success">Update</button>
        </form>

        <Link to="/viewproducts">
          <Button style={{ marginTop: 10 }} variant="primary">
            Go Back
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default Update;
