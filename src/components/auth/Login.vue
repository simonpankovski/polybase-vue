<template>
  <v-container id="container">
    <v-card color="grey darken-4" class="pa-8" id="login-form">
      <h1 class="white--text">LOGIN</h1>
      <form @submit.prevent="login">
        <v-text-field
          label="Email"
          hide-details="auto"
          :rules="emailRules"
          v-model="email"
          name="username"
          dark
        >
        </v-text-field>
        <v-text-field
          label="Password"
          :rules="passwordRules"
          hide-details="auto"
          type="password"
          v-model="password"
          name="password"
          dark
        ></v-text-field>

        <p id="invalid-credentials" v-if="invalidLogin" class="red--text pt-2">
          Invalid Credentials
        </p>
        <div class="d-flex justify-space-between align-end pt-6 form-buttons">
          <v-btn class="orange darken-2 accent-2 white--text" type="submit">
            submit
          </v-btn>
          <a href="#" id="password-link">Forgot password?</a>
        </div>
      </form>
    </v-card>
    <v-progress-linear
      id="progress-bar"
      color="orange"
      indeterminate
      height="6"
      bottom
      v-if="loading"
    ></v-progress-linear>
  </v-container>
</template>
<script>
import { mapMutations } from "vuex";
import { mapGetters } from "vuex";
export default {
  name: "Login",
  data: () => {
    return {
      loading: false,
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
          this.loading = true;
          fetch(process.env.VUE_APP_BACKEND_SERVICE_URL + "login_check", {
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
              this.loading = false;
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
<style scoped>
#invalid-credentials {
  margin-bottom: 0;
}
#login-form {
  border-radius: 4px 4px 0 0;
}

#password-link {
  text-decoration: none;
  color: white;
}
#progress-bar {
  border-radius: 0 0 4px 4px;
}
#container {
  margin-top: 100px !important;
}
@media screen and (min-width: 600px) {
  #container {
    width: 60%;
  }
}
@media screen and (min-width: 1200px) {
  #container {
    width: 40%;
  }
}
</style>