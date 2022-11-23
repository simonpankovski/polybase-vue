<template>
  <v-card class="skeleton" dark>
    <div class="image loading"></div>
    <v-card-title class="title-wrapper"
      ><div class="loading"></div
    ></v-card-title>
    <v-card-text class="d-flex text-wrapper rating"
      ><div class="loading"></div>
    </v-card-text>
    <v-divider class="mx-4"></v-divider>
    <v-card-text class="py-4">
      <v-chip-group active-class="deep-purple accent-4 white--text" column>
        <v-chip class="tag loading" color="rgb(48 48 48)"
          ><span class="white--text"></span
        ></v-chip>
        <v-chip class="tag loading" color="rgb(48 48 48)"
          ><span class="white--text"></span
        ></v-chip>
        <v-chip class="tag loading" color="rgb(48 48 48)"
          ><span class="white--text"></span
        ></v-chip>
      </v-chip-group>
    </v-card-text>
    <v-card-actions class="justify-space-between px-4 pt-0 pb-4">
      <v-btn color="loading"></v-btn>
    </v-card-actions>
  </v-card>
</template>
<script></script>
<style scoped lang="scss">
@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}
.loading {
  position: relative;
  overflow: hidden;
  &::after {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    transform: translateX(-100%);
    background-image: linear-gradient(
      90deg,
      rgba(#454545, 0) 0,
      rgba(#454545, 0.2) 20%,
      rgba(#454545, 0.5) 60%,
      rgba(#454545, 0)
    );
    animation: shimmer 2s infinite;
    content: "";
  }
}
.skeleton {
  max-width: 400px !important;
  .tag {
    width: 4vw;
  }
  .image {
    background: #333333;
    height: 300px;
    width: 100%;
  }

  .title-wrapper {
    height: 64px;

    div {
      border-radius: 4px;
      background: #333333;
      width: 50%;
      height: 100%;
      content: "";
    }
  }

  .text-wrapper {
    height: 60px;
  }

  .rating {
    width: 70%;
    height: 52px;
    align-items: center;
    div {
      border-radius: 4px;
      background: #333333;
      width: 50%;
      height: 70%;
      content: "";
    }
  }
}

.height {
  height: 90vh;
  width: 80vw;
  padding: 0px 3%;
}

#container {
  overflow-y: visible;
}

.bg-color {
  padding: 20px;
  background: #333333;
}

.v-overlay--active {
  backdrop-filter: blur(5px) !important;
}
</style>
