const { generateKeyPairSync } = require("crypto");
const fs = require("fs");

// Generate RSA key pair
const { privateKey, publicKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048, // Key size
  publicKeyEncoding: {
    type: "spki",
    format: "pem",
  },
  privateKeyEncoding: {
    type: "pkcs8",
    format: "pem",
  },
});

// Save keys to files
fs.writeFileSync("private.key", privateKey);
fs.writeFileSync("public.key", publicKey);

console.log("✅ RSA key pair generated successfully!");
