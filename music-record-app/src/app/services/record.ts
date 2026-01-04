import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../enviroments/enviroment';

export interface Record {
  id: number;
  title: string;
  artist: string;
  format: string;
  genre: string;
  releaseYear: number;
  price: number;
  stockQty: number;
  customerId: string;
  customerFirstName: string;
  customerLastName: string;
  customerContact: string;
  customerEmail: string;
}

@Injectable({
  providedIn: 'root'
})
export class RecordService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getRecords(): Observable<Record[]> {
    return this.http.get<Record[]>(`${this.apiUrl}/records`);
  }

  getRecord(id: number): Observable<Record> {
    return this.http.get<Record>(`${this.apiUrl}/records/${id}`);
  }

  addRecord(record: Omit<Record, 'id'>): Observable<Record> {
    return this.http.post<Record>(`${this.apiUrl}/records`, record);
  }

  updateRecord(id: number, record: Partial<Record>): Observable<Record> {
    return this.http.put<Record>(`${this.apiUrl}/records/${id}`, record);
  }

  deleteRecord(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/records/${id}`);
  }

  getFormats(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/formats`);
  }

  getGenres(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/genres`);
  }
}