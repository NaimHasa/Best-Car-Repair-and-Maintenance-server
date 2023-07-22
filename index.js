const express = require('express')
const cors = require('cors')
const app = express();
const port = process.env.PORT || 5000;



// Middleware

app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
    res.send('Car servicing server is rannning')
})

app.listen(port, () => {
    console.log(`Node Server is ranning ${port}`);
})