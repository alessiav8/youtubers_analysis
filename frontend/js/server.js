const express = require('express');
const path = require('path');

const app = express();
const port = 8080;

app.use(express.static(path.join(__dirname, '..')));

//routing here
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname,'../', 'templates', 'index.html'));
});

// Routing for the /{username} path
app.get('/:username', (req, res) => {
  const username = req.params.username;
  res.sendFile(path.join(__dirname, '../', 'templates', 'userPage.html'));
});

//to handle error
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).sendFile(path.join(__dirname,'../', 'templates', 'error.html'));
});




//to handle wrong url
app.all('*', (req, res) => {
  res.status(404).sendFile(path.join(__dirname, '../', 'templates','error.html'));
});

app.listen(port, () => {
  console.log(`Server is running on http://127.0.0.1:${port}`);
});
