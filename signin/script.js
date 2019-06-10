const emailAddr = document.getElementById('emailAddr');
const psword = document.getElementById('psword');
const btnLogin = document.getElementById('login');
const btnSignup = document.getElementById('signup');
const btnSignout = document.getElementById('signout');
const status = document.getElementById("status");

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        console.log(user.email, "登入中");
        loginUser = firebase.auth().currentUser;
        status.innerText = user.email + "登入中";
    } else {
        console.log("未登入");
        loginUser = null;
        status.innerText = "未登入";
    }
});

btnLogin.addEventListener('click', e => {
    const email = emailAddr.value;
    const pswd = psword.value;
    const auth = firebase.auth();

    const promise = auth.signInWithEmailAndPassword(email, pswd);
    promise.catch(e => alert(e.message));
})
btnSignup.addEventListener('click', e => {
    const email = emailAddr.value;
    const pswd = psword.value;
    const auth = firebase.auth();

    const promise = auth.createUserWithEmailAndPassword(email, pswd);
    promise.catch(e => alert(e.message));
})

btnSignout.addEventListener('click', e => {
    const auth = firebase.auth();
    auth.signOut()
        .then(function () {
            console.log("Sign out!")
        })
        .catch(function (e) {
            console.log(e.message);
        });
})