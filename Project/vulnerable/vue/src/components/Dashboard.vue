<template>
  <div class="hello">
    <div class="container mrgnbtm">
          <div class="row">
              <LoginUser @loginUser="loginUser($event)" />
              <div class="form-group col-md-6">
                <input type="text" class="form-control" v-model="path" name="path" id="path" placeholder="path" />
              </div>
          </div>
          <button type="button" @click='showXSS()' class="btn btn-danger">XSS hack</button>
          <button type="button" @click='pathTraversal()' class="btn btn-danger">Path traversal hack</button>
          <div v-html="resp"></div>
    </div>
  </div>
</template>

<script>
import LoginUser from './LoginUser.vue'

export default {
  data() {
    return {
      resp: '',
      path: ''
    }
  },
  name: 'Dashboard',
  components: {
    LoginUser
  },
  methods: {
    loginUser(data) {
      fetch(`/api/login`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({user: data})
      }).then(response => response.json())
      .then(data => (this.resp = data));
    },
    showXSS() {
      fetch(`/api/show_xss`, {
        method: 'GET',
        headers: {'Content-Type': 'application/json'}
      }).then(response => response.json())
      .then(data => (this.resp = data));
    },
    pathTraversal () {
      fetch(`/api/path_traversal`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({'path': this.path})
      }).then(response => response.json())
      .then(data => (this.resp = data));
    }
  }
}
</script>