import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GetAllStudentsComponent } from './components/get-all-students/get-all-students.component';
import { PostStudentComponent } from './components/post-student/post-student.component';
import { UpdateStudentComponent } from './components/update-student/update-student.component';

const routes: Routes = [
  { path: "student", component: PostStudentComponent },
  { path: "", component: GetAllStudentsComponent },
  { path: "student/:id", component: UpdateStudentComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
