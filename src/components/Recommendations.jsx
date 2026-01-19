import { useQuery } from "@apollo/client/react";
import { ALL_BOOKS } from "../queries";

const Recommendations = ({ show, yo }) => {
  if (!show) return null;
  
  const { loading, data } = useQuery(ALL_BOOKS, {
    variables: { genero: yo.favGenre },
    fetchPolicy: "network-only"
  });

  if (loading) return (<div>Loading...</div>);

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
          {data.allBooks.map((b) => (
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