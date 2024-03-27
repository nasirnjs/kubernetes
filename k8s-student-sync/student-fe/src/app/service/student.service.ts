import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

const BASIC_URL = ["http://localhost:8080/"]
@Injectable({
  providedIn: 'root'
})
export class StudentService {

  constructor(private http: HttpClient) { }

  postStudent(student: any): Observable<any> {
    return this.http.post(BASIC_URL + "api/student", student);
  }

  getAllstudents(): Observable<any> {
    return this.http.get(BASIC_URL + "api/students");
  }

  deleteStudent(id: number): Observable<any> {
    return this.http.delete(BASIC_URL + "api/student/" + id);
  }

  getStudentById(id: number): Observable<any> {
    return this.http.get(BASIC_URL + "api/student/" + id);
  }

  updateStudent(id: number, student: any): Observable<any> {
    return this.http.put(BASIC_URL + "api/student/" + id, student);
  }
}
