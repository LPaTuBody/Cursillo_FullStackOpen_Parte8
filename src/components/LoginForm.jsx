import { useState, useEffect } from "react";
import { useMutation } from "@apollo/client/react";
import { LOGIN } from "../queries";

const LoginForm = ({ show, setPage }) => {
  if (!show) return null;

  const [username, setUsername] = useState("");
  const [password, setPswd] = useState("");

  const [login, { data }] = useMutation(LOGIN, {
    onError: (err) => { setError(err.graphQLErrors[0].message) },
  });

  useEffect(() => {
    if (data) {
      const token = data.login.value;
      localStorage.setItem("user-logged-token", token);
      setPage("authors");
    }
  }, [data]);

  const submit = (e) => {
    e.preventDefault();
    login({ variables: { username, password } });
    setUsername("");
    setPswd("");
  }

  return (
    <>
      <h2>Iniciar Sesión</h2>
      <form onSubmit={submit}>
        <div>
          <label htmlFor="username">username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={({ target }) => setUsername(target.value)}
          />
        </div>
        <div>
          <label htmlFor="password">password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={({ target }) => setPswd(target.value)}
          />
        </div>
        <button type="submit">login</button>
      </form>
    </>
  )
}

export default LoginForm;