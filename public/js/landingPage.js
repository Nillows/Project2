const landingPageSignup = document.getElementById(`landing-page-signup`);
const landingPageLogin = document.getElementById(`landing-page-login`);

landingPageSignup.addEventListener(`click`, signupRedirect)

function signupRedirect(){
    const url = `/registration`
    window.location.href = url;
}

landingPageLogin.addEventListener(`click`, loginRedirect)

function loginRedirect(){
    const url = `/login`
    window.location.href = url;
}
