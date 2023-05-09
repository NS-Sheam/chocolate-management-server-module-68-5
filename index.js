const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Chocolate server is running");
})



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// const uri = "mongodb+srv://<username>:<password>@cluster0.k0vsmln.mongodb.net/?retryWrites=true&w=majority";
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.k0vsmln.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();
        const chocolateCollection = client.db("chocolateDB").collection("chocolate");

        // Read Operation 
        app.get("/chocolates", async (req, res) => {
            const cursor = chocolateCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })


        app.get("/chocolates/:id", async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) };
            const result = await chocolateCollection.findOne(query);
            res.send(result);
        })

        // Create Operation 
        app.post("/chocolates", async (req, res) => {
            const newChocolate = req.body;
            console.log(newChocolate);
            const result = await chocolateCollection.insertOne(newChocolate);
            res.send(result);
        })

        // Update Operations 
        app.put("/chocolates/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updatedChocolate = req.body;
            console.log(updatedChocolate);
            const chocolate = {
                $set: {
                    name: updatedChocolate.name,
                    country: updatedChocolate.country,
                    category: updatedChocolate.category,
                    photo: updatedChocolate.photo
                }
            }
            const result = await chocolateCollection.updateOne(filter, chocolate, options);
            res.send(result);
        })

        // Delete Operations 
        app.delete("/chocolates/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await chocolateCollection.deleteOne(query);
            res.send(result);
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.listen(port, () => {
    console.log(`Chocolate server is running on port ${port}`);
})