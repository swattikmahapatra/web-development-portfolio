/*
  Google Sheets response database for the portfolio assignment.
  Setup:
  1. Create a Google Sheet and copy its spreadsheet ID from the URL.
  2. Open Extensions > Apps Script and paste this code into Code.gs.
  3. Replace SPREADSHEET_ID below.
  4. Deploy > New deployment > Web app. Execute as: Me.
     Set access according to your course/demo requirements.
  5. Copy the deployed /exec URL into APPS_SCRIPT_URL in script.js.
  Note: the public endpoint is a classroom demo, not production-grade security.
*/
const SPREADSHEET_ID = "PASTE_YOUR_GOOGLE_SHEET_ID_HERE";
const SHEET_NAME = "Responses";

function getSheet_() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
    sheet.appendRow(["ID", "Name", "Email", "Message", "Timestamp"]);
  }
  return sheet;
}

function respond_(data, callback) {
  const json = JSON.stringify(data);
  if (callback && /^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(callback)) {
    return ContentService.createTextOutput(callback + "(" + json + ");")
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  const params = (e && e.parameter) || {};
  const callback = params.callback || "";
  try {
    if (params.action === "submit") {
      const item = JSON.parse(params.data || "{}");
      if (!item.name || !item.email || !item.message) throw new Error("Name, email and message are required.");
      if (String(item.message).length > 1500) throw new Error("Message is too long.");
      getSheet_().appendRow([
        String(item.id || Utilities.getUuid()),
        String(item.name).slice(0, 80),
        String(item.email).slice(0, 120),
        String(item.message).slice(0, 1500),
        item.timestamp || new Date().toISOString()
      ]);
      return respond_({ success: true }, callback);
    }
    if (params.action === "list") {
      const sheet = getSheet_();
      const rows = sheet.getDataRange().getValues();
      const messages = rows.slice(1).filter(row => row[0]).map(row => ({
        id: String(row[0]), name: String(row[1]), email: String(row[2]),
        message: String(row[3]),
        timestamp: row[4] instanceof Date ? row[4].toISOString() : String(row[4])
      }));
      return respond_({ success: true, messages: messages }, callback);
    }
    return respond_({ success: true, message: "Portfolio response API is ready." }, callback);
  } catch (error) {
    return respond_({ success: false, error: String(error.message || error) }, callback);
  }
}
