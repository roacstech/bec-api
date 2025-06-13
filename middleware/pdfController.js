const puppeteer = require("puppeteer");
const moment = require("moment");
const numberToWords = require("number-to-words");
const _ = require("lodash");
const he = require("he"); // Import the 'he' library to decode HTML entities
const { uploadPDFToS3 } = require("./uploadS3");

function sanitizeHtml(html) {
  if (typeof html !== "string") {
    console.error("Expected a string, but got:", typeof html);
    return ""; // Return an empty string or handle the error as needed
  }
  return html.replace(/<[^>]*>/g, ""); // Remove all HTML and CSS tags
}

function splitIntoSentences(text) {
  if (typeof text !== "string") {
    console.error("Expected a string, but got:", typeof text);
    return []; // Return an empty array or handle the error as needed
  }
  // Remove "Note:-" and "Terms & Conditions:" before splitting into sentences
  const cleanedText = text
    .replace(/^Note:-\s*/i, "")
    .replace(/^Terms & Conditions:\s*/i, "");
  return cleanedText.split(".");
}

function splitIntoTermsSentences(text) {
  if (typeof text !== "string") {
    console.error("Expected a string, but got:", typeof text);
    return []; // Return an empty array or handle the error as needed
  }

  // Decode HTML entities to handle cases like &amp; and others
  const decodedText = he.decode(text);
  console.log("Decoded Text:", decodedText); // Debug log

  // Remove the "Terms & Conditions:" heading and any content that follows it
  const cleanedText = decodedText
    .replace(/^Terms & Conditions:.*?(\d+\))?/i, "")
    .trim();
  console.log("Cleaned Text:", cleanedText); // Debug log

  if (cleanedText === "") {
    console.error("No content left after removing the heading.");
    return []; // Return an empty array if no content remains
  }

  // Split into sentences using sentence delimiters like period, exclamation mark, or question mark
  const sentences = cleanedText
    .split(/[.!?]\s*/)
    .filter((sentence) => sentence.trim() !== "");
  console.log("Sentences:", sentences); // Debug log

  return sentences;
}

module.exports.customerQuotationPDFGeneration = async (props) => {
  const { quotationid, customerid, userid } = props;
  try {
    let foldername = 'quotation';

    const quotationData = await getQuotationData(quotationid);

    const quotationuniqueid = quotationData?.quotationuniqueid;

    const customerdata = await getCustomerData(customerid);

    const userdata = await getUserData(userid);

    const sanitizeHtmlNotes = sanitizeHtml(quotationData.quotationnotes);

    const Notes = splitIntoSentences(sanitizeHtmlNotes);

    const sanitizeHtmlTermsandConditions = sanitizeHtml(
      quotationData.quotationtermsandconditions
    );

    const TermsAndConditions = splitIntoTermsSentences(
      sanitizeHtmlTermsandConditions
    );

    const data = {
      quotationdate: moment(quotationData?.quotationdata).format("YYYY-MM-DD"),
      quotationname: quotationData?.quotationname,
      prepared_by: userdata?.username,
      customer_refrence: customerdata?.customeruniqueid,
      quotationid: quotationData?.quotationuniqueid,
      customername: customerdata?.customername,
      customertrnno: customerdata?.customertrnno,
      customeraddress: quotationData?.quotationto,
      customerid: customerdata?.customertrnno,
      subtotal: quotationData?.totalrate,
      total: quotationData?.totalamount,
      amountwords: convertToWordsWithCapital(quotationData?.totalamount),
      quotationdetails: quotationData?.quotationdetails,
      notes: Notes,
      terms: TermsAndConditions,
    };

    console.log("sanitixeHtl", TermsAndConditions);

    const htmlContent = `
 <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        display: flex;
        justify-content: center; /* Center the container horizontally */
        align-items: center; /* Center the container vertically */
        height: 100vh; /* Full height of the viewport */
        background: white;
      }
      .container {
        width: 700px; /* Set a fixed width for the container */
        background: white;
        display: flex;
        flex-direction: column; /* Stack children vertically */
        position: relative; /* Position relative to allow absolute children */
      }
      .watermark {
        width: auto;
     height: auto;
     opacity: 0.1; /* Adjust transparency */
     position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: -1; /* Keep behind content */
      }
      .content {
        padding: 20px; /* Add padding to the content */
        position: relative; /* Position relative to the container */
        z-index: 1; /* Ensure content is above the watermark */
        display: flex;
        flex-direction: column; /* Stack children vertically */
      }
      .header {
    display: flex;
    justify-content: space-between; /* Space between logo and text */
    align-items: center; /* Center items vertically */
    margin-top: -100px; /* Adjust this value to move the header further down */
    margin-bottom: 10px; /* Space below header */
    width: 100%; /* Ensures the header spans the full width */
    background-color: white; /* Optional: background color for the header */
      }
      .header img {
        width: 539px;
        height: 87px;
      }
      .label,
      .value,
      .title,
      .notes,
      .terms {
        color: #0f0f0f;
        font-size: 10px;
        font-family: Inter;
        font-weight: 400;
        margin: 5px 0; /* Add margin for spacing */
      }
      .label {
        color: #22877f;
        font-weight: 600;
      }
      .title {
        font-size: 14px;
        font-weight: 500;
      }
      .divider {
        border: 0.5px solid #22877f;
        margin: 10px 0; /* Add margin for spacing */
      }
      .quotation-details {
        width: 100%;
        border-collapse: collapse;
        margin-top: 10px;
      }
      .quotation-details th,
      .quotation-details td {
        padding: 8px;
        text-align: left;
      }
      .quotation-details th {
        border-bottom: 2px solid #ddd;
        color: #22877f;
        font-weight: 600;
        font-size: 9px;
      }
    body, .value, .label,  .terms {
    font-family: Arial, sans-serif;
    font-size: 12px;
    line-height: 1.5;
}
    .notes{
     font-family: Arial, sans-serif;
    font-size: 12px;
    line-height: 1.5;
    }
    .quotation-details th, .quotation-details td {
    padding: 6px 8px;
   
    font-size: 14px; /* Match font size */
}
.notes, .terms {
    margin: 10px 0; /* Add spacing */
}
.notes div, .terms div {
    margin-bottom: 5px; /* Space between items */
}
.footer {
    position: relative; /* Make the footer a positioning context */
    padding: 40px 0; /* Padding for footer content */
    text-align: center; /* Center text in footer */
}

    </style>
  </head>
  <body>
    <div class="container">
      <img
        class="watermark"
        src="https://webnox.blr1.digitaloceanspaces.com/rythm_watermark_logo.png"
      />
      <div class="content">
        <div class="header" style="position: relative; display: inline-block">
          <img
            src="https://phpstack-1354028-4979514.cloudwaysapps.com/assets/Rythmlogo01-CvGMMHAq.png"
          />
          <div
            style="
              position: absolute;
              bottom: 10px;
              right: 10px;
              color: #829b44;
              font-size: 10px;
              font-family: Inter;
              font-style: italic;
              font-weight: 600;
            "
          >
            Your technology partner...
          </div>
        </div>

        <div class="divider"></div>

        <div
          style="
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          "
        >
          <!-- Top-left section -->
          <div>
            <div class="label">To:</div>
            <div id="customername" class="value"></div>
            <div id="customerid" class="value"></div>
            <div id="customeraddress" class="value"></div>
          </div>

          <!-- Top-right section -->
          <div
            style="display: flex; flex-direction: column; align-items: flex-end"
          >
            <div class="title">
              Quotation <span id="quotationid" class="value"></span>
            </div>
            <div class="title">
              Quotation Date <span id="quotationdate" class="value"></span>
            </div>
            <div class="title">
              Prepared By <span id="prepared_by" class="value"></span>
            </div>
            <div class="title">
              Customer Reference
              <span id="customer_refrence" class="value"></span>
            </div>
          </div>
        </div>

        <div
          id="quotation-details-container"
          style="
            font-family: Inter;
            font-size: 8px;
            color: black;
            border-top: 1px solid black;
          "
        ></div>

        <div style="border-bottom: 1px solid black">
          <div class="notes">Notes:</div>
          <div id="notes-container" class="notes"></div>
        </div>

        <div
          style="display: flex; flex-direction: column; align-items: flex-end"
        >
          <div
            class="label"
            style="
              border-top: 1px solid black;
              border-bottom: 1px solid black;
              margin-bottom: 25px;
              padding-top: 5px;
              padding-bottom: 5px;
            "
          >
            Subtotal
            <span id="subtotal" class="value" style="margin-left: 50px"></span>
          </div>
          <div class="label" style="margin-top: -20px">
            Total
            <span id="total" class="value" style="margin-left: 50px"></span>
          </div>
        </div>

        <div class="terms">Terms & Conditions:</div>
        <div id="terms-container" class="terms"></div>
        <div class="label">Total amount in words</div>
        <div id="amountwords" class="value"></div>
      </div>

      <div class="divider"></div>
      <div style="font-family: Inter; font-size: 14px; color: black;">
    <p style="text-align: center; margin-top: 0; margin-bottom: 2px;">Tel: +971 4 2642613, &nbsp;&nbsp; Fax: +971 4 26426118, &nbsp;&nbsp; Email: rythmts@emirates.net.ae</p>
    <p style="text-align: center; margin-top: 0; margin-bottom: 0;">Email: info@rythmtechnical.com, &nbsp;&nbsp; Web: www.rythmtechnical.com, P.O. Box: 86153, Dubai - U.A.E.</p>
</div>

    </div>
   
  </body>
</html>

`;

    const pdfDocument = await pdfGeneration(htmlContent, data);

    const uploadS3 = await uploadPDFToS3(pdfDocument, quotationuniqueid, foldername);

    const quoteuploaddata = {
      quotationid: quotationData.quotationid,
      quotationdocument: uploadS3,
    };

    const updateQuoteDocument = await updateQuotationDocument(quoteuploaddata);

    console.log("updateQuoteDocument completed", updateQuoteDocument);
  } catch (error) {
    console.log("customerQuotation middleware", error);
  }
};

module.exports.inspectionReportGeneration = async (props) => {
  const {
    tenantid,
    userid,
    orderheaderid,
    deliveryid,
    visitid,
    visitdetailid,
    tenantstaffid,
    inspectionreporttype,
    inspectiondate,
    inspectiondescription,
    workitems,
    actiontaken,
    workstatus,
    customercomments,
    customersatisfaction,
    technicalsignature,
    authorizesignature,
    reportid,
  } = props;

  try {
    let htmlContent;
    let data = {};
    let pdfDocument;
    let inspectionreportid;
    let uploadS3;
    let uploadData = {};
    let updateDocument;
    let updateReportAgainstStaff;
    let staffInspectionReportData;
    let foldername = 'inspectionreport';

    console.log("props", props.reportid);

    const reportData = await getInspectionReportData(
      reportid,
      inspectionreporttype
    );

    switch (inspectionreporttype) {
      case 1:
        // service inspection report generation
        const orderData = await getOrderData(orderheaderid);

        data = {
          inspection_date: inspectiondate,
          reportid: reportData?.jobinspectionuniqueid,
          actual_job_started_date: orderData?.orderstartdate,
          work_description: inspectiondescription,
          actual_job_end_date: inspectiondate,
          action_taken: actiontaken,
          work_status: workstatus,
          customer_comments: customercomments,
          checkboxStates: customersatisfaction,
          workItems: workitems,
          authorizesignature: authorizesignature,
          technicalsignature: technicalsignature,
        };

        // html content generation for service inspection report
        htmlContent = `
        <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Document</title>
      </head>
      <body>
         <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; max-width: 600px; margin: 20px auto;">
        <img 
          style="width: 700px; height: 150px;" 
          src="https://phpstack-1354028-4979514.cloudwaysapps.com/assets/Rythmlogo01-CvGMMHAq.png" 
          alt="Rythm Logo" 
        />
         <div 
          style="color: black; font-size: 15px; font-family: Inter; font-style: italic; font-weight: 800; white-space: nowrap; margin-top: 10px; margin-left: 700px">
          Your technology partner...
        </div>
       
      </div>
      
            
            <div style="position: relative; color: black; font-size: 25px; font-family: Inter; font-weight: 700; text-decoration: underline; white-space: nowrap; margin: 0px auto; margin-top: -10px; text-align: center;">
              SITE INSPECTION REPORT / SERVICE REPORT
            </div>
      
               <div id="reportid" style="display: flex; align-items: center; justify-content: space-between; width: 265px; height: 35px; font-size: 20px.17px; font-weight: 500; margin: 25px auto; text-align: right; margin-left: 700px;">
            </div>
                <div style="width: 900px; border: 0.46px black solid; margin: 20px auto;"> </div>
            
            <div id="inspection_date" style="display: flex; align-items: center; justify-content: space-between; width: 265px; height: 35px; font-size: 16.17px; font-weight: 500; margin: 20px auto; text-align: right; margin-left: 900px;">
            </div>
            
                 <div style="display: flex; justify-content: space-between; align-items: center; width: 900px; margin: 20px auto;">
              <div style="width: 265px; height: 35px; border: 0.46px black solid; font-size: 15.17px; font-weight: 500;" id="actual-job-started-date"></div>
              <div style="width: 265px; height: 35px; border: 0.46px black solid; font-size: 15.17px; font-weight: 500;" id="actual-job-end-date"></div>
            </div>
            
            <div style="width: 900px; height: 93px; border: 0.46px black solid; margin: 20px auto;">
              Work Description:
            </div>
      
               <!-- Work Items -->
               <div style="width: 900px; height: 450px; border: 0.46px black solid; margin: 20px auto;">
                  <div id="work-items" style="position: relative;"></div>
              </div>
      
              <!-- Action Taken -->
              <div style="width: 900px; height: 93px; border: 0.46px black solid; margin: 20px auto;">
                  <div id="action-taken" style="position: relative;"></div>
              </div>
      
              <!-- Work Status -->
              <div style="width: 900px; height: 93px; border: 0.46px black solid; margin: 20px auto;">
                  <div id="work-status" style="position: relative;"></div>
              </div>
      
      
      
              <!-- Customer Comments  -->
      
              <div style="width: 900px; height: 93px; border: 0.46px black solid; margin: 20px auto;">
                  <div id="customer-comments" style="position: relative;"></div>
                  <div style="width: 590.25px; height: 80px; display: flex; position: relative; justify-content: space-between; align-items: center; margin: 20px auto;">
                <!-- Very Satisfied -->
                <div style="width: 110.92px; height: 50px; display: flex; align-items: center;">
                  <div class="checkbox-very-satisfied" style="width: 14.76px; height: 10.08px; border: 0.46px black solid; cursor: pointer; display: flex; justify-content: center; align-items: center;">
                    <div class="checkmark-very-satisfied" style="width: 10px; height: 10px; display: none; position: relative; border: 0.46px solid black;">
                      <svg class="tick-very-satisfied" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="black" stroke-width="2" style="width: 100%; height: 100%;">
                        <path d="M4 10L8 14L16 6" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                    </div>
                  </div>
                  <div style="margin-left: 8px; color: black; font-size: 15.17px; font-family: Inter; font-weight: 500;">Very Satisfied</div>
                </div>
              
                <!-- Satisfied -->
                <div style="width: 125.43px; height: 50px; display: flex; align-items: center;">
                  <div class="checkbox-satisfied" style="width: 14.76px; height: 10.08px; border: 0.46px black solid; cursor: pointer; display: flex; justify-content: center; align-items: center;">
                    <div class="checkmark-satisfied" style="width: 10px; height: 10px; display: none; position: relative; border: 0.46px solid black;">
                      <svg class="tick-satisfied" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="black" stroke-width="2" style="width: 100%; height: 100%;">
                        <path d="M4 10L8 14L16 6" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                    </div>
                  </div>
                  <div style="margin-left: 8px; color: black; font-size: 15.17px; font-family: Inter; font-weight: 500;">Satisfied</div>
                </div>
              
                <!-- Dissatisfied -->
                <div style="width: 125.53px; height: 50px; display: flex; align-items: center;">
                  <div class="checkbox-dissatisfied" style="width: 14.76px; height: 10.08px; border: 0.46px black solid; cursor: pointer; display: flex; justify-content: center; align-items: center;">
                    <div class="checkmark-dissatisfied" style="width: 10px; height: 10px; display: none; position: relative; border: 0.46px solid black;">
                      <svg class="tick-dissatisfied" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="black" stroke-width="2" style="width: 100%; height: 100%;">
                        <path d="M4 10L8 14L16 6" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                    </div>
                  </div>
                  <div style="margin-left: 8px; color: black; font-size: 15.17px; font-family: Inter; font-weight: 500;">Dissatisfied</div>
                </div>
              
                <!-- Work Completed -->
                <div style="width: 135.30px; height: 50px; display: flex; align-items: center;">
                  <div class="checkbox-completed" style="width: 14.76px; height: 10.08px; border: 0.46px black solid; cursor: pointer; display: flex; justify-content: center; align-items: center;">
                    <div class="checkmark-completed" style="width: 10px; height: 10px; display: none; position: relative; border: 0.46px solid black;">
                      <svg class="tick-completed" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="black" stroke-width="2" style="width: 100%; height: 100%;">
                        <path d="M4 10L8 14L16 6" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                    </div>
                  </div>
                  <div style="margin-left: 8px; color: black; font-size: 15.17px; font-family: Inter; font-weight: 500;">Work Completed</div>
                </div>
              </div>
              </div>
      
              <!-- Signature -->
            <div style="width: 880px; height: 93px; border: 0.46px black solid; margin: 20px auto; display:flex; justify-content: space-between; align-items: center; padding: 10px;">
              <div style="width: 250px; color: black; font-size: 15.17px; font-family: Inter; font-weight: 500; word-wrap: break-word;">
                  <p style="margin: 0;">Rythm Technical</p>
                  <img 
                    src=${technicalsignature} 
                    alt="Signature Logo" 
                    style="width: 60px; height: 30px; margin-top: 5px;" />
                </div>
                <div style="width: 250px; color: black; font-size: 15.17px; font-family: Inter; font-weight: 500; word-wrap: break-word; text-align: right;">
                  <p style="margin: 0;">Authorized Signature</p>
                  <img 
                    src=${authorizesignature} 
                    alt="Signature Logo" 
                    style="width: 66px; height: 30px; margin-top: 5px;" />
                </div>
            </div>
                <div style="width: 900px; border: 0.46px black solid; margin: 20px auto;"> </div>
      
            
            <div style="display:flex; justify-content: space-between;  width: 1000px;  margin: 20px auto;  flex-direction: column; align-items: center; color: black; font-size: 15px; font-family: Inter; font-weight: 500; word-wrap: break-word;">
              <p style="text-align: center; margin-top: 2px; font-size: 15.17px; font-family: Inter; font-weight: 500;">Tel: +971 4 2642613, &nbsp; &nbsp; Fax: +971 4 26426118, &nbsp; &nbsp;  Email: rythmts@emirates.net.ae</p>
              <p style="text-align: center; margin-top: 10px; font-size: 15.17px; font-family: Inter; font-weight: 500;">Email: info@rythmtechnical.com, &nbsp; &nbsp; Web : www.rythmtechnical.com, P.O.Box : 86153, Dubai - U.A.E. &nbsp; &nbsp;  Email: rythmts@emirates.net.ae</p>
          </div>
            
      </body>
      </html>
      `;

        inspectionreportid = reportData?.jobinspectionuniqueid;

        pdfDocument = await inspectionReportPDFGeneration(htmlContent, data);

        uploadS3 = await uploadPDFToS3(pdfDocument, inspectionreportid, foldername);

        uploadData = {
          documenturl: uploadS3,
          inspectionreportid: reportid,
        };

        console.log("uploadData", uploadData);

        updateDocument = await updateInspectionDocument(uploadData);

        console.log("updateQuoteDocument completed", updateDocument);

        staffInspectionReportData = {
          inspectionreporttype,
          orderheaderid,
          deliveryid,
          documenturl: uploadS3
        }
        updateReportAgainstStaff = await inspectionReportAgainstStaff(staffInspectionReportData);

        break;

      case 2:
        const visitData = await getVisitData(visitid);

        // site inspection report generation

        data = {
          inspection_date: inspectiondate,
          reportid: reportData?.siteinspectionuniqueid,
          actual_job_started_date: visitData?.visitstartdate,
          work_description: inspectiondescription,
          actual_job_end_date: visitData?.visitenddate,
          action_taken: actiontaken,
          work_status: workstatus,
          customer_comments: customercomments,
          checkboxStates: customersatisfaction,
          workItems: workitems,
          authorizesignature: authorizesignature,
          technicalsignature: technicalsignature,
        };

        // html content generation for service inspection report
        htmlContent = `
        <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Document</title>
      </head>
      <body>
         <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; max-width: 600px; margin: 20px auto;">
        <img 
          style="width: 700px; height: 150px;" 
          src="https://phpstack-1354028-4979514.cloudwaysapps.com/assets/Rythmlogo01-CvGMMHAq.png" 
          alt="Rythm Logo" 
        />
         <div 
          style="color: black; font-size: 15px; font-family: Inter; font-style: italic; font-weight: 800; white-space: nowrap; margin-top: 10px; margin-left: 700px">
          Your technology partner...
        </div>
       
      </div>
      
            
            <div style="position: relative; color: black; font-size: 25px; font-family: Inter; font-weight: 700; text-decoration: underline; white-space: nowrap; margin: 0px auto; margin-top: -10px; text-align: center;">
              SITE INSPECTION REPORT / SERVICE REPORT
            </div>
      
               <div id="reportid" style="display: flex; align-items: center; justify-content: space-between; width: 265px; height: 35px; font-size: 20px.17px; font-weight: 500; margin: 25px auto; text-align: right; margin-left: 700px;">
            </div>
                <div style="width: 900px; border: 0.46px black solid; margin: 20px auto;"> </div>
            
            <div id="inspection_date" style="display: flex; align-items: center; justify-content: space-between; width: 265px; height: 35px; font-size: 16.17px; font-weight: 500; margin: 20px auto; text-align: right; margin-left: 900px;">
            </div>
            
                 <div style="display: flex; justify-content: space-between; align-items: center; width: 900px; margin: 20px auto;">
              <div style="width: 265px; height: 35px; border: 0.46px black solid; font-size: 15.17px; font-weight: 500;" id="actual-job-started-date"></div>
              <div style="width: 265px; height: 35px; border: 0.46px black solid; font-size: 15.17px; font-weight: 500;" id="actual-job-end-date"></div>
            </div>
            
            <div style="width: 900px; height: 93px; border: 0.46px black solid; margin: 20px auto;">
              Work Description:
            </div>
      
               <!-- Work Items -->
               <div style="width: 900px; height: 450px; border: 0.46px black solid; margin: 20px auto;">
                  <div id="work-items" style="position: relative;"></div>
              </div>
      
              <!-- Action Taken -->
              <div style="width: 900px; height: 93px; border: 0.46px black solid; margin: 20px auto;">
                  <div id="action-taken" style="position: relative;"></div>
              </div>
      
              <!-- Work Status -->
              <div style="width: 900px; height: 93px; border: 0.46px black solid; margin: 20px auto;">
                  <div id="work-status" style="position: relative;"></div>
              </div>
      
      
      
              <!-- Customer Comments  -->
      
              <div style="width: 900px; height: 93px; border: 0.46px black solid; margin: 20px auto;">
                  <div id="customer-comments" style="position: relative;"></div>
                  <div style="width: 590.25px; height: 80px; display: flex; position: relative; justify-content: space-between; align-items: center; margin: 20px auto;">
                <!-- Very Satisfied -->
                <div style="width: 110.92px; height: 50px; display: flex; align-items: center;">
                  <div class="checkbox-very-satisfied" style="width: 14.76px; height: 10.08px; border: 0.46px black solid; cursor: pointer; display: flex; justify-content: center; align-items: center;">
                    <div class="checkmark-very-satisfied" style="width: 10px; height: 10px; display: none; position: relative; border: 0.46px solid black;">
                      <svg class="tick-very-satisfied" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="black" stroke-width="2" style="width: 100%; height: 100%;">
                        <path d="M4 10L8 14L16 6" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                    </div>
                  </div>
                  <div style="margin-left: 8px; color: black; font-size: 15.17px; font-family: Inter; font-weight: 500;">Very Satisfied</div>
                </div>
              
                <!-- Satisfied -->
                <div style="width: 125.43px; height: 50px; display: flex; align-items: center;">
                  <div class="checkbox-satisfied" style="width: 14.76px; height: 10.08px; border: 0.46px black solid; cursor: pointer; display: flex; justify-content: center; align-items: center;">
                    <div class="checkmark-satisfied" style="width: 10px; height: 10px; display: none; position: relative; border: 0.46px solid black;">
                      <svg class="tick-satisfied" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="black" stroke-width="2" style="width: 100%; height: 100%;">
                        <path d="M4 10L8 14L16 6" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                    </div>
                  </div>
                  <div style="margin-left: 8px; color: black; font-size: 15.17px; font-family: Inter; font-weight: 500;">Satisfied</div>
                </div>
              
                <!-- Dissatisfied -->
                <div style="width: 125.53px; height: 50px; display: flex; align-items: center;">
                  <div class="checkbox-dissatisfied" style="width: 14.76px; height: 10.08px; border: 0.46px black solid; cursor: pointer; display: flex; justify-content: center; align-items: center;">
                    <div class="checkmark-dissatisfied" style="width: 10px; height: 10px; display: none; position: relative; border: 0.46px solid black;">
                      <svg class="tick-dissatisfied" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="black" stroke-width="2" style="width: 100%; height: 100%;">
                        <path d="M4 10L8 14L16 6" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                    </div>
                  </div>
                  <div style="margin-left: 8px; color: black; font-size: 15.17px; font-family: Inter; font-weight: 500;">Dissatisfied</div>
                </div>
              
                <!-- Work Completed -->
                <div style="width: 135.30px; height: 50px; display: flex; align-items: center;">
                  <div class="checkbox-completed" style="width: 14.76px; height: 10.08px; border: 0.46px black solid; cursor: pointer; display: flex; justify-content: center; align-items: center;">
                    <div class="checkmark-completed" style="width: 10px; height: 10px; display: none; position: relative; border: 0.46px solid black;">
                      <svg class="tick-completed" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="black" stroke-width="2" style="width: 100%; height: 100%;">
                        <path d="M4 10L8 14L16 6" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                    </div>
                  </div>
                  <div style="margin-left: 8px; color: black; font-size: 15.17px; font-family: Inter; font-weight: 500;">Work Completed</div>
                </div>
              </div>
              </div>
      
              <!-- Signature -->
            <div style="width: 880px; height: 93px; border: 0.46px black solid; margin: 20px auto; display:flex; justify-content: space-between; align-items: center; padding: 10px;">
              <div style="width: 250px; color: black; font-size: 15.17px; font-family: Inter; font-weight: 500; word-wrap: break-word;">
                  <p style="margin: 0;">Rythm Technical</p>
                  <img 
                    src=${technicalsignature} 
                    alt="Signature Logo" 
                    style="width: 60px; height: 30px; margin-top: 5px;" />
                </div>
                <div style="width: 250px; color: black; font-size: 15.17px; font-family: Inter; font-weight: 500; word-wrap: break-word; text-align: right;">
                  <p style="margin: 0;">Authorized Signature</p>
                  <img 
                    src=${authorizesignature} 
                    alt="Signature Logo" 
                    style="width: 66px; height: 30px; margin-top: 5px;" />
                </div>
            </div>
                <div style="width: 900px; border: 0.46px black solid; margin: 20px auto;"> </div>
      
            
            <div style="display:flex; justify-content: space-between;  width: 1000px;  margin: 20px auto;  flex-direction: column; align-items: center; color: black; font-size: 15px; font-family: Inter; font-weight: 500; word-wrap: break-word;">
              <p style="text-align: center; margin-top: 2px; font-size: 15.17px; font-family: Inter; font-weight: 500;">Tel: +971 4 2642613, &nbsp; &nbsp; Fax: +971 4 26426118, &nbsp; &nbsp;  Email: rythmts@emirates.net.ae</p>
              <p style="text-align: center; margin-top: 10px; font-size: 15.17px; font-family: Inter; font-weight: 500;">Email: info@rythmtechnical.com, &nbsp; &nbsp; Web : www.rythmtechnical.com, P.O.Box : 86153, Dubai - U.A.E. &nbsp; &nbsp;  Email: rythmts@emirates.net.ae</p>
          </div>
            
      </body>
      </html>
      `;

        inspectionreportid = reportData?.siteinspectionuniqueid;

        pdfDocument = await inspectionReportPDFGeneration(htmlContent, data);

        uploadS3 = await uploadPDFToS3(pdfDocument, inspectionreportid, foldername);

        uploadData = {
          documenturl: uploadS3,
          inspectionreportid: reportid,
        };

        console.log("uploadData", uploadData);

        updateDocument = await updateInspectionDocument(uploadData);

        console.log("updateQuoteDocument completed", updateDocument);


        staffInspectionReportData = {
          inspectionreporttype,
          visitid,
          visitdetailid,
          documenturl: uploadS3
        }
        updateReportAgainstStaff = await inspectionReportAgainstStaff(staffInspectionReportData);

        break;
    }
  } catch (err) {
    console.log("inspectionReportPDFGeneration Error", err);
  }
};

//number to words first letter must be capital letter conversion
function convertToWordsWithCapital(number) {
  let words = numberToWords.toWords(number);
  return words.charAt(0).toUpperCase() + words.slice(1);
}

//pdf Generation function
const pdfGeneration = async (htmlContent, data) => {
  try {
    // Launch Puppeteer
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Set HTML content
    await page.setContent(htmlContent);

    // Populate the document with data
    await page.evaluate((data) => {
      if (data.quotationdate) {
        document.getElementById(
          "quotationdate"
        ).textContent = ` : ${data.quotationdate}`;
      }

      if (data.prepared_by) {
        document.getElementById(
          "prepared_by"
        ).textContent = `: ${data.prepared_by}`;
      }

      if (data.customer_refrence) {
        document.getElementById(
          "customer_refrence"
        ).textContent = `: ${data.customer_refrence}`;
      }

      if (data.quotationid) {
        document.getElementById(
          "quotationid"
        ).textContent = `: ${data.quotationid}`;
      }

      if (data.customername) {
        document.getElementById(
          "customername"
        ).textContent = `${data.customername}`;
      }

      if (data.customeraddress) {
        document.getElementById(
          "customeraddress"
        ).textContent = `${data.customeraddress}`;
      }

      if (data.customerid) {
        document.getElementById(
          "customerid"
        ).textContent = `${data.customerid}`;
      }

      if (data.subtotal) {
        document.getElementById("subtotal").textContent = `${data.subtotal}`;
      }

      if (data.total) {
        document.getElementById("total").textContent = `${data.total}`;
      }

      if (data.amountwords) {
        document.getElementById(
          "amountwords"
        ).textContent = `${data.amountwords}`;
      }

      let detailsHtml = `
  <table class="quotation-details">
    <thead>
      <tr>
        <th>#</th>
        <th>Description</th>
        <th>Quantity</th>
        <th>Unit Price</th>
        <th>Tax</th>
        <th>Amount</th>
      </tr>
    </thead>
    <tbody>
   <tr>
  <td colspan="6" style="background-color: #ebecf0; color:#8a718e; word-wrap: break-word; white-space: normal;">
    <strong>${data.quotationname}</strong>
  </td>
</tr>

`;

      if (data.quotationdetails) {
        data.quotationdetails.forEach((item, index) => {
          detailsHtml += `
<tr>
  <td>${index + 1}</td>
  <td>${item.quotationdetaildescription}</td>
  <td>${item.quantity}</td>
  <td>${item.rate}</td>
  <td>${item.tax}</td>
  <td>${item.amount}</td>
</tr>
`;
        });
      }

      detailsHtml += `
    </tbody>
  </table>
`;

      document.getElementById("quotation-details-container").innerHTML =
        detailsHtml;

      // Fill Notes Section
      let notesHtml = "";

      if (data.notes && Array.isArray(data.notes)) {
        data.notes.forEach((note, index) => {
          notesHtml += `<div>${note.trim()}</div>`;
        });
        document.getElementById("notes-container").innerHTML = notesHtml;
      }

      // Fill Terms & Conditions Section
      let termsHtml = "";

      if (data.terms && Array.isArray(data.terms)) {
        data.terms.forEach((term, index) => {
          termsHtml += `<div>${term.trim()}</div>`;
        });
        document.getElementById("terms-container").innerHTML = termsHtml;
      }
    }, data);

    // Define PDF options
    const pdfOptions = {
      format: "A4",
      printBackground: true, // Print background styles
    };

    // Generate PDF
    const pdfDocument = await page.pdf(pdfOptions);

    // Close the browser
    await browser.close();

    console.log("PDF generated successfully: quotationNew.pdf");
    return pdfDocument;
  } catch (error) {
    console.error("Error generating PDF:", error);
  }
};

const inspectionReportPDFGeneration = async (htmlContent, data) => {
  try {
    // Launch Puppeteer
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Set HTML content
    await page.setContent(htmlContent);

    // Populate the document with data
    await page.evaluate((data) => {
      const propertyIdElement = document.getElementById("property-id");
      const ReportIdElement = document.getElementById("reportid");

      const inspectionDateElement = document.getElementById("inspection_date");
      const actualJobStartedDateElement = document.getElementById(
        "actual-job-started-date"
      );
      const actualJobEndedDateElement = document.getElementById(
        "actual-job-end-date"
      );
      const workDescriptionElement =
        document.getElementById("work-description");
      const actionTakenElement = document.getElementById("action-taken");
      const workStatusElement = document.getElementById("work-status");
      const customerCommentsElement =
        document.getElementById("customer-comments");

      if (propertyIdElement) propertyIdElement.textContent = data.address;
      if (ReportIdElement)
        ReportIdElement.textContent = `S.No ${data.reportid}`;

      if (inspectionDateElement)
        inspectionDateElement.textContent = `Date: ${data.inspection_date}`;
      if (actualJobStartedDateElement)
        actualJobStartedDateElement.textContent = `Actual job Started Date: ${data.actual_job_started_date}`;
      if (actualJobEndedDateElement)
        actualJobEndedDateElement.textContent = `Actual job End Date: ${data.actual_job_end_date}`;
      if (workDescriptionElement)
        workDescriptionElement.textContent = `Work Description: ${data.work_description}`;
      if (actionTakenElement)
        actionTakenElement.textContent = `ACTION TAKEN: ${data.action_taken}`;
      if (workStatusElement)
        workStatusElement.textContent = `WORK STATUS: ${data.work_status}`;
      if (customerCommentsElement)
        customerCommentsElement.textContent = `CUSTOMER COMMENTS: ${data.customer_comments}`;

      //work-items

      const container = document.getElementById("work-items");
      const baseTop = 35.61; // Starting top position
      const leftPositions = [75, 350.03, 625.05]; // Different columns
      const rowHeight = 90; // Space between rows

      data.workItems.forEach((item, index) => {
        const top = baseTop + Math.floor(index / 3) * rowHeight;
        const left = leftPositions[index % 3];

        const itemContainer = document.createElement("div");
        itemContainer.style.cssText = `
            width: 420.95px;
            height: 150.58px;
            position: absolute;
            left: ${left}px;
            top: ${top}px;
          `;

        const borderBox = document.createElement("div");
        borderBox.style.cssText = `
            width: 170.49px;
            height: 50.58px;
            position: absolute;
            left: 0px;
            top: 0px;
            border: 0.46px black solid;
          `;
        itemContainer.appendChild(borderBox);

        const tickMark = document.createElement("div");
        tickMark.style.cssText = `
            width: 50.03px;
            height: 50.58px;
            position: absolute;
            left: 116.92px;
            top: 0px;
            border: 0.46px black solid;
            text-align: center; /* Center the tick mark */
            line-height: 50.58px; /* Vertically center the tick mark */
            font-size: 15;
          `;
        tickMark.textContent = item.status ? "✔" : ""; // Correctly set the checkmark symbol
        itemContainer.appendChild(tickMark);

        const text = document.createElement("div");
        text.textContent = item.taskcategoryname;
        text.style.cssText = `
            position: absolute;
            color: black;
            font-size: 15.17px;
            font-family: Inter;
            font-weight: 500;
            width: 100px;
            left: 9.08px;
            top: 4px;
          `;
        itemContainer.appendChild(text);

        container.appendChild(itemContainer);
      });

      // Function to set checkbox state based on the JSON
      function setCheckboxStates(states) {
        Object.keys(states).forEach((className) => {
          const isChecked = states[className];
          const checkmark = document.querySelector(`.checkmark-${className}`);
          const tick = document.querySelector(`.tick-${className}`);

          if (isChecked) {
            checkmark.style.display = "block";
            tick.style.display = "block";
          } else {
            checkmark.style.display = "none";
            tick.style.display = "none";
          }
        });
      }

      // Apply the checkbox states
      setCheckboxStates(data.checkboxStates);
    }, data);

    // Define PDF options
    const pdfOptions = {
      format: "A4",
      printBackground: true, // Print background styles
    };

    // Generate PDF
    const pdfDocument = await page.pdf(pdfOptions);

    // Close the browser
    await browser.close();

    console.log("Report PDF generated successfully");
    return pdfDocument;
  } catch (error) {
    console.error("Error generating PDF:", error);
  }
};

// all user data
const getUserData = async (id) => {
  const db = global.dbConnection;
  try {
    const result = await db.transaction(async (trx) => {
      const userdata = await trx("app_users")
        .where({
          "app_users.userid": id,
        })
        .first();
      return userdata ? userdata : null;
    });

    return result;
  } catch (err) {
    console.log("getUserById Err", err);
  }
};

const getCustomerData = async (id) => {
  const db = global.dbConnection;
  try {
    const result = await db.transaction(async (trx) => {
      const customerdata = await trx("customers")
        .leftJoin("app_users", "app_users.userid", "customers.userid")
        .where({
          "customers.customerid": id,
        })
        .first();
      return customerdata ? customerdata : null;
    });

    return result;
  } catch (err) {
    console.log("getCustomer Err", err);
  }
};

const getQuotationData = async (id) => {
  const db = global.dbConnection;

  try {
    const quotationdata = await db("quotation")
      .where({
        quotationid: id,
      })
      .first();

    const quotationdetails = await db("quotationdetails").where({
      quotationid: id,
    });
    quotationdata.quotationdetails = quotationdetails || [];

    // console.log('quotationdata', quotationdata);

    return !_.isEmpty(quotationdata) ? quotationdata : {};
  } catch (error) {
    console.log("errr", error);
  }
};

const getInspectionReportData = async (id, type) => {
  const db = global.dbConnection;
  console.log("id", id, type);

  try {
    const reportdata = await db("inspectionreports")
      .where({
        inspectionreportid: id,
        inspectionreporttype: type,
      })
      .first();

    // console.log('reportdata', reportdata);

    return !_.isEmpty(reportdata) ? reportdata : {};
  } catch (error) {
    console.log("errr", error);
  }
};

const getOrderData = async (id) => {
  const db = global.dbConnection;

  try {
    const orderdata = await db("orders")
      .where({
        orderheaderid: id,
      })
      .first();

    // console.log('reportdata', reportdata);

    return !_.isEmpty(orderdata) ? orderdata : {};
  } catch (error) {
    console.log("errr", error);
  }
};

const getVisitData = async (id) => {
  const db = global.dbConnection;

  try {
    const visitdata = await db("visits")
      .where({
        visitid: id,
      })
      .first();

    // console.log('reportdata', reportdata);

    return !_.isEmpty(visitdata) ? visitdata : {};
  } catch (error) {
    console.log("errr", error);
  }
};

const getWccDocumentData = async (id) => {
  const db = global.dbConnection;

  try {
    const wccdata = await db("wccdocuments")
      .where({
        wccdocumentid: id,
      })
      .first();

    // console.log('wccdata', wccdata);

    return !_.isEmpty(wccdata) ? wccdata : {};
  } catch (error) {
    console.log("errr", error);
  }
};


const getCustomerProjectData = async (id) => {
  const db = global.dbConnection;

  try {
    const projectdata = await db("orderprojects")
    .leftJoin('customerprojects', 'customerprojects.customerprojectid', 'orderprojects.customerprojectid')
      .where({
        "orderprojects.orderheaderid": id,
      })
      .first();

    console.log('projectdata', projectdata);

    return !_.isEmpty(projectdata) ? projectdata : {};
  } catch (error) {
    console.log("errr", error);
  }
};


// document update against report

const updateInspectionDocument = async (props) => {
  const { documenturl, inspectionreportid } = props;
  const db = global.dbConnection;

  try {
    const updateReport = await db("inspectionreports")
      .update({
        reportdocumenturl: documenturl,
      })
      .where({
        inspectionreportid: inspectionreportid,
      });

    return !_.isEmpty(updateReport > 0) ? updateReport > 0 : {};
  } catch (error) {
    console.log("errr", error);
  }
};

const updateQuotationDocument = async (props) => {
  const { quotationdocument, quotationid } = props;
  const db = global.dbConnection;

  try {
    const quotationdata = await db("quotation")
      .update({
        quotationdocumenturl: quotationdocument,
      })
      .where({
        quotationid: quotationid,
      });

    return !_.isEmpty(quotationdata > 0) ? quotationdata > 0 : {};
  } catch (error) {
    console.log("errr", error);
  }
};

const inspectionReportAgainstStaff = async (props) => {
  const {
    inspectionreporttype,
    documenturl,
    visitdetailid,
    visitid,
    orderheaderid,
    deliveryid,
  } = props;
  const db = global.dbConnection;
  try {
    let updatedocument;

    const result = await db.transaction(async (trx) => {
      switch (inspectionreporttype) {
        case 1:
          updatedocument = await trx("deliveries")
            .update({
              deliveryinspectionreportdocumenturl: documenturl
            })
            .where({
              orderheaderid,
              deliveryid,
            });

          return updatedocument > 0 ? updatedocument : {};

        case 2:
          updatedocument = await db("visitdetails")
            .update({
              visitdetailinspectionreportdocumenturl: documenturl,
            })
            .where({
              visitid,
              visitdetailid,
            });
          return updatedocument > 0 ? updatedocument : {};

        default:
          break;
      }
    });
    return result;
  } catch (err) {
    console.log("inspectionReportAgainstStaff Error", err);
  }
};


const updateWCCDocument = async (props) => {
  const { wccdocumenturl, orderheaderid, wccdocumentid } = props;
  const db = global.dbConnection;

  try {

    const updateorderwccfile = await db("orders")
      .update({
        orderwccdocumenturl: wccdocumenturl,
      })
      .where({
        orderheaderid: orderheaderid,
      });

      const updatewccfile = await db('wccdocuments')
      .update({
        wccdocumenturl: wccdocumenturl,
      })
      .where({
        wccdocumentid: wccdocumentid
      })


    return !_.isEmpty(updateorderwccfile > 0) ? updateorderwccfile > 0 : {};
  } catch (error) {
    console.log("errr", error);
  }
};


module.exports.wccPDFContent = async (props) => {
  const { orderheaderid, wccdocumentid } = props;

  try {

    let foldername = 'wcc';

    const orders = await getOrderData(orderheaderid);

    const quotationdata = await getQuotationData(orders?.quotationid);

    const customerdata = await getCustomerData(orders?.customerid);

    const customerprojectdata = await getCustomerProjectData(orders?.orderheaderid);

    // console.log('orders?.customerprojectid', orders?.customerprojectid);
    
    const wccdata = await getWccDocumentData(orders?.wccdocumentid);


    const htmlContent = `
     <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>WCC Document</title>
    <style>
      body {
        margin: 20px;
        padding: 0;
        display: flex;
        justify-content: center; /* Center the container horizontally */
        align-items: center; /* Center the container vertically */
      }
      .container {
        width: 700px; /* Set a fixed width for the container */
        background: white;
        display: flex;
        flex-direction: column; /* Stack children vertically */
        position: relative; /* Position relative to allow absolute children */
      }
      .image1 {
        width: 693px;
        height: 575px;
        position: absolute;
        opacity: 0.3; /* Adjust transparency */

        transform: translate(-35px, 282px);
      }
      .content {
        width: 535px;
        height: 800px;
        position: absolute;
        transform: translate(30px, 21px);
      }
      .header-image {
        width: 600px;
        height: 87px;
        position: absolute;
      }
      .text-container {
        width: 519px;
        height: 628px;
        position: absolute;
        transform: translate(8px, 98px);
      }
      .text {
        position: absolute;
        color: black;
        font-size: 15px;
        font-family: Inter;
        font-weight: 700;
        text-decoration: underline;
        word-wrap: break-word;
      }
      .signature {
        position: absolute;
        color: black;
        font-size: 15px;
        font-family: Inter;
        font-weight: 700;
        word-wrap: break-word;
      }
      .text-small {
        position: absolute;
        color: black;
        width: 400px;
        font-size: 15px;
        font-family: Inter;
        font-weight: 500;
        word-wrap: break-word;
      }
      .certification {
        width: 395px;
        height: 65px;
        padding: 10px;
        position: absolute;
        transform: translate(82px, 415px);
        display: inline-flex;
        justify-content: center;
        align-items: center;
        gap: 10px;
      }
      .completion-date {
        width: 250px;
        height: 35px;
        padding: 10px;
        position: absolute;
        transform: translate(158px, 385px);
        display: inline-flex;
        justify-content: center;
        align-items: center;
        gap: 10px;
      }
      .border {
        width: 600px;
        height: 850px;
        position: absolute;
        border: 1px black solid;
      }
      .footer {
        position: absolute;
        color: black;
        font-size: 12px;
        font-family: Inter;
        font-weight: 400;
        line-height: 16px;
        word-wrap: break-word;
      }
      .footer-line {
        width: 600px;
        height: 0px;
        position: absolute;
        border: 1.5px #58ab1b solid;
      }
      .dotted-line {
        width: 110px;
        height: 0px;
        position: absolute;
        transform: rotate(180deg);
        transform-origin: 0 0;
        border: 0.46px black dotted;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <img class="image1" src="https://webnox.blr1.digitaloceanspaces.com/rythm_watermark_logo.png" />
      <div class="content">
        <img class="header-image" src="https://phpstack-1354028-4979514.cloudwaysapps.com/assets/Rythmlogo01-CvGMMHAq.png" />
        <div class="text-container">
          <div class="text" style="left: 195px; top: 15px">
            WORK COMPLETION CERTIFICATE
          </div>
          <div class="text" style="left: 12px; top: 105px">
            WCC: ${orders?.orderwccid}
          </div>
          <div class="text" style="left: 12px; top: 145px">
            QUOTE TEF#${quotationdata?.quotationuniqueid}
          </div>
          <div class="text" style="left: 12px; top: 185px">
            LPO REF#${quotationdata?.quotationlpoid}
          </div>
          <div class="text" style="left: 12px; top: 225px">
            PROJECT: ${customerprojectdata?.customerprojectname}
          </div>
          <div class="signature" style="left: 65px; top: 650px">Signature</div>
          <div class="signature" style="left: 411px; top: 650px">Signature</div>
          <div class="text-small" style="left: 22px; top: 670px">
            (Rythm Technical services)
          </div>
          <div class="text-small" style="left: 345px; top: 670px">
            ( For ${customerdata?.customername} )
          </div>
          <div class="text-small" style="left: 22px; top: 735px">
            Name: 
          </div>
          <div class="text-small" style="left: 368px; top: 735px">Name</div>
          <div class="text-small" style="left: 22px; top: 765px">
            Date:
          </div>
          <div class="text-small" style="left: 369px; top: 765px">Date</div>
          <div class="certification">
            <div
              style="
                text-align: center;
                color: black;
                font-size: 13px;
                font-family: Inter;
                font-weight: 500;
                word-wrap: break-word;
              "
            >
              This is to certify that above mentioned project’s Supply<br />
              and Placement of Photocell for ${customerprojectdata?.customerprojectname} completed by
              <br />Rythm Technical Services.
            </div>
          </div>
          <div class="completion-date">
            <div
              style="
                text-align: center;
                color: black;
                font-size: 13px;
                font-family: Inter;
                font-weight: 600;
                word-wrap: break-word;
              "
            >
              COMPLETION DATE: ${orders?.orderwccdate}
            </div>
          </div>
          <div class="border"></div>
        </div>
        <div class="footer" style="left: 82px; top: 990px">
          P.O. BOX: 86153, DUBAI, U.A.E., TEL: +971-4 -2642613, FAX:
          +971-4-2642618.
        </div>
        <div class="footer" style="left: 46px; top: 1005px">
          Email: rythmtechnical@gmail.com&info@rythmtechnical.com ; Web:
          www.rythmtechnical.com
        </div>
        <div class="footer-line" style="left: 5px; top: 980px"></div>
      </div>
      <div class="dotted-line" style="left: 565px; top: 870px"></div>
      <div class="dotted-line" style="left: 565px; top: 900px"></div>
    </div>
  </body>
</html>
`;

    const wccPDF = await wccPDFGeneration(htmlContent);

    const uploadS3 = await uploadPDFToS3(wccPDF, orders?.orderwccid, foldername);
    

    const wccuploaddata = {
      wccdocumenturl: uploadS3,
      orderheaderid,
      wccdocumentid
    };

    const updateWCCDoc = await updateWCCDocument(wccuploaddata);

  
  } catch (err) {
    console.log('wccPDFContent Error', err);

  }
}


const wccPDFGeneration = async (htmlContent) => {
  try {
    // Launch Puppeteer
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Set HTML content
    await page.setContent(htmlContent);

    // Define PDF options
    const pdfOptions = {
      format: "A4",
      printBackground: true, // Print background styles
    };

    // Generate PDF
    const pdfDocument = await page.pdf(pdfOptions);

    // Close the browser
    await browser.close();

    console.log("WCC PDF generated successfully");
    return pdfDocument;
  } catch (error) {
    console.error("Error generating PDF:", error);
  }
};

