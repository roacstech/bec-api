const AWS = require("aws-sdk");
const puppeteer = require("puppeteer");

module.exports.pdfGeneration = async (contractHtml) => {
  try {
    // Launch Puppeteer
    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      headless: true,
    });
    const page = await browser.newPage();

    // Set the HTML content
    await page.setContent(contractHtml, { waitUntil: "networkidle0" });

    // Generate and save the PDF
    const pdfDocument = await page.pdf({ format: "Letter" });

    // Close Puppeteer
    await browser.close();

    return pdfDocument;
  } catch (err) {
    console.log("pdfGeneration", err);
  }
};

module.exports.uploadPDFToS3 = async (
  pdfdocument,
  pdfdocumentid,
  foldername
) => {
  try {
    const folderName = `One_Touch_API/${foldername}`;
    const S3_BUCKET = process.env.BUCKET_NAME;
    const REGION = process.env.REGION;
    const ACCESS_KEY = process.env.ACCESS_KEY;
    const SECRET_ACCESS_KEY = process.env.SECRET_ACCESS_KEY;

    if (!S3_BUCKET || !REGION || !ACCESS_KEY || !SECRET_ACCESS_KEY) {
      throw new Error("Missing required environment variables for S3 upload.");
    }

    const s3 = new AWS.S3({
      accessKeyId: ACCESS_KEY,
      secretAccessKey: SECRET_ACCESS_KEY,
      region: REGION,
      // endpoint: `https://${REGION}.digitaloceanspaces.com`,
    });

    if (!pdfdocument) {
      console.error("No file selected for upload.");
      return null;
    }

    const params = {
      Bucket: S3_BUCKET,
      Key: `${folderName}/${pdfdocumentid}.pdf`,
      Body: pdfdocument,
      ACL: "public-read",
      ContentType: "application/pdf",
    };

    const data = await s3.upload(params).promise();
    console.log("PDF uploaded successfully:", data.Location);
    return data.Location;
  } catch (error) {
    console.error("Error uploading PDF:", error);
    throw error;
  }
};
