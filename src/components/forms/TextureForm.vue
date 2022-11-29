<template>
  <v-container class="px-10">
    <v-form
      ref="form"
      v-model="valid"
      lazy-validation
      @submit.prevent="handleSubmit"
    >
      <v-text-field
        v-model="title"
        :rules="rules"
        counter="50"
        name="name"
        label="Texture Name"
      ></v-text-field>
      <v-card flat color="transparent">
        <v-subheader class="px-0">Price in EUR</v-subheader>

        <v-card-text class="mt-0 pa-0">
          <v-row>
            <v-col class="mt-0 pt-0">
              <v-slider
                v-model="slider"
                class="align-center"
                :max="max"
                :min="min"
                hide-details
              >
                <template v-slot:append>
                  <v-text-field
                    v-model="slider"
                    name="price"
                    class="mt-0 pt-0"
                    hide-details
                    single-line
                    type="number"
                    style="width: 60px"
                  ></v-text-field>
                </template>
              </v-slider>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
      <v-file-input
        small-chips
        multiple
        counter
        required
        v-model="thumbnails"
        :rules="thumbnailRules"
        name="thumbnails"
        accept="image/*"
        label="Upload thumbnails"
      ></v-file-input>
      <v-file-input
        small-chips
        multiple
        counter
        :rules="fileRules"
        name="format"
        v-model="format"
        required
        label="Upload texture files"
      ></v-file-input>
      <v-select
        :items="categories"
        label="Category"
        v-model="category"
        :rules="categoryRules"
        name="category"
        required
      ></v-select>
      <div class="text-center">
        <v-btn
          color="rgb(104 250 220 / 65%)"
          class="white--text my-5"
          type="submit"
        >
          Submit
        </v-btn>

        <v-overlay :value="overlay">
          <v-snackbar v-model="snackbar" :timeout="100000">
            {{ text }}

            <template v-slot:action="{ attrs }">
              <v-btn
                color="#94d2bd"
                text
                v-bind="attrs"
                @click="snackbar = false"
              >
                Close
              </v-btn>
            </template>
          </v-snackbar>
          <v-progress-circular indeterminate size="64"></v-progress-circular>
        </v-overlay>
      </div>
    </v-form>
  </v-container>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  data() {
    return {
      valid: true,
      overlay: false,
      title: "",
      category: "",
      format: [],
      thumbnails: [],
      rules: [
        (v) => v.length <= 50 || "Max 25 characters",
        (v) => v.length >= 4 || "Min 4 characters",
      ],
      fileRules: [
        (v) => !!v || "At least one file is required",
        (v) => (v && v.length > 0) || "At least one file is required",
      ],
      thumbnailRules: [
        (v) => !!v || "At least one thumbnail is required",
        (v) => (v && v.length > 0) || "At least one thumbnail is required",
      ],
      categoryRules: [
        (v) => !!v || "Please select a category!",
        (v) => (v && v.length > 0) || "Please select a category!",
      ],
      min: 0,
      max: 999,
      slider: 40,
      items: [],
      categories: ["Free", "Dirt", "Metal", "Wood", "Concrete", "Marble"],
      snackbar: false,
      text: ``,
    };
  },
  methods: {
    ...mapGetters(["getToken"]),
    handleSubmit() {
      if (!this.$refs.form.validate()) {
        console.log("invalid");
      } else {
        this.overlay = !this.overlay;
        const data = new FormData();
        Object.values(this.format).forEach((element) => {
          data.append("format[]", element);
        });
        this.thumbnails.forEach((element) => {
          data.append("thumbnails[]", element);
        });
        data.append("price", this.slider);
        data.append("name", this.title);
        data.append("category", this.category);

        let token = "Bearer " + this.getToken();
        fetch(process.env.VUE_APP_BACKEND_SERVICE_URL + "texture/", {
          method: "POST",
          mode: "cors",
          headers: {
            Authorization: token,
            "Access-Control-Allow-Origin": "*",
          },
          body: data,
        })
          .then((res) => {
            return res.json();
          })
          .then((res) => {
            this.snackbar = true;
            this.text = res.message;
            if (res.code == 200) {
              setTimeout(() => {
                this.$router.push("/browse/textures/all");
              }, 2000);
            }
          });
      }
    },
  },
  created: function () {
    let token = this.getToken();
    if (token == "") {
      this.$router.push("/login");
    }
  },
};
</script>

<style lang="scss" scoped>
.v-input {
  margin-top: 15px;
}
</style>