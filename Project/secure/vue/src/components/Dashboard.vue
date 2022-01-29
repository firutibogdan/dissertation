<template>
  <div class="hello">
    <div class="container mrgnbtm">
          <div class="row">
              <LoginUser @loginUser="loginUser($event)" />
              <XSS @xss="xss($event)" />
              <PathTraversal @pathTraversal="pathTraversal($event)" />
          </div>
          <div v-html="resp_html"></div>
          <div v-text="resp"></div>
    </div>
  </div>
</template>

<script>
import LoginUser from './LoginUser.vue'
import XSS from './XSS.vue'
import PathTraversal from './PathTraversal.vue'

export default {
  data() {
    return {
      resp: '',
      resp_html: '',
      path: ''
    }
  },
  name: 'Dashboard',
  components: {
    LoginUser,
    XSS,
    PathTraversal
  },
  methods: {
    loginUser(data) {
      fetch(`/api/login`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
      }).then(response => response.json())
      .then(data => (this.resp = data));
    },
    async xss(data) {
      const response = await fetch(`/api/show_xss`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
      });

      const answer = await response.json();

      if (response.headers.get('Content-Type') == 'text/plain; charset=utf-8') {
        this.resp = answer
        this.resp_html = ''
      } else {
        this.resp = ''
        this.resp_html = answer
      }
    },
    pathTraversal (data) {
      fetch(`/api/path_traversal`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
      }).then(response => response.json())
      .then(data => (this.resp = data));
    }
  }
}
</script>