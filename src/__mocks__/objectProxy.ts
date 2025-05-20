export default new Proxy(
  {},
  {
    get: function getter(_target, key) {
      if (key === '__esModule') {
        return false;
      }
      return key;
    },
  }
);
