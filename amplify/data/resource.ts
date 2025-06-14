import {a, type ClientSchema, defineData} from "@aws-amplify/backend";
import { metadataEnrichment } from "../function/metadata-enrichment/resource";


const schema = a.schema({
  Category: a.model({
    name:    a.string().required(),
    system:  a.boolean().required(), // true pour les catégories par défaut
    owner:   a.id().required(),
    items:   a.hasMany('Item', 'categoryID'),
  }).authorization(allow => [
      allow.owner(),
    ]),

  Bucket: a.model({
    name:    a.string().required(),
    owner:   a.id().required(),
    items:   a.hasMany('Item', 'bucketID'),
  }).authorization(allow => [
      allow.owner(),
    ]),
  Item: a.model({
    title:    a.string().required(),
    url:      a.string(),
    info:     a.string(),
    imageUrl: a.string(),
    owner:    a.id().required(),
    bucketID: a.id().required(),
    bucket:   a.belongsTo('Bucket', 'bucketID'),
    categoryID: a.id().required(),
    category: a.belongsTo('Category', 'categoryID'),
  }).authorization(allow => [
      allow.owner(),
    ]),

  // Query pour l'enrichissement des métadonnées
  enrichMetadata: a
    .query()
    .arguments({
      title: a.string().required(),
      categoryId: a.string().required(),
    })
    .returns(
      a.customType({
        success: a.boolean().required(),
        title: a.string(),
        url: a.string(),
        info: a.string(),
        imageUrl: a.string(),
        error: a.string(),
      })
    )
    .authorization(allow => [allow.authenticated()])
    .handler(a.handler.function(metadataEnrichment)),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
    // API Key is used for a.allow.public() rules
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});

/*== STEP 2 ===============================================================
Go to your frontend source code. From your client-side code, generate a
Data client to make CRUDL requests to your table. (THIS SNIPPET WILL ONLY
WORK IN THE FRONTEND CODE FILE.)

Using JavaScript or Next.js React Server Components, Middleware, Server 
Actions or Pages Router? Review how to generate Data clients for those use
cases: https://docs.amplify.aws/gen2/build-a-backend/data/connect-to-API/
=========================================================================*/

/*
"use client"
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>() // use this Data client for CRUDL requests
*/

/*== STEP 3 ===============================================================
Fetch records from the database and use them in your frontend component.
(THIS SNIPPET WILL ONLY WORK IN THE FRONTEND CODE FILE.)
=========================================================================*/

/* For example, in a React component, you can use this snippet in your
  function's RETURN statement */
// const { data: todos } = await client.models.Todo.list()

// return <ul>{todos.map(todo => <li key={todo.id}>{todo.content}</li>)}</ul>
