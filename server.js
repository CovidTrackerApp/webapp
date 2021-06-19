const express = require('express');
const ejs = require('ejs');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;


// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'ejs');

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));

// app.use(express.static(__dirname + '/views'));

// const index = require('./routes/index');
// app.use('/', index);

// // catch 404 and forward to error handler
// app.use((req, res, next) => {
//   const err = new Error('File Not Found');
//   err.status = 404;
//   next(err);
// });

// // error handler
// // define as the last app.use callback
// app.use((err, req, res, next) => {
//   res.status(err.status || 500);
//   res.send(err.message);
// });

app.set("view engine", "ejs");


app.get("/", (req, res) => {
  res.render("index");
});

app.get("/users/login", (req, res) => {
  req.render("login");
});

app.get("/users/dashboard", (req, res) => {
  req.render("dashboard", { user: "Furqan"});
});





// database connection here. //
async function dbStart() {
  try { 
      await client.connect();
      console.log("DB connected successfully.");
      // await client.query("");

  }
  catch (e) {
      console.error(`The error has occured: ${e}`)
  }
}

// listen on port 3000
app.listen(PORT || 3000, () => {
  console.log("Server has started on port 5000");
  dbStart();
});