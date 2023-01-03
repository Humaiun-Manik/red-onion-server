const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lsrj1u2.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();

    const foodCollection = client.db("red_onion").collection("meals");
    const orderCollection = client.db("red_onion").collection("orders");

    // meals API
    app.get("/meal-time", async (req, res) => {
      const time = req.query.time;
      const query = { time: time };
      const cursor = foodCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    // orders API
    app.post("/order", async (req, res) => {
      const order = req.body;
      const query = { mealId: order.mealId, email: order.email };
      const exists = await orderCollection.findOne(query);
      if (exists) {
        return res.send({ success: false });
      }
      const result = await orderCollection.insertOne(order);
      res.send({ success: true, result });
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Red onion is running");
});

app.listen(port, () => {
  console.log(`Red onion app listening on port ${port}`);
});
