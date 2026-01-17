import { useState } from "react";
import { useQuery } from "@apollo/client/react";
import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import LoginForm from "./components/LoginForm";
import { ALL_AUTHORS } from "./queries";

const App = () => {
  const [page, setPage] = useState("authors");
  const [token, setToken] = useState(null);
  const result = useQuery(ALL_AUTHORS);

  const handleLogout = () => {
    localStorage.clear();
    setToken(null);
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
            <button onClick={() => setPage("add")}>add book</button>
            <button onClick={() => handleLogout()}>logout</button>
          </>
        )}
      </div>

      <Authors show={page === "authors"} authors={result.data.allAuthors} />
      <Books show={page === "books"} />
      <NewBook show={page === "add"} />
      <LoginForm
        show={page === "login"}
        setToken={setToken}
        setPage={setPage}
      />
    </div>
  );
};

export default App;
