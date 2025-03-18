const express = require('express');
const fs = require('fs');
const csvParser = require('csv-parser');
const app = express();

const FILE_PATH = 'LE.txt';

let data = [];

// Read and parse the CSV file
fs.createReadStream(FILE_PATH)
  .pipe(csvParser({ separator: '\t' })) // Use tab separator for columns
  .on('data', (row) => {
    // Log each row for debugging purposes
    console.log('Row:', row);
    
    // Assume columns are in the following order:
    // Serial, Name, ..., Price (tab-separated)
    const serial = row['0'] || '';  // Serial number - first column
    const name = row['1'] || '';    // Name - second column
    let price = row['8'] || '';     // Price - ninth column

    // Replace commas in price with dots (for decimal values)
    price = price.replace(',', '.');

    // Add to the data array
    data.push({ serial, name, price });
  })
  .on('end', () => {
    console.log(`CSV Loaded with ${data.length} rows.`);
    app.listen(3000, () => {
      console.log('Server is running at http://localhost:3000');
    });
  })
  .on('error', (error) => {
    console.error('Error reading CSV file:', error);
  });

// Filter data based on query params (name, serial)
function filterData({ name, serial }) {
  let filteredData = data;

  if (name) {
    filteredData = filteredData.filter((item) => {
      return item.name.toLowerCase().includes(name.toLowerCase());
    });
  }

  if (serial) {
    filteredData = filteredData.filter(
      (item) => item.serial === serial
    );
  }

  return filteredData;
}

// Sort data by a specific field (price, name, etc.)
function sortData(data, sortBy, order = 'asc') {
  if (sortBy && data[0].hasOwnProperty(sortBy)) {
    return data.sort((a, b) => {
      let valueA = a[sortBy];
      let valueB = b[sortBy];

      if (sortBy === 'price') {
        valueA = parseFloat(valueA);
        valueB = parseFloat(valueB);
      }

      if (order === 'asc') {
        return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
      } else {
        return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
      }
    });
  }
  return data;
}

// Paginate data based on page number and items per page
function paginateData(data, page, perPage) {
  const start = (page - 1) * perPage;
  const end = start + perPage;
  return data.slice(start, end);
}

// API endpoint to get the spare parts data
app.get('/parts', (req, res) => {
  const { name, serial, sort, order = 'asc', page = 1, perPage = 30 } = req.query;

  // Parse query parameters safely
  const pageNum = Math.max(parseInt(page), 1);
  const perPageNum = Math.max(Math.min(parseInt(perPage), 100), 1);

  // Filter data based on name and serial
  let filteredData = filterData({ name, serial });

  // Sort data based on the query
  filteredData = sortData(filteredData, sort, order);

  // Paginate the data
  const paginatedData = paginateData(filteredData, pageNum, perPageNum);

  // Send the response as JSON
  res.json({
    total: filteredData.length,
    page: pageNum,
    perPage: perPageNum,
    results: paginatedData,
  });
});










