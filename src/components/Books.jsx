import { useState } from "react";
import { useQuery } from "@apollo/client/react";
import { ALL_BOOKS } from "../queries";

const Books = ({ show }) => {
  if (!show) return null;

  const [genres, setGenres] = useState(["all genres"]);
  const [genero, setGenero] = useState("all genres");
  const [autor, setAutor] = useState(null);
  
  const { loading, data } = useQuery(ALL_BOOKS, {
    variables: {
      autor,
      genero: genero === "all genres" ? null : genero,
    }
  });

  if (loading) return (<div>Loading...</div>);
  
  const books = data.allBooks;
  
  books.forEach(b => {
    for (let i in b.genres) {
      const g = b.genres[i];
      if (!genres.includes(g)) setGenres(genres.concat(g));
    }
  }); // array de los géneros para generar los botones

  return (
    <div>
      <h2>Books</h2>
      <div>
        <div>
          {genres.map(g => (
            <button key={g} onClick={() => setGenero(g)}>{g}</button>
          ))}
        </div>
        <p><strong>In genre:</strong> {genero}</p>
      </div>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>Author</th>
            <th>Published</th>
          </tr>
          {books.map((b) => (
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
