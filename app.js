const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const usersRouter = require('./routes/users');
const rolesRouter = require('./routes/roles');
const productsRouter = required('./routes/products')

const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/KSSIA', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB', err));

    app.use(bodyParser.json());
    app.use('/users', usersRouter);
    app.use('/roles', rolesRouter);
    app.use('/products', productsRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
