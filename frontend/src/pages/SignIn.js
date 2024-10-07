import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import axios from "axios";
import "mdb-react-ui-kit/dist/css/mdb.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import {
  MDBContainer,
  MDBInput,
  MDBCheckbox,
  MDBBtn,
  MDBIcon,
} from "mdb-react-ui-kit";

function SignIn() {
  const [values, setValues] = useState({
    Email: "",
    Password: "",
  });
  // States for checking the errors
  //   const [submitted, setSubmitted] = useState(false);
  // const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // Handling the email change
  const handleEmail = (e) => {
    setValues({ ...values, Email: e.target.value });
  };

  // Handling the password change
  const handlePassword = (e) => {
    setValues({ ...values, Password: e.target.value });
  };

  // Handling the form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // setErrors(Validation(values));
    // if(errors.Email === "" && errors.password === ""){
    axios
      .post("http://localhost:8081/login", values)
      .then((res) => {
        if (res.data.Login === true) {
          localStorage.setItem("token", res.data.token);
          navigate("/viewproducts");
        } else {
          alert("No record exists");
        }
      })
      .catch((err) => console.log(err));
    // }
  };

  return (
    <>
      <h2 style={{ textAlign: "center", paddingTop: 20 }}>SignIn</h2>
      <MDBContainer className="p-3 my-5 d-flex flex-column w-50">
        <MDBInput
          wrapperClass="mb-4"
          label="Email address"
          id="form1"
          type="email"
          onChange={handleEmail}
          value={values.Email}
        />
        <MDBInput
          wrapperClass="mb-4"
          label="Password"
          id="form2"
          type="password"
          onChange={handlePassword}
          value={values.Password}
        />

        <div className="d-flex justify-content-between mx-3 mb-4">
          <MDBCheckbox
            name="flexCheck"
            value=""
            id="flexCheckDefault"
            label="Remember me"
          />
          <a href="!#">Forgot password?</a>
        </div>

        <MDBBtn className="mb-4" onClick={handleSubmit}>
          Sign in
        </MDBBtn>

        <div className="text-center">
          <p>
            Not a member? <a href="/signup">Register</a>
          </p>
          <p>or sign up with:</p>

          <div
            className="d-flex justify-content-between mx-auto"
            style={{ width: "40%" }}
          >
            <MDBBtn
              tag="a"
              color="none"
              className="m-1"
              style={{ color: "#1266f1" }}
            >
              <MDBIcon fab icon="facebook-f" size="sm" />
            </MDBBtn>

            <MDBBtn
              tag="a"
              color="none"
              className="m-1"
              style={{ color: "#1266f1" }}
            >
              <MDBIcon fab icon="twitter" size="sm" />
            </MDBBtn>

            <MDBBtn
              tag="a"
              color="none"
              className="m-1"
              style={{ color: "#1266f1" }}
            >
              <MDBIcon fab icon="google" size="sm" />
            </MDBBtn>

            <MDBBtn
              tag="a"
              color="none"
              className="m-1"
              style={{ color: "#1266f1" }}
            >
              <MDBIcon fab icon="github" size="sm" />
            </MDBBtn>
          </div>
        </div>
      </MDBContainer>
    </>
  );
}

export default SignIn;
