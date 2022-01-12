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
      <v-text-field
        label="Confirm Password"
        hide-details="auto"
        :rules="[passwordConfirmationRule]"
        type="password"
        ref="password"
        v-model="confirmPassword"
      ></v-text-field>
      <v-btn class="mt-10" type="submit"> submit </v-btn>
    </form>
  </v-container>
</template>

<script>
import { mapMutations } from "vuex";
export default {
  data: () => {
    return {
      email: "",
      password: "",
      confirmPassword: "",
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
  computed: {
    passwordConfirmationRule: function () {
      return () =>
        this.password === this.confirmPassword || "Password must match";
    },
  },
  methods: {
    ...mapMutations(["setToken"]),
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
      });
      if (
        passwordCount === this.passwordRules.length &&
        emailCount == this.emailRules.length &&
        this.passwordConfirmationRule() === true
      ) {
        const data = new FormData(e.target);
        const value = Object.fromEntries(data.entries());
        fetch("http://localhost:8000/api/register", {
          method: "POST",
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': "*",
          },
          body: JSON.stringify(value),
        })
          .then((res) => {
            return res.json();
          })
          .then((data) => {
            if (data.token === undefined) {
              console.log("The email address is already registered!");
            } else {
              this.$store.commit("setToken", data.token);
              this.$router.push("/");
              window.location.reload();
            }
          });
      }
    },
  },
};
</script>

<style>
</style>