const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const storage = admin.storage();

exports.getPdfAsArrayBuffer = functions.https.onCall(async (data, context) => {
  console.log("=== FUNCTION DEBUG START ===");
  console.log("Received data keys:", Object.keys(data || {}));
  console.log("Data type:", typeof data);
  
  let filePath = data?.filePath;
  console.log("FilePath:", filePath);

  if (!filePath) {
    console.error("ERROR: No filePath found");
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The function must be called with one argument 'filePath'."
    );
  }

  try {
    console.log("Attempting to download file:", filePath);
    const bucket = storage.bucket();
    const file = bucket.file(filePath);
    
    const [exists] = await file.exists();
    if (!exists) {
      console.error("File does not exist:", filePath);
      throw new functions.https.HttpsError(
        "not-found",
        "File not found: " + filePath
      );
    }

    const [fileBuffer] = await file.download();
    console.log("File downloaded successfully, size:", fileBuffer.length);
    
    return fileBuffer;
  } catch (error) {
    console.error("Error downloading file:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to download file: " + error.message
    );
  }
});