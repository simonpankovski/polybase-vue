<template>
  <div class="d-flex">
    <v-row>
      <v-col cols="2">
        <v-card max-width="500">
          <v-list class="pt-0">
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
                  <router-link class="no-style" :to="'/browse/' + child">{{
                    child
                  }}</router-link>
                </v-list-item-content>
              </v-list-item>
            </v-list-group>
          </v-list>
        </v-card>
      </v-col>
      <v-col>
        <div class="d-flex">
          <model
            v-for="model in models"
            :key="model.id"
            :model-data="model"
          ></model>
        </div>
        <div class="text-center">
          <v-pagination
            v-model="page"
            :length="pages"
            circle
            @input="pagination"
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
    page: 1,
    pages: 0,
    items: [
      {
        action: "mdi-toy-brick",
        items: [
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
        items: [{ title: "Free" }],
        title: "Textures",
      },
    ],
    models: [],
  }),
  methods: {
    ...mapGetters(["getToken"]),
    pagination() {
      this.getResults();
    },
    getResults() {
      let token = this.getToken();
      let pathName = window.location.pathname.split("/");
      let category = "";
      if (pathName.length > 2) {
        category = pathName[pathName.length - 1];
      }
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
        });
    },
  },
  created: function () {
    this.getResults();
  },
  watch: {
    $route(to, from) {
      console.log(to.params.category, from);
      console.log(document.querySelectorAll(".no-style"))
      this.getResults();
    },
  },
};
</script>

<style lang="scss">
#vh100 {
  height: calc(100vh - 56px) !important;
}
.no-style {
  text-decoration: none;
  color: rgba(0, 0, 0, 0.87) !important;
}
.router-link-active {
  color: orange!important;
}
</style>
