import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { CREATE_BOOK, ALL_AUTHORS, ALL_BOOKS } from "../queries";

const NewBook = ({ show }) => {
  const [title, setTitle] = useState(""),
    [author, setAuthor] = useState(""),
    [published, setPublished] = useState(""),
    [genre, setGenre] = useState(""),
    [genres, setGenres] = useState([]);

  const [crearLibro] = useMutation(CREATE_BOOK, {
    refetchQueries: [ ALL_AUTHORS, ALL_BOOKS ]
  });

  if (!show) return null

  const submit = async (e) => {
    e.preventDefault();
    console.log("adding book...");

    crearLibro({
      variables: {
        titulo: title,
        publicado: parseInt(published),
        autor: author,
        generos: genres,
      }
    });

    setTitle("");
    setPublished("");
    setAuthor("");
    setGenres([]);
    setGenre("");
  }

  const addGenre = () => {
    setGenres(genres.concat(genre));
    setGenre("");
  }

  return (
    <div>
      <h2>Add Book</h2>
      <form onSubmit={submit}>
        <div>
          <label htmlFor="tit">title</label>
          <input
            id="tit"
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>
        <div>
          <label htmlFor="aut">author</label>
          <input
            id="aut"
            value={author}
            onChange={({ target }) => setAuthor(target.value)}
          />
        </div>
        <div>
          <label htmlFor="pub">published</label>
          <input
            id="pub"
            type="number"
            value={published}
            onChange={({ target }) => setPublished(target.value)}
          />
        </div>
        <div>
          <input
            value={genre}
            onChange={({ target }) => setGenre(target.value)}
          />
          <button onClick={addGenre} type="button">
            add genre
          </button>
        </div>
        <div>genres: {genres.join(", ")}</div>
        <button type="submit">create book</button>
      </form>
    </div>
  )
}

export default NewBook;