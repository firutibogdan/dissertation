<template>
  <div class="div" align="left">
    <div v-for="item in items" :key="item.username">
      <h2>Hello, <b>{{item.username}}</b> AKA <b>{{item.name}}</b>!</h2>
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
  name: "Profile",
  components: {},
  data() {
    return {
      items: []
    };
  },
  methods: {
    ...mapActions(["GetUser"]),
    async getUser() {
      const User = new FormData();
      if (this.$route.query.profile_id != undefined) {
        User.append("username", this.$route.query.profile_id);
      } else {
        User.append("username", "");
      }
      return await this.GetUser(User);
    }
  },
  created: async function() {
    this.items = await this.getUser();
  }
};
</script>
