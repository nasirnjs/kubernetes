import { Component } from '@angular/core';
import { StudentService } from 'src/app/service/student.service';

@Component({
  selector: 'app-get-all-students',
  templateUrl: './get-all-students.component.html',
  styleUrls: ['./get-all-students.component.css']
})
export class GetAllStudentsComponent {

  students: any = [];

  constructor(private service: StudentService) {}

  ngOnInit() {
    this.getAllStudents();
  }

  getAllStudents() {
    this.service.getAllstudents().subscribe((res)=> {
      console.log(res);
      this.students = res;
    })
  }

  deleteStudent(id: number){
    console.log(id);
    this.service.deleteStudent(id).subscribe((res) => {
      console.log(res);
      this.getAllStudents();
    })
  }
}
