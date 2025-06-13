const _ = require("lodash");
const jwt = require("jsonwebtoken");

module.exports.counts = async (props) => {
  const { tenantid, userid } = props;
  const db = global.dbConnection;

  try {
    const result = await db.transaction(async (trx) => {
      // Get the total count of leads
      const [leadCount] = await trx("leads")
        .count("leadid as totalLeads");

      // Get the total count of site visits
      const [siteVisitedCount] = await trx("leaddeliveries")
        .count("leadid as totalSiteVisited");

      // Get the total count of staff
      const [staffCount] = await trx("tenantstaffs")
        .count("* as totalStaffCount");

      const [customerCount] = await trx("products")
        .count("* as totalCustomerCount");

      // Return the counts
      return {
        totalLeads: leadCount.totalLeads || 0,       // Fallback to 0 if undefined
        totalSiteVisited: siteVisitedCount.totalSiteVisited || 0, // Fallback to 0
        totalStaffCount: staffCount.totalStaffCount || 0,  // Fallback to 0
        totalCustomerCount: customerCount.totalCustomerCount || 0,  // Fallback to 0
      };
    });

    return result;
  } catch (err) {
    console.error("Error fetching counts:", err);

    // Return fallback values in case of an error
    return {
      totalLeads: 0,
      totalSiteVisited: 0,
      totalStaffCount: 0,
    };
  }
};

module.exports.customercard = async (props) => {
  const { tenantid } = props;
  const db = global.dbConnection;

  const calculatePercentageIncrease = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const calculatePercentage = (count, total) =>
    total > 0 ? ((count / total) * 100).toFixed(2) : "0.00";

  try {
    const result = await db.transaction(async (trx) => {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1; // 1-based month
      const currentYear = currentDate.getFullYear();
      const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();

      const fetchCounts = async (table, dateField, idField) => {
        const [{ count: totalCount }] = await trx(table)
          .where({ tenantid })
          .count({ count: idField });

        const [{ count: currentMonthCount }] = await trx(table)
          .where({ tenantid })
          .andWhereRaw(`MONTH(${dateField}) = ? AND YEAR(${dateField}) = ?`, [currentMonth, currentYear])
          .count({ count: idField });

        const [{ count: previousMonthCount }] = await trx(table)
          .where({ tenantid })
          .andWhereRaw(
            `MONTH(${dateField}) = MONTH(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH)) 
             AND YEAR(${dateField}) = YEAR(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH))`
          )
          .count({ count: idField });

        const dailyCounts = await trx(table)
          .select(
            trx.raw(`DAY(${dateField}) as day`),
            trx.raw(`COUNT(${idField}) as count`)
          )
          .whereRaw(`MONTH(${dateField}) = ? AND YEAR(${dateField}) = ?`, [currentMonth, currentYear])
          .groupByRaw(`DAY(${dateField})`)
          .orderByRaw(`DAY(${dateField})`);

        const seriesData = Array(daysInMonth).fill(0);
        dailyCounts.forEach(({ day, count }) => {
          seriesData[day - 1] = count;
        });

        return {
          totalCount: parseInt(totalCount, 10) || 0,
          currentMonthCount: parseInt(currentMonthCount, 10) || 0,
          previousMonthCount: parseInt(previousMonthCount, 10) || 0,
          seriesData,
        };
      };

      // Fetch data for customers, service requests, and orders
      const customerData = await fetchCounts("customers", "created", "customerid");
      const serviceRequestData = await fetchCounts(
        "customerservicerequest",
        "requestvisitdate",
        "customerservicerequestid"
      );
      const orderData = await fetchCounts("orders", "orderstartdate", "orderheaderid");

      // Calculate percentage increases
      const customerPercentage = calculatePercentageIncrease(
        customerData.currentMonthCount,
        customerData.previousMonthCount
      );
      const serviceRequestPercentage = calculatePercentageIncrease(
        serviceRequestData.currentMonthCount,
        serviceRequestData.previousMonthCount
      );
      const orderPercentage = calculatePercentageIncrease(
        orderData.currentMonthCount,
        orderData.previousMonthCount
      );

      // Fetch total and categorized orders
      const totalOrders = await trx("orders").where({ tenantid }).count("* as count").first().then((res) => res.count || 0);

      const getCount = async (statusId) => {
        const result = await trx("orders")
          .where({ tenantid, orderstatusid: statusId })
          .count("* as count")
          .first();
        return result ? result.count : 0;
      };

      const orderStatuses = ["pending", "assigned", "started", "completed", "notSolved", "wcc", "grn", "invoice", "payment"];
      const orderCounts = await Promise.all(orderStatuses.map((_, index) => getCount(index + 1)));

      const notStarted = await trx("orders")
        .where({ tenantid })
        .whereRaw("DATE(orderstartdate) <= ?", [currentDate])
        .whereNot("orders.orderstatusid", ">=", 3)
        .count("* as count")
        .first()
        .then((res) => res.count || 0);

      return {
        customer: {
          totalCount: customerData.totalCount,
          percentageIncrease: parseFloat(customerPercentage.toFixed(2)),
          isLoss: customerData.currentMonthCount < customerData.previousMonthCount,
          seriesData: customerData.seriesData,
        },
        servicerequest: {
          totalCount: serviceRequestData.totalCount,
          percentageIncrease: parseFloat(serviceRequestPercentage.toFixed(2)),
          isLoss: serviceRequestData.currentMonthCount < serviceRequestData.previousMonthCount,
          seriesData: serviceRequestData.seriesData,
        },
        orders: {
          totalCount: orderData.totalCount,
          percentageIncrease: parseFloat(orderPercentage.toFixed(2)),
          isLoss: orderData.currentMonthCount < orderData.previousMonthCount,
          seriesData: orderData.seriesData,
        },
        orderpercentage: {
          totalOrders,
          percentages: orderStatuses.reduce((acc, status, index) => {
            acc[status] = calculatePercentage(orderCounts[index], totalOrders);
            return acc;
          }, {}),
          notStarted: calculatePercentage(notStarted, totalOrders),
        },
      };
    });

    return result;
  } catch (err) {
    console.error("Error fetching customer card data:", err);

    const fallbackData = {
      totalCount: 0,
      percentageIncrease: 0,
      isLoss: false,
      seriesData: Array(31).fill(0),
    };

    return {
      customer: fallbackData,
      servicerequest: fallbackData,
      orders: fallbackData,
      orderpercentage: {
        totalOrders: 0,
        percentages: {
          pending: "0.00",
          assigned: "0.00",
          started: "0.00",
          completed: "0.00",
          notSolved: "0.00",
          wcc: "0.00",
          grn: "0.00",
          invoice: "0.00",
          payment: "0.00",
          notStarted: "0.00",
        },
      },
    };
  }
};


module.exports.getServiceRequestInsights = async (props) => {
  const { tenantid } = props;
  const db = global.dbConnection;

  try {
    const result = await db.transaction(async (trx) => {
      const currentDate = moment().format("YYYY-MM-DD");

      const allOrders = await trx('orders').where({ tenantid: tenantid });
      const totalOrders = allOrders.length;

      const getCount = async (statusId) => {
        return await trx('orders')
          .where({ tenantid: tenantid, orderstatusid: statusId })
          .count('* as count')
          .first();
      };

      const pending = await getCount(1);
      const assigned = await getCount(2);
      const started = await getCount(3);
      const completed = await getCount(4);
      const notSolved = await getCount(5);
      const wcc = await getCount(6);
      const grn = await getCount(7);
      const invoice = await getCount(8);
      const payment = await getCount(9);

      const notStarted = await trx('orders')
        .where({ tenantid: tenantid })
        .whereRaw("DATE(orderstartdate) <= ?", [currentDate])
        .whereNot("orders.orderstatusid", ">=", 3)
        .count('* as count')
        .first();

      // Helper function to calculate percentages
      const calculatePercentage = (count) =>
        totalOrders > 0 ? ((count / totalOrders) * 100).toFixed(2) : "0.00";

      return {
        code: 200,
        status: true,
        message: "Data fetched",
        response: {
          totalOrders,
          percentages: {
            pending: calculatePercentage(pending.count),
            assigned: calculatePercentage(assigned.count),
            started: calculatePercentage(started.count),
            completed: calculatePercentage(completed.count),
            notSolved: calculatePercentage(notSolved.count),
            wcc: calculatePercentage(wcc.count),
            grn: calculatePercentage(grn.count),
            invoice: calculatePercentage(invoice.count),
            payment: calculatePercentage(payment.count),
            notStarted: calculatePercentage(notStarted.count),
          },
          counts: {
            pending: pending.count,
            assigned: assigned.count,
            started: started.count,
            completed: completed.count,
            notSolved: notSolved.count,
            wcc: wcc.count,
            grn: grn.count,
            invoice: invoice.count,
            payment: payment.count,
            notStarted: notStarted.count,
          },
        },
      };
    });

    return result;
  } catch (err) {
    console.error("Error in getServiceRequestInsights:", err);
    return {
      code: 500,
      status: false,
      message: "An error occurred",
      response: null,
    };
  }
};




