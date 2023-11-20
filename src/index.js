const express = require('express');
const app = express();

//routes
app.get('/', (req, res) => {
    res.send('Hello Node API');
});


app.listen(3000, () => {
    console.log('Servers is listening on port 3000...');
});