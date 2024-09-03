import { Injectable } from '@angular/core';
import {Observable, tap} from "rxjs";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly baseUrl: string = 'http://localhost:3000';
  private tokenKey: string = 'token';

  constructor(private http: HttpClient) { }

  register(username: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, { username, password });
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post<{ token: string }>(`${this.baseUrl}/login`, { username, password }).pipe(
      tap((res) => {
        if (res.token) {
          localStorage.setItem(this.tokenKey, res.token);
        }
      })
    );
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
  }

  isLoggedIn() {
    return localStorage.getItem(this.tokenKey) !== null;
  }

  getToken() {
    return localStorage.getItem(this.tokenKey);
  }
}
