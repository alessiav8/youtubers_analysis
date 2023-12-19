const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const XLSX = require('xlsx');
const cors = require('cors');

const app = express();
const port = 8080;

app.use(cors());

app.use(express.static(path.join(__dirname, '..')));

app.use('/bootstrap', express.static(path.join(__dirname, '../../node_modules/bootstrap/dist')));

console.log('Server started!');

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

//get a specific xlsx file
app.get('/getXlsx/:filename', async (req, res) => {
  try {
    const filename = req.params.filename.toLowerCase();
    console.log('Requested filename:', filename);

    const filenames = [
      "../datasets/june.xlsx",
      "../datasets/september.xlsx",
      "../datasets/november.xlsx",
      "../datasets/december.xlsx",
    ];

    const selectedFile = filenames.find(file => path.basename(file).toLowerCase() === filename);

    console.log('Selected file:', selectedFile);

    if (selectedFile) {
      try {
        const workbook = XLSX.readFile(path.join(__dirname, '..', selectedFile));
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        res.json(jsonData);
      } catch (error) {
        console.error('Error during XLSX file reading:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
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

// Middleware per la gestione degli errori
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Errore interno del server');
});
