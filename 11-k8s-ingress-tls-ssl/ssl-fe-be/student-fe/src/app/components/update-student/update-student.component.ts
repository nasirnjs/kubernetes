import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentService } from 'src/app/service/student.service';

@Component({
  selector: 'app-update-student',
  templateUrl: './update-student.component.html',
  styleUrls: ['./update-student.component.css']
})
export class UpdateStudentComponent {

  updateStudentForm!: FormGroup;
  id:number=this.activatedRoute.snapshot.params['id'];

  constructor(private activatedRoute: ActivatedRoute,
    private service: StudentService,
    private fb: FormBuilder,
    private router: Router){ }

    ngOnInit(){
      this.updateStudentForm = this.fb.group({
        name: [null, Validators.required],
        className: [null, Validators.required],
        roll: [null, Validators.required],
        fatherName: [null, Validators.required],
        motherName: [null, Validators.required]
      })
      this.getStudentById();
    }
    getStudentById() {
      this.service.getStudentById(this.id).subscribe((res) => {
        console.log(res);
        this.updateStudentForm.patchValue(res);
      })
    }

    updateStudent(){
      this.service.updateStudent(this.id, this.updateStudentForm.value).subscribe((res) => {
        console.log(res);
        this.router.navigateByUrl("");
      })
    }

}
