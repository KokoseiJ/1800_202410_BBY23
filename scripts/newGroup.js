/*
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

    /*
        Data format:
        {
            owner: owner UID
            title: group desc. title
            description: group desc.
            members: list of member UID
        }
    */
    if (user != null) {
        db.collection("groups").add({
            owner: user.uid;
            title: title.value;
            description: description.value;
            members: [];
        }).then(()=>{
            console.log("group submitted");
            window.location = "/main.html";
        })
    }
}

// Listens to "submit" event
groupForm.addEventListener("submit", handleSubmit);
