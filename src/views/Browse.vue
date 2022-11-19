<template>
  <div id="main">
    <v-row class="mx-0">
      <v-col class="px-0" cols="12" sm="3" md="3" lg="2">
        <v-card dark>
          <div class="px-4 relative">
            <input
              name="txtName"
              id="search"
              class="v-list-item relative"
              @input="debouncedSearch"
              v-model="searchText"
            />
            <v-icon id="magnify" dark> mdi-magnify </v-icon>
          </div>
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
      <v-col class="mt-5">
        <v-row class="mx-0" v-if="!isLoading">
          <v-col
            cols="12"
            sm="6"
            md="6"
            lg="4"
            v-for="model in models"
            :key="model.id"
          >
            <model :model-data="model" :is-model="isModel"></model>
          </v-col>
        </v-row>
        <v-row class="mx-0" v-else>
          <v-col v-for="n in 6" :key="n" cols="12" sm="6" md="6" lg="4">
            <skeleton-card />
          </v-col>
        </v-row>

        <div class="text-center pagination">
          <v-pagination
            v-model="page"
            :length="pages"
            circle
            @input="pagination"
            color="orange"
            class="mt-10"
          >
          </v-pagination>
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import Model from "../components/model/Model";
import SkeletonCard from "../components/model/SkeletonCard";
import { mapGetters } from "vuex";
import debounce from "lodash/debounce";
export default {
  components: { Model, SkeletonCard },
  data: () => ({
    searchText: "",
    isModel: true,
    isLoading: true,
    page: 1,
    pages: 0,
    items: [
      {
        action: "mdi-shape",
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
        items: [
          "All",
          "Free",
          "Ceramic",
          "Dirt",
          "Metal",
          "Wood",
          "Concrete",
          "Marble",
        ],
        title: "Textures",
      },
    ],
    models: [],
  }),
  beforeMount() {
    /*if (this.getToken() === "") {
      this.$router.push("/login");
    }*/
    console.log(debounce);
  },
  methods: {
    ...mapGetters(["getToken", "getSearchTerm"]),
    pagination() {
      this.getResults();
    },
    capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    },
    search() {
      this.$store.commit("setSearchTerm", this.searchText);
    },
    getResults(searchTerm) {
      if (searchTerm == undefined) searchTerm = "";
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
            this.page +
            "&search=" +
            searchTerm,
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
            this.isLoading = false;
          });
      } else if (type == "Textures") {
        fetch(
          "http://localhost:8000/api/texture/?category=" +
            category +
            "&page=" +
            this.page +
            "&search=" +
            searchTerm,
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
            this.isLoading = false;
          });
      }
    },
  },
  created: function () {
    this.getResults();
  },
  computed: {
    searchTerm() {
      return this.getSearchTerm();
    },
    debouncedSearch() {
      return debounce(this.search, 1000);
    },
  },
  watch: {
    $route(to, from) {
      console.log(to.params.category, from);
      this.isLoading = true;
      this.getResults();
    },
    searchTerm(to, from) {
      console.log(to, from);
      this.getResults(to);
    },
  },
};
</script>

<style lang="scss" scoped>
#magnify {
  right: 20px;
  top: 20%;
  position: absolute;
  z-index: 2;
}
#search {
  width: 100%;
  border-bottom: 1px solid white;
  color: white;
  transition: all 0.2s ease-in;
  &:focus {
    border-color: orange;
    & + i {
      color: orange;
    }
  }
}
.relative {
  position: relative;
  display: flex;
}
.pagination {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: 30px;
}

.no-style {
  text-decoration: none;
  color: rgba(255, 255, 255, 0.87) !important;
}

.router-link-active {
  color: orange !important;
}

.v-application .primary--text {
  color: orange !important;
}
</style>
