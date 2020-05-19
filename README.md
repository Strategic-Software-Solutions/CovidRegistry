This repository serves as the documentation and provides an example of how to work with the Bio-Linked coronavirus question API utilizing an Ionic/Angular Web Application. 

# Table of Contents
- [Live Version](#Live-Version)
- [Host Your Own](#Host-Your-Own)
- [Bio-Linked API](#Bio-Linked-API)
  * [Application Flow](#Application-Flow)
  * [Authentication](#Authentication)
    + [Get Auth Token](#Get-Auth-Token)
    + [Get Version](#Get-Version)
  * [Registration](#Registration)
    + [Email Registered](#Email-Registered)
    + [User Name Available](#User-Name-Available)
    + [Register User](#Register-User)
  * [Questions](#Questions)
    + [Get Questions](#Get-Questions)
    + [Submit Answers](#Submit-Answers)

# Live Version

You can utilize our live version, at [covid.bio-linked.org](https://covid.bio-linked.org/) and can customize your link with a logo through URL parameters.

*  **URL Params**

   **Required:**
 
   `channel=[integer]`

   *note that links will work without the `channel` property, however registrations will not be linked to your organization.

   **Optional:**

   `logo=[https url]`

* **Sample Call:**

`https://covid.bio-linked.org/?logo=https:%2F%2Frequestdonorid.azurewebsites.net%2Fassets%2Fimg%2Fobilogo2.png&channel=1001`

# Host Your Own

You can also clone this repository, to customize and host your own version of this.

## Getting Started

### Setup

This application uses Angular version 9 and has requirments of `node >= 10.13.0` and `npm >= 6.11.0` or `yarn >= 1.13.0`.

To install the Angular CLI run
`npm install -g @angular/cli`

To learn more about Angular visit their site at [angular.io](https://angular.io/guide/setup-local).

### Install

Clone the repo.
```
git clone https://github.com/Strategic-Software-Solutions/CovidRegistry
cd CovidRegistry
```

Install Node Modules

`npm install`

Copy example.appsettings.json, rename it to appsettings.json, and include the credentials you received from bio-linked. 

`/src/app/settings/example.appsettings.json`

*Note you will have to log in to portal.azure with your username and temporary password to reset it.

Start the Development Server

`npm start`

### Other Commands

Building

`npm run build`

Angular will bundle your application and place the result in `/www`.

# Bio-Linked API

It is important to note that you will obtain your token from a separate URL than the main Bio-linked API. This is explained in more detail below.

The bio-linked api endpoint:
`https://biolinked.azure-api.net/api`

## Application Flow

The structure of the API necessitates and application flow of:

- 1. Retrieving an authentication token for the session.
- 2. Registering the user with bio-linked.
- 3. Retrieving questions for the user.
- 4. Submitting the users' answers.

## Authentication

The Bio-linked Question API uses the Microsoft Identity Platform for OAuth2 authentication for outside connections. Microsoft does not allow open CORS requests to their OAuth2 token request. As a result, Single Page Applications like the CovidRegistry cannot request Bearer tokens directly. We created a separate REST API to handle the creation of auth tokens, for our SPA and for you to use. If you choose to create your own solution you can learn more about Microsoft's OAuth2 here:

https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow

**Get Auth Token**
----
  Returns a JSON object with a scope and auth token, the token will expire in one hour.

* **URL**

  `https://biolinkedcovidregistry-authservice.azurewebsites.net/api/retrivetoken`

* **Method:**

    `POST`

* **Headers:**

  `'Content-Type' : 'application/json'`
  
*  **URL Params**

   None

* **Data Params**

  **Required:**

    `AuthUri: string`
    `UserName: string`
    `Password: string`
    `Scope: string`
    `ClientId: string`
    `ClientScret: string`

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** 
    ```
    {
        token_type: "Bearer"
        scope: "api://772c8a44-f9f0-4d84-aa05-4b0811bc5da3/PublicAPIAccess"
        expires_in: 3599
        ext_expires_in: 3599
        access_token: "eyJ0e...."
    }
 
* **Error Response:**

  * **Code:** 401 UNAUTHORIZED <br />
    **Content:** `{ error : "You are unauthorized to make this request."`

* **Sample Call:**

  An example assuming you used the appsettings.json file in typescript.

  ```typescript
    import settings from '../settings/appsettings.json';
  
    this.config = settings;
  
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
  ```
  
**Get Version**
----
  This is a method included on the primary API for you to test your auth token against.

* **URL**

  `/version`

* **Method:**

    `GET`

* **Headers:**

  `'Authorization' : 'Bearer AUTH_TOKEN'`
  
*  **URL Params**

   None

* **Data Params**

    None

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `v1`
 
* **Error Response:**

  * **Code:** 401 UNAUTHORIZED <br />
    **Content:** `{ "statusCode": 401, "message": "Unauthorized. Access token is missing or invalid." }`

* **Sample Call:**

  An example assuming you used the appsettings.json file in typescript.

  ```typescript
    let httpHeaders = new HttpHeaders({
      'Authorization' : `Bearer ${this.auth.access_token}`
    });
    let version = await this.http.get(`${this.config.covid_registry_api_uri}/api/version`, { headers: httpHeaders }).toPromise();
    return version;
  ```

## Registration

**Email Registered**
----
  Check if an email is already registered.

* **URL**

  `/emailregistered`

* **Method:**

    `GET`

* **Headers:**

  `'Authorization' : 'Bearer AUTH_TOKEN'`
  
*  **URL Params**

  **Required:**

   `email= string`

* **Data Params**

    None

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** <br />
    `true` If not registered. <br />
    `false` If already registered.
 
* **Error Response:**

  * **Code:** 401 UNAUTHORIZED <br />
    **Content:** `{ "statusCode": 401, "message": "Unauthorized. Access token is missing or invalid." }`

* **Sample Call:**

  An example assuming you used the appsettings.json file in typescript.

  ```typescript
     let httpHeaders = new HttpHeaders({
      'Authorization' : `Bearer ${this.auth.access_token}`
    });
    let available = await this.http.get(`${this.config.covid_registry_api_uri}/api/emailregistered?email=${email}`, { headers: httpHeaders }).toPromise();
    return !available;
  ```
  
**User Name Available**
----
  Check if a bio-linked user name is available or not.

* **URL**

  `/usernameavailable`

* **Method:**

    `GET`

* **Headers:**

  `'Authorization' : 'Bearer AUTH_TOKEN'`
  
*  **URL Params**

  **Required:**

   `userName= string`

* **Data Params**

    None

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** <br />
    `true` If available. <br />
    `false` If not.
 
* **Error Response:**

  * **Code:** 401 UNAUTHORIZED <br />
    **Content:** `{ "statusCode": 401, "message": "Unauthorized. Access token is missing or invalid." }`

* **Sample Call:**

  An example assuming you used the appsettings.json file in typescript.

  ```typescript
     let httpHeaders = new HttpHeaders({
      'Authorization' : `Bearer ${this.auth.access_token}`
     });
     let available = await this.http.get(`${this.config.covid_registry_api_uri}/api/usernameavailable?userName=${userName}`, { headers: httpHeaders }).toPromise();
     return available;
  ```

**Register User**
----
  Registers the user with the bio-linked system and returns the new userId.

* **URL**

  `/registeruser`

* **Method:**

    `POST`

* **Headers:**

  `'Authorization' : 'Bearer AUTH_TOKEN'`
  `'Content-Type' : 'application/json'`
  
*  **URL Params**

   None

* **Data Params**

  **Required:**

    `FirstName: string` <br />
    `LastName: string` <br />
    `Birthday: DateTime`<br />
    `Email: string` <br />
    `HomePhone: integer` <br />
    `CellPhone: integer` <br />
    `Address1: string` <br />
    `Zip: integer` <br />
    `UserName: string` <br />
    `Password: string` <br />
    `Channel: string` <br />

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** 
    `{UserId: integer, Success: true, ErrorMessage: ""}`
 
* **Error Response:**

  * **Code:** 401 UNAUTHORIZED <br />
    **Content:** `{ error : "You are unauthorized to make this request."`

* **Sample Call:**

  An example assuming you used the appsettings.json file in typescript.

  ```typescript
    let httpHeaders = new HttpHeaders({
      'Authorization' : `Bearer ${this.auth.access_token}`,
      'Content-Type' : 'application/json'
    });
    
    let regResp: any = await this.http.post(`${this.config.covid_registry_api_uri}/api/registeruser`, regModel,
      { headers: httpHeaders }).toPromise();
    return regResp;
  ```

## Questions

**Get Questions**
----
  Get the bio-linked coronavirus questions.

* **URL**

  `/covidquestions`

* **Method:**

    `GET`

* **Headers:**

  `'Authorization' : 'Bearer AUTH_TOKEN'`
  
*  **URL Params**

  **Required:**

   `userId=integer`

* **Data Params**

    None

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** <br />
    
    A list of objects will be returned in the format of: <br />
    
    ```
    {
       "Id":"0d403c32-9ebb-46a7-bc6b-726947b5dc9a",
       "Name":"Have Been Tested for Covid-19.",
       "Value":"Have you been tested for Covid-19?",
       "AnswerOptions":["Yes","No","No - Received clinical diagnosis"],
       "Answers":[""],
       "AnswerBools":null,
       "HasMultipleAnswers":false
     },
     {
       Id: "cb915e79-fac1-4c78-8cf5-35e9cf891b19"
       Name: "Underlying Conditions?"
       Value: "Do you have any of the following underlying medical conditions?"
       AnswerOptions: ["High Blood Pressure", "Heart Disease", "Blood Clots", "Diabetes", "Cancer Requiring Therapy",…]
       Answers: [""]
       AnswerBools: null
       HasMultipleAnswers: true
     }
 
* **Error Response:**

  * **Code:** 401 UNAUTHORIZED <br />
    **Content:** `{ "statusCode": 401, "message": "Unauthorized. Access token is missing or invalid." }`

* **Sample Call:**

  An example assuming you used the appsettings.json file in typescript.

  ```typescript
     let httpHeaders = new HttpHeaders({
      'Authorization' : `Bearer ${this.auth.access_token}`
    });
    return await this.http.get(`${this.config.covid_registry_api_uri}/api/covidquestions?userId=${userId}`, { headers: httpHeaders }).toPromise();
  ```

**Submit Answers**
----
  Submit the users' answers, by sending back the Question objects with answers populated in the Answers array.

* **URL**

  `/submitanswers`

* **Method:**

    `POST`

* **Headers:**

  `'Authorization' : 'Bearer AUTH_TOKEN'`
  `'Content-Type' : 'application/json'`
  
*  **URL Params**

   None

* **Data Params**

  **Required:**

    `UserName: string` <br />
    `Password: string` <br />
    `COVIDQuestions: [Question]` Where Question is the same type of object from Get Questions above <br />
    
    Example of Question with an answer.
   ``` Id: "0d403c32-9ebb-46a7-bc6b-726947b5dc9a"
       Name: "Have Been Tested for Covid-19."
       Value: "Have you been tested for Covid-19?"
       AnswerOptions: ["Yes", "No", "No - Received clinical diagnosis"]
       Answers: ["No"]
       AnswerBools: null
       HasMultipleAnswers: false
   ```

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `{"Success":true,"ErrorMessage":""}`
    
* **Error Response:**

  * **Code:** 401 UNAUTHORIZED <br />
    **Content:** `{"Success":false,"ErrorMessage":"Object reference not set to an instance of an object."}`
    
 OR
 
  * **Code:** 401 UNAUTHORIZED <br />
    **Content:** `{ error : "You are unauthorized to make this request."`

* **Sample Call:**

  An example assuming you used the appsettings.json file in typescript.

  ```typescript
     let httpHeaders = new HttpHeaders({
      'Authorization' : `Bearer ${this.auth.access_token}`,
      'Content-Type' : 'application/json'
    });
    let submitResp: any = await this.http.post(`${this.config.covid_registry_api_uri}/api/submitanswers`, answeredQuestions,
      { headers: httpHeaders }).toPromise();
    console.log(submitResp);
    return submitResp;
  ```
