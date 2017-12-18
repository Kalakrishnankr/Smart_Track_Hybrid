import { Injectable } from '@angular/core';
import { Observable} from 'rxjs/Observable';

import {Http, Headers, RequestOptions, URLSearchParams } from '@angular/http';
import { Platform } from 'ionic-angular';
import 'rxjs/add/operator/map';
import 'rxjs/Rx';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch'
import 'rxjs/Rx';



export class User {
    Usercode: string;
    password: string;

    constructor(Usercode: string, password: string) {
        this.Usercode = Usercode;
        this.password = password;
    }
}

 
@Injectable()
export class AuthService {
    imagecaught: any;
    byteArrays: ArrayBuffer;
    dev_api_url  = "http://abiwhiz.twilightsoftwares.com/AbiWhizServices.asmx";
    prod_api_url = "http://119.75.23.122:8083/AbiWhizServices.asmx";
    face_api_url = "https://southeastasia.api.cognitive.microsoft.com/face/v1.0/detect?returnFaceId=true&returnFaceLandmarks=false";
    public faceApiUrl: any;

    // api_url = this.dev_api_url;
    api_url = this.dev_api_url;
    currentUser: User;
    result: any;
    private defaultOptions_ = new RequestOptions({ headers: new Headers({ 'Content-Type': 'application/json' }) });
    
    constructor(public http: Http,public platform: Platform) {
        console.log('Hello Restapi Provider');
        this.faceApiUrl = "https://southeastasia.api.cognitive.microsoft.com/face/v1.0/";
    }
    
    private _serverError(err: any) {
        console.log('sever error:', err);  // debug
        if(err instanceof Response) {
          return Observable.throw(err.text() || 'backend server error');
        }
        return Observable.throw(err || 'backend server error');
    }

    // Method to login to the API. Pass the username and password and this will 
    // return a response that also contains the Project  list and associated location List
    login(data): Observable<Object[]> {
        let params: URLSearchParams = new URLSearchParams();
            params.set('SUsername', data.UserCode);
            params.set('SPassword', data.UserPassword);
        let body = params.toString();
        return this.http.get(`${this.api_url}/ValidateLogin?` + body)
            .map(res => res.json()) 
    }

    // api to verify if employee id is valid or not. If id is valid return details for that empid
    empIdVerification(empid) : Observable<Object[]> {
        return this.http.get(`${this.api_url}/ValidateEmployee?SEmployeeCode=` + empid)
            .map(res => res.json())
    }

    // api to submit the bulk attendance to the server side
    submit(myJson){  
            console.log("Submitting attendance details!!")
            let body = JSON.stringify(myJson);        
            return this.http.post(`${this.api_url}/BulkSubmitAttendanceDetails`, body, this.defaultOptions_)
                .map(res => res.json())
    }
   
    // api to get the attendance details on a particular date taken by the logged in supervisor
    getReport(supervisor_id,view_date) {
        console.log("Getting report from auth service");
        let headers = new Headers();
            headers.append('Content-Type', 'application/json');
        let body = JSON.stringify({"Date":view_date, "SupervisorId":supervisor_id});
        return this.http.post(`${this.api_url}/Getattendancedetails`, body, {headers})
            .map(res => res.json())
    }
   
    // function to logout
    public logout() {
        return Observable.create(observer => {
            this.currentUser = null;
            observer.next(true);
            observer.complete();
        });
    }
    

    detectFace(imageData) {        
        console.log("Going to Detect Face");
        let headers = new Headers();
            headers.append('Content-Type', 'application/octet-stream');
            headers.append('Ocp-Apim-Subscription-Key','8a02c17784704846ac1f4b0f88cb5f7a');
        // let options = new RequestOptions({ headers: headers });
        let body = imageData;
        return this.http.post(this.faceApiUrl+"detect", body, {headers})
            .map((res) => res.json())
            .do(data => console.log('server data:', data))  // debug
            .catch(this._serverError);
    }

    identifyFace(faceData) {
        console.log("Going to Identify Face");
        let headers = new Headers();
            headers.append('Content-Type', 'application/json');
            headers.append('Ocp-Apim-Subscription-Key','8a02c17784704846ac1f4b0f88cb5f7a');
        // let options = new RequestOptions({ headers: headers });
        let body = faceData;
        return this.http.post(this.faceApiUrl+"identify", body, {headers})
            .map((res) => res.json())
            .do(data => console.log('server data:', data))  // debug
            .catch(this._serverError); 
    }

    getPersonDetails(personId) {
        console.log("Going to get Person's Details");
        let headers = new Headers();
            headers.append('Content-Type', 'application/json');
            headers.append('Ocp-Apim-Subscription-Key','8a02c17784704846ac1f4b0f88cb5f7a');
        // let options = new RequestOptions({ headers: headers });
        return this.http.get(this.faceApiUrl+"persongroups/ckr_pg/persons/"+personId, {headers})
            .map((res) => res.json())
            .do(data => console.log('server data:', data))  // debug
            .catch(this._serverError);
    }

}