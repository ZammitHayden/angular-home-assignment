import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Record } from './record';

@Injectable({
  providedIn: 'root'
})
export class ExportService {
  
  private genreColors: { [key: string]: string } = {
    'Rock': '#FF6B6B',
    'Pop': '#4ECDC4',
    'Jazz': '#FFD166',
    'Classical': '#06D6A0',
    'Hip Hop': '#118AB2',
    'Electronic': '#EF476F',
    'Country': '#073B4C',
    'R&B': '#7209B7',
    'Metal': '#3A0CA3',
    'Folk': '#F72585',
    'Blues': '#480CA8',
    'Reggae': '#560BAD'
  };

  private getGenreColor(genre: string): string {
    return this.genreColors[genre] || '#CCCCCC';
  }


  exportToExcel(records: Record[], filename: string = 'records'): void {
    const wb = XLSX.utils.book_new();
    
    const data = records.map(record => [
      record.id,
      record.title,
      record.artist,
      record.format,
      record.genre,
      record.releaseYear,
      `€${record.price.toFixed(2)}`,
      record.stockQty,
      record.customerId,
      `${record.customerFirstName} ${record.customerLastName}`,
      record.customerContact,
      record.customerEmail
    ]);

    const ws = XLSX.utils.aoa_to_sheet([
      ['ID', 'Title', 'Artist', 'Format', 'Genre', 'Release Year', 'Price', 'Stock', 
       'Customer ID', 'Customer Name', 'Contact', 'Email'],
      ...data
    ]);

    const colWidths = [
      { wch: 8 },  
      { wch: 25 }, 
      { wch: 20 }, 
      { wch: 10 }, 
      { wch: 15 }, 
      { wch: 12 }, 
      { wch: 10 }, 
      { wch: 8 },  
      { wch: 12 }, 
      { wch: 25 }, 
      { wch: 15 }, 
      { wch: 25 }  
    ];
    ws['!cols'] = colWidths;

    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:L1');
    
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cell = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!ws[cell]) continue;
      ws[cell].s = {
        fill: { fgColor: { rgb: "4472C4" } },
        font: { color: { rgb: "FFFFFF" }, bold: true }
      };
    }

    XLSX.utils.book_append_sheet(wb, ws, 'Records');

    XLSX.writeFile(wb, `${filename}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  
  exportToPDF(records: Record[], filename: string = 'records'): void {
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.setTextColor(40);
    doc.text('Music Records Export', 14, 15);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 22);
    doc.text(`Total Records: ${records.length}`, 14, 28);
    
    const tableData = records.map(record => [
      record.id.toString(),
      record.title,
      record.artist,
      record.format,
      record.genre,
      record.releaseYear.toString(),
      `€${record.price.toFixed(2)}`,
      record.stockQty.toString(),
      record.customerId,
      `${record.customerFirstName} ${record.customerLastName}`,
      record.customerContact,
      record.customerEmail
    ]);

    const headers = [
      ['ID', 'Title', 'Artist', 'Format', 'Genre', 'Year', 'Price', 'Stock', 
       'Cust ID', 'Customer', 'Contact', 'Email']
    ];

    autoTable(doc, {
      head: headers,
      body: tableData,
      startY: 35,
      theme: 'grid',
      headStyles: {
        fillColor: [68, 114, 196],
        textColor: 255,
        fontSize: 9,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 8,
        cellPadding: 2,
        overflow: 'linebreak'
      },
      columnStyles: {
        0: { cellWidth: 8 },
        1: { cellWidth: 25 },
        2: { cellWidth: 18 },
        3: { cellWidth: 10 },
        4: { cellWidth: 12 },
        5: { cellWidth: 8 },
        6: { cellWidth: 10 },
        7: { cellWidth: 8 },
        8: { cellWidth: 12 },
        9: { cellWidth: 22 },
        10: { cellWidth: 15 },
        11: { cellWidth: 25 }
      },
      didParseCell: (data) => {
        if (data.section === 'body') {
          const recordIndex = data.row.index;
          const record = records[recordIndex];
          const genreColor = this.getGenreColor(record.genre);
          
          const rgb = this.hexToRgb(genreColor);
          if (rgb) {
            data.cell.styles.fillColor = [rgb.r, rgb.g, rgb.b];
            data.cell.styles.textColor = this.getContrastColor(rgb);
          }
        }
      }
    });

    doc.save(`${filename}_${new Date().toISOString().slice(0, 10)}.pdf`);
  }


  exportAll(records: Record[]): void {
    this.exportToExcel(records);
    setTimeout(() => {
      this.exportToPDF(records);
    }, 500);
  }


  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  private getContrastColor(rgb: { r: number; g: number; b: number }): [number, number, number] {
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    return luminance > 0.5 ? [0, 0, 0] : [255, 255, 255];
  }
}