 function getNameFromAuth() {
    firebase.auth().onAuthStateChanged((user) => {
        // Check if a user is signed in:
        if (user) {
            // Do something for the currently logged-in user here: 
            console.log(user.uid); //print the uid in the browser console
            // Look up name from firestore user document
            db.collection("users").doc(user.uid).onSnapshot((doc)=>{
                let data = doc.data();
                document.getElementById("name-goes-here").innerText = data.name; 
            })
        } else {
            // No user is signed in.
            console.log ("No user is logged in");
        }
    });
}

const Timestamp = firebase.firestore.Timestamp;



async function getGroups(before=null, limit=null) {
    /*
    Retrieves group objects from DB using specified limits.

    Args:
        before:
            only get groups that were created before specified time.
            if null (default), ignored.
        limit:
            only get this specified amount of entries. ignored if null.
    Returns:
        Promise of document iterables.
    */
    let query = db.collection("groups").orderBy("created_at");

    if (before !== null) {
        query = query.where("created_at", "<", before);
    }

    if (limit !== null) {
        query = query.limit(limit);
    }

    return await query.get();
}


async function createGroupElement(group) {
    /*
    Creates new Group card element from given data.

    Args:
        group:
            object from groups collection, return value of .data()

    Returns:
        newGroup object.
    */

    // TOOD: #groupTemplate : template element containing group card thing
    const groupTemplate = document.getElementById("groupTemplate");

    let newGroup = groupTemplate.content.cloneNode(true);

    // TODO: these are elements inside groupTemplate, with following classes
    //       .group-title : p or span or h1 or whatever that grabs title
    //       .group-description : same but with description
    //       .group-owner : same but with owner's name
    newGroup.querySelector(".group-title").innerHTML = group.title;
    newGroup.querySelector(".group-description").innerHTML = group.description;
    
    // Queries DB to grab owner's name
    let doc = await db.collection("users").doc(group.owner).get();
    if (doc.exists) {
        newGroup.querySelector(".group-owner").innerHTML = doc.data().name;
    }

    return newGroup.firstElementChild;
}


function displayJoinedGroups(before=null, limit=null) {
    /*
     Populates group container with data from db.
 
     Args:
         Same as getGroups.
     */
     
         // Checks for UID upon Auth State Changing
         // Needed to get the user ID into a variable
         // Otherwise user.uid returns null
     firebase.auth().onAuthStateChanged(async (user) => {
         // TODO: #groups-go-here: div container that will have group cards inside
         
         
         const userID = user.uid;
         const groupContainer = document.getElementById("groups-go-here");

        //In case of running into problems later, uncomment the 
        //Code line below and see if it works. If not, Hit up
        //Giorgio he might know what's up

        //groupContainer.innerHTML = "";
 
         // Get list of groups from firebase
         let groups = await getGroups(before, limit);
     
         groups.forEach(async (group)=>{
            
            //Checks if the UID matches either the Owner's UID
            //Or if the UID is associated with a group member
            //And creates a group card if true
             
            if (userID == group.data().owner || userID == group.data().members){
                 // Create new element and insert it to newGroup
                 let newElement = await createGroupElement(group.data());
                 groupContainer.insertAdjacentElement("beforeend", newElement);
             }
         });
     })    
 }

getNameFromAuth(); //run the function


displayJoinedGroups();

