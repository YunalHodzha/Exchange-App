const express = require('express');
const fs = require('fs');
const path = require('path');
const { loadJSON, saveJSON } = require('./utils');
const { getPrices } = require('./prices');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));  // Adjusted path to serve static files

app.get('/api/load-data', (req, res) => {
    const holdings = loadJSON(path.join(__dirname, '../data/holdings.json'));
    const prices = getPrices();
    const trades = loadJSON(path.join(__dirname, '../data/trades.json'));
    res.json({ holdings, trades, prices });
});

app.get('/api/get-price', (req, res) => {
    const { currency, operation } = req.query;
    const prices = getPrices();
    res.json({ price: prices[currency][operation] });
});

app.post('/api/handle-operation', (req, res) => {
    const { currency, operation, amount, price } = req.body;
    const holdings = loadJSON(path.join(__dirname, '../data/holdings.json'));
    let trades = loadJSON(path.join(__dirname, '../data/trades.json'));

    if (!Array.isArray(trades)) {
        trades = [];
    }

    if (operation === 'buy') {
        holdings.BGN -= amount * price;
        holdings[currency] += amount;
    } else {
        holdings.BGN += amount * price;
        holdings[currency] -= amount;
    }

    trades.push({ type: operation, currency, amount, price, date: new Date() });

    saveJSON(path.join(__dirname, '../data/holdings.json'), holdings);
    saveJSON(path.join(__dirname, '../data/trades.json'), trades);

    res.json({ holdings, trades });
});

app.get('/api/daily-report', (req, res) => {
    const trades = loadJSON(path.join(__dirname, '../data/trades.json'));
    const today = new Date().toISOString().split('T')[0];

    const report = trades.reduce((acc, trade) => {
        const tradeDate = new Date(trade.date).toISOString().split('T')[0];
        if (tradeDate === today) {
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
        }
        return acc;
    }, { totalProfit: 0 });

    res.json(report);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
