<template>
  <v-container>
    <v-data-table
        dark
      :headers="headers"
      :items="desserts"
      :sort-by="['price', 'fat']"
      :sort-desc="[false, true]"
      multi-sort
      class="elevation-1"
    ></v-data-table>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      headers: [
        {
          text: "Model/ Texture name",
          align: "start",
          sortable: false,
          value: "name",
        },
        { text: "Price in $", value: "price" },
      ],
      desserts: [
        {
          name: "Frozen Yogurt",
          price: 200,
        },
        {
          name: "Ice cream sandwich",
          price: 200,
        },
        {
          name: "Eclair",
          price: 300,
        },
      ],
    };
  },
};
</script>

<style>
</style>