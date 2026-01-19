import { useState, useEffect } from "react";
import { useQuery, useApolloClient, useSubscription } from "@apollo/client/react";
import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import LoginForm from "./components/LoginForm";
import Recommendations from "./components/Recommendations";
import { ALL_AUTHORS, BOOK_ADDED, USER_LOGGED, ALL_BOOKS } from "./queries";

const App = () => {
  const [page, setPage] = useState("authors");
  const [yo, setYo] = useState({});
  const client = useApolloClient();
  const token = localStorage.getItem("user-logged-token");

  const {
    loading: authorLoading,
    data: authorData
  } = useQuery(ALL_AUTHORS);

  const {
    loading: meLoading,
    data: meData
  } = useQuery(USER_LOGGED, {
    fetchPolicy: "network-only",
    skip: !token,
  });

  useEffect(() => {
    if (meData) setYo(meData.me);
  }, [meData]);

  useSubscription(BOOK_ADDED, {
    onData: ({ client, data }) => {
      console.log("New book added:", data.data.bookAdded);
      window.alert(`New book "${data.data.bookAdded.title}" has been added!`);

      client.cache.updateQuery({ query: ALL_BOOKS }, (prev) => {
        if (!prev) return prev
        return {
          allBooks: [...prev.allBooks, data.bookAdded]
        }
      })
    },
  });

  const handleLogout = () => {
    localStorage.clear();
    client.clearStore();
    setPage("login");
  };

  if (authorLoading) return (<div>Loading...</div>);

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

      <Authors show={page === "authors"} authors={authorData.allAuthors} />
      <Books show={page === "books"} />
      <Recommendations show={page === "reco"} yo={yo} />
      <NewBook show={page === "add"} />
      <LoginForm show={page === "login"} setPage={setPage} />
    </div>
  );
};

export default App;
