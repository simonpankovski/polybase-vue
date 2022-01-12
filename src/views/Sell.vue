<template>
  <v-container>
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
      ></v-text-field>
      <v-card flat color="transparent">
        <v-subheader>Price in EUR</v-subheader>

        <v-card-text>
          <v-row>
            <v-col>
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
        label="Import model and textures"
      ></v-file-input>
      <v-combobox
        v-model="tags"
        :items="items"
        label="Tags"
        name="tags"
        multiple
        chips
      ></v-combobox>
      <v-select
        :items="categories"
        label="Category"
        v-model="category"
        :rules="categoryRules"
        name="category"
        required
      ></v-select>
      <div class="text-center">
        <v-btn color="deep-orange accent-2" class="white--text" type="submit">
          Submit
        </v-btn>

        <v-overlay :value="overlay">
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
        (v) => v.length > 5 || "Min 5 characters",
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
    };
  },

  methods: {
    ...mapGetters(["getToken"]),
    handleSubmit() {
      if (!this.$refs.form.validate()) {
        console.log("invalid");
      } else {
        this.overlay = !this.overlay
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
          "Authorization": token,
          "Access-Control-Allow-Origin": "*",
        },
        body: data,
      })
        .then(() => {
          this.$router.push("/browse");
        })
      }
    },
    getTags() {},
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

<style>
</style>