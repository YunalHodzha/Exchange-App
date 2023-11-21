// const mongoose = require('mongoose');

// const TransactionSchema = mongoose.Schema(
//     {
//         currencyCode: {
//             type: String,
//             required: [true, 'CurrencyCode is required!']
//         },
//         amount: {
//             type: Number,
//             required: [true, 'Amount is required!']
//         },
//         rate: {
//             type: Number,
//             required: [true, 'Rate is required!']
//         },
//         bgnAmount: {
//             type: Number,
//             required: [true, 'bgnAmount is required!']
//         },
//         transactionType: String,
//         timestamp: { type: Date, default: Date.now }
//     }

// )

// const Transaction = mongoose.model('Transaction', TransactionSchema);

// module.exports = Transaction;