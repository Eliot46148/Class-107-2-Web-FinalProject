var hashParams = window.location.hash.substr(1).split('&'); // substr(1) to remove the `#`
for(var i = 0; i < hashParams.length; i++){
    var p = hashParams[i].split('=');
    document.getElementById(p[0]).value = decodeURIComponent(p[1]);
}

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
var gameRef = storage.ref(document.getElementById('game_id').value);

gameDownloading = gameRef.getDownloadURL().then(function (url) {
    var gameEmbed = document.createElement('embed');
    gameEmbed.width = '100%';
    gameEmbed.height = '500px';
    gameEmbed.src = url;
    document.getElementById('content').appendChild(gameEmbed);
});