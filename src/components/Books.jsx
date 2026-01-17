import { useState, useEffect } from "react";
import { useQuery } from "@apollo/client/react";
import { ALL_BOOKS } from "../queries";

const Books = ({ show }) => {
  if (!show) return null;

  const [genres, setGenres] = useState(["all genres"]);
  const [filtGenre, setFiltGenre] = useState("all genres");
  const [filtBooks, setFiltBooks] = useState([]);
  const result = useQuery(ALL_BOOKS);
  
  useEffect(() => {
    if(!result.loading) setFiltBooks(result.data.allBooks);
  }, [result.loading]);

  if (result.loading) return (<div>Loading...</div>);
  
  const books = result.data.allBooks;
  
  books.forEach(b => {
    for (let i in b.genres) {
      const genero = b.genres[i];
      if (!genres.includes(genero)) setGenres(genres.concat(genero));
    }
  }); // array de los géneros para generar los botones

  const handleFilter = (genero) => {
    setFiltGenre(genero);
    if (genero === "all genres") setFiltBooks(books);
    else setFiltBooks(books.filter(b => (b.genres.includes(genero))));
  }

  return (
    <div>
      <h2>Books</h2>
      <div>
        <div>
          {genres.map(g => (
            <button key={g} onClick={() => handleFilter(g)}>{g}</button>
          ))}
        </div>
        <p><strong>In genre:</strong> {filtGenre}</p>
      </div>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>Author</th>
            <th>Published</th>
          </tr>
          {filtBooks.map((b) => (
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

export default Books
