import axios from "axios";

const state = {
  user: null,
};

const getters = {
  isAuthenticated: (state) => !!state.user,
  StateUser: (state) => state.user,
};

const actions = {
  async LogIn({commit}, user) {
    let ret = await axios.post("/api/login", user);
    if (ret.data.auth) {
      await commit("setUser", ret.data.username);
    } else {
      throw 'No username or wrong password'
    }
  },

  async LogOut({ commit }) {
    let user = null;
    commit("logout", user);
  },

  async GetFile(_, file) {
    let ret = await axios.post("/api/download", file);
    if (ret.data.found == true) {
      return ret.data.file;
    }
    return "No file found";
  },

  async GetUser(commit, user) {
    if (user.get("username") === "") {
      user.set("username", commit.state.user);
    }

    let ret = await axios.post("/api/profile", user);
    if (ret.data.found == true) {
      return ret.data.data;
    }
    return [];
  },

  async SendMessage(commit, message) {
    message.append("username", commit.state.user);
    await axios.post("/api/message", message);
  },

  async GetMessages() {
    let ret = await axios.get("/api/messages");
    return ret.data.messages;
  }
};

const mutations = {
  setUser(state, username) {
    state.user = username;
  },
  getUser(state) {
    return state.user;
  },
  logout(state, user) {
    state.user = user;
  },
};

export default {
  state,
  getters,
  actions,
  mutations,
};
