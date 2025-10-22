import React from "react";
import ReactDOM from "react-dom/client";
import { HashbrownProvider } from "@hashbrownai/react";

import { FinanceExample } from "./FinanceExample";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HashbrownProvider url="http://localhost:4000/api/chat">
      <FinanceExample />
    </HashbrownProvider>
  </React.StrictMode>
);
