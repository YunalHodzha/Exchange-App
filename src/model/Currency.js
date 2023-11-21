const mongoose = require('mongoose');

const currencySchema = new mongoose.Schema({
    currencyCode: {
        type: String,
        required: true,
        unique: true
    },
    holdingAmount: {
        type: Number,
        required: true,
        default: 0
    }
});

const Currency = mongoose.model('Currency', currencySchema);

module.exports = Currency;

