function getNameFromAuth() {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            console.log(user.uid); // Log the UID
            db.collection("users")
                .doc(user.uid)
                .onSnapshot((doc) => {
                    let data = doc.data();
                    document.getElementById("name-goes-here").innerText = data.name;
                });
        } else {
            console.log("No user is logged in");
        }
    });
}

const Timestamp = firebase.firestore.Timestamp;

async function getGroups(before = null, limit = null) {
    let query = db.collection("groups").orderBy("created_at");

    if (before !== null) {
        query = query.where("created_at", "<", before);
    }

    if (limit !== null) {
        query = query.limit(limit);
    }

    return await query.get();
}

async function createGroupElement(group, groupID) {
    const groupTemplate = document.getElementById("groupTemplate");
    let newGroup = groupTemplate.content.cloneNode(true);

    newGroup.querySelector(".group-title").innerHTML = group.title;
    newGroup.querySelector(".group-description").innerHTML = group.description;

    // Fetch owner's name
    try {
        let ownerDoc = await db.collection("users").doc(group.owner).get();
        if (ownerDoc.exists) {
            let ownerName = ownerDoc.data().name;
            newGroup.querySelector(".group-owner").innerHTML = ownerName;
            group.ownerName = ownerName; // Save owner name for modal
        } else {
            newGroup.querySelector(".group-owner").innerHTML = "Unknown Owner";
        }
    } catch (error) {
        console.error("Error fetching owner:", error);
        newGroup.querySelector(".group-owner").innerHTML = "Error Loading Owner";
    }

    // Set group-specific data attributes
    newGroup.querySelector(".group-id").value = groupID;
    newGroup.querySelector(".group-owner-id").value = group.owner;

    // Attach event listener for the "Read More" button
    let readMoreBtn = newGroup.querySelector("[data-bs-target='#modal-FAQ']");
    readMoreBtn.addEventListener("click", () => openGroupModal(group, groupID));

    return newGroup.firstElementChild;
}

function openGroupModal(group, groupID) {
    const modalFAQ = document.getElementById("modal-FAQ");

    modalFAQ.querySelector(".modal-title").textContent = group.title;
    modalFAQ.querySelector(".modal-body").innerHTML = `
        <p><strong>Owner:</strong> ${group.ownerName || "Unknown Owner"}</p>
        <p>${group.description}</p>
    `;

    const modalFooter = modalFAQ.querySelector(".modal-footer");
    modalFooter.innerHTML = "";

    firebase.auth().onAuthStateChanged((user) => {
        if (user.uid === group.owner) {
            const editButton = document.createElement("button");
            editButton.className = "btn btn-warning";
            editButton.textContent = "Edit Group";

            editButton.addEventListener("click", () => {
                modalFAQ.querySelector(".modal-title").innerHTML = `
                    <input type="text" class="form-control" id="editGroupName" value="${group.title}">
                `;
                modalFAQ.querySelector(".modal-body").innerHTML = `
                    <textarea class="form-control" id="editGroupDescription" rows="3">${group.description}</textarea>
                `;
                modalFooter.innerHTML = `
                    <button class="btn btn-success" id="saveChangesBtn">Save Changes</button>
                `;

                document.getElementById("saveChangesBtn").addEventListener("click", async () => {
                    const updatedName = document.getElementById("editGroupName").value.trim();
                    const updatedDescription = document.getElementById("editGroupDescription").value.trim();

                    if (!updatedName || !updatedDescription) {
                        alert("Both fields are required.");
                        return;
                    }

                    try {
                        await db.collection("groups").doc(groupID).update({
                            title: updatedName,
                            description: updatedDescription,
                        });

                        const toastElement = document.getElementById("saveSuccessToast");
                        const toast = new bootstrap.Toast(toastElement);
                        toast.show();

                        modalFAQ.querySelector(".modal-title").textContent = updatedName;
                        modalFAQ.querySelector(".modal-body").innerHTML = `
                            <p><strong>Owner:</strong> ${group.ownerName || "Unknown Owner"}</p>
                            <p>${updatedDescription}</p>
                        `;
                        modalFooter.innerHTML = "";
                    } catch (error) {
                        console.error("Error updating group:", error);
                        alert("Failed to update group.");
                    }
                });
            });

            modalFooter.appendChild(editButton);
        }
    });
}

function displayJoinedGroups(before = null, limit = null) {
    firebase.auth().onAuthStateChanged(async (user) => {
        const userID = user.uid;
        const groupContainer = document.getElementById("groups-go-here");

        let groups = await getGroups(before, limit);

        groups.forEach(async (groupDoc) => {
            const groupData = groupDoc.data();
            const groupID = groupDoc.id;

            if (userID === groupData.owner || groupData.members.includes(userID)) {
                let newElement = await createGroupElement(groupData, groupID);
                groupContainer.appendChild(newElement);
            }
        });
    });
}

getNameFromAuth();
displayJoinedGroups();
