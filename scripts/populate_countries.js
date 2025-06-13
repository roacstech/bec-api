const fs = require('fs');
const csv = require('csv-parser');
const knex = require('knex');
const knexConfig = require('../utils/knexfile');

const db = knex(knexConfig.OTDEV);

async function populateCountries() {
  try {
    // Clear existing data
    await db('all_countries').del();

    const results = [];

    // Read CSV file
    fs.createReadStream('countries.csv')
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
          // Insert data in batches of 100
          for (let i = 0; i < results.length; i += 100) {
            const batch = results.slice(i, i + 100).map((country) => ({
              name: country.name,
              code: country.code,
              phone_code: country.phone_code,
              currency: country.currency,
              currency_symbol: country.currency_symbol,
              region: country.region,
              subregion: country.subregion,
              created_at: new Date(),
              updated_at: new Date(),
            }));

            await db('all_countries').insert(batch);
            console.log(`Inserted ${batch.length} countries`);
          }

          console.log('Successfully populated countries table');
          process.exit(0);
        } catch (error) {
          console.error('Error inserting data:', error);
          process.exit(1);
        }
      });
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

populateCountries();
