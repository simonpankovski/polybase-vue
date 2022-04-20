<template>
  <v-card color="grey darken-4">
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
          label="Model Name"
          dark
        ></v-text-field>
        <v-card flat color="transparent">
          <v-subheader class="white--text px-0">Price in EUR</v-subheader>
          <v-card-text class="mt-0 pa-0">
            <v-row>
              <v-col class="mt-0 pt-0">
                <v-slider
                  v-model="slider"
                  class="align-center"
                  :max="max"
                  :min="min"
                  hide-details
                  dark
                >
                  <template v-slot:append>
                    <v-text-field
                      dark
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
          dark
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
          dark
          small-chips
          multiple
          counter
          :rules="fileRules"
          name="format"
          v-model="format"
          required
          label="Import model and textures"
        ></v-file-input>
        <v-combobox
          dark
          v-model="tags"
          :items="items"
          label="Tags"
          name="tags"
          multiple
          chips
        ></v-combobox>
        <v-select
          dark
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
                  color="pink"
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
  </v-card>
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
      categories: [
        "Space",
        "Transport",
        "Architecture",
        "Nature",
        "Food",
        "Character",
        "Abstract",
      ],
      tags: [],
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
        data.append("tags", Object.values(this.tags));
        data.append("category", this.category);

        let token = "Bearer " + this.getToken();
        fetch("http://localhost:8000/api/model/", {
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
            if (res.code == 400) {
              setTimeout(() => {
                this.overlay = false;
              }, 3000);
            }
            if (res.code == 200) {
              setTimeout(() => {
                this.$router.push("/browse/models/all");
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
    fetch("http://localhost:8000/api/tag", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        authorization: "Bearer " + token,
      },
    })
      .then((res) => {
        return res.json();
      })
      .then((data) => (this.items = data));
  },
};
</script>

<style lang="scss" scoped>
.v-input {
  margin-top: 15px;
}
</style>