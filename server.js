const express = require('express');
const client = require("./db");;
const bcrypt = require("bcrypt");
const flash = require("express-flash");

const app = express();

const PORT = process.env.PORT || 3000;


// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'ejs');

// Parses details from a form
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");

app.use(express.json());
app.use(flash());

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


app.get("/", (req, res) => {
  res.render("index");
});

app.get("/users/register", (req, res) => {
  res.render("register.ejs");
});

app.get("/users/login", (req, res) => {
  res.render("login");
});

app.get("/users/dashboard", (req, res) => {
  res.render("dashboard", { user: "Furqan"});
});

app.post("/users/register", async (req, res) => {
  try {
    // const {uname} = req.body;

    // res.render("register");
  let {uname, password, re_password, email, ph_no } = req.body;
  
  console.log(uname, password, re_password, email, ph_no);
  let errors = [];

  if (!uname || !password || !re_password || !email || !ph_no) {
    errors.push({
      message : "Please Enter all the fields" 
    });
  }

  if (password.length < 4) {
    errors.push({
      message : "Password should be longer than 4 characters." 
    });
  }

  if (password != re_password) {
    errors.push({
      message : "Passwords do not match." 
    });
  }

  console.log(errors);
  if (errors.length > 0) {
    res.redirect("register",  { errors });
  } 
  else {
    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    let hashedPassword = await bcrypt.hash(password, salt);
    console.log(hashedPassword);

    client.query(
      `SELECT * FROM hospital
        WHERE uname = $1`,
      [uname],
      (err, results) => {
        if (err) {
          console.log(err);
        }
        console.log(results.rows);

        if (results.rows.length > 0) {
          return res.render("register", {
            message: "Username already registered"
          });
        } else {

          // check duplicacy of email 
          client.query(`SELECT * FROM hospital
            WHERE email = $1`,
            [email], (err, result2) => {
              if (err) {
                console.log(err);
              }
              if (result2.rows.length > 0) {
                return res.render("register", {
                  message: "Email already registered"
                });
              }
            });

          // check duplicacy of ph_no
          client.query(`SELECT * FROM hospital
          WHERE ph_no = $1`,
          [ph_no], (err, result3) => {
            if (err) {
              console.log(err);
            }
            if (result3.rows.length > 0) {
              return res.render("register", {
                message: "Phone number already registered"
              });
            }
          }); 

          // generate OTP
          function randomNum(min, max) {
            return Math.floor(Math.random() * (max - min) + min)
          }

          const verificationCode = randomNum(10000, 99999);
          var verified = false;
          var verified_by = null;

          // insert data into table
          client.query(
            `INSERT INTO hospital (uname, password, email, ph_no, otp, verified, verified_by)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *`,
            [uname, hashedPassword, email, ph_no, verificationCode, verified, verified_by],
            (err, results) => {
              if (err) {
                throw err;
              }
              console.log(results.rows);
              req.flash("success_msg", "You are now registered. Please log in");
              res.redirect("/users/login");
            }
          );
        }
      }
    );
  }
} catch (error) {
  console.error(error.message);        
}
  
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
  console.log(`Server has started on port ${PORT}`);
  dbStart();
});