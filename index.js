const express = require("express");
const cors = require("cors");
// const jwt = require("jsonwebtoken");
// const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

console.log(process.env.DB_PASS);

// MIDDLEWARE
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json());
// app.use(cookieParser());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.znfmgop.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// const verifyToken = async (req, res, next) => {
//   const token = req.cookies?.token;
//   // console.log("value of token in middleware", token);

//   //no token available
//   if (!token) {
//     return res.status(401).send({ message: "not authorized" });
//   }
//   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
//     //error
//     if (err) {
//       console.log(err);
//       return res.status(401).send({ message: "unauthorized" });
//     }
//     //if token is valid decoded
//     // console.log("value in the token", decoded);
//     req.user = decoded;
//     next();
//   });
// };

async function run() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    // await client.connect();

    const foodCollections = client
      .db("foodSharing")
      .collection("foodCollection");
    // const bookingCollection = client.db("cardoctor").collection("bookings");

    //auth
    // app.post("/jwt", async (req, res) => {
    //   // console.log("Inside /jwt route handler");
    //   const user = req.body;
    //   // console.log(user);
    //   const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    //     expiresIn: "6h",
    //   });
    //   res
    //     .cookie("token", token, {
    //       httpOnly: true,
    //       // secure: false, //http://localhost:5173/,
    //       secure: true,
    //       sameSite: "none",
    //       // maxAge: '1h'
    //     })
    //     .send({ success: true });
    // });

    // app.post("/logout", async (req, res) => {
    //   const user = req.body;
    //   console.log("logout", user);
    //   res.clearCookie("token", { maxAge: 0 }).send({ success: true });
    // });

    // //services
    app.get("/foods", async (req, res) => {
      const cursor = foodCollections.find();
      const result = await cursor.toArray();
      result.sort((a, b) => b.food_quantity - a.food_quantity);
      res.send(result);
    });
    app.get("/foods/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await foodCollections.findOne(query);
      res.send(result);
    });
    // const options = {
    //   // Sort returned documents in ascending order by title (A->Z)
    //   //   sort: { title: 1 },
    //   // Include only the `title` and `imdb` fields in each returned document
    //   projection: { title: 1, price: 1, img: 1, service_id: 1 },
    // };

    // //bookings

    // app.post("/bookings", logger, async (req, res) => {
    //   const booking = req.body;
    //   // console.log(booking);
    //   const result = await bookingCollection.insertOne(booking);
    //   res.send(result);
    // });

    // app.get("/bookings", verifyToken, async (req, res) => {
    //   // console.log("token", req.cookies.token);
    //   if (req.query.email !== req.user.email) {
    //     return res.status(403).send({ message: "forbidden access" });
    //   }
    //   let query = {};
    //   if (req.query?.email) {
    //     query = { email: req.query.email };
    //   }
    //   const result = await bookingCollection.find(query).toArray();
    //   res.send(result);
    // });

    // app.delete("/bookings/:id", verifyToken, async (req, res) => {
    //   const id = req.params.id;
    //   const query = { _id: new ObjectId(id) };
    //   const result = await bookingCollection.deleteOne(query);
    //   res.send(result);
    // });

    // app.patch("/bookings/:id", async (req, res) => {
    //   const id = req.params.id;
    //   const filter = { _id: new ObjectId(id) };
    //   const updatedBooking = req.body;
    //   // console.log(updatedBooking);

    //   // Specify the update to set a value for the plot field
    //   const updateDoc = {
    //     $set: {
    //       status: updatedBooking.status,
    //     },
    //   };
    //   const result = await bookingCollection.updateOne(filter, updateDoc);
    //   res.send(result);
    // });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    //     await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("food is running");
});

app.listen(port, () => {
  console.log(`food is running on port ${port}`);
});
