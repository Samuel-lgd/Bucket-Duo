import {defineBackend} from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import {myFirstFunction} from "./firstFunc/ressource";

defineBackend({
  auth,
  data,
  myFirstFunction
});