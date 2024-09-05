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
    console.log('test');
    return this.http.get<any>( `${this.baseUrl}/list`, query).pipe(
      map((res: any) => {
        return res as User[];
      }),
    );
  }
}
