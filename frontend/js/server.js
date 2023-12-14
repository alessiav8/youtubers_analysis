const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const XLSX = require('xlsx');
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


// Routing for the /getData/{username} path
app.get('/getData/:username', async (req, res) => {
  try {
    const username = req.params.username;
    const filenames = ["../datasets/june.xlsx", "../datasets/september.xlsx", "../datasets/november.xlsx", "../datasets/december.xlsx"];

    const workbooks = [];
    for (const filename of filenames) {
      const workbook = XLSX.readFile(path.join(__dirname, '..', filename), { type: 'binary' });
      workbooks.push(workbook);
    }

    const data = [];
    for (const workbook of workbooks) {
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(worksheet);
      data.push(rows);
    }

    const allData = data.flat();

    const youtuberData = allData.filter(row => String(row["Youtube channel"]).toLowerCase() === username.toLowerCase());

    res.json(youtuberData);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


//to handle wrong url
app.all('*', (req, res) => {
  res.status(404).sendFile(path.join(__dirname, '../', 'templates','error.html'));
});

app.listen(port, () => {
  console.log(`Server is running on http://127.0.0.1:${port}`);
});
