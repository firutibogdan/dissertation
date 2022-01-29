<template>
  <div class="container">
    <div class="row">
        <div class="col-md-7 mrgnbtm">
        <h2>XSS</h2>
            <form>
                <div class="row">
                    <div class="form-group col-md-6">
                        <input type="text" class="form-control" v-model="username" name="username" id="username" placeholder="username" />
                    </div>
                    <div class="form-group col-md-6">
                        <select class="form-control" v-model="safeness" name="safeness" id="safeness">
                            <option value="0">No sanitization</option>
                            <option value="1">Sanitize special characters</option>
                            <option value="2">Add headers</option>
                        </select>
                    </div>
                </div>
                <button type="button" @click='xss()' class="btn btn-danger">XSS</button>
            </form>
        </div>
    </div>
    </div>
</template>

<script>
export default {
  name: 'XSS',
  data() {
    return {
      username: '',
      safeness: '0'
    }
  },
  methods: {
      xss() {
          const payload = {
              username: this.username,
              safeness: this.safeness
          }
          this.$emit('xss', payload)
          this.clearForm();
      },
      clearForm() {
          this.username = "";
          this.safeness = "0";
      }
  }
}
</script>