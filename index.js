const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000; 

// Routes
const adminRoute = require('./routes/admin');
const shopRoute = require('./routes/shop');

// Body parse
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

// Use routes
app.use('/admin', adminRoute);
app.use(shopRoute);

app.use((req, res) => {
  res.send('<h1>Page not found!</h1>')
})

app.listen(
  port,
  console.log(`Server running on port ${port}`)
)