var config = {
    apiKey: "AIzaSyC-7yHkjfJsXaOlBVj81bv_nP87X2_l2HY",
    authDomain: "utility-dynamo-242807.firebaseapp.com",
    databaseURL: "https://utility-dynamo-242807.firebaseio.com",
    projectId: "utility-dynamo-242807",
    storageBucket: "utility-dynamo-242807.appspot.com",
    messagingSenderId: "825744686702",
    appId: "1:825744686702:web:18baeb1ddfb42964"
};
firebase.initializeApp(config);

var storage = firebase.storage();
var gameRef = storage.ref('default game/angrybirdsspace.swf');

gameRef.getDownloadURL().then(function (url) {
    document.getElementById('game').src = url;
});

function progress(self, snapshot) {
    var percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    console.log('this is image =', percentage);
    self.progress = percentage;
    console.log(progress);
}