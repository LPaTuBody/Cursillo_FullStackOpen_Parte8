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
  const [authors, setAuthors] = useState([]);
  const client = useApolloClient();
  const token = localStorage.getItem("user-logged-token");

  const {
    loading: authorLoading,
    data: authorData
  } = useQuery(ALL_AUTHORS, { fetchPolicy: "network-only" });

  const { data: meData } = useQuery(USER_LOGGED, {
    fetchPolicy: "network-only",
    skip: !token,
  });

  useEffect(() => {
    if (meData) setYo(meData.me);
  }, [meData]);

  useEffect(() => {
    if (authorData) setAuthors(authorData.allAuthors)
  }, [authorData]);

  useSubscription(BOOK_ADDED, {
    onData: ({ client, data }) => {
      const addedBook = data.data.bookAdded;
      console.log("New book added:", addedBook)
      window.alert(`New book "${addedBook.title}" has been added!`);

      try {
        client.cache.updateQuery({ query: ALL_BOOKS, variables: { autor: null, genero: null } },
          (data) => {
            if (!data) return null;
            if (data.allBooks.find((b) => b.id === addedBook.id)) return data;
            return {
              allBooks: data.allBooks.concat(addedBook),
            }
          }
        );
      } catch (e) {
        console.log("Error updating ALL_BOOKS cache", e);
      }

      try {
        client.cache.updateQuery({ query: ALL_AUTHORS }, (data) => {
          if (!data) return null;
          const authorName = addedBook.author.name;
          const authorExists = data.allAuthors.find((a) => a.name === authorName);

          if (authorExists) {
            return {
              allAuthors: data.allAuthors.map((a) =>
                a.name === authorName ? { ...a, bookCount: a.bookCount + 1 } : a
              )
            };
          } else {
            return {
              allAuthors: data.allAuthors.concat(addedBook.author)
            };
          }
        });
      } catch (e) {
        console.log("Error updating ALL_AUTHORS cache", e);
      }

      try {
        const userPayload = client.cache.readQuery({ query: USER_LOGGED });
        if (userPayload && userPayload.me && addedBook.genres.includes(userPayload.me.favGenre)) {
          client.cache.updateQuery({
            query: ALL_BOOKS,
            variables: { genero: userPayload.me.favGenre }
          },
            (data) => {
              if (!data) return null;
              if (data.allBooks.find(b => b.id === addedBook.id)) return data;
              return {
                allBooks: data.allBooks.concat(addedBook)
              }
            });
        }
      } catch (e) {
        console.log("Error updating Recommendations cache", e);
      }
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

      <Authors show={page === "authors"} authors={authors} />
      <Books show={page === "books"} />
      <Recommendations show={page === "reco"} yo={yo} />
      <NewBook show={page === "add"} />
      <LoginForm show={page === "login"} setPage={setPage} />
    </div>
  );
};

export default App;
