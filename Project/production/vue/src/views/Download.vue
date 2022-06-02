<template>
  <div class="div" align="left">
    {{content}}
  </div>
</template>

<style>
  .div {
    background-color: #e6e6e6;
    width: 40%;
    border: 15px solid #006600;
    text-align: left;
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
  name: "Download",
  components: {},
  data() {
    return {
      content: ""
    };
  },
  methods: {
    ...mapActions(["GetFile"]),
    async getContent() {
      const File = new FormData();
      File.append("path", this.$route.query.file);
      return await this.GetFile(File);
    }
  },
  created: async function() {
    this.content = await this.getContent();
  }
};
</script>
