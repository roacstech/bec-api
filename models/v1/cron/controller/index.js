const cron = require('node-cron');
const moment = require('moment');
const knex = require('knex');
const emailController = require('../../email/controller/index');
const { expDateToAdmin } = require('../../../../mail/mailService');
const { sendNotifcation } = require('../../notification/controller');
const notificationController = require('../../notification/controller/index');

// Initialize the global connection (if required globally)
global.dbConnection = knex({
    client: "mysql2",
    connection: {
        host: '143.110.248.227',
        user: 'meyeyajzma',
        password: 'R2uT8Pt6Bh',
        database: 'meyeyajzma',
    },
    debug: false
});

module.exports.emirateExpNotification = async () => {
    const db = global.dbConnection;

    console.log("Starting emirateExpNotification process...");

    try {
        // Fetch tenant staff details
        const tenantStaffDetails = await db('tenantstaffs').select(
            'tenantstaffs.visaexpdate',
            'tenantstaffs.visanumber',
            'tenantstaffs.labourcontractexpdate',
            'tenantstaffs.email',
            'tenantstaffs.tenantstaffname',
            'tenantstaffs.tenantstaffid',
            'tenantstaffs.contact'
        );

        // Fetch tenant information
        const gettenant = await db('tenants').where({ tenantid: 1 }).first();

        // Fetch super admin users
        const superAdminUsers = await db('app_users').where({
            roleid: 1,
            tenantid: 1,
        });

        if (!tenantStaffDetails.length) {
            console.log('No visas found for scheduling notifications.');
            return;
        }

        // Function to send notifications
        const sendNotification = async () => {
            for (const staff of tenantStaffDetails) {
                const { visaexpdate, visanumber, email, tenantstaffname, labourcontractexpdate } = staff;

                // Notification intervals (visa expiration)
                const intervals = [
                    { label: '1 month', date: moment(visaexpdate).subtract(1, 'month').toDate() },
                    { label: '15 days', date: moment(visaexpdate).subtract(15, 'days').toDate() },
                    { label: '1 week', date: moment(visaexpdate).subtract(1, 'week').toDate() },
                    { label: '1 day', date: moment(visaexpdate).subtract(1, 'day').toDate() },
                ];

                // Labour contract intervals
                const contractInterval = [
                    { label: '1 month', date: moment(labourcontractexpdate).subtract(1, 'month').toDate() },
                    { label: '15 days', date: moment(labourcontractexpdate).subtract(15, 'days').toDate() },
                    { label: '1 week', date: moment(labourcontractexpdate).subtract(1, 'week').toDate() },
                    { label: '1 day', date: moment(labourcontractexpdate).subtract(1, 'day').toDate() },
                ];


                // Check if today's date matches the visa expiration date
                for (const interval of intervals) {
                    const today = moment().startOf('day').toDate();
                    const targetDate = moment(interval.date).startOf('day').toDate();
// console.log('interval', today);


                    if (moment(today).isSame(targetDate, 'day')) {
                        try {
                            
                            // Notify all super admin users
                            const notificationPromises = superAdminUsers.map(async (user) => {
                                try {
                                    // Generate the email content for the notification
                                    const visaExpMail = await expDateToAdmin({
                                        ...staff,
                                        gettenant,
                                        title: 'Emirate',
                                        interval: interval.label,
                                    });

                                    // console.log('user.userid', user.userid);
                                    

                                   

                                    // Send the email
                                    await emailController.sendAdminEmail({
                                        to: user.authname,
                                        subject: visaExpMail.subject,
                                        html: visaExpMail.html,
                                        tenantid: 1,
                                    });

                                    await notificationController.expiryNotification({
                                        title: `Emirate - ${tenantstaffname} - ${interval.label} before visa expiration`,
                                        body: `Visa expiration date is approaching for ${tenantstaffname}.`,
                                        userid: user.userid
                                    });
                                   
                                    


                                    console.log(`Notification sent to ${user.authname} for ${tenantstaffname} (${email}) - ${interval.label}`);
                                } catch (error) {
                                    console.error(`Failed to send email to ${user.authname} for ${tenantstaffname} (${email}):`, error);
                                }
                            });

                            await Promise.all(notificationPromises);
                        } catch (error) {
                            console.error(`Failed to send email for ${tenantstaffname} (${email}):`, error);
                        }
                    }
                }

                // Similarly check for labour contract expiration
                for (const interval of contractInterval) {
                    const today = moment().startOf('day').toDate();
                    const targetDate = moment(interval.date).startOf('day').toDate();

                    if (moment(today).isSame(targetDate, 'day')) {
                        try {
                            // Notify all super admin users for contract expiration
                            const notificationPromises = superAdminUsers.map(async (user) => {
                                try {
                                    const visaExpMail = await expDateToAdmin({
                                        ...staff,
                                        gettenant,
                                        title: 'Labour Contract',
                                        interval: interval.label,
                                    });

                                    await emailController.sendAdminEmail({
                                        to: user.authname,
                                        subject: visaExpMail.subject,
                                        html: visaExpMail.html,
                                        tenantid: 1,
                                    });

                                    await notificationController.expiryNotification({
                                        title: `Emirate - ${tenantstaffname} - ${interval.label} before contract expiration`,
                                        body: `Contract expiration date is approaching for ${tenantstaffname}.`,
                                        userid: user.userid
                                    });

                                    console.log(`Notification sent to ${user.authname} for ${tenantstaffname} (${email}) - ${interval.label}`);
                                } catch (error) {
                                    console.error(`Failed to send email to ${user.authname} for ${tenantstaffname} (${email}):`, error);
                                }
                            });

                            await Promise.all(notificationPromises);
                        } catch (error) {
                            console.error(`Failed to send email for ${tenantstaffname} (${email}):`, error);
                        }
                    }
                }
            }
        };

        cron.schedule('0 0 * * *', async () => {
            console.log("Running every second...");
            await sendNotification(); // Call the function to execute the logic
        });
        
        

        console.log('Daily check set to run at 12:00 AM every day.');

    } catch (error) {
        console.error('Error during emirateExpNotification execution:', error);
    }
};

// Invoke the function once at startup
// this.emirateExpNotification();


