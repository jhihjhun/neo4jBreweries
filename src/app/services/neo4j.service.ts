import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Neo4jService {

  constructor(private http: HttpClient) { }

  /**
   * 取得啤酒廠下拉選單
   */
  public getBreweryDropDownList(): Observable<any> {
    const body = {
      statements: [{
        statement: 'MATCH (n:Brewery) RETURN n LIMIT 25',
        parameters: null,
        resultDataContents: ['row', 'graph']
      }]
    };

    return this.http.post<any>(environment.apiTarget, body, {
      headers: new HttpHeaders().set('Authorization', 'Basic ' + btoa(`${environment.neo4jAccount}` + ':' + `${environment.neo4jPassword}`))
    });
  }

  public getCategoryDropDownList(): Observable<any> {
    const body = {
      statements: [{
        statement: 'MATCH (n:Category) RETURN n LIMIT 25',
        parameters: null,
        resultDataContents: ['row', 'graph']
      }]
    };

    return this.http.post<any>(environment.apiTarget, body, {
      headers: new HttpHeaders().set('Authorization', 'Basic ' + btoa(`${environment.neo4jAccount}` + ':' + `${environment.neo4jPassword}`))
    });
  }

  public getCityDropDownList(): Observable<any> {
    const body = {
      statements: [{
        statement: 'MATCH (n:City) RETURN n LIMIT 25',
        parameters: null,
        resultDataContents: ['row', 'graph']
      }]
    };

    return this.http.post<Observable<any>>(environment.apiTarget, body, {
      headers: new HttpHeaders().set('Authorization', 'Basic ' + btoa(`${environment.neo4jAccount}` + ':' + `${environment.neo4jPassword}`))
    });
  }

  public getCountryDorpDownList(): Observable<any> {
    const body = {
      statements: [{
        statement: 'MATCH (n:Country) RETURN n LIMIT 25',
        parameters: null,
        resultDataContents: ['row', 'graph']
      }]
    };

    return this.http.post<Observable<any>>(environment.apiTarget, body, {
      headers: new HttpHeaders().set('Authorization', 'Basic ' + btoa(`${environment.neo4jAccount}` + ':' + `${environment.neo4jPassword}`))
    });
  }
}
