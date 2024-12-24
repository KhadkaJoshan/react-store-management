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
function Sales() {
  const { user, isAuthenticated } = useAuth0();
  const pagination = true;
  const paginationPageSize = 10;
  const paginationPageSizeSelector = [10, 100, 1000];
  const [localUserId, setLocalUserId] = useState([{}]);
  const localID = localUserId[0].ID;

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
  //   const values = {
  //     Name: "",
  //     Price: "",
  //     Quantity: "",
  //     DOS: "",
  //     Total: 0,
  //   };

  const colDefs = [
    {
      field: "SalesID",
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
      field: "SName",
      flex: 3,
      filter: true,
      editable: true,
      cellEditor: "agTextCellEditor",
      cellEditorParams: {
        maxLength: 20,
      },
    },
    {
      field: "SPrice",
      flex: 2,
      filter: true,
      editable: true,
      cellEditor: "agTextCellEditor",
      cellEditorParams: {
        maxLength: 20,
      },
    },
    {
      field: "SQuantity",
      flex: 2,
      filter: true,
      editable: true,
      cellEditor: "agTextCellEditor",
      cellEditorParams: {
        maxLength: 20,
      },
    },
    {
      field: "DOS",
      flex: 2,
      filter: true,
      editable: true,
      cellEditor: "agTextCellEditor",
      cellEditorParams: {
        maxLength: 20,
      },
    },
    {
      field: "Stotal",
      flex: 2,
      filter: true,
      editable: true,
      cellEditor: "agTextCellEditor",
      cellEditorParams: {
        maxLength: 20,
      },
    },
  ];

  const [sales, setSales] = useState([{}]);

  //Fetch sales data
  useEffect(() => {
    axios
      .get("http://localhost:8081/sales/" + localID)
      .then((res) => {
        console.log(res);
        setSales(res.data);
      })
      .catch((err) => console.log(err));
  }, [localID]);
  //   //udpate changes in sales value
  //   function update(e) {
  //     const ID = JSON.stringify(e.data.ID);
  //     const values = e.data;
  //     axios
  //       .put("http://localhost:8081/updateSales/" + ID +"/" +localID, values)
  //       .then((res) => {
  //         console.log(res);
  //       })
  //       .catch((err) => console.log(err));
  //   }
  //   //deleteData
  //   function deleteData() {
  //     const ID = selectedRowID;
  //     axios
  //       .delete("http://localhost:8081/delete/" + ID)
  //       .then((res) => {
  //         console.log(res);
  //       })
  //       .catch((err) => console.log(err));

  //     window.location.reload();
  //   }
  //Add empty row
  //   function addEmptyRow() {
  //     axios
  //       .post("http://localhost:8081/addproducts", values)
  //       .then((res) => {
  //         console.log(res);
  //         window.location.reload();
  //       })
  //       .catch((err) => console.log(err));
  //   }
  //   const [selectedRowID, setSelectedRowID] = useState("");

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
        <p style={{ fontFamily: "cursive", color: "red" }}>Welcome</p>
        <h5>{user.name}</h5>
        <p>{user.email}</p>
        {/* <p>{localUserId[0].ID}</p> */}

        <h1
          style={{
            textAlign: "center",
            color: "RoyalBlue",
            fontFamily: "fantasy",
            fontStyle: "normal",
          }}
        >
          Sales
        </h1>

        <AgGridReact
          rowSelection={"single"}
          rowData={sales}
          columnDefs={colDefs}
          pagination={pagination}
          paginationPageSize={paginationPageSize}
          paginationPageSizeSelector={paginationPageSizeSelector}
          // //   onCellValueChanged={(event) => update(event)}
          // //   onRowSelected={(event) => {
          // //     setSelectedRowID(event.data.ID);
          //   }}
        />
        {/* <div>
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
        </div> */}
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

export default Sales;

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
