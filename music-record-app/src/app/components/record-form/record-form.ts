import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { RecordService } from '../../services/record';

@Component({
  selector: 'app-record-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './record-form.html',
  styleUrls: ['./record-form.css']
})
export class RecordFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private recordService = inject(RecordService);
  
  recordForm!: FormGroup;
  isEditMode: boolean = false;
  recordId: number | null = null;
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
    this.loadDropdownData();

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.recordId = +params['id'];
        this.loadRecordData(this.recordId);
      } else {
        this.isEditMode = false;
      }
    });
  }

  initForm(): void {
    this.recordForm = this.fb.group({
      title: ['', Validators.required],
      artist: ['', Validators.required],
      format: ['', Validators.required],
      genre: ['', Validators.required],
      releaseYear: ['', [Validators.required, Validators.min(1900), Validators.max(new Date().getFullYear())]],
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
    this.recordService.getRecord(id).subscribe({
      next: (record) => {
        this.recordForm.patchValue({
          title: record.title,
          artist: record.artist,
          format: record.format,
          genre: record.genre,
          releaseYear: record.releaseYear,
          price: record.price,
          stockQty: record.stockQty,
          customerId: record.customerId,
          customerFirstName: record.customerFirstName,
          customerLastName: record.customerLastName,
          customerContact: record.customerContact,
          customerEmail: record.customerEmail
        });
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load record data';
        this.isLoading = false;
        console.error('Error loading record:', error);
      }
    });
  }

  loadDropdownData(): void {
    this.recordService.getFormats().subscribe({
      next: (formats) => this.formats = formats,
      error: (error) => console.error('Error loading formats:', error)
    });

    this.recordService.getGenres().subscribe({
      next: (genres) => this.genres = genres,
      error: (error) => console.error('Error loading genres:', error)
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
    const formData = this.recordForm.value;

    if (this.isEditMode && this.recordId) {
      this.recordService.updateRecord(this.recordId, formData).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.router.navigate(['/records']);
        },
        error: (error) => {
          this.errorMessage = 'Failed to update record';
          this.isSubmitting = false;
          console.error('Error updating record:', error);
        }
      });
    } else {
      this.recordService.addRecord(formData).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.router.navigate(['/records']);
        },
        error: (error) => {
          this.errorMessage = 'Failed to add record';
          this.isSubmitting = false;
          console.error('Error adding record:', error);
        }
      });
    }
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
}