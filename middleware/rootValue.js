module.exports = {
  ip(args, request) {
    return request.ip;
  },
  session(args, request) {
    console.log('root.session', request);
    return null;
  }
};