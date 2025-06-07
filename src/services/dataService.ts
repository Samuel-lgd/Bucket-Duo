import type {Schema} from "../../amplify/data/resource";
import {generateClient} from "aws-amplify/data";
import {createDataService} from "./mockDataService";

// Configuration globale pour basculer entre mode mock et réel
export const USE_MOCK_DATA = false;

// Client prêt à utiliser pour toute l'application
export const dataClient = USE_MOCK_DATA 
  ? createDataService(true) 
  : generateClient<Schema>();
