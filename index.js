const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 3000;

// MIDDLE WARES
app.use(cors());
app.use(express.json());

// database config

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.ezm1s.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // Connect the client to the server	(optional starting in v4.7)
    const allEvents = client.db("Eventora").collection("all-events");
    const reviews = client.db("Eventora").collection("reviews");
    const users = client.db("Eventora").collection("users");

    // OPERATIONS
    // GET OPERATIONS
    // get operations for featured events
    app.get("/featured-events", async (req, res) => {
      const query = { featured: true };
      const result = await allEvents.find(query).limit(3).toArray();
      res.send(result);
    });

    // get operation for all events
    app.get("/all-events", async (req, res) => {
      const cursor = allEvents.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // get operation for category wise events
    app.get("/events-by-category", async (req, res) => {
      const category = req.query.category;
      const query = { category: category };
      const cursor = allEvents.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    // get operation for details page
    app.get("/details-event/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await allEvents.findOne(query);
      res.send(result);
    });

    // POST OPERATION
    app.post("/post-user", async (req, res) => {
      const user = req.body;
      const email = user?.email;
      const query = { email: email };
      const existingUser = await users.findOne(query);

      // checking if user exist
      if (existingUser) {
        return res.send({ message: "USER ALREADY EXISTS", insertedId: null });
      }

      // user to be added
      const userToBeAdded = {
        ...user,
        createdAt: new Date(),
      };

      const result = await users.insertOne(userToBeAdded);
      res.send(result);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Eventora is on");
});

app.listen(port, () => {
  console.log(`Eventora is open at ${port}`);
});
