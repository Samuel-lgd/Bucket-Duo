import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import {Amplify} from "aws-amplify";
import {Authenticator} from '@aws-amplify/ui-react';
import outputs from "../amplify_outputs.json";
import '@aws-amplify/ui-react/styles.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { initializeExternalAPIs } from "./services/apiInitializer";

// Configuration d'Amplify
Amplify.configure(outputs);

// Préchargement des APIs externes
initializeExternalAPIs()
  .catch(err => console.warn("Erreur lors de l'initialisation des APIs externes:", err));

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Authenticator>
      <App />
    </Authenticator>
  </React.StrictMode>
);
