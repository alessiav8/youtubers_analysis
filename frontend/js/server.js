const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const XLSX = require('xlsx');
const cors = require('cors');
const bodyParser = require('body-parser');



const app = express();
const port = 8080;

app.use(cors());
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

app.use(
  bodyParser.urlencoded({
    extended: true,
    limit: '35mb',
    parameterLimit: 50000,
  }),
);

//disable the cache 
app.use((req, res, next) => {
  res.header('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  next();
});


app.use(express.static(path.join(__dirname, '..')));

app.use('/bootstrap', express.static(path.join(__dirname, '../../node_modules/bootstrap/dist')));


//routing here
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname,'../', 'templates', 'index.html'));
});

// Routing for the /{username} path
app.get('/detail/:username', (req, res) => {
  const username = req.params.username;
  res.sendFile(path.join(__dirname, '../', 'templates', 'userPage.html'));
});
app.get('/compare', (req, res) => {
  res.sendFile(path.join(__dirname, '../', 'templates', 'compare.html'));
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

app.post('/generateExcel', async (req, res) => {
  try {
    const datasetString = req.body.dataset;
    const dataset = JSON.parse(datasetString);

    // Define the file path to save the Excel file
    const filePath = path.join(__dirname, '../../datasets/temp.xlsx');

    // Ensure the directory exists
    await fs.mkdir(path.dirname(filePath), { recursive: true });

    // Delete the existing file if it exists
    try {
      await fs.unlink(filePath);
      console.log('Existing file deleted:', filePath);
    } catch (unlinkError) {
      // Ignore if the file doesn't exist
      if (unlinkError.code !== 'ENOENT') {
        throw unlinkError;
      }
    }

    // Create a worksheet from the dataset
    const ws = XLSX.utils.json_to_sheet(dataset);

    // Create a workbook with the worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet 1');

    // Convert the workbook to a binary string
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', bookSST: true, type: 'binary' });

    // Write the binary string to the file
    await fs.writeFile(filePath, excelBuffer, 'binary');

    console.log('File saved successfully:', filePath);
    res.status(200).send('File saved successfully');
  } catch (error) {
    console.error('Error generating Excel file:', error);
    res.status(500).send('Internal Server Error');
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
