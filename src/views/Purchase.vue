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
            <v-icon
              @click="onButtonClick(row.item)"
              color="rgb(104 250 220 / 65%)"
              background="white"
              >mdi-cloud-download</v-icon
            >
          </td>
          <td>
            <v-rating
              v-model="row.item.rating"
              color="yellow darken-3"
              background-color="grey darken-1"
              empty-icon="$ratingFull"
              half-increments
              hover
              medium
              @input="handleRatingChange(row.item)"
            ></v-rating>
          </td>
        </tr>
      </template>
    </v-data-table>
    <v-snackbar v-model="snackbar" :timeout="timeout" top>
      {{ text }}

      <template v-slot:action="{ attrs }">
        <v-btn color="pink" text v-bind="attrs" @click="snackbar = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  data() {
    return {
      loading: true,
      headers: [
        {
          text: "Model/ Texture name",
          align: "start",
          sortable: false,
          value: "name",
        },
        { text: "Price in €", sortable: true, value: "price" },
        { text: "Type", value: "type" },
        { text: "Download", value: "download" },
        { text: "Rating", value: "rating" },
      ],
      items: [],
      snackbar: false,
      text: `Rating updated successfully!`,
      timeout: 3000,
    };
  },
  methods: {
    ...mapGetters(["getToken"]),
    handleRatingChange(item) {
      let jwt = "Bearer " + this.getToken();
      fetch(
        "http://localhost:8000/api/purchase/" +
          item.objectId +
          "?type=" +
          item.type,
        {
          method: "POST",
          mode: "cors",
          headers: {
            Authorization: jwt,
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ rating: item.rating }),
        }
      )
        .then((res) => res.json())
        .then((json) => {
          this.snackbar = true;
          console.log(json);
        });
    },
    onButtonClick(obj) {
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