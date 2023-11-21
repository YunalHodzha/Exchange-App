const express = require('express');
const expressConfig = require('./config/expressConfig')
const dbConnect = require('./config/dbConfing');

const path = require('path');



const app = express();
expressConfig(app);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/action', (req, res) => {
    res.send('Action!');
})


dbConnect()
    .then(() => {
        console.log('DB Connected successfuly!')
        app.listen(3000, () => {
            console.log('Servers is listening on port 3000...');
        });
    }

    )
    .catch((err) =>
        console.log(err));