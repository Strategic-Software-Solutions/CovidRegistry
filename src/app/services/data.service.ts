import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import settings from '../settings/appsettings.json';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  config: any = null;
  auth: any = null;
  constructor(private http: HttpClient) { 
  }

  public async init() {

    // Retrieve our configuration variables
    await this.getConfiguration();

    // Set a timer to refresh the auth token every 15 minutes.
    setInterval(async () => {
      await this.getAuthToken();
    }, 900000);

    // Get our auth token.
    await this.getAuthToken();
    return true;
  }

  private async getAuthToken() {
    let authRequest = {
      AuthUri : this.config.auth_uri,
      UserName: this.config.username,
      Password: this.config.password,
      Scope: this.config.scope,
      ClientId: this.config.client_id,
      ClientScret: this.config.client_secret
    }
    let httpHeaders = new HttpHeaders({
      'Content-Type' : 'application/json'
    });
    let auth: any = await this.http.post(this.config.bio_auth_service_uri, authRequest, { headers: httpHeaders }).toPromise();
    this.auth = JSON.parse(auth.toString()); 
  }

  public async getVersion() {
    let httpHeaders = new HttpHeaders({
      'Authorization' : `Bearer ${this.auth.access_token}`
    });
    let version = await this.http.get(`${this.config.covid_registry_api_uri}/api/version`, { headers: httpHeaders }).toPromise();
    return version;
  }

  public async getQuestions(userId: number) {
    let httpHeaders = new HttpHeaders({
      'Authorization' : `Bearer ${this.auth.access_token}`
    });
    return await this.http.get(`${this.config.covid_registry_api_uri}/api/covidquestions?userId=${userId}`, { headers: httpHeaders }).toPromise();
  }

  public async userNameAvailable(userName: string) {
    let httpHeaders = new HttpHeaders({
      'Authorization' : `Bearer ${this.auth.access_token}`
    });
    let available = await this.http.get(`${this.config.covid_registry_api_uri}/api/usernameavailable?userName=${userName}`, { headers: httpHeaders }).toPromise();
    return available;
  }

  public async emailAvailable(email: string) {
    let httpHeaders = new HttpHeaders({
      'Authorization' : `Bearer ${this.auth.access_token}`
    });
    let available = await this.http.get(`${this.config.covid_registry_api_uri}/api/emailregistered?email=${email}`, { headers: httpHeaders }).toPromise();
    return !available;
  }

  public async registerUser(regModel: any) {
    let httpHeaders = new HttpHeaders({
      'Authorization' : `Bearer ${this.auth.access_token}`,
      'Content-Type' : 'application/json'
    });
    
    let regResp: any = await this.http.post(`${this.config.covid_registry_api_uri}/api/registeruser`, regModel,
      { headers: httpHeaders }).toPromise();
    return regResp;
  }

  public async submitAnswers(answeredQuestions: any) {
    let httpHeaders = new HttpHeaders({
      'Authorization' : `Bearer ${this.auth.access_token}`,
      'Content-Type' : 'application/json'
    });
    let submitResp: any = await this.http.post(`${this.config.covid_registry_api_uri}/api/submitanswers`, answeredQuestions,
      { headers: httpHeaders }).toPromise();
    console.log(submitResp);
    return submitResp;
  }

  public async getConfiguration() {
    this.config = settings;
  }
}
