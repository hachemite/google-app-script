const sheetName = 'Sheet1'
const scriptProp = PropertiesService.getScriptProperties()

function initialSetup() {
  const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet()
  scriptProp.setProperty('key', activeSpreadsheet.getId())
}

function doPost(e) {
  console.log('Received:', JSON.stringify(e.parameter));
  const lock = LockService.getScriptLock()
  lock.tryLock(10000)
  
  try {
    const doc = SpreadsheetApp.openById(scriptProp.getProperty('key'))
    const sheet = doc.getSheetByName(sheetName)
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
    const nextRow = sheet.getLastRow() + 1
    
    const newRow = headers.map(function(header) {
      if (header === 'Timestamp') return new Date()
      return e.parameter[header] || ''
    })
    
    sheet.getRange(nextRow, 1, 1, newRow.length).setValues([newRow])
    
    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'success', 'row': nextRow }))
      .setMimeType(ContentService.MimeType.JSON)
  }
  catch(e) {
    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'error', 'error': e.toString() }))
      .setMimeType(ContentService.MimeType.JSON)
  }
  finally {
    lock.releaseLock()
  }
}