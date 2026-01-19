const { createServer } = require("node:http");
const { createYoga } = require("graphql-yoga");
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
// sin intermediarios de por medio

const yoga = createYoga({
  schema,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null;
    if (auth && auth.startsWith("Bearer ")) {
      const token = auth.replace("Bearer ", "");
      try {
        const decoded = jwt.verify(token, SECRET);
        const currentUser = await User.findById(decoded.id);
        return { currentUser };
      } catch (err) {
        return { jwtError: err.message };
      }
    };
  }
});

const server = createServer(yoga);

server.listen(PORT, () => {
  console.log(`Server ready at http://localhost:${PORT}/graphql`);
  console.log(`Subscriptions on ws://localhost:${PORT}/graphql`);
});