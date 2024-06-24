import { loadData, getPrice, handleOperation, getDailyReport, getCustomReport } from './api.js';
import { updateHoldings, renderTrades, showReport } from './ui.js';

const currencyNames = {
    EUR: "ЕВРО",
    USD: "Американски Долар",
    GBP: "Британски Паунд",
    TRY: "Турска Лира"
};

const operationNames = {
    buy: "КУПУВА",
    sell: "ПРОДАВА"
};

document.addEventListener('DOMContentLoaded', () => {
    // Load initial data from server
    loadData().then(data => {
        updateHoldings(data.holdings);
        renderTrades(data.trades);
    }).catch(err => {
        console.error("Failed to load initial data:", err.message);
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
    document.addEventListener('keydown', function (event) {
        if (event.key === "Escape" || event.key === "Esc") {
            closeModal();
        }
    });
    document.querySelector('.modal').addEventListener('click', function (event) {
        if (event.target === this) {
            closeModal();
        }
    });

    // Event listener for submitting the operation
    document.getElementById('modal-submit-btn').addEventListener('click', processOperation);

    // Event listener for amount input to update BGN sum
    document.getElementById('modal-amount').addEventListener('input', updateBgnSum);
    document.getElementById('modal-price').addEventListener('input', updateBgnSum);

    // Event listeners for report buttons
    document.getElementById('daily-report-btn').addEventListener('click', generateDailyReport);
    document.getElementById('custom-report-btn').addEventListener('click', generateCustomReport);
});

const openModal = (currency, operation) => {
    document.getElementById('modal-currency').dataset.value = currency; // Store original value in data attribute
    document.getElementById('modal-currency').value = currencyNames[currency];
    document.getElementById('modal-operation').dataset.value = operation; // Store original value in data attribute
    document.getElementById('modal-operation').value = operationNames[operation];

    getPrice(currency, operation).then(data => {
        document.getElementById('modal-price').value = data.price.toFixed(3);
    });

    document.getElementById('modal-amount').value = '';
    document.getElementById('modal-bgn-sum').value = '';
    document.getElementById('modal').style.display = 'block';

    // Auto-focus the amount input field
    const amountInput = document.getElementById('modal-amount');
    amountInput.focus();

    // Add event listener for Enter key
    amountInput.addEventListener('keydown', handleEnterKey);
};

const closeModal = () => {
    document.getElementById('modal').style.display = 'none';

    // Remove event listener for Enter key
    const amountInput = document.getElementById('modal-amount');
    amountInput.removeEventListener('keydown', handleEnterKey);
};

const handleEnterKey = (event) => {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent the default action to avoid form submission issues
        processOperation();
    }
};

const processOperation = () => {
    const currency = document.getElementById('modal-currency').dataset.value;
    const operation = document.getElementById('modal-operation').dataset.value;
    const amount = parseFloat(document.getElementById('modal-amount').value);
    const price = parseFloat(document.getElementById('modal-price').value);
    const bgnSum = parseFloat(document.getElementById('modal-bgn-sum').value);

    if (!isNaN(amount) && amount > 0) {
        const confirmationMessage = `
        Сигурни ли сте, че искате да продължите със следната сделка?
        \n${operationNames[operation]} ${amount} ${currencyNames[currency]}
        \nКурс: ${price.toFixed(3)} BGN Обща сума: ${bgnSum.toFixed(2)} лева
        `;
        
        if (confirm(confirmationMessage)) {
            handleOperation({ currency, operation, amount, price }).then(data => {
                loadData().then(data => {
                    updateHoldings(data.holdings);
                    renderTrades(data.trades);
                });
                closeModal();
            }).catch(err => {
                alert("Сделката не може да бъде изпълнена: " + err.message);
            });
        }
    } else {
        alert("Моля, въведете валидно количество.");
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

const generateCustomReport = () => {
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;
    if (startDate && endDate) {
        getCustomReport(startDate, endDate).then(report => {
            showReport(report);
        }).catch(err => {
            alert("Failed to generate custom report: " + err.message);
        });
    } else {
        alert("Please select both start and end dates.");
    }
};
