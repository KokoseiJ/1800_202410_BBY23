function getNameFromAuth() {
    firebase.auth().onAuthStateChanged(user => {
        // Check if a user is signed in:
        if (user) {
            // Do something for the currently logged-in user here: 
            console.log(user.uid); //print the uid in the browser console

            // Look up name from firestore user document
            db.collection("users").doc(user.uid).onSnapshot(doc=>{
                let data = doc.data();
                document.getElementById("name-goes-here").innerText = data.name; 
            })
        } else {
            // No user is signed in.
            console.log ("No user is logged in");
        }
    });
}
getNameFromAuth(); //run the function
