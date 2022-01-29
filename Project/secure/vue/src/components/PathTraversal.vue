<template>
  <div class="container">
    <div class="row">
        <div class="col-md-7 mrgnbtm">
        <h2>Path Traversal</h2>
            <form>
                <div class="row">
                    <div class="form-group col-md-6">
                        <input type="text" class="form-control" v-model="username" name="username" id="username" placeholder="username" />
                    </div>
                    <div class="form-group col-md-6">
                        <input type="text" class="form-control" v-model="path" name="path" id="path" placeholder="path" />
                    </div>
                    <div class="form-group col-md-6">
                        <select class="form-control" v-model="safeness" name="safeness" id="safeness">
                            <option value="0">No sanitization</option>
                            <option value="1">Sanitize special characters</option>
                            <option value="2">Hash name of file</option>
                            <option value="3">Check database</option>
                        </select>
                    </div>
                </div>
                <button type="button" @click='pathTraversal()' class="btn btn-danger">PathTraversal</button>
            </form>
        </div>
    </div>
    </div>
</template>

<script>
export default {
  name: 'PathTraversal',
  data() {
    return {
      username: '',
      path: '',
      safeness: '0'
    }
  },
  methods: {
      pathTraversal() {
          const payload = {
              username: this.username,
              path: this.path,
              safeness: this.safeness
          }
          this.$emit('pathTraversal', payload)
          this.clearForm();
      },
      clearForm() {
          this.username = "";
          this.path = "";
          this.safeness = "0";
      }
  }
}
</script>