import { loadData, getPrice, handleOperation, getDailyReport } from './api.js';
import { updateHoldings, renderTrades, showReport } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    // Load initial data from server
    loadData().then(data => {
        updateHoldings(data.holdings);
        renderTrades(data.trades);
    });

    // Event listeners for buy and sell buttons
    document.querySelectorAll('.buy-btn').forEach(button => {
        button.addEventListener('click', () => openModal(button.dataset.currency, 'buy'));
    });

    document.querySelectorAll('.sell-btn').forEach(button => {
        button.addEventListener('click', () => openModal(button.dataset.currency, 'sell'));
    });

    // Event listener for closing the modal
    document.querySelector('.close').addEventListener('click', closeModal);

    // Event listener for submitting the operation
    document.getElementById('modal-submit-btn').addEventListener('click', processOperation);

    // Event listener for amount input to update BGN sum
    document.getElementById('modal-amount').addEventListener('input', updateBgnSum);
    document.getElementById('modal-price').addEventListener('input', updateBgnSum);

    // Event listener for daily report button
    document.getElementById('daily-report-btn').addEventListener('click', generateDailyReport);
});

const openModal = (currency, operation) => {
    document.getElementById('modal-currency').value = currency;
    document.getElementById('modal-operation').value = operation;

    getPrice(currency, operation).then(data => {
        document.getElementById('modal-price').value = data.price.toFixed(3);
    });

    document.getElementById('modal-amount').value = '';
    document.getElementById('modal-bgn-sum').value = '';

    document.getElementById('modal').style.display = 'block';
};

const closeModal = () => {
    document.getElementById('modal').style.display = 'none';
};

const processOperation = () => {
    const currency = document.getElementById('modal-currency').value;
    const operation = document.getElementById('modal-operation').value;
    const amount = parseFloat(document.getElementById('modal-amount').value);
    const price = parseFloat(document.getElementById('modal-price').value);

    if (!isNaN(amount) && amount > 0) {
        handleOperation({ currency, operation, amount, price }).then(data => {
            updateHoldings(data.holdings);
            renderTrades(data.trades);
            closeModal();
        });
    } else {
        alert('Please enter a valid amount.');
    }
};

const updateBgnSum = () => {
    const amount = parseFloat(document.getElementById('modal-amount').value);
    const price = parseFloat(document.getElementById('modal-price').value);
    if (!isNaN(amount) && !isNaN(price)) {
        document.getElementById('modal-bgn-sum').value = (amount * price).toFixed(2);
    } else {
        document.getElementById('modal-bgn-sum').value = '';
    }
};

const generateDailyReport = () => {
    getDailyReport().then(report => {
        showReport(report);
    });
};
