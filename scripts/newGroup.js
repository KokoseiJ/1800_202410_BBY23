/*
    TODO: Implement following elements.

    #hopinFormTitle - input element that receives group title
    #hopinFormDescription - input element that receives description
    #hopinForm - form element that encapsulates all of them

    button should be added manually, but it shouldn't need any handlers;
    just add a button like you normally do on forms and it will work
*/  
const title = document.getElementById("hopinFormTitle");
const description = document.getElementById("hopinFormDescription");
const groupForm = document.getElementById("hopinForm");


function handleSubmit(e) {
    e.preventDefault();

    const user = firebase.auth().currentUser;

    // Data format to be added to Firestore
    if (user != null) {
        db.collection("groups").add({
            owner: user.uid,
            title: title.value,
            description: description.value,
            created_at: firebase.firestore.Timestamp.now(),
            members: [user.uid]
        }).then(() => {
            console.log("Group created successfully.");
            window.location.href = "main.html"; // Redirect after creation
        }).catch((error) => {
            console.error("Error creating group: ", error);
            alert("Error creating group. Please try again.");
        });
    } else {
        alert("You must be logged in to create a group.");
    }
}

// Event listener for form submission
groupForm.addEventListener("submit", handleSubmit);

function saveGroupAndRedirect(){
    const params = new URLSearchParams(window.location.search);
    const groupID = params.get("docID");
    if (groupID) {
        localStorage.setItem('GroupID', groupID);
        window.location.href = 'newGroup.html';
    }
}

// Function to retrieve and display group name by document ID
function getGroupName(id) {
    db.collection("groups")
        .doc(id)
        .get()
        .then((doc) => {
            if (doc.exists) {
                const groupName = doc.data().name;
                document.getElementById("createGroup").textContent = groupName;
            } else {
                console.log("No such document found.");
            }
        })
        .catch((error) => {
            console.error("Error retrieving document: ", error);
        });
} 
