import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Pipe, PipeTransform } from "@angular/core";
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'sanitizeHtml'
})
export class SanitizeHtmlPipe implements PipeTransform {

  constructor(private _sanitizer:DomSanitizer) {
  }

  transform(v:string):SafeHtml {
    return this._sanitizer.bypassSecurityTrustHtml(v);
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(private http: HttpClient) {}
  username = '';
  password = '';
  path = '';
  title = 'Login';
  ret = '';

  loginUser() {
    const data = {"username": this.username, "password": this.password};
    this.http.post('/api/login', data).subscribe((response: JSON) => this.ret = response["message"]);
    this.username = '';
    this.password = '';
  }

  showXSS() {
    this.http.get('/api/show_xss').subscribe((response: JSON) => this.ret = response["message"]);
  }

  pathTraversal() {
    const data = {"path": this.path};
    this.http.post('/api/path_traversal', data).subscribe((response: JSON) => {
      this.ret = response["message"];
      this.path = '';
    });
  }
}
