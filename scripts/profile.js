const GRAVATAR_BASEURL = "https://gravatar.com/avatar/"

let pfp = document.getElementById("hopinFormPfp")
let nameLabel = document.getElementById("hopinFormNameLabel")
let nameInput = document.getElementById("hopinFormUserName")
let programInput = document.getElementById("hopinFormProgram")
let ageInput = document.getElementById("hopinFormAge")
let profileForm = document.getElementById("hopinForm")


function submitCallback(e) {
    e.preventDefault();

    const user = firebase.auth().currentUser;
    db.collection("users").doc(user.uid).update({
        name: nameInput.value,
        age: ageInput.value,
        program: programInput.value
    });
}

function calculateEmailHash(text) {
    // TODO: If adding sha256 impl, add check to enable polyfill
    const data = (new TextEncoder()).encode(text);
    const hash = window.crypto.subtle.digest(
        "SHA-256", data
    ).then(hashdata => {
        const hashstr = Array.from(new Uint8Array(hashdata))
                             .map(n=>n.toString(16).padStart(2, "0"))
                             .join("");
        console.log({"email_hash": hashstr});
        return hashstr;
    })

    // This is promise!
    return hash;
}

async function getAvatarUrlFromEmail(email) {
    if (window.crypto.subtle === null) {
        // This should be here on all modern browsers
        // TODO: Replace this with proper polyfill
        return "https://http.cat/images/404.jpg"
    }

    const hash = await calculateEmailHash(email);

    return GRAVATAR_BASEURL + hash + "?s=256";
}

function setProfilePic(email) {
    getAvatarUrlFromEmail(email).then(url => {
        pfp.src = url
    });
}

function populateFormInfo(data) {
    console.log({"userdata": data});

    nameLabel.innerHTML = data.name;
    nameInput.value = data.name;
    programInput.value = data.program;
    ageInput.value = data.age;
}

profileForm.addEventListener("submit", submitCallback);

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
