function m(){

  // Sort data by Availability value
var ss = SpreadsheetApp.getActiveSpreadsheet();
var sheet = ss.getSheetByName('Sayfa1')
var range = sheet.getRange(2,1,sheet.getLastRow()-1,7);
range.sort(4);

 // Send email 
var spreadsheetId = ss.getId(); 
var file          = DriveApp.getFileById(spreadsheetId);
var url           = 'https://docs.google.com/spreadsheets/d/'+spreadsheetId+'/export?format=xlsx';
var token         = ScriptApp.getOAuthToken();
var response      = UrlFetchApp.fetch(url, {
  headers: {
    'Authorization': 'Bearer ' +  token
  }
});
  
var fileName = (ss.getName()) + '.xlsx';
var blobs   = [response.getBlob().setName(fileName)];

var receipient = "people@analyticahouse.com"
var subject = "Metehan Akyıldız - Software Case Study"
var emailbody = ""

MailApp.sendEmail(receipient, subject, emailbody, {attachments: blobs});
}


