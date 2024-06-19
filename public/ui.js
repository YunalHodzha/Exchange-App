export const updateHoldings = (holdings) => {
    for (const currency in holdings) {
        const element = document.getElementById(`holdings-${currency}`);
        if (element) {
            element.innerText = holdings[currency].toFixed(2);
        }
    }
};

export const renderTrades = (trades) => {
    const tradesList = document.getElementById('trades-list');
    tradesList.innerHTML = ''; // Clear existing trades

    trades.forEach((trade, index) => {
        const tradeItem = document.createElement('li');

        const date = new Date(trade.date).toLocaleString();
        const type = trade.type.toUpperCase();
        const amount = trade.amount;
        const currency = trade.currency;
        const price = trade.price;

        tradeItem.innerHTML = `<strong>${date}</strong> - <span class="trade-type">${type}</span> <span class="trade-amount">${amount}</span> <span class="trade-currency">${currency}</span> at <span class="trade-price">${price}</span> BGN`;

        if (index === trades.length - 1) {
            tradeItem.classList.add('highlight'); // Add highlight class to the last trade
        }
        tradesList.appendChild(tradeItem);
    });

    // Scroll the last trade into view
    const lastTrade = tradesList.lastElementChild;
    if (lastTrade) {
        lastTrade.scrollIntoView({ behavior: 'smooth' });
    }
};

export const showReport = (report) => {
    let reportOutput = '';
    for (const currency in report) {
        if (currency === 'totalProfit') continue;
        const details = report[currency];
        reportOutput += `${currency}:\n`;
        reportOutput += `  Bought: ${details.bought}\n`;
        reportOutput += `  Sold: ${details.sold}\n`;
        reportOutput += `  Profit: ${details.profit.toFixed(2)} BGN\n`;
        reportOutput += '\n';
    }
    reportOutput += `Total Profit: ${report.totalProfit.toFixed(2)} BGN\n`;
    document.getElementById('report-output').textContent = reportOutput;
};
