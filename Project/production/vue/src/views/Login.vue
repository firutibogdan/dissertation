<template>
  <div class="container">
    <div class="row">
      <div class="div">
        <h2 style="font-family:courier;" align="center">Vulnerable VueJS</h2>
        <form @submit.prevent="submit" align="center">
          <input class="username" id="name" name="username"
            placeholder="username" type="text"
            style="font-family:courier;"
            v-model="form.username"
            required="required"><br><br>
          <input class="password" id="password" name="password"
            placeholder="password" type="password"
            style="font-family:courier;"
            v-model="form.password"
            required="required"><br><br>
          <input class="button" id="submit" name="submit" type="submit"
            value="Sign In">
        </form>
        <p style="color:red" v-if="showError" id="error">User unknown or password mismatch</p>
      </div>
    </div>
  </div>
</template>

<style>
  .div {
    background-color: #e6e6e6;
    width: 40%;
    border: 15px solid #006600;
    padding: 50px;
    position: absolute;
    top: 25%;
    left: 25%;
  }

  .button {
    display: inline-block;
    padding: 6px 10px;
    font-size: 12px;
    cursor: pointer;
    text-align: center;
    text-decoration: none;
    outline: none;
    color: #663300;
    background-color: #cce5ff;
    border: none;
    border-radius: 15px;
    box-shadow: 0 9px #999;
    font-family:courier;
  }

  .button:hover {background-color: #80bdff}

  .button:active {
    background-color: #4da3ff;
    box-shadow: 0 5px #666;
    transform: translateY(4px);
  }
</style>

<script>
import { mapActions } from "vuex";

export default {
  name: "Login",
  components: {},
  data() {
    return {
      form: {
        username: "",
        password: "",
      },
      showError: false
    };
  },
  methods: {
    ...mapActions(["LogIn"]),
    async submit() {
      const User = new FormData();
      User.append("username", this.form.username);
      User.append("password", this.form.password);
      try {
          await this.LogIn(User);
          this.$router.push("/");
          this.showError = false
      } catch (error) {
        this.showError = true
      }
    },
  },
};
</script>
