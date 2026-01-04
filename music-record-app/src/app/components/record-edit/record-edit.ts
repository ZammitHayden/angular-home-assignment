import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../services/auth';
import { RecordService } from '../../services/record';

@Component({
  selector: 'app-record-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './record-edit.html',
  styleUrls: ['./record-edit.css']
})
export class RecordEditComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private recordService = inject(RecordService);  
  private cdr = inject(ChangeDetectorRef);
  
  recordForm!: FormGroup;
  recordId!: number;
  isLoading: boolean = false;
  isSubmitting: boolean = false;
  errorMessage: string = '';
  
  formats: string[] = [];
  genres: string[] = [];

  private customerIdPattern = /^\d+[A-Za-z]$/; 
  private contactPattern = /^\d{8,}$/; 
  private emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  getCurrentYear(): number {
    return new Date().getFullYear();
  }

  ngOnInit(): void {
    this.initForm();
    
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.recordId = +params['id'];
        this.loadRecordData(this.recordId);
      } else {
        this.router.navigate(['/records']);
      }
    });
  }

  initForm(): void {
    this.recordForm = this.fb.group({
      title: ['', Validators.required],
      artist: ['', Validators.required],
      format: ['', Validators.required],
      genre: ['', Validators.required],
      releaseYear: ['', [Validators.required, Validators.min(1900), Validators.max(this.getCurrentYear())]],
      price: ['', [Validators.required, Validators.min(0)]],
      stockQty: ['', [Validators.required, Validators.min(0)]],
      
      customerId: ['', [Validators.required, Validators.pattern(this.customerIdPattern)]],
      customerFirstName: ['', Validators.required],
      customerLastName: ['', Validators.required],
      customerContact: ['', [Validators.required, Validators.pattern(this.contactPattern)]],
      customerEmail: ['', [Validators.required, Validators.pattern(this.emailPattern)]]
    });
  }

  loadRecordData(id: number): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.cdr.detectChanges(); 
    
    forkJoin({
      record: this.recordService.getRecord(id),
      formats: this.recordService.getFormats(),
      genres: this.recordService.getGenres()
    }).subscribe({
      next: (results) => {
        
        this.formats = results.formats;
        this.genres = results.genres;
        
        this.recordForm.patchValue({
          title: results.record.title,
          artist: results.record.artist,
          format: results.record.format,
          genre: results.record.genre,
          releaseYear: results.record.releaseYear,
          price: results.record.price,
          stockQty: results.record.stockQty,
          customerId: results.record.customerId,
          customerFirstName: results.record.customerFirstName,
          customerLastName: results.record.customerLastName,
          customerContact: results.record.customerContact,
          customerEmail: results.record.customerEmail
        });
        
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading record data:', error);
        this.errorMessage = 'Failed to load record data. Please try again.';
        this.isLoading = false;
        this.cdr.detectChanges(); 
      }
    });
  }

  onSubmit(): void {
    if (this.recordForm.invalid) {
      Object.keys(this.recordForm.controls).forEach(key => {
        const control = this.recordForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    const formData = this.recordForm.value;

    this.recordService.updateRecord(this.recordId, formData).subscribe({
      next: () => {
        this.isSubmitting = false;
        alert('Record updated successfully!');
        this.router.navigate(['/records']);
      },
      error: (error) => {
        console.error('Error updating record:', error);
        this.errorMessage = 'Failed to update record. Please try again.';
        this.isSubmitting = false;
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.recordForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  getFieldError(fieldName: string): string {
    const field = this.recordForm.get(fieldName);
    
    if (!field || !field.errors) return '';
    
    if (field.errors['required']) {
      return 'This field is required';
    }
    
    if (field.errors['pattern']) {
      if (fieldName === 'customerId') {
        return 'ID must be numbers followed by a letter (e.g., 123A)';
      }
      if (fieldName === 'customerContact') {
        return 'Contact must be at least 8 digits';
      }
      if (fieldName === 'customerEmail') {
        return 'Please enter a valid email address';
      }
    }
    
    if (field.errors['min']) {
      if (fieldName === 'releaseYear') {
        return `Year must be 1900 or later`;
      }
      if (fieldName === 'price' || fieldName === 'stockQty') {
        return 'Value must be 0 or greater';
      }
    }
    
    if (field.errors['max']) {
      if (fieldName === 'releaseYear') {
        return `Year cannot be in the future`;
      }
    }
    
    return 'Invalid value';
  }

  onCancel(): void {
    if (this.recordForm.dirty) {
      if (confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        this.router.navigate(['/records']);
      }
    } else {
      this.router.navigate(['/records']);
    }
  }
}