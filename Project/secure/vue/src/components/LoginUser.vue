<template>
  <div class="container">
    <div class="row">
        <div class="col-md-7 mrgnbtm">
        <h2>Login</h2>
            <form>
                <div class="row">
                    <div class="form-group col-md-6">
                        <input type="text" class="form-control" v-model="username" name="username" id="username" placeholder="username" />
                    </div>
                    <div class="form-group col-md-6">
                        <input type="password" class="form-control" v-model="password" name="password" id="password" placeholder="password" />
                    </div>
                    <div class="form-group col-md-6">
                        <select class="form-control" v-model="safeness" name="safeness" id="safeness">
                            <option value="0">No sanitization</option>
                            <option value="1">Only letters and numbers</option>
                            <option value="2">Sanitize \'</option>
                            <option value="3">Hash inputs</option>
                        </select>
                    </div>
                </div>
                <button type="button" @click='loginUser()' class="btn btn-danger">Login</button>
            </form>
        </div>
    </div>
    </div>
</template>

<script>
export default {
  name: 'LoginUser',
  data() {
    return {
      username: '',
      password: '',
      safeness: '0'
    }
  },
  methods: {
      loginUser() {
          const payload = {
              username: this.username,
              password: this.password,
              safeness: this.safeness
          }
          this.$emit('loginUser', payload)
          this.clearForm();
      },
      clearForm() {
          this.username = "";
          this.password = "";
          this.safeness = "0";
      }
  }
}
</script>