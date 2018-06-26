const assign = require('object-assign');

const firebase = assign({}, require('firebase/app'), require('firebase/database'));
var config = {
  apiKey: 'AIzaSyB4zek8u4Myu15AFulmv4LEmrelxd5wrhU',
  authDomain: 'fakespotter-9719b.firebaseapp.com',
  databaseURL: 'https://fakespotter-9719b.firebaseio.com',
  projectId: 'fakespotter-9719b',
  storageBucket: 'fakespotter-9719b.appspot.com',
  messagingSenderId: '241915956546'
};
firebase.initializeApp(config);

module.exports = firebase;
