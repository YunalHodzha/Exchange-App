const express = require('express');
const expressConfig = require('./config/expressConfig')
const dbConnect = require('./config/dbConfing');
const path = require('path');
const handleTransaction = require('./managers/transactionManager');
const initialCurrencies = require('./utils/initializeCurrencies');


const app = express();
expressConfig(app);
app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/transaction', async (req, res) => {
    const data = req.body;

    try {

     await handleTransaction(req.body.currencyCode, req.body.amount, req.body.rate, req.body.transactionType);
        
     res.sendFile(path.join(__dirname, 'public', 'index.html'));
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ message: err.message })
    }
})



dbConnect()
    .then(() => {
        console.log('DB Connected successfuly!')
        app.listen(3000, () => {
            console.log('Servers is listening on port 3000...');
        });
    }

    )
    .catch((err) =>
        console.log(err));


    initialCurrencies();