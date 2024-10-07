import React from "react";
import { Outlet, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.css";
import Button from "react-bootstrap/Button";
import LogoutButton from "./logout";

const Layout = () => {
  return (
    <div>
      <h1 style={{ textAlign: "center", color: "Green" }}>
        Inventory Management System
      </h1>

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
              <Button variant="success">View Products</Button>
            </Link>
          </li>

          {/* <li style={{ margin: 15 }}>
            <Link to="/addproducts">
              <Button variant="success">Add Products</Button>
            </Link>
          </li> */}
          <li style={{ margin: 15 }}>
            <Link to="/newbilling">
              <Button variant="success">Billing</Button>
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
