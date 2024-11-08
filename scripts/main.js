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


function getGroups(before=null, limit=null) {
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

    if (limmit !== null) {
        query = query.limit(limit);
    }

    // returns promise
    return query.get();
}


function getGroupElementFromGroupData(group) {
    /*
    Creates new Group card element from given data.

    Args:
        group:
            object from groups collection, return value of .data()

    Returns:
        Promise of newGroup object.
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
    let result = db.collection("users").doc(group.owner).get().then((doc) => {
        if (doc.exists) {
            newGroup.querySelector(".group-owner").innerHTML = doc.data().name;
        }
        // This promise now returns newGroup when .then is called
        return newGroup.firstElementChild;
    })

    // returns promise
    return result;
}


function displayGroups(before=null, limit=null) {
    /*
    Populates group container with data from db.

    Args:
        Same as getGroups.
    */

    // TODO: #groups-go-here: div container that will have group cards inside
    const groupContainer = document.getElementById("groups-go-here");

    // Stores created_at value of earliest listing we have
    // `now` is a placeholder
    let lastCreatedAt = Timestamp.now();

    getGroups(before, limit).then((groups)=>{
        let promises = [];
        groups.forEach((group)=>{
            // Overwrite it to latest one
            lastCreatedAt = group.data().created_at;

            // Create new element and insert it to newGroup
            // Created as promise and not awaited so
            // we don't have to wait for each one to finish
            let promise = getGroupElementFromGroupData(group.data()).then((newGroup)=>{
                return groupContainer.insertAdjacentElement("beforeend", newGroup);
            });

            // Put all promises to a list
            promises.push(promise);
        })
        // Wait until all elements are created
        return Promise.all(promises);
    });
}

getNameFromAuth(); //run the function
displayGroups();
