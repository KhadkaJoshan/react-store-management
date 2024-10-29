import React from "react";
import { Outlet, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.css";
import Button from "react-bootstrap/Button";
import LogoutButton from "./logout";

const Layout = () => {
  function getDate() {
    const today = new Date();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    const date = today.getDate();
    return `${month}/${date}/${year}`;
  }
  const currentDate = getDate();
  return (
    <div>
      <h1 style={{ textAlign: "center", color: "Green" }}>
        Inventory Management System
      </h1>
      <p style={{ textAlign: "center", color: "red", fontWeight: "bold" }}>
        {currentDate}
      </p>

      <nav>
        <ul
          style={{
            display: "flex",
            justifyContent: "center",
            listStyle: "none",
          }}
        >
          <li style={{ margin: 15 }}>
            <Link to="/viewproducts">
              <Button variant="primary">View Products</Button>
            </Link>
          </li>

          {/* <li style={{ margin: 15 }}>
            <Link to="/addproducts">
              <Button variant="success">Add Products</Button>
            </Link>
          </li> */}
          <li style={{ margin: 15 }}>
            <Link to="/newbilling">
              <Button variant="primary">Billing</Button>
            </Link>
          </li>
          <li style={{ margin: 15 }}>
            <Link to="/sales">
              <Button variant="primary">Sales Report</Button>
            </Link>
          </li>
        </ul>
        <div style={{ textAlign: "right", marginRight: 300 }}>
          <LogoutButton />
        </div>
      </nav>

      <Outlet />
    </div>
  );
};

export default Layout;
