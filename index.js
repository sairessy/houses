const express = require("express")
const Datastore = require("nedb")
const cookieParser = require("cookie-parser");

const db = {
  users: new Datastore("./src/collections/users.db"),
  products: new Datastore("./src/collections/products.db")
}

db.users.loadDatabase()
db.products.loadDatabase()

const app = express()
app.use(cookieParser())

app.use(express.static("public"))
app.use(express.json({limit: "1mb"}))

const port = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log("Server On")
})

// Serving pages
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html")
})

app.get("/dashboard", (req, res) => {
  if(req.cookies.user) {
    res.sendFile(__dirname + "/public/dashboard.html")
  } else {
    res.redirect("/login");
  }
})

app.get("/addproduct", (req, res) => {
  if(req.cookies.user) {
    res.sendFile(__dirname + "/public/addproduct.html")
  } else {
    res.redirect("/login");
  }
})

app.get("/login", (req, res) => {
  if(req.cookies.user) {
    res.sendFile(__dirname + "/public/dashboard.html")
  } else {
    res.sendFile(__dirname + "/public/login.html")
  }
})

app.get("/register", (req, res) => {
  if(req.cookies.user) {
    res.sendFile(__dirname + "/public/dashboard.html")
  } else {
    res.sendFile(__dirname + "/public/register.html")
  }
})



// REQUESTS
// Regist user
app.post("/register", (req, res) => {
  const data = req.body
  db.users.insert(data, (err, doc) => {
    console.log(doc)
    res.json({success: true})
  })
})

// Authenticate user
app.post("/auth", (req, res) => {
  const {email, pass} = req.body
  db.users.findOne({email, pass}, (err, user) => {
    if (user !== null) {
			res.cookie("user", user._id, {})
		}

    res.json({success: user !== null})
  })
})

// Add product
app.post("/addproduct", (req, res) => {
  const data = req.body
  db.products.insert({...data, time: Date.now().toString(), user: req.cookies.user, removed: false}, (err, doc) => {
    console.log(doc)
  })
  res.json({success: true})
})

// Get all products
app.get("/products", (req, res) => {
  db.products.find({removed: false},async (err, d) => {
    const data = d;
    for (let i = 0; i < data.length; i++) {
      const p = data[i];
      const ui = await new Promise((resolve, reject) => {
        db.users.findOne({_id: p.user}, (err, _d) => {
          resolve(_d);
        });
      });
      const {email, contact} = ui;
      data[i].ui = {email, contact};
    }

    res.json({data})
  })
})

// Get user products
app.get("/userproducts", (req, res) => {
  db.products.find({user: req.cookies.user, removed: false}, async (err, d) => {
    const data = d;
    for (let i = 0; i < data.length; i++) {
      const p = data[i];
      const ui = await new Promise((resolve, reject) => {
        db.users.findOne({_id: p.user}, (err, _d) => {
          resolve(_d);
        });
      });
      const {email, contact} = ui;
      data[i].ui = {email, contact};
    }

    res.json({data})
  })
})

// Logout
app.get("/logout", (req, res)  => {
  res.clearCookie("user", {});
	res.redirect("/login");
})


// Remove product
app.get("/remove/product/:id", (req, res)  => {
  const id = req.params.id
  if(req.cookies.user) {
    db.products.update(
      { _id: id },
      {
        $set: {
          removed: true
        },
      },
      { multi: true },
      function (err, numReplaced) {
        console.log(numReplaced)
      }
    );
  }
  
	res.redirect("/dashboard");
})

// Test
app.get("/test", (req, res)  => {
  db.products.update(
    {  },
    {
      $set: {
        removed: false
      },
    },
    { multi: true },
    function (err, numReplaced) {
      console.log(numReplaced)
    }
  );
  res.json({})
})

// Filter products
app.post("/products/filter", (req, res) => {
  const {size, location} = req.body
  db.products.find({size, location}, async (err, d) => {
    const data = d;

    for (let i = 0; i < data.length; i++) {
      const p = data[i];
      const ui = await new Promise((resolve, reject) => {
        db.users.findOne({_id: p.user}, (err, _d) => {
          resolve(_d);
        });
      });
      const {email, contact} = ui;
      data[i].ui = {email, contact};
    }

    res.json(data);
  })
});