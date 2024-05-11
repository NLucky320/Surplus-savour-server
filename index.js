const express = require("express");
const cors = require("cors");
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

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.znfmgop.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    // await client.connect();

    const foodCollections = client
      .db("foodSharing")
      .collection("foodCollection");

    const myFoodCollections = client
      .db("foodSharing")
      .collection("myFoodCollection");

    // foods collection
    app.get("/foods", async (req, res) => {
      const { status } = req.query;
      let query = {};

      if (status) {
        query = { food_status: status };
      }
      const cursor = foodCollections.find(query);
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

    app.post("/foods", async (req, res) => {
      const newFoods = req.body;
      console.log(newFoods);
      const result = await foodCollections.insertOne(newFoods);
      res.send(result);
    });

    app.get("/myFood/:email", async (req, res) => {
      const email = req.params.email;
      const query = { "donor.email": email };
      const result = await foodCollections.find(query).toArray();
      res.send(result);
    });

    app.delete("/foods/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await foodCollections.deleteOne(query);
      res.send(result);
    });
    app.put("/foods/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedFood = req.body;
      const craft = {
        $set: {
          food_name: updatedFood.food_name,
          food_quantity: updatedFood.food_quantity,
          pickup_location: updatedFood.pickup_location,
          expired_date: updatedFood.expired_date,
          additional_notes: updatedFood.additional_notes,
          food_status: updatedFood.food_status,
          food_image: updatedFood.food_image,
        },
      };
      const result = await foodCollections.updateOne(filter, craft, options);
      res.send(result);
    });
    app.patch("/foods/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const update = { $set: { food_status: "Requested" } };
        const options = { returnOriginal: false };

        const result = await foodCollections.findOneAndUpdate(
          filter,
          update,
          options
        );

        if (!result.value) {
          return res.status(404).json({ error: "Food item not found" });
        }

        res.json(result.value);
      } catch (error) {
        console.error("Error updating food status:", error);
        res.status(500).send("Error updating food status");
      }
    });

    // app.put("/foods/:id", async (req, res) => {
    //   try {
    //     const id = req.params.id;
    //     const filter = { _id: new ObjectId(id) };
    //     const options = { upsert: true };
    //     const updatedFood = req.body;
    //     const food = {
    //       $set: {
    //         food_status: updatedFood.food_status,
    //       },
    //     };
    //     const result = await foodCollections.updateOne(filter, food, options);
    //     res.send(result);
    //   } catch (error) {
    //     console.error("Error updating food status:", error);
    //     res.status(500).send("Error updating food status");
    //   }
    // });

    //myfoodcollection

    app.get("/myFoodRequest", async (req, res) => {
      const cursor = myFoodCollections.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    app.post("/myFoodRequest", async (req, res) => {
      try {
        const newFood = req.body;
        const result = await myFoodCollections.insertOne(newFood);
        res.send(result);
      } catch (error) {
        console.error("Error adding food to myFoodCollection:", error);
        res.status(500).send("Error adding food to myFoodCollection");
      }
    });
    app.get("/myFoodRequest/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email }; // Adjust this line
      const result = await myFoodCollections.find(query).toArray();
      res.send(result);
    });

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
