// import { useState } from "react";

import ShowAllProducts from "./pages/ShowAllProducts";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./pages/Layout";
import NoPage from "./pages/NoPage";

import NewBilling from "./pages/NewBill";
import SignInWithGoogle from "./pages/SignInWithGoogle";
import LogoutButton from "./pages/logout";

function App() {
  // const [state, setState] = useState(false);
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<SignInWithGoogle />} />
        <Route path="/" element={<Layout />}>
          <Route path="viewproducts" element={<ShowAllProducts />} />

          <Route path="newbilling" element={<NewBilling />} />
          <Route path="logout" element={<LogoutButton />} />

          <Route path="*" element={<NoPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
