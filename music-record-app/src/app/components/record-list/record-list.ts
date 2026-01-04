import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { RecordService, Record } from '../../services/record';
import { ExportService } from '../../services/export';

@Component({
  selector: 'app-record-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './record-list.html',
  styleUrls: ['./record-list.css']
})
export class RecordListComponent implements OnInit {
  private recordService = inject(RecordService);
  private authService = inject(AuthService);
  private exportService = inject(ExportService);
  private router = inject(Router);
  
  records: Record[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';

  canUpdate(): boolean {
    return this.authService.canUpdate();
  }

  canDelete(): boolean {
    return this.authService.canDelete();
  }

  ngOnInit(): void {
    this.loadRecords();
  }

  loadRecords(): void {
    this.isLoading = true;
    this.recordService.getRecords().subscribe({
      next: (data) => {
        this.records = [...data];
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load records';
        this.isLoading = false;
        console.error('Error loading records:', error);
      }
    });
  }

  deleteRecord(id: number): void {
    if (!confirm('Are you sure you want to delete this record?')) {
      return;
    }
    
    this.recordService.deleteRecord(id).subscribe({
      next: () => {
        this.records = this.records.filter(record => record.id !== id);
      },
      error: (error) => {
        alert('Failed to delete record');
        console.error('Error deleting record:', error);
      }
    });
  }

  getCustomerDisplay(record: Record): string {
    if (record.customerLastName) {
      return `${record.customerLastName} (${record.customerId})`;
    }
    return record.customerId || 'N/A';
  }

  exportToExcel(): void {
    if (this.records.length === 0) {
      alert('No records to export');
      return;
    }
    this.exportService.exportToExcel(this.records, 'music_records');
  }

  exportToPDF(): void {
    if (this.records.length === 0) {
      alert('No records to export');
      return;
    }
    this.exportService.exportToPDF(this.records, 'music_records');
  }

  exportToBoth(): void {
    if (this.records.length === 0) {
      alert('No records to export');
      return;
    }
    this.exportService.exportAll(this.records);
  }
}