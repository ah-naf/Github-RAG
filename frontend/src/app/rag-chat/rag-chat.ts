import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as marked from 'marked';

interface ChatMessage {
  text: string;
  sender: 'user' | 'bot';
  loading?: boolean;
}

@Component({
  selector: 'app-rag-chat',
  templateUrl: './rag-chat.html',
  imports: [CommonModule, FormsModule],
  styleUrls: ['./rag-chat.css']
})
export class RagChatComponent {
  messages: ChatMessage[] = [
    {
      text: 'Hello! 👋 I am your Repo Assistant.',
      sender: 'bot'
    },
    {
      text: 'Hi, can you show me the README file?',
      sender: 'user'
    },
    {
      text: marked.parse('Sure! Here’s the **README.md** file summary:') as string,
      sender: 'bot'
    },
    {
      text: 'Thanks, that helps a lot!',
      sender: 'user'
    }
  ];
  inputValue: string = '';

  sendMessage() {
    if (!this.inputValue.trim()) return;

    // Push user message
    this.messages.push({ text: this.inputValue, sender: 'user' });

    // Add temporary loading bubble for bot
    this.messages.push({ text: '', sender: 'bot', loading: true });

    const userInput = this.inputValue;
    this.inputValue = '';

    // Simulate async response
    setTimeout(() => {
      // Remove loading
      this.messages = this.messages.filter(m => !m.loading);

      // Push bot reply (markdown rendered)
      this.messages.push({
        text: marked.parse(`**Bot:** I received: ${userInput}`) as string,
        sender: 'bot'
      });
    }, 1500);
  }
}
