const _ = require("lodash");
const jwt = require("jsonwebtoken");
const moment = require("moment");
const pdfController = require('../middleware/pdfController');



// Initialize the Firebase Admin SDK

module.exports.pdfGenerationMiddleWare = async (req, res, next) => {
    try {
        const fullendpoint = req.originalUrl.replace(
            /^\/api\/[^\/]+\/v1\/dev\//,
            ""
        );
        const mainendpoint = fullendpoint.split("/")[0];
        const subendpoint = fullendpoint.split("/")[1];

        // Capture the response object for processing
        const originalSend = res.send;
        let responseObject;

        res.send = function (body) {
            try {
                responseObject = typeof body === "string" ? JSON.parse(body) : body;
            } catch (e) {
                responseObject = body;
            }
            return originalSend.apply(res, arguments);
        };

        res.on("finish", async () => {



            try {
                if (responseObject?.status) {
                    // console.log("fullendpoint:", fullendpoint);
                    // console.log("mainendpoint:", mainendpoint);
                    // console.log("subendpoint:", subendpoint);

                    switch (mainendpoint) {
                        case "quotation":
                            if (subendpoint === "createQuotation") {

                                await pdfController.customerQuotationPDFGeneration(responseObject?.quotedata);

                            }
                            if (subendpoint === "editQuotation") {
                                console.log('pdf GenerationMiddleWare editQuotation');

                                await pdfController.customerQuotationPDFGeneration(responseObject?.quotedata);

                            }
                            if (subendpoint === "sendQuotationToCustomer") {

                            }
                            if (subendpoint === "quotationApproval") {

                            }
                            break;

                        case "jobs":
                            if (subendpoint === "inspectionReportByStaff") {
                                // console.log('responseObject?.reportdata', responseObject?.reportdata);

                                await pdfController.inspectionReportGeneration(responseObject?.reportdata);

                            }

                        case "wcc":
                            if (subendpoint === "generateWCCDocument") {
                                console.log('responseObject?.reportdata', responseObject?.reportdata, "generateWCCDocument");

                                await pdfController.wccPDFContent(responseObject?.reportdata);

                            }
                        default:
                            break;
                    }
                }


            } catch (err) {
                console.error("Error in notification middleware:", err);
            }
        });
    } catch (err) {
        console.error("Error in notification middleware:", err);
        return res.status(500).json({ message: "Internal Server Error" });
    }

    // Proceed to the next middleware or route handler
    next();
};
