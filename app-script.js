function m(){
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Sayfa1')
    var range = sheet.getRange(2,1,sheet.getLastRow()-1,6);
    
    range.sort(3);
    
    var newRange = sheet.getRange(1,1,sheet.getLastRow()-1,6)
    var text = "";
    var data = newRange.getValues();
    
    for(let i=0;i<newRange.getNumRows();i++){
      for(let j=0;j<newRange.getNumColumns();j++){
          text += data[i][j] + " / ";
        }
      }
      text+="\n";
    
    console.log(text);
    var email = "data@analyticahouse.com"
    var name = "metehan akyıldız"
    var message = text + "\n\n";
    var subject = "Sending emails from a Spreadsheet";
    MailApp.sendEmail(email, subject, message);
    }
    
    
    