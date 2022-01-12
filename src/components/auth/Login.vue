<template>
  <v-container>
    <h1>LOGIN</h1>
    <form @submit.prevent="login">
      <v-text-field
        label="Email"
        hide-details="auto"
        :rules="emailRules"
        v-model="email"
        name="username"
      ></v-text-field>
      <v-text-field
        label="Password"
        :rules="passwordRules"
        hide-details="auto"
        type="password"
        v-model="password"
        name="password"
      ></v-text-field>
      <p v-if="invalidLogin" class="red--text pt-2">Invalid Credentials</p>
      <v-btn class="mt-10" type="submit"> submit </v-btn>
    </form>
  </v-container>
</template>
<script>
import { mapMutations } from "vuex";
import { mapGetters } from "vuex";
export default {
  name: "Login",
  data: () => {
    return {
      invalidLogin: false,
      email: "",
      password: "",
      passwordRules: [
        (v) => !!v || "Password is required",
        (v) => v.length <= 50 || "Max 50 characters",
        (v) => v.length >= 8 || "Min 8 characters",
      ],
      emailRules: [
        (v) => !!v || "Email is required",
        (v) => /.+@.+/.test(v) || "E-mail must be valid",
      ],
    };
  },
  methods: {
    ...mapMutations(["setToken"]),
    ...mapGetters(["getToken"]),
    login: function (e) {
      let emailCount = 0;
      let passwordCount = 0;
      this.emailRules.forEach((rule) => {
        if (rule(this.email) === true) {
          emailCount++;
        }
      });
      this.passwordRules.forEach((rule) => {
        if (rule(this.password) === true) {
          passwordCount++;
        }
        if (
          passwordCount === this.passwordRules.length &&
          emailCount == this.emailRules.length
        ) {
          const data = new FormData(e.target);
          const value = Object.fromEntries(data.entries());
          fetch("http://localhost:8000/api/login_check", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify(value),
          })
            .then((res) => {
              return res.json();
            })
            .then((data) => {
              if (data.code == 401) {
                this.invalidLogin = true;
              } else {
                this.$store.commit("setToken", data.token);
                this.$router.push("/");
                window.location.reload();
              }
            });
        }
      });
    },
  },
};
</script>