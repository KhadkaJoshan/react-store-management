import React, { useEffect, useState } from "react";
import "../App.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { AgGridReact } from "ag-grid-react"; // React Data Grid Component
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the Data Grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the Data Grid
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
// Theme
import { ModuleRegistry } from "@ag-grid-community/core";
import axios from "axios";

import { useAuth0 } from "@auth0/auth0-react";

ModuleRegistry.registerModules([ClientSideRowModelModule]);
function ShowAllProducts() {
  const { user, isAuthenticated } = useAuth0();
  const [isRegistered, setIsRegistered] = useState(false);
  const [localUserId, setLocalUserId] = useState([{}]);
  const localID = localUserId[0].ID;
  console.log(localID);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Check if the user is registered
      axios
        .post("http://localhost:8081/check-user", { Email: user.email })
        .then((response) => {
          setIsRegistered(response.data.isRegistered);
        })
        .catch((error) => {
          console.error("Error checking user registration:", error);
        });
    }
  }, [isAuthenticated, user]);
  console.log(`${isRegistered} is the result obtained from userdatabase`);
  // register user in local database if not registered
  const registerUser = () => {
    if (isAuthenticated && user) {
      axios
        .post("http://localhost:8081/addusers", {
          Name: user.name,
          Email: user.email,
        })
        .then((response) => {
          if (response.data.success) {
            setIsRegistered(true);
          }
        })
        .catch((error) => {
          console.error("Error registering user:", error);
        });
    }
  };

  const pagination = true;
  const paginationPageSize = 10;
  const paginationPageSizeSelector = [10, 100, 1000];
  //get userID
  useEffect(() => {
    if (isAuthenticated && user) {
      axios
        .post("http://localhost:8081/getusers", { Email: user.email })
        .then((res) => {
          setLocalUserId(res.data);
        })
        .catch((err) => console.log(err));
    }
  }, [user, isAuthenticated]);

  const values = {
    Name: "",
    Price: "",
    Quantity: "",
    user_id: localUserId[0].ID,
  };

  const colDefs = [
    {
      field: "ID",
      flex: 1,
      filter: true,
      sort: ["desc"],
      editable: false,
      cellEditor: "agTextCellEditor",
      cellEditorParams: {
        maxLength: 20,
      },
    },
    {
      field: "Name",
      flex: 3,
      filter: true,
      editable: true,
      cellEditor: "agTextCellEditor",
      cellEditorParams: {
        maxLength: 20,
      },
    },
    {
      field: "Price",
      flex: 2,
      filter: true,
      editable: true,
      cellEditor: "agTextCellEditor",
      cellEditorParams: {
        maxLength: 20,
      },
    },
    {
      field: "Quantity",
      flex: 2,
      filter: true,
      editable: true,
      cellEditor: "agTextCellEditor",
      cellEditorParams: {
        maxLength: 20,
      },
    },
  ];

  const [products, setProducts] = useState([{}]);

  //Fetch products
  useEffect(() => {
    axios
      .get("http://localhost:8081/products/" + localID)
      .then((res) => {
        console.log(res);
        setProducts(res.data);
      })
      .catch((err) => console.log(err));
  }, [localID]);
  //udpate changes in products value
  function update(e) {
    const ID = JSON.stringify(e.data.ID);
    const values = e.data;
    axios
      .put("http://localhost:8081/update/" + ID, values)
      .then((res) => {
        console.log(res);
      })
      .catch((err) => console.log(err));
  }
  //deleteData
  function deleteData() {
    const ID = selectedRowID;
    axios
      .delete("http://localhost:8081/delete/" + ID)
      .then((res) => {
        console.log(res);
      })
      .catch((err) => console.log(err));

    window.location.reload();
  }
  //Add empty row
  function addEmptyRow() {
    axios
      .post("http://localhost:8081/addproducts", values)
      .then((res) => {
        console.log(res);
        window.location.reload();
      })
      .catch((err) => console.log(err));
  }
  const [selectedRowID, setSelectedRowID] = useState("");

  return (
    isAuthenticated && (
      <div
        className="ag-theme-quartz" // applying the Data Grid theme
        style={{
          height: 400,
          paddingLeft: 200,
          paddingRight: 200,
        }} // the Data Grid will fill the size of the parent container
      >
        {isRegistered ? (
          <p style={{ fontFamily: "cursive", color: "red" }}>Welcome</p>
        ) : (
          <div>{registerUser}</div>
        )}
        <h5>{user.name}</h5>
        <p>{user.email}</p>
        {/* <p>{localUserId[0].ID}</p> */}

        <h1
          style={{
            textAlign: "center",
            color: "red",
            fontFamily: "monospace",
            fontStyle: "normal",
          }}
        >
          Products List
        </h1>

        <AgGridReact
          rowSelection={"single"}
          rowData={products}
          columnDefs={colDefs}
          pagination={pagination}
          paginationPageSize={paginationPageSize}
          paginationPageSizeSelector={paginationPageSizeSelector}
          onCellValueChanged={(event) => update(event)}
          onRowSelected={(event) => {
            setSelectedRowID(event.data.ID);
          }}
        />
        <div>
          <button
            onClick={addEmptyRow}
            style={{ marginTop: 10 }}
            className="btn btn-success"
          >
            <i className="fa fa-plus-square" aria-hidden="true"></i> Add
            Products
          </button>
          <button
            onClick={deleteData}
            style={{ marginTop: 10, marginLeft: 10 }}
            className="btn btn-danger"
          >
            <i className="fa fa-minus-square" aria-hidden="true"></i> Delete
          </button>
        </div>
        {/* <button
        onClick={getSelectedRowData}
        style={{ marginLeft: 340, marginTop: 10 }}
        className="btn btn-success"
      >
        Get selected Row Data
      </button> */}
      </div>
    )
  );
}

export default ShowAllProducts;

// const handleAuth = () => {
//   axios
//     .get("http://localhost:8081/checkauth", {
//       headers: {
//         "access-token": localStorage.getItem("token"),
//       },
//     })
//     .then((res) => console.log(res))
//     .catch((err) => console.log(err));
// };
