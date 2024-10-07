// Filename - Form.js
import axios from "axios";
import React from "react";
import { useState } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import { Link } from "react-router-dom";

export default function SignUp() {
  // States for registration
  const [values, setValues] = useState({
    Name: "",
    Email: "",
    Password: "",
  });

  // States for checking the errors
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);

  // Handling the name change
  const handleName = (e) => {
    setValues({ ...values, Name: e.target.value });
    setSubmitted(false);
  };

  // Handling the email change
  const handleEmail = (e) => {
    setValues({ ...values, Email: e.target.value });
    setSubmitted(false);
  };

  // Handling the password change
  const handlePassword = (e) => {
    setValues({ ...values, Password: e.target.value });
    setSubmitted(false);
  };

  // Handling the form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    axios
      .post("http://localhost:8081/addusers", values)
      .then((res) => {
        console.log(res);
      })
      .catch((err) => console.log(err));
    if (values.Name === "" || values.Email === "" || values.Password === "") {
      setError(true);
    } else {
      setSubmitted(true);
      setError(false);
    }
  };

  // Showing success message
  const successMessage = () => {
    return (
      <div
        className="success"
        style={{
          display: submitted ? "" : "none",
        }}
      >
        <h5 style={{ color: "green" }}>
          User {values.Name} has been successfully registered!!
        </h5>
      </div>
    );
  };

  // Showing error message if error is true
  const errorMessage = () => {
    return (
      <div
        className="error"
        style={{
          display: error ? "" : "none",
        }}
      >
        <h6>Please enter all the fields</h6>
      </div>
    );
  };

  return (
    <div
      className="form"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div>
        <h1 style={{ color: "blue", paddingTop: 20 }}>User Registration</h1>
      </div>

      <Form
        style={{
          borderStyle: "solid",
          padding: 20,
          borderRadius: 15,
          borderColor: "blue",
        }}
      >
        <Row className="mb-3">
          <Form.Group as={Col} controlId="formGridName">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter Name"
              onChange={handleName}
              className="input"
              value={values.Name}
            />
          </Form.Group>

          <Form.Group as={Col} controlId="formGridEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="Email"
              onChange={handleEmail}
              className="input"
              value={values.Email}
            />
          </Form.Group>
        </Row>
        <Form.Group className="mb-3" controlId="formGridAddress1">
          <Form.Label>Password</Form.Label>
          <Form.Control
            onChange={handlePassword}
            className="input"
            value={values.Password}
            type="password"
          />
        </Form.Group>
        <Button onClick={handleSubmit} variant="primary" type="submit">
          Submit
        </Button>{" "}
      </Form>
      <h5 style={{ paddingTop: 20 }}>Already a User? </h5>
      <Link to="/login" style={{ paddingTop: 5 }}>
        <Button variant="success">Login</Button>
      </Link>
      {/* Calling to the methods */}
      <div className="messages" style={{ paddingTop: 20 }}>
        {errorMessage()}
        {successMessage()}
      </div>
    </div>
  );
}
