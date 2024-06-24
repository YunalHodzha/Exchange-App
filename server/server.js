const express = require('express');
const path = require('path');
const { connectDB, getDB } = require('./db');
const { getPrices } = require('./prices');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

const initializeHoldings = async (db) => {
    const holdingsCollection = db.collection('holdings');
    const existingHoldings = await holdingsCollection.find().toArray();

    if (existingHoldings.length === 0) {
        const initialHoldings = [
            { currency: 'BGN', amount: 0 },
            { currency: 'EUR', amount: 0 },
            { currency: 'USD', amount: 0 },
            { currency: 'GBP', amount: 0 },
            { currency: 'TRY', amount: 0 },
        ];

        await holdingsCollection.insertMany(initialHoldings);
    }
};

const updateHoldings = async (db, trade) => {
    const holdingsCollection = db.collection('holdings');
    const { currency, type, amount, price } = trade;
    const holding = await holdingsCollection.findOne({ currency });

    let newAmount;
    if (type === 'buy') {
        newAmount = (holding ? holding.amount : 0) + amount;
    } else {
        newAmount = (holding ? holding.amount : 0) - amount;
    }

    await holdingsCollection.updateOne(
        { currency },
        { $set: { amount: newAmount } },
        { upsert: true }
    );

    // Update BGN holdings
    const bgnHolding = await holdingsCollection.findOne({ currency: 'BGN' });
    let bgnAmount = bgnHolding ? bgnHolding.amount : 0;

    if (type === 'buy') {
        bgnAmount -= amount * price;
    } else {
        bgnAmount += amount * price;
    }

    await holdingsCollection.updateOne(
        { currency: 'BGN' },
        { $set: { amount: bgnAmount } },
        { upsert: true }
    );
};

const generateReport = (trades) => {
    const report = trades.reduce((acc, trade) => {
        if (!acc[trade.currency]) {
            acc[trade.currency] = { bought: 0, sold: 0, profit: 0, buyAmounts: [] };
        }
        if (trade.type === 'buy') {
            acc[trade.currency].bought += trade.amount;
            acc[trade.currency].buyAmounts.push({ amount: trade.amount, price: trade.price });
        } else {
            acc[trade.currency].sold += trade.amount;
            let remainingAmount = trade.amount;
            let profit = 0;

            while (remainingAmount > 0 && acc[trade.currency].buyAmounts.length > 0) {
                let buyTrade = acc[trade.currency].buyAmounts[0];
                let tradeAmount = Math.min(buyTrade.amount, remainingAmount);

                profit += tradeAmount * (trade.price - buyTrade.price);
                buyTrade.amount -= tradeAmount;
                remainingAmount -= tradeAmount;

                if (buyTrade.amount === 0) {
                    acc[trade.currency].buyAmounts.shift();
                }
            }

            acc[trade.currency].profit += profit;
            acc.totalProfit += profit; // Update total profit
        }
        return acc;
    }, { totalProfit: 0 });

    // Remove buyAmounts from the report to clean up the output
    for (const currency in report) {
        if (report[currency].buyAmounts) {
            delete report[currency].buyAmounts;
        }
    }

    return report;
};
app.get('/api/load-data', async (req, res) => {
    try {
        const db = getDB();
        const holdings = await db.collection('holdings').find().toArray();
        const prices = getPrices();
        const trades = await db.collection('trades').find().toArray();
        res.json({ holdings, trades, prices });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to load data' });
    }
});

app.post('/api/handle-operation', async (req, res) => {
    try {
        const { currency, operation, amount, price } = req.body;
        const date = new Date().toISOString();
        const db = getDB();

        // Check if selling amount is greater than holding amount
        if (operation === 'sell') {
            const holding = await db.collection('holdings').findOne({ currency });
            if (!holding || holding.amount < amount) {
                return res.status(400).json({ error: `Insufficient holdings for sale: You have ${holding ? holding.amount : 0} ${currency} but trying to sell ${amount}` });
            }
        }

        const trade = { type: operation, currency, amount, price, date };
        const result = await db.collection('trades').insertOne(trade);

        await updateHoldings(db, trade);

        res.json({ id: result.insertedId, ...trade });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to handle operation' });
    }
});

app.get('/api/daily-report', async (req, res) => {
    try {
        const db = getDB();
        const today = new Date().toISOString().split('T')[0];

        const trades = await db.collection('trades').find({ date: { $regex: `^${today}` } }).toArray();

        const report = generateReport(trades);
        res.json(report);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to generate report' });
    }
});

app.post('/api/custom-report', async (req, res) => {
    try {
        const { startDate, endDate } = req.body;
        const db = getDB();

        // Convert startDate and endDate to strings for comparison
        const start = new Date(startDate).toISOString();
        const end = new Date(endDate).toISOString();

        const trades = await db.collection('trades').find({
            date: {
                $gte: start,
                $lte: end,
            },
        }).toArray();
        

        const report = generateReport(trades);
        res.json(report);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to generate report' });
    }
});

app.get('/api/get-price', (req, res) => {
    const { currency, operation } = req.query;
    const prices = getPrices();
    const price = prices[currency][operation];
    res.json({ price });
});

connectDB().then(async () => {
    const db = getDB();
    await initializeHoldings(db); // Initialize holdings when the server starts
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('Failed to connect to MongoDB', err);
});
