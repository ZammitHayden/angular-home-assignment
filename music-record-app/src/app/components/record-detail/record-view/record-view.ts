import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RecordService, Record } from '../../../services/record';

@Component({
  selector: 'app-record-view',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './record-view.html',
  styleUrls: ['./record-view.css']
})
export class RecordViewComponent implements OnInit {
  private recordService = inject(RecordService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  
  record: Record | null = null;
  isLoading: boolean = true;
  errorMessage: string = '';

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        const id = +params['id'];
        this.loadRecordData(id);
      }
    });
  }

  loadRecordData(id: number): void {
    this.isLoading = true;
    this.record = null;
    this.errorMessage = '';
    this.cdr.detectChanges(); 
    
    this.recordService.getRecord(id).subscribe({
      next: (record) => {
        this.record = record;
        this.isLoading = false;
        this.cdr.detectChanges(); 
      },
      error: (error) => {
        console.error('Error loading record:', error);
        this.errorMessage = 'Failed to load record data';
        this.isLoading = false;
        this.cdr.detectChanges(); 
      },
      complete: () => {
        console.log('Record load complete');
      }
    });
  }
}