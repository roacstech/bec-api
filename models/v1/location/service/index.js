const _ = require("lodash");


module.exports.getCountries = async (props) => {
  const { countryid } = props
  const db = global.dbConnection;
  try {
    const result = db.transaction(async (trx) => {
      let country = trx('countries')
        .select(
          '*'
        )

      if (countryid) {
        country = country.where({
          countryid: countryid
        })
      }
      const response = await country;
      

      if (!_.isEmpty(response)) {
        return {
          code: 200,
          status: true,
          message: 'Successfully fetched countries data',
          response: response
        }
      }
      if (_.isEmpty(response)) {
        return {
          code: 200,
          status: true,
          message: 'No countries data fetched',
          response: []
        }
      }
    })
    return result;
  } catch (err) {
    console.log(err);
    return {
      code: 200,
      status: false,
      message: 'Failed to fetch countries data',
      response: []
    }
  }
};

module.exports.getAllCountries = async (props) => {
  // const { countryid } = props
  const db = global.dbConnection;
  try {
    const result = db.transaction(async (trx) => {
      let country = trx('country_names_only')
        .select(
          '*'
        )

      // if (countryid) {
      //   country = country.where({
      //     countryid: countryid
      //   })
      // }
      const response = await country;
      

      if (!_.isEmpty(response)) {
        return {
          code: 200,
          status: true,
          message: 'Successfully fetched countries data',
          response: response
        }
      }
      if (_.isEmpty(response)) {
        return {
          code: 200,
          status: true,
          message: 'No countries data fetched',
          response: []
        }
      }
    })
    return result;
  } catch (err) {
    console.log(err);
    return {
      code: 200,
      status: false,
      message: 'Failed to fetch countries data',
      response: []
    }
  }
};

module.exports.getStates = async (props) => {
  const { countryid } = props
  const db = global.dbConnection;
  try {
    const result = db.transaction(async (trx) => {
      let state = trx('states')
        .select(
          '*'
        )

      if (countryid) {
        state = state.where({
          country_id: countryid
        })
      }
      const response = await state;

      if (!_.isEmpty(response)) {
        return {
          code: 200,
          status: true,
          message: 'Successfully fetched states data',
          response: response
        }
      }
      if (_.isEmpty(response)) {
        return {
          code: 200,
          status: true,
          message: 'No states data fetched',
          response: []
        }
      }
    })
    return result;
  } catch (err) {
    console.log(err);
    return {
      code: 200,
      status: false,
      message: 'Failed to fetch states data',
      response: []
    }
  }
};

module.exports.getCities = async (props) => {
  const { countryid, stateid } = props
  const db = global.dbConnection;
  try {
    const result = db.transaction(async (trx) => {
      let city = trx('cities')
        .select(
          '*'
        )

      if (countryid && stateid) {
        city = city.where({
          country_id: countryid,
          state_id: stateid
        })
      }
      const response = await city;

      if (!_.isEmpty(response)) {
        return {
          code: 200,
          status: true,
          message: 'Successfully fetched cities data',
          response: response
        }
      }
      if (_.isEmpty(response)) {
        return {
          code: 200,
          status: true,
          message: 'No cities data fetched',
          response: []
        }
      }
    })
    return result;
  } catch (err) {
    console.log(err);
    return {
      code: 200,
      status: false,
      message: 'Failed to fetch cities data',
      response: []
    }
  }
};



