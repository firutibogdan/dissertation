import './App.css';
import React from 'react';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ret : "" ,
      ret_html: "",

      username_login : "",
      password_login : "",
      safeness_login : 0,

      username_xss : "",
      safeness_xss : 0,

      username_lfi : "",
      path_lfi : "",
      safeness_lfi : 0,
    };

    this.updateUsernameLogin = this.updateUsernameLogin.bind(this);
    this.updatePasswordLogin = this.updatePasswordLogin.bind(this);
    this.updateSafenessLogin = this.updateSafenessLogin.bind(this);

    this.updateUsernameXSS = this.updateUsernameXSS.bind(this);
    this.updateSafenessXSS = this.updateSafenessXSS.bind(this);

    this.updateUsernameLFI = this.updateUsernameLFI.bind(this);
    this.updatePathLFI = this.updatePathLFI.bind(this);
    this.updateSafenessLFI = this.updateSafenessLFI.bind(this);

    this.loginUser = this.loginUser.bind(this);
    this.xss = this.xss.bind(this);
    this.pathTraversal = this.pathTraversal.bind(this);
  }

  updateUsernameLogin(evt) {
    this.setState({username_login: evt.target.value});
  }

  updatePasswordLogin(evt) {
    this.setState({password_login: evt.target.value});
  }

  updateSafenessLogin(evt) {
    this.setState({safeness_login: evt.target.value});
  }

  updateUsernameXSS(evt) {
    this.setState({username_xss: evt.target.value});
  }

  updateSafenessXSS(evt) {
    this.setState({safeness_xss: evt.target.value});
  }

  updateUsernameLFI(evt) {
    this.setState({username_lfi: evt.target.value});
  }

  updatePathLFI(evt) {
    this.setState({path_lfi: evt.target.value});
  }

  updateSafenessLFI(evt) {
    this.setState({safeness_lfi: evt.target.value});
  }

  loginUser() {
    fetch(`/api/login`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({"username": this.state.username_login, "password": this.state.password_login, "safeness": this.state.safeness_login})
    }).then(response => response.json())
    .then(data => {
      this.setState({ret: data.message, ret_html: ''})
    });
  }

  async xss() {
    const response = await fetch(`/api/show_xss`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({"username": this.state.username_xss, "safeness": this.state.safeness_xss})
    });

    const answer = await response.json();

    if (response.headers.get('Content-Type') === 'text/plain') {
      this.setState({ret_html: answer.message, ret: ''})
    } else {
      this.setState({ret: answer.message, ret_html: ''})
    }
  }

  pathTraversal() {
    fetch(`/api/path_traversal`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({"username": this.state.username_lfi, "path": this.state.path_lfi, "safeness": this.state.safeness_lfi})
    }).then(response => response.json())
    .then(data => {
      this.setState({ret: data.message, ret_html: ''})
    });
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <div>
            <div>
              <div>
                <h2>Login</h2>
                  <form>
                    <div>
                      <div>
                        <input type="username" name="username_login" id="username_login" placeholder="username" onChange={this.updateUsernameLogin}/>
                      </div>
                      <div>
                        <input type="password" name="password_login" id="password_login" placeholder="password" onChange={this.updatePasswordLogin}/>
                      </div>
                      <div>
                        <select onChange={this.updateSafenessLogin} name="safeness_login" id="safeness_login">
                          <option value="0">No sanitization</option>
                          <option value="1">Only letters and numbers</option>
                          <option value="2">Sanitize \'</option>
                          <option value="3">Hash inputs</option>
                        </select>
                      </div>
                    </div>
                    <button type="button" onClick={this.loginUser} >Login</button>
                  </form>
              </div>
              <div>
                <h2>XSS</h2>
                <form>
                  <div>
                    <div>
                      <input type="username" name="username_xss" id="username_xss" placeholder="username" onChange={this.updateUsernameXSS}/>
                    </div>
                    <div>
                      <select onChange={this.updateSafenessXSS} name="safeness_xss" id="safeness_xss">
                        <option value="0">No sanitization</option>
                        <option value="1">Sanitize special characters</option>
                        <option value="2">Add headers</option>
                      </select>
                    </div>
                  </div>
                  <button type="button" onClick={this.xss} >XSS</button>
                </form>
              </div>
              <div>
                <h2>Path Traversal</h2>
                <form>
                  <div>
                    <div>
                      <input type="username" name="username_lfi" id="username_lfi" placeholder="username" onChange={this.updateUsernameLFI}/>
                    </div>
                    <div>
                      <input type="text" name="path_lfi" id="path_lfi" placeholder="path" onChange={this.updatePathLFI}/>
                    </div>
                    <div>
                      <select onChange={this.updateSafenessLFI} name="safeness_lfi" id="safeness_lfi">
                        <option value="0">No sanitization</option>
                        <option value="1">Sanitize special characters</option>
                        <option value="2">Hash name of file</option>
                        <option value="3">Check database</option>
                      </select>
                    </div>
                  </div>
                  <button type="button" onClick={this.pathTraversal} >PathTraversal</button>
                </form>
              </div>
              <div dangerouslySetInnerHTML={{__html: this.state.ret}}></div>
              <div>{this.state.ret_html}</div>
            </div>
          </div>
        </header>
      </div>
    );
  }
}

export default App;
