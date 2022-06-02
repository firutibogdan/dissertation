<template>
  <div class="div" align="left">
      <div v-for="item in messages" :key="item.id">
				<p><b><u>{{item.name}}</u></b>: <span v-html="item.message"></span></p>
      </div>

			<br>

      <form @submit.prevent="submit" align="center">
				<textarea rows = "5" cols = "50" placeholder="Write your message here..." name="message" v-model="form.message" required="required"></textarea><br><br>
				<input class="button" id="submit" name="submit" type="submit" value="Send">
			</form>
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
  name: "Home",
  components: {},
  data() {
    return {
      form: {
        message: "",
      },
      messages: []
    };
  },
  methods: {
    ...mapActions(["SendMessage", "GetMessages"]),
    async submit() {
      console.log(this.form.message);
      const Message = new FormData();
      Message.append("message", this.form.message);
      try {
          await this.SendMessage(Message);
          this.$router.go("/");
      } catch (error) {
        this.$router.go("/");
      }
    },
    async getMessages() {
      return await this.GetMessages();
    }
  },
  created: async function() {
    this.messages = await this.getMessages();
  }
};
</script>
