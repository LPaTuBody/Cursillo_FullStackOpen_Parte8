import { useState } from "react";
import { useQuery, useApolloClient } from "@apollo/client/react";
import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import LoginForm from "./components/LoginForm";
import Recommendations from "./components/Recommendations";
import { ALL_AUTHORS } from "./queries";

const App = () => {
  const [page, setPage] = useState("authors");
  const result = useQuery(ALL_AUTHORS);
  const client = useApolloClient();
  const token = localStorage.getItem("user-logged-token");

  const handleLogout = () => {
    localStorage.clear();
    client.clearStore();
    setPage("login");
  }

  if (result.loading) return (<div>Loading...</div>);

  return (
    <div>
      <div>
        <button onClick={() => setPage("authors")}>authors</button>
        <button onClick={() => setPage("books")}>books</button>
        {!token && (
          <button onClick={() => setPage("login")}>login</button>
        )}
        {token && (
          <>
            <button onClick={() => setPage("reco")}>recommendations</button>
            <button onClick={() => setPage("add")}>add book</button>
            <button onClick={() => handleLogout()}>logout</button>
          </>
        )}
      </div>

      <Authors show={page === "authors"} authors={result.data.allAuthors} />
      <Books show={page === "books"} />
      <Recommendations show={page === "reco"} />
      <NewBook show={page === "add"} />
      <LoginForm show={page === "login"} setPage={setPage} />
    </div>
  );
};

export default App;
