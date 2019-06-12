firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        console.log(user.email);
    } else {
        console.log("未登入");
    }
});

function AdjustIframeHeightOnLoad(id) {
    var iframeid = document.getElementById(id);
    if (document.getElementById) {
        if (iframeid && !window.opera) {
            if (iframeid.contentDocument && iframeid.contentDocument.body.offsetHeight) {
                iframeid.height = iframeid.contentDocument.body.offsetHeight;
            } else if (iframeid.Document && iframeid.Document.body.scrollHeight) {
                iframeid.height = iframeid.Document.body.scrollHeight;
            }
        }
    }
}

const userName = document.getElementById('userName');
const emailAddr = document.getElementById('emailAddr');
const psword = document.getElementById('psword');
const btnLogin = document.getElementById('login');
const btnSignup = document.getElementById('signup');
const btnSignout = document.getElementById('signout');
const status = document.getElementById("status");

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        console.log(user.email, "login");
        loginUser = firebase.auth().currentUser;
        status.innerText = user.email + "登入成功";
    } else {
        console.log("login failed");
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
    const name = userName.value;
    const email = emailAddr.value;
    const pswd = psword.value;
    const auth = firebase.auth();

    const publicData = {
        email: auth.currentUser.email,
        name: name
    };
    const promise = auth.createUserWithEmailAndPassword(email, pswd)
        .then(function () {
            var updates = {};
            updates['/user_group/public_user_data/' + auth.currentUser.uid] = publicData;
            updates['/user_group/private_user_data/' + auth.currentUser.uid] = {
                password: pswd
            };
            firebase.database().ref().update(updates)
                .then(function () {
                    alert('註冊成功');
                    console.log("Sign Up");
                    window.location.reload();
                })
                .catch(function (error) {
                    console.log(error);
                });
        });
    promise.catch(e => alert(e.message));
})

btnSignout.addEventListener('click', e => {
    const auth = firebase.auth();
    auth.signOut()
        .then(function () {
            alert("成功登出");
            console.log("Sign out");
            window.location.reload();
        })
        .catch(function (e) {
            console.log(e.message);
        });
})