import './App.css';
import React from 'react';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { ret : "" , username : "", password : "", path : ""};

    this.updateUsername = this.updateUsername.bind(this);
    this.updatePassword = this.updatePassword.bind(this);
    this.updatePath = this.updatePath.bind(this);
    this.loginUser = this.loginUser.bind(this);
    this.showXSS = this.showXSS.bind(this);
    this.pathTraversal = this.pathTraversal.bind(this);
  }

  updateUsername(evt) {
    this.setState({username: evt.target.value});
  }

  updatePassword(evt) {
    this.setState({password: evt.target.value});
  }

  updatePath(evt) {
    this.setState({path: evt.target.value});
  }

  loginUser() {
    fetch(`/api/login`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({"username": this.state.username, "password": this.state.password})
    }).then(response => response.json())
    .then(data => (this.setState({ret: data.message})));
  }

  showXSS() {
    fetch(`/api/show_xss`, {
      method: 'GET',
      headers: {'Content-Type': 'application/json'},
    }).then(response => response.json())
    .then(data => (this.setState({ret: data.message})));
  }

  pathTraversal() {
    fetch(`/api/path_traversal`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({"path": this.state.path})
    }).then(response => response.json())
    .then(data => (this.setState({ret: data.message})));
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
                        <input type="username" name="username" id="username" placeholder="username" onChange={this.updateUsername}/>
                      </div>
                      <div>
                        <input type="password" name="password" id="password" placeholder="password" onChange={this.updatePassword}/>
                      </div>
                    </div>
                    <button type="button" onClick={this.loginUser} >Login</button>
                  </form>
                  <div>
                    <input type="text" name="path" id="path" placeholder="path" onChange={this.updatePath}/><br></br>
                    <button type="button" onClick={this.showXSS} >XSS hack</button>
                    <button type="button" onClick={this.pathTraversal} >Path traversal hack</button>
                  </div>
                  <div dangerouslySetInnerHTML={{__html: this.state.ret}}></div>
              </div>
            </div>
          </div>
        </header>
      </div>
    );
  }
}

export default App;
