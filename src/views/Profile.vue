<template>
  <v-container>
    <h1>Update Profile</h1>
    <v-form v-model="valid">
      <v-container>
        <v-row>
          <v-col md="4">
            <v-text-field
              v-model="email"
              :rules="emailRules"
              label="E-mail"
              required
            ></v-text-field>
          </v-col>
        </v-row>
      </v-container>
    </v-form>
  </v-container>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  data: () => ({
    valid: false,
    email: "",
    emailRules: [
      (v) => !!v || "E-mail is required",
      (v) => /.+@.+/.test(v) || "E-mail must be valid",
    ],
  }),
  methods: {
    ...mapGetters(["getToken", ]),
  },
  beforeMount() {
    if (this.getToken() === "") {
        this.$router.push("/login");
    }
  }
};
</script>

<style>
</style>