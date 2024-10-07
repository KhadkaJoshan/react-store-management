import { useRef } from "react";
import generatePDF from "react-to-pdf";
import React from "react";

const BillPDF = () => {
  const targetRef = useRef();
  return (
    <div>
      <h1>Bill Details</h1>
      <div ref={targetRef}>Hello Hi</div>
      <button onClick={() => generatePDF(targetRef, { filename: "page.pdf" })}>
        Download PDF
      </button>
    </div>
  );
};
export default BillPDF;
