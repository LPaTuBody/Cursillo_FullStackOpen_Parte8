import { useState, useEffect, useRef } from "react";
import { useQuery } from "@apollo/client/react";
import { ALL_BOOKS } from "../queries";

const Books = ({ show }) => {
  if (!show) return null;

  const [genres, setGenres] = useState(["all genres"]);
  const [genero, setGenero] = useState("all genres");
  const [books, setBooks] = useState([]);
  const [autor, setAutor] = useState(null);
  const genreRef = useRef(true);

  const { loading, data } = useQuery(ALL_BOOKS, {
    variables: {
      autor,
      genero: genero === "all genres" ? null : genero,
    }
  });

  useEffect(() => {
    if (data) {
      const libros = data.allBooks;
      setBooks(libros);

      if (genreRef.current) {
        const generos = [];
        libros.forEach(b => {
          for (let i in b.genres) {
            const g = b.genres[i];
            if (!generos.includes(g)) generos.push(g);
          }
        });
        setGenres(genres.concat(generos));
        genreRef.current = false;
      }
    };
  }, [data]);

  if (loading) return (<div>Loading...</div>);

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
