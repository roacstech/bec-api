const axios = require('axios');
const mysql = require('mysql2');

// ✅ MySQL connection setup
const connection = mysql.createConnection({
  host: '147.93.30.32',
  port: 3306,
  user: 'root',
  password: 'c7d415fd5addf27b5c48',
  database: 'becdb',
});

// ✅ Drop and create new table
const dropTableQuery = `DROP TABLE IF EXISTS country_names_only`;
const createTableQuery = `
  CREATE TABLE country_names_only (
    id INT AUTO_INCREMENT PRIMARY KEY,
    country_name VARCHAR(100)
  )
`;

connection.query(dropTableQuery, (err) => {
  if (err) {
    console.error('❌ Error dropping table:', err.message);
    return;
  }

  connection.query(createTableQuery, (err) => {
    if (err) {
      console.error('❌ Error creating table:', err.message);
      return;
    }

    console.log('✅ Table "country_names_only" created.');

    // ✅ Fetch and insert country names
    axios
      .get('https://restcountries.com/v3.1/all')
      .then((res) => {
        const insertQuery = `INSERT INTO country_names_only (country_name) VALUES (?)`;

        res.data.forEach((country) => {
          const name = country.name?.common || null;

          if (name) {
            connection.query(insertQuery, [name], (err) => {
              if (err) {
                console.error(`❌ Insert failed for [${name}]:`, err.message);
              }
            });
          }
        });

        console.log('✅ Country names inserted successfully.');
      })
      .catch((err) => {
        console.error('❌ Error fetching countries:', err.message);
      });
  });
});
