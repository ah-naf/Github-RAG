import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ChatMessage } from "../type";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class RagService {
    private apiUrl = "http://localhost:8000"

    constructor(private http: HttpClient) {}

    askQuestion(question: string, branch: string = "origin"): Observable<ChatMessage> {
        const repoInfo = localStorage.getItem('repoInfo');
        if (!repoInfo) {
            throw new Error("Repository information not found in local storage.");
        }

        const { username, repoName, accessToken } = JSON.parse(repoInfo);
        const payload = {
            question,
            username,
            "repo_name": repoName,
            "token": accessToken,
            branch
        }

        return this.http.post<ChatMessage>(`${this.apiUrl}/ask`, payload)
    }
}