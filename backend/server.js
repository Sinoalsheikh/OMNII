


const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 5002; // Changed to 5002

app.use(cors());
app.use(express.json());

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from OmniFlow.Ai backend!' });
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});


