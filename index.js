const { createServer } = require("node:http");
const { createYoga } = require("graphql-yoga");
const { useServer } = require("graphql-ws/use/ws");
const { WebSocketServer } = require("ws");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("./models/user");
const schema = require("./graphql/schema");
require("dotenv").config();

mongoose.set("strictQuery", false);
const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT;
const SECRET = process.env.JWT_SECRET;

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log("connected to", MONGODB_URI);
  })
  .catch((err) => {
    console.log("error connection to MongoDB:", err.message);
  });

// cambio a Yoga porque el Apollo Server actual no maneja suscripciones
// sin express y par de cosas de por medio

const authFunction = async (auth) => {
  if (auth && auth.startsWith("Bearer ")) {
    const token = auth.replace("Bearer ", "");
    try {
      const decoded = jwt.verify(token, SECRET);
      const currentUser = await User.findById(decoded.id);
      return { currentUser };
    } catch (err) {
      return { jwtError: err.message };
    }
  }
  return {};
}

const yoga = createYoga({
  schema,
  context: async ({ req, connectionParams }) => {
    let auth = null;
    if (req) auth = req.headers.authorization;
    if (!auth && connectionParams?.authorization) {
      auth = connectionParams.authorization;
    }

    const autenticacion = await authFunction(auth);
    return autenticacion;
  },
});

const server = createServer(yoga);

const wsServer = new WebSocketServer({
  server,
  path: "/graphql",
});

useServer(
  {
    schema,
    context: async (ctx) => {
      const auth = ctx.connectionParams?.authorization;
      const autenticacion = await authFunction(auth);
      return autenticacion;
    },
    onConnect: () => {
      console.log("🟢 WS client connected");
    },
    onDisconnect: () => {
      console.log("🔴 WS client disconnected");
    },
    onError: (msg, description) => {
      console.error("💥 WS error:", msg, description);
    },
  },
  wsServer
);

server.listen(PORT, () => {
  console.log(`Server ready at http://localhost:${PORT}/graphql`);
});