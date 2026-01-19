import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  ApolloLink,
} from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import { SetContextLink } from "@apollo/client/link/context";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { OperationTypeNode } from "graphql";
import App from "./App.jsx";

const authLink = new SetContextLink((prevContext) => {
  const token = localStorage.getItem("user-logged-token");
  return {
    headers: {
      ...prevContext.headers,
      authorization: token ? `Bearer ${token}` : null,
    }
  };
});

const splitLink = ApolloLink.split(
  ({ operationType }) => {
    return operationType === OperationTypeNode.SUBSCRIPTION;
  },
  new GraphQLWsLink(createClient({
    url: "ws://localhost:4000/graphql",
    on: {
      connected: () => console.log("WS conectado"),
      closed: () => console.log("WS cerrado"),
      error: (err) => console.error("WS error", err),
    },
    connectionParams: () => {
      const token = localStorage.getItem("user-logged-token");
      return {
        authorization: token ? `Bearer ${token}` : null,
      };
    },
  })),
  authLink.concat(new HttpLink({ uri: "http://localhost:4000/graphql" }))
);

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: splitLink,
});

createRoot(document.getElementById("root")).render(
  <ApolloProvider client={client}>
    <StrictMode>
      <App />
    </StrictMode>
  </ApolloProvider>
);
