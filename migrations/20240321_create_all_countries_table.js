exports.up = function (knex) {
  return knex.schema.createTable('all_countries', function (table) {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('code', 2).notNullable();
    table.string('phone_code').nullable();
    table.string('currency').nullable();
    table.string('currency_symbol').nullable();
    table.string('region').nullable();
    table.string('subregion').nullable();
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('all_countries');
};
