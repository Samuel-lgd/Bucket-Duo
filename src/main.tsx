import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import {Amplify} from "aws-amplify";
import {Authenticator} from '@aws-amplify/ui-react';
import outputs from "../amplify_outputs.json";
import '@aws-amplify/ui-react/styles.css';
import '@fortawesome/fontawesome-free/css/all.min.css';


Amplify.configure(outputs);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Authenticator>
      <App />
    </Authenticator>
  </React.StrictMode>
);
