import express, { query } from "express";
import { ApolloServer, gql } from "apollo-server-express";
import {typeDefs,resolvers} from "./schema.js"

const PORT = 4001;

const server = new ApolloServer({
  typeDefs,
  resolvers
});

const app = express();
server.applyMiddleware({ app });

app.listen({ port: PORT }, () => {
  console.log(`Server ready at: http://localhost:${PORT}${server.graphqlPath}`);
});
