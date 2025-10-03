import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as marked from 'marked';
import { ChatMessage } from '../type';
import { RagService } from '../services/rag-service';

@Component({
  selector: 'app-rag-chat',
  templateUrl: './rag-chat.html',
  imports: [CommonModule, FormsModule],
  standalone: true,
  styleUrls: ['./rag-chat.css'],
})
export class RagChatComponent {
  @Input() selectedBranch: string = 'origin';
  @ViewChild('chatContainer') chatContainer!: ElementRef;

  messages: ChatMessage[] = [];
  inputValue: string = '';
  isLoading = false;

  constructor(private ragService: RagService) {}

  sendMessage() {
    if (!this.inputValue.trim()) return;

    const userMessage: ChatMessage = { text: this.inputValue, sender: 'user' };
    this.messages.push(userMessage);
    const botMessage: ChatMessage = { text: '', sender: 'bot', loading: true };
    this.messages.push(botMessage);

    this.scrollToBottom();

    const question = this.inputValue;
    this.inputValue = '';
    this.isLoading = true;

    this.ragService.askQuestion(question, this.selectedBranch).subscribe({
      next: (response) => {
        botMessage.text = marked.parse(response.text) as string;
        botMessage.loading = false;
        this.isLoading = false;
        this.scrollToBottom();
      },
      error: (error) => {
        botMessage.text = 'Error: ' + error.message;
        botMessage.loading = false;
        this.isLoading = false;
        this.scrollToBottom();
      },
    });
  }

  scrollToBottom() {
    setTimeout(() => {
      if (this.chatContainer) {
        this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }
}
