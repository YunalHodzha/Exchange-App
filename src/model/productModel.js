const mongoose = require('mongoose');

const productSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Enter product name"],
        },
        quantity: {
            type: Number,
            require: true,
            default: 0
        },
        price: {
            type: Number,
            required: true,
        }
    },
    {
        timestamp: true
    }
)

const Product = mongoose.model('Product', productSchema);

module.exports = Product;