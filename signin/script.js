const emailAddr = document.getElementById('emailAddr');
const psword = document.getElementById('psword');
const btnLogin = document.getElementById('login');
const btnSignup = document.getElementById('signup');
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