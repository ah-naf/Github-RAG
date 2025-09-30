import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';

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

  constructor(private fb: FormBuilder) {
    this.repoForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      repoName: ['', [Validators.required]],
      accessToken: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  onSubmit() {
    if (this.repoForm.valid) {
      console.log('Form Data:', this.repoForm.value);
      // You can add service call here
    } else {
      this.repoForm.markAllAsTouched();
    }
  }
}
