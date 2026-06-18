const SPREADSHEET_ID = '1LfdsEiZjZY3phnxNxAgg8UItwN9K1qLDJX4y48zLIfs';

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Form Permintaan WH - Murinda')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// Mengambil Data Stock dan Nomor Urut Berikutnya
function getInitialData() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  // Ambil Stock
  const sheetStock = ss.getSheetByName('Stock');
  const dataStock = sheetStock.getDataRange().getValues();
  const stockList = [];
  
  // Cari index kolom "Sisa Stok" secara dinamis dari header (Baris 1)
  let sisaStokIndex = -1;
  for (let c = 0; c < dataStock[0].length; c++) {
    if (dataStock[0][c].toString().toLowerCase().includes('sisa stok')) {
      sisaStokIndex = c;
      break;
    }
  }
  
  for (let i = 1; i < dataStock.length; i++) {
    if(dataStock[i][1] && dataStock[i][1] !== "") { 
      // Jika kolom Sisa Stok ditemukan, ambil nilainya. Jika tidak, asumsikan 0.
      let sisa = sisaStokIndex !== -1 ? (parseFloat(dataStock[i][sisaStokIndex]) || 0) : 0;
      
      // HANYA MASUKKAN BARANG JIKA STOK > 0
      if (sisa > 0) {
        stockList.push({ 
          id: dataStock[i][1], 
          nama: dataStock[i][2], 
          ukuran: dataStock[i][3],
          sisa: sisa 
        });
      }
    }
  }

  // Auto Numbering Aman
  const sheetReq = ss.getSheetByName('Permintaan');
  const dataReq = sheetReq.getDataRange().getValues();
  let nextNo = "REQ-001";
  
  if (dataReq.length > 1) {
    let lastNo = "";
    for (let i = dataReq.length - 1; i > 0; i--) {
      if (dataReq[i][0] && String(dataReq[i][0]).startsWith("REQ-")) {
        lastNo = dataReq[i][0];
        break;
      }
    }
    if (lastNo) {
      const num = parseInt(lastNo.replace('REQ-', ''), 10) + 1;
      nextNo = "REQ-" + String(num).padStart(3, '0');
    }
  }

  return { stock: stockList, newNo: nextNo };
}

// Proses Simpan Data
function processForm(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheetReq = ss.getSheetByName('Permintaan');
  const sheetBarang = ss.getSheetByName('Barang Permintaan');
  
  // Simpan ke Sheet Permintaan
  sheetReq.appendRow([
    data.no, 
    data.waktu, 
    data.dept, 
    data.dibuat 
  ]);
  
  // Simpan ke Sheet Barang Permintaan
  data.items.forEach(item => {
    sheetBarang.appendRow([data.no, item.id, item.nama, item.ukuran, item.jml, item.catatan]);
  });
  
  return "Sukses";
}