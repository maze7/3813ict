import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {map, Observable} from "rxjs";
import {User} from "../models/user.model";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = 'http://localhost:3000/user';

  constructor(private http: HttpClient) { }

  list(query: any): Observable<User[]> {
    return this.http.get<any>( `${this.baseUrl}/list`, query).pipe(
      map((res: any) => {
        return res as User[];
      }),
    );
  }

  ban(user: User, banned: boolean): Observable<any> {
    return this.http.post(`${this.baseUrl}/${user._id}/ban`, { banned });
  }

  flag(user: User, flagged: boolean): Observable<any> {
    return this.http.post(`${this.baseUrl}/${user._id}/flag`, { flagged });
  }

  delete(user: User): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${user._id}`);
  }

  update(user: User): Observable<any> {
    return this.http.put(`${this.baseUrl}/${user._id}`, { user });
  }
}
