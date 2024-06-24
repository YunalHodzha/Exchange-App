// Helper function to check if a date is today
const isToday = (date) => {
    const today = new Date();
    return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
    );
};

export const updateHoldings = (holdings) => {
    holdings.forEach(holding => {
        const element = document.getElementById(`holdings-${holding.currency}`);
        if (element) {
            element.innerText = holding.amount.toFixed(2);
        }
    });
};

export const renderTrades = (trades) => {
    const tradesList = document.getElementById('trades-list');
    tradesList.innerHTML = ''; // Clear existing trades

    // Filter trades to show only today's trades
    const todaysTrades = trades.filter(trade => isToday(new Date(trade.date)));

    if (todaysTrades.length > 0) {
        todaysTrades.reverse().forEach((trade, index) => {
            const tradeItem = document.createElement('li');

            const date = new Date(trade.date).toLocaleString();
            const type = trade.type.toUpperCase();
            const amount = trade.amount;
            const currency = trade.currency;
            const price = trade.price;

            tradeItem.innerHTML = `<strong>${date}</strong> - <span class="trade-type">${type}</span> <span class="trade-amount">${amount}</span> <span class="trade-currency">${currency}</span> at <span class="trade-price">${price}</span> BGN`;

            if (index === 0) {
                tradeItem.classList.add('highlight'); // Add highlight class to the most recent trade
            }
            tradesList.appendChild(tradeItem);
        });

        // Scroll the trades list to the top
        tradesList.scrollTop = 0;
    } else {
        const noTradesItem = document.createElement('li');
        noTradesItem.textContent = "No trades for today.";
        tradesList.appendChild(noTradesItem);
    }
};

export const showReport = (report) => {
    let reportOutput = '';
    for (const currency in report) {
        if (currency === 'totalProfit') continue;
        const details = report[currency] || { bought: 0, sold: 0, profit: 0 }; // Handle undefined details
        reportOutput += `${currency}:\n`;
        reportOutput += `  Bought: ${details.bought}\n`;
        reportOutput += `  Sold: ${details.sold}\n`;
        reportOutput += `  Profit: ${details.profit.toFixed(2)} BGN\n`;
        reportOutput += '\n';
    }
    reportOutput += `Total Profit: ${report.totalProfit ? report.totalProfit.toFixed(2) : '0.00'} BGN\n`; // Handle undefined totalProfit
    document.getElementById('report-output').textContent = reportOutput;
};
