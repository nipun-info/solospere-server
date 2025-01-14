const express = require('express')
const cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.port || 9000
const app = express()

const corsOptions = {
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
    optionSuccessStatus: 200,
}

// middleware
app.use(cors(corsOptions))
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nndvli5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
        const jobsCollection = client.db('soloSphere').collection('jobs')
        const bidsCollection = client.db('soloSphere').collection('bids')

        // Get all jobs data from db
        app.get('/jobs', async (req, res) => {
            const result = await jobsCollection.find().toArray()
            res.send(result)
        })

        // Get a single job data from db using job id
        app.get('/job/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await jobsCollection.findOne(query)
            res.send(result);
        })

        // save a bid data in db
        app.post('/bid', async (req, res) => {
            const bidData = req.body
            console.log(bidData);
            const result = await bidsCollection.insertOne(bidData);
            res.send(result);
        })

        // save a job data in db
        app.post('/job', async (req, res) => {
            const jobData = req.body;
            console.log(jobData);
            const result = await jobsCollection.insertOne(jobData);
            res.send(result)
        })

        // get all jobs posted by a specific user
        app.get('/jobs/:email', async (req, res) => {
            const email = req.params.email;
            const query = { 'buyer.email': email };
            const result = await jobsCollection.find(query).toArray();
            res.send(result)
        })

        // delete a job data from db
        app.delete('/job/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await jobsCollection.deleteOne(query);
            res.send(result);
        })

        // update a job in db
        app.put('/job/:id', async (req, res) => {
            const id = req.params.id;
            const jobData = req.body;
            const query = { _id: new ObjectId(id) }
            const options = { upsert: true }
            const updateDoc = {
                $set: {
                    ...jobData,
                },
            }
            const result = await jobsCollection.updateOne(query, updateDoc, options)

            res.send(result);
        });

        // get all bids for a user by email from db
        app.get('/my-bids/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const result = await bidsCollection.find(query).toArray();
            res.send(result);
        });

        // Get all bid requests fro d for jo owner

        app.get('/bid-requests/:email', async (req, res) => {
            const email = req.params.email
            const query = { 'buyer.email': email }
            const result = await bidsCollection.find(query).toArray()
            res.send(result)
        })

        // Update Bid status
        app.patch('/bid/:id', async(req, res) => {
            const id = req.params.id;
            const status = req.body;
            const query = {_id: new ObjectId(id)};
            const updateDoc = {
                $set: status,
            }
            const result = await bidsCollection.updateOne(query, updateDoc);
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
    res.send("Solosphere server is running")
});

app.listen(port, () => {
    console.log(`SERVER RUNNING IS ${port}`);
});