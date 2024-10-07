import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";

function Read() {
  const { ID } = useParams();
  const [product, setProduct] = useState([{}]);
  useEffect(() => {
    axios
      .get("http://localhost:8081/read/" + ID)
      .then((res) => {
        console.log(res);
        setProduct(res.data);
      })
      .catch((err) => console.log(err));
  }, [ID]);
  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <Card style={{ width: "18rem" }}>
        <Card.Body>
          <Card.Title>Product Details</Card.Title>
          <Card.Text>ID: {product[0].ID}</Card.Text>
          <Card.Text>Name: {product[0].Name}</Card.Text>
          <Card.Text>Price: {product[0].Price}</Card.Text>
          <Card.Text>Quantity: {product[0].Quantity}</Card.Text>
          <Link to="/viewproducts">
            <Button variant="primary">Go Back</Button>
          </Link>
        </Card.Body>
      </Card>
    </div>
  );
}

export default Read;
