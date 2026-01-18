import { useState, useEffect } from "react";
import { useQuery } from "@apollo/client/react";
import { ALL_BOOKS, USER_LOGGED } from "../queries";

const Recommendations = ({ show }) => {
  if (!show) return null;

  const [books, setBooks] = useState([]);
  const [yo, setYo] = useState({});

  const {
    loading: booksLoading,
    data: booksData
  } = useQuery(ALL_BOOKS);
  
  const {
    loading: meLoading,
    data: meData
  } = useQuery(USER_LOGGED, { fetchPolicy: "network-only" });

  useEffect(() => {
    if(!booksLoading) setBooks(booksData.allBooks);
    if(!meLoading) setYo(meData.me);
  }, [booksLoading, meLoading]);

  if (booksLoading || meLoading) return (<div>Loading...</div>);

  const recBooks = books.filter(b => (b.genres.includes(yo.favGenre)));

  return (
    <div>
      <h2>Recommendations</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>Author</th>
            <th>Published</th>
          </tr>
          {recBooks.map((b) => (
            <tr key={b.id}>
              <td>{b.title}</td>
              <td>{b.author.name}</td>
              <td>{b.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Recommendations;