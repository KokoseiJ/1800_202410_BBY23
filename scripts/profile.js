let pfp = document.getElementById("hopinFormPfp")
let nameLabel = document.getElementById("hopinFormNameLabel")
let nameInput = document.getElementById("hopinFormUserName")
let programInput = document.getElementById("hopinFormProgram")
let ageInput = document.getElementById("hopinFormAge")
let profileForm = document.getElementById("hopinForm")
let logoutButton = document.getElementById("hopinLogout")



function submitCallback(e) {
    e.preventDefault();

    const user = firebase.auth().currentUser;
    db.collection("users").doc(user.uid).update({
        name: nameInput.value,
        age: ageInput.value,
        program: programInput.value
    });
}

function setProfilePic(email) {
    import("./gravatar.js").then(({getAvatarUrlFromEmail})=>{
        getAvatarUrlFromEmail(email).then(url => {
            pfp.src = url
        });
    })
}

function populateFormInfo(data) {
    console.log({"userdata": data});

    nameLabel.innerHTML = data.name;
    nameInput.value = data.name;
    programInput.value = data.program;
    ageInput.value = data.age;
}

function logout() {
    firebase.auth().signOut().then(() => {
        // Sign-out successful.
        console.log("logging out user");
        window.location = "/index.html"
      }).catch((error) => {
        // An error happened.
      });
}

profileForm.addEventListener("submit", submitCallback);
logoutButton.addEventListener("click", logout);

firebase.auth().onAuthStateChanged(user => {
    if (user) {
        console.log(user.uid);
        console.log(user.displayName)
        db.collection("users").doc(user.uid).onSnapshot((doc) => {
            let data = doc.data();
            console.log({"userdata": data})
            setProfilePic(data.email);
            populateFormInfo(data);
        });
    }
});
