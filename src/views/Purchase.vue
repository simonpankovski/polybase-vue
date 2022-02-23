<template>
  <v-container>
    <v-data-table
      dark
      :headers="headers"
      :items="items"
      :sort-by="['price']"
      :sort-desc="[false]"
      multi-sort
      class="elevation-1"
      :loading="loading"
      loading-text="Loading... Please wait"
    >
      <template v-slot:item="row">
        <tr>
          <td>{{ row.item.name }}</td>
          <td>{{ row.item.price }}</td>
          <td>{{ row.item.type }}</td>
          <td>
            <v-btn small @click="onButtonClick(row.item)">
              <v-icon>mdi-cloud-download</v-icon>
            </v-btn>
          </td>
          <td>
            <v-rating
              v-model="rating"
              color="yellow darken-3"
              background-color="grey darken-1"
              empty-icon="$ratingFull"
              half-increments
              hover
              large
            ></v-rating>
          </td>
        </tr>
      </template>
    </v-data-table>
  </v-container>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  data() {
    return {
      loading: true,
      rating: 4.5,
      headers: [
        {
          text: "Model/ Texture name",
          align: "start",
          sortable: false,
          value: "name",
        },
        { text: "Price in $", sortable: true, value: "price" },
        { text: "Type", value: "type" },
        { text: "Download", value: "download" },
        { text: "Rating", value: "rating" },
      ],
      items: [],
    };
  },
  methods: {
    ...mapGetters(["getToken"]),
    onButtonClick(obj) {
      console.log(obj);
      let jwt = "Bearer " + this.getToken();
      fetch("http://localhost:8000/api/" + obj.type + "/" + obj.objectId, {
        method: "GET",
        mode: "cors",
        headers: {
          Authorization: jwt,
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.blob())
        .then((blob) => {
          var file = window.URL.createObjectURL(blob);
          window.location.assign(file);
        });
    },
  },
  beforeMount() {
    if (this.getToken() === "") {
        this.$router.push("/login");
    }
  },
  created: function () {
    let token = "Bearer " + this.getToken();
    fetch("http://localhost:8000/api/purchase/", {
      method: "GET",
      mode: "cors",
      headers: {
        Authorization: token,
        "Access-Control-Allow-Origin": "*",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        this.items = data.message;
        this.loading = false;
      });
  },
};
</script>

<style scoped>
</style>