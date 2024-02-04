// REGISTRATION PAGE logic
const signupForm = document.getElementById(`signup-form`);
const signupUsername = document.getElementById(`signup-username`);
const signupName = document.getElementById(`signup-name`);
const signupEmail = document.getElementById(`signup-email`);
const signupPassword1 = document.getElementById(`signup-pword1`);
const signupPassword2 = document.getElementById(`signup-pword2`);
const signupWarning = document.getElementById("signup-warning");

// Event listener for signup form
signupForm.addEventListener(`submit`, (e) => {
    e.preventDefault();
    signupWarning.textContent = ``;
    // check is both password fields match
    if (signupPassword1.value !== signupPassword2.value) {
        signupWarning.textContent = `Passwords do not match, please try again.`
        return;
    }

    const newUser = {
        username: signupUsername.value,
        name: signupName.value,
        email: signupEmail.value,
        password1: signupPassword1.value,
        password2: signupPassword2.value
    }

    let isUsernameTaken
    // call authentication function
    signupAuth(newUser, isUsernameTaken);
});

// Username authentication function
// Checks if username is already taken
function signupAuth(newUser, isUsernameTaken) {
    fetch(`/api/users`, {
        method: `GET`,
        headers: {
            "Content-Type": "application/json",
        },
        
    }).then(res => res.json())
    .then(res => {
        res.forEach(item => {
            if(item.username === newUser.username) {
                signupWarning.textContent = `That username is taken! Please select another.`
                isUsernameTaken = true;
            } 
        });
        if(!isUsernameTaken) {
            // call signup function
            signup(newUser);
        }
    }) .catch(err => {
        console.error(err);
    });
}

// Signup function
// issues post request  to create new user on server and logs in
function signup(newUserData){    
    const newUser = {
        username:newUserData.username,
        email:newUserData.email,
        password:newUserData.password1,
        name:newUserData.name
    }
    fetch(`/api/users`, {
        method: `POST`,
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
    }).then(res => res.json())
    .then(res => {
        // call login function
        loginFunc(signupUsername.value, signupPassword1.value);
    }) .catch(err => {
        console.error(err);
    });
}

// Login function
// Issues post request to server to log user in (create session variables), also refreshes page to chat page
function loginFunc(username, password){
    const user = {
        username: username,
        password: password
    }
    fetch(`/api/users/login`, {
        method: `POST`,
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
    }).then(res => res.json())
    .then(res => {
        console.log(res.username);
        const username = res.username;
        const userId = res.userId;
        const newUrl = `/`
        window.location.href = newUrl;
        sessionStorage.setItem(`userId`, userId);
        sessionStorage.setItem(`username`, username);
    }) .catch(err => {
        console.error(err);
    });

    
}