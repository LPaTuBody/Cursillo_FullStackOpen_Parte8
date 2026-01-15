import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { EDIT_AUTHOR, ALL_AUTHORS } from "../queries";

const Authors = ({ show, authors }) => {
  const [author, setAuthor] = useState("");
  const [year, setYear] = useState("");
  const [ editarAutor ] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [ ALL_AUTHORS ]
  });

  if (!show) return null

  const submit = (e) => {
    e.preventDefault();
    console.log("updating author...");

    editarAutor({
      variables: {
        nombre: author,
        anno: parseInt(year)
      }
    });

    setAuthor("");
    setYear("");
  }

  return (
    <div>
      <h2>Authors</h2>
      <div>
        <table>
          <tbody>
            <tr>
              <th></th>
              <th>Born</th>
              <th>Books</th>
            </tr>
            {authors.map((a) => (
              <tr key={a.id}>
                <td>{a.name}</td>
                <td>{a.born}</td>
                <td>{a.bookCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <br />
      <div>
        <form onSubmit={submit}>
          <div>
            <label htmlFor="name">name</label>
            <input
              type="text"
              id="name"
              value={author}
              onChange={({target}) => setAuthor(target.value)}
            />
          </div>
          <div>
            <label htmlFor="born">born</label>
            <input
              type="number"
              id="born"
              value={year}
              onChange={({target}) => setYear(target.value)}
            />
          </div>
          <button type="submit">update author</button>
        </form>
      </div>
    </div>
  )
}

export default Authors
