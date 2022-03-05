<template>
  <div class="d-flex">
    <v-row>
      <v-col cols="12"
            sm="3"
            md="3"
            lg="2">
        <v-card max-width="500">
          <v-list class="pt-0 px-0">
            <v-list-group
              v-for="item in items"
              :key="item.title"
              v-model="item.active"
              :prepend-icon="item.action"
              no-action
            >
              <template v-slot:activator>
                <v-list-item-content>
                  <v-list-item-title v-text="item.title"></v-list-item-title>
                </v-list-item-content>
              </template>

              <v-list-item v-for="child in item.items" :key="child.title">
                <v-list-item-content>
                  <router-link
                    class="no-style"
                    :to="
                      '/browse/' +
                      item.title.toLowerCase() +
                      '/' +
                      child.toLowerCase()
                    "
                    >{{ child }}</router-link
                  >
                </v-list-item-content>
              </v-list-item>
            </v-list-group>
          </v-list>
        </v-card>
      </v-col>
      <v-col>
        <v-row>
          <v-col
            cols="12"
            sm="6"
            md="4"
            lg="3"
            
            v-for="model in models"
            :key="model.id"
            
          >
            <model :model-data="model" :is-model="isModel" class="mx-auto"></model>
          </v-col>
        </v-row>
        <div class="d-flex"></div>
        <div class="text-center">
          <v-pagination
            v-model="page"
            :length="pages"
            circle
            @input="pagination"
            color="orange"
          ></v-pagination>
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import Model from "../components/model/Model";
import { mapGetters } from "vuex";
export default {
  components: { Model },
  data: () => ({
    isModel: true,
    page: 1,
    pages: 0,
    items: [
      {
        action: "mdi-toy-brick",
        items: [
          "All",
          "Space",
          "Transport",
          "Architecture",
          "Nature",
          "Food",
          "Character",
          "Abstract",
        ],
        active: true,
        title: "Models",
      },
      {
        action: "mdi-texture",
        items: ["All", "Free", "Dirt", "Metal", "Wood", "Concrete", "Marble"],
        title: "Textures",
      },
    ],
    models: [],
  }),
  beforeMount() {
    if (this.getToken() === "") {
      this.$router.push("/login");
    }
  },
  methods: {
    ...mapGetters(["getToken"]),
    pagination() {
      this.getResults();
    },
    capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    },
    getResults() {
      let token = this.getToken();
      let pathName = window.location.pathname.split("/");
      let category = "";
      let type = "";
      if (pathName.length > 2) {
        category = this.capitalizeFirstLetter(pathName[pathName.length - 1]);
        type = this.capitalizeFirstLetter(pathName[pathName.length - 2]);
      }
      if (category == "All" || category == "all") category = "";
      if (type == "Models") {
        fetch(
          "http://localhost:8000/api/model/?category=" +
            category +
            "&page=" +
            this.page,
          {
            method: "GET",
            headers: {
              authorization: "Bearer " + token,
            },
          }
        )
          .then((res) => res.json())
          .then((data) => {
            this.models = data.slice(0, data.length - 1);
            this.pages = data[data.length - 1];
            this.isModel = true;
            console.log(this.models)
          });
      } else if (type == "Textures") {
        fetch(
          "http://localhost:8000/api/texture/?category=" +
            category +
            "&page=" +
            this.page,
          {
            method: "GET",
            headers: {
              authorization: "Bearer " + token,
            },
          }
        )
          .then((res) => res.json())
          .then((data) => {
            this.models = data.slice(0, data.length - 1);
            this.pages = data[data.length - 1];
            this.isModel = false;
            console.log(this.models)
          });
      }
    },
  },
  created: function () {
    this.getResults();
  },
  watch: {
    $route(to, from) {
      console.log(to.params.category, from);
      this.getResults();
    },
  },
};
</script>

<style lang="scss" scoped>
#vh100 {
  height: calc(100vh - 56px) !important;
}
.no-style {
  text-decoration: none;
  color: rgba(0, 0, 0, 0.87) !important;
}
.router-link-active {
  color: orange !important;
}
</style>
