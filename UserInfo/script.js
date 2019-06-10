const email = document.getElementById("email");

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        console.log(user.email);
        loginUser = firebase.auth().currentUser;
        email.innerText = user.email;
    } else {
        console.log("未登入");
        loginUser = null;
        email.innerText = "未登入";
    }
});