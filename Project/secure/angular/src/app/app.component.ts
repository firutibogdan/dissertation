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
  username_login = '';
  password_login = '';
  safeness_login = 0;

  username_xss = '';
  safeness_xss = 0;

  username_lfi = '';
  path_lfi = '';
  safeness_lfi = 0;

  ret = '';
  ret_html = '';

  clear_all() {
    this.username_login = '';
    this.password_login = '';
    this.safeness_login = 0;

    this.username_xss = '';
    this.safeness_xss = 0;

    this.username_lfi = '';
    this.path_lfi = '';
    this.safeness_lfi = 0;

    this.ret = '';
    this.ret_html = '';
  }

  loginUser() {
    const data = {"username": this.username_login, "password": this.password_login, "safeness": this.safeness_login};
    this.http.post('/api/login', data).subscribe((response: JSON) => {
      this.clear_all();
      this.ret = response["message"]
    });
  }

  xss() {
    const data = {"username": this.username_xss, "safeness": this.safeness_xss};
    this.http.post('/api/show_xss', data, { observe: 'response' }).subscribe((response) => 
    {
      this.clear_all();
      if (response.headers.get('Content-Type') == 'text/plain') {
        this.ret_html = response.body["message"]
      } else {
        this.ret = response.body["message"]
      }
    });
  }

  pathTraversal() {
    const data = {"username": this.username_lfi, "path": this.path_lfi, "safeness": this.safeness_lfi};
    this.http.post('/api/path_traversal', data).subscribe((response: JSON) => {
      this.clear_all();
      this.ret = response["message"];
    });
  }
}
