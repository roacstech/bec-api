const _ = require('lodash');

module.exports.getCurrency = async (props) => {
    const { tenantid } = props;
    const db = global.dbConnection;
    try {

        const result = await db.transaction(async (trx) => {
            const response = await trx('currency')
                .where({
                    tenantid
                })
            if (!_.isEmpty(response)) {
                return {
                    code: 200,
                    status: true,
                    message: "Data retrieved successful",
                    response: response
                }
            }

            if (_.isEmpty(response)) {
                return {
                    code: 200,
                    status: true,
                    message: "No data retrieved",
                    response: []
                }
            }
        });
        return result;

    } catch (err) {
        console.log('err', err);
        return {
            code: 200,
            status: false,
            message: "Failed to retrieve currency"
        }
    }
}