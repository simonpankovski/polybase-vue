import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    token: null,
    cart: 0
  },
  mutations: {
    setToken(state, token) {
      state.token = token;
      setCookie("token", token, 1);
    },
    removeToken(state) {
      state.token = null;
      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    },
    incrementCart(state) {
      state.cart++;
    },
    decrementCart(state) {
      state.cart++;
    },
    setCart(state, count) {
      state.cart = count;
    }
  },
  getters: {
    getToken: () => {
      return getCookie("token");
    },
    getCart: (state) => {
      return state.cart;
    }
  },
  actions: {
  },
  modules: {},
});

function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}
function setCookie(cname, cvalue, exdays) {
  document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  const d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  let expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}