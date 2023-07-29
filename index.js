const express = require('express')
const cors = require('cors')
const app = express();
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;
require('dotenv').config();



// Middleware

app.use(cors());
app.use(express.json());
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');





const uri = `mongodb+srv://${process.env.SECRET_DBUSER}:${process.env.SECRET_KEY}@car-servicing.6whvnzi.mongodb.net/?retryWrites=true&w=majority`;

// console.log(uri)

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});


const verifyJWT = (req, res, next) => {
    console.log('hitting verify JWT token')
    console.log(req.headers.authorization)

    const authorization = req.headers.authorization;
    if (!authorization) {
        return res.status(401).send({ error: true, message: 'unauthorized access' })
    }
    const token = authorization.split(' ')[1];
    console.log('token inside verify jwt', token)
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
        if (error) {
            return res.status(403).send({ error: true, message: 'unauthorized access' })
        }
        req.decoded = decoded;
        next();
    })
}

async function run() {
    try {
        const serviceCollection = client.db('geniusCar').collection('services');
        const ordersCollection = client.db('geniusCar').collection('orders');


        //jwt
        app.post('/jwt', async (req, res) => {
            const user = req.body;
            // console.log(user)

            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET,
                {
                    expiresIn: '1hr'
                });

            res.send({ token })
        })

        // service API start 


        app.get('/services', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);

        });

        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const service = await serviceCollection.findOne(query);
            res.send(service);
        });

        //Order API
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await ordersCollection.insertOne(order)
            res.send(result);

        })

        app.get('/orders', verifyJWT, async (req, res) => {
            const decoded = req.decoded;
            console.log('come back after verify', decoded)

            let query = {};
            if (req.query.email) {
                query = {
                    email: req.query.email
                }

            }
            const cursor = ordersCollection.find(query);
            const orders = await cursor.toArray()
            res.send(orders)
        })

        // update 

        app.patch('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updateOrders = req.body;
            console.log(updateOrders);
            const updateDoc = {
                $set: {
                    status: 'confirm'
                },
            };
            const result = await ordersCollection.updateOne(filter, updateDoc)
            res.send(result)
        })

        //deteted 

        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await ordersCollection.deleteOne(query)
            res.send(result);
        })


        //Service API end



    } finally {

    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Car servicing server is rannning')
})

app.listen(port, () => {
    console.log(`Node Server is ranning ${port}`);
})