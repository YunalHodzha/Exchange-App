const mongoose = require('mongoose');
//const Transaction = require('../model/transactionModel');
const Currency = require('../model/Currency')

const currencyIds = {
    EUR: '655cb2bc5e878acae88383af',
    TRY: '655cb2bc5e878acae88383b3',
    BGN: '655cb2bc5e878acae88383b5',
    GBP: '655cb2bc5e878acae88383b1',
    USD: '655cb2bc5e878acae88383ad'
};




async function handleTransaction(inputCurrency, amount, rate, transactionType) {
    const currencyId = currencyIds[inputCurrency];
    const bgnId = currencyIds.BGN;
    const bgnAmount = amount * rate;

    try {
        const currency = await Currency.findById(currencyId).lean();
        console.log('Transaction currency: ', currency);

        if (transactionType === 'Buy') {
            currency.holdingAmount = currency.holdingAmount + Number(amount);
            await Currency.findByIdAndUpdate(currencyId, currency);
        } else if (transactionType === 'Sell') {
            currency.holdingAmount = currency.holdingAmount - Number(amount);
            await Currency.findByIdAndUpdate(currencyId, currency);
        }


    } catch (error) {

        throw error;
    }
}
module.exports = handleTransaction;

// async function calculateIncome(startDate, endDate) {
//     const income = await Transaction.aggregate([
//         { $match: { timestamp: { $gte: startDate, $lte: endDate } } },
//         {
//             $group: {
//                 _id: '$transactionType',
//                 total: { $sum: '$bgnAmount' }
//             }
//         }
//     ]);

//     let netIncome = 0;
//     income.forEach(item => {
//         if (item._id === 'sell') {
//             netIncome += item.total;
//         } else {
//             netIncome -= item.total;
//         }
//     });

//     return netIncome;
// }

