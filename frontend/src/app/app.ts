import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RepoForm } from './type';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule
  ],

  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  repoForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) {
    this.repoForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      repoName: ['', [Validators.required]],
      accessToken: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  onSubmit() {
    if (this.repoForm.valid) {
      const repoForm: RepoForm = this.repoForm.value;
      localStorage.setItem('repoForm', JSON.stringify(repoForm));
      
      this.router.navigate(["/repo"], {
        queryParams: repoForm
      })
    } else {
      this.repoForm.markAllAsTouched();
    }
  }
}
