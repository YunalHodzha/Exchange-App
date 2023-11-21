const Currency = require('../model/Currency');

const initializeCurrencies = async () => {
    const initialCurrencies = ['USD', 'GBP', 'TRY', 'EUR', 'BGN']; // Include BGN if you want to track its holdings

    initialCurrencies.forEach(async (code) => {
        const currencyExists = await Currency.findOne({ currencyCode: code });
        if (!currencyExists) {
            await Currency.create({ currencyCode: code, holdingAmount: 0 });
        }
    });
};

module.exports = initializeCurrencies;