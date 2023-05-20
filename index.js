const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hnsynpk.mongodb.net/?retryWrites=true&w=majority`;
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
        await client.connect();

        const toyCollection = client.db('toyBiz').collection('toy');

        app.get('/toy20', async (req, res) => {
            const cursor = toyCollection.find().limit(20);
            const result = await cursor.toArray();
            console.log(result);
            res.send(result);
        });

        app.get('/toy', async (req, res) => {
            const cursor = toyCollection.find();
            const result = await cursor.toArray();
            console.log(result);
            res.send(result);
        })

        app.get('/toy/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await toyCollection.findOne(query);
            res.send(result);
        })


        app.get('/myToys', async (req, res) => {
            let query = {};
            if (req.query?.sellerEmail) {
                query = { sellerEmail: req.query.sellerEmail }
            }
            const result = await toyCollection.find(query).toArray();
            res.send(result);
        })

        app.get('/myToysAsc', async (req, res) => {
            const query = req.query.sellerEmail ? { sellerEmail: req.query.sellerEmail } : {};
            const result = await toyCollection.find(query).sort({ price: -1 }).toArray();
            // const result = await toyCollection.find(query).sort({ price: -1 }).collation({ locale: "en_US", numericOrdering: true }).toArray();
            console.log(result);
            res.send(result);
        });

        app.get('/myToysDsc', async (req, res) => {
            const query = req.query.sellerEmail ? { sellerEmail: req.query.sellerEmail } : {};
            const result = await toyCollection.find(query).sort({ price: 1 }).toArray();
            // const result = await toyCollection.find(query).sort({ price: 1 }).collation({ locale: "en_US", numericOrdering: true }).toArray();
            console.log(result);
            res.send(result);
        });

        app.post('/toy', async (req, res) => {
            const newToy = req.body;
            console.log(newToy);
            const result = await toyCollection.insertOne(newToy);
            res.send(result);
        })

        app.put('/myToy/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const updatedToy = req.body;

            const toy = {
                $set: {
                    price: updatedToy.price,
                    quantity: updatedToy.quantity,
                    description: updatedToy.description
                }
            }
            console.log(toy);
            const result = await toyCollection.updateOne(filter, toy, options);
            res.send(result);
        })


        app.delete('/myToys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await toyCollection.deleteOne(query);
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

app.get('/', (req, res) => {
    res.send('Coffee making server is running')
})

app.listen(port, () => {
    console.log(`Coffee Server is running on port: ${port}`)
})