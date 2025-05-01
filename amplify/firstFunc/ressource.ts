import {defineFunction} from "@aws-amplify/backend";

export const myFirstFunction = defineFunction({
  name: 'addMemberToList',
  entry: './handler.ts',
})