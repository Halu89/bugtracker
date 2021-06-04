require("dotenv-safe").config();

const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const path = require("path");
const app = express();

app.use(express.static(path.join(__dirname, "views")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("tiny"));
app.use(helmet());

require("./models"); // Connect to the database

const routes = require("./routes");
app.use("/", routes);

const port = process.env.PORT || 5050;
app.listen(port, () =>
  console.log(
    `App listening on port ${port}` +
      (process.env.NODE_ENV === "dev" ? ` Open http://localhost:${port}` : "")
  )
);
