import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RepoForm } from '../type';

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
  ],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  repoForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) {
    this.repoForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      repoName: ['', [Validators.required]],
      accessToken: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {
    const repoInfo = localStorage.getItem('repoInfo');
    if(repoInfo) {
      const { username, repoName, accessToken } = JSON.parse(repoInfo);
      if(username && repoName && accessToken) { 
        this.router.navigate(["/repo"])
        return;
      }
    }
  }

  onSubmit() {
    if (this.repoForm.valid) {
      const repoForm: RepoForm = this.repoForm.value;
      localStorage.setItem('repoInfo', JSON.stringify(repoForm));
      
      this.router.navigate(["/repo"])
    } else {
      this.repoForm.markAllAsTouched();
    }
  }
}
