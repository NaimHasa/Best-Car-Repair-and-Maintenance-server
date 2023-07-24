const express = require('express')
const cors = require('cors')
const app = express();
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

async function run() {
    try {
        const serviceCollection = client.db('geniusCar').collection('services');
        const ordersCollection = client.db('geniusCar').collection('orders');

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

        app.get('/orders', async (req, res) => {
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

        // const { orders, setOrders } = useState({})
        // useEffect(() => {
        //     fetch(`http://localhost:5000/orders?email=${user.email}`)
        //         .then(res => res.json())
        //         .then(data => setOrders(data))


        // }, [])





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