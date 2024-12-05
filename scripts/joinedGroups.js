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

    // Populate modal with group details
    modalFAQ.querySelector(".modal-title").textContent = group.title;
    modalFAQ.querySelector(".modal-body").innerHTML = `
        <p><strong>Owner:</strong> ${group.ownerName || "Unknown Owner"}</p>
        <p>Pickup Time: ${group.pickup_time || "Not provided"}</p>
        <p>Pickup Location: ${group.pickup_Location || "Not provided"}</p>
        <p>One Way Trip: ${group.oneWayTrip ? "Yes" : "No"}</p>
        <p>${group.description}</p>
    `;

    const modalFooter = modalFAQ.querySelector(".modal-footer");
    modalFooter.innerHTML = "";

    // Add edit and delete options if the current user is the owner
    firebase.auth().onAuthStateChanged((user) => {
        if (user.uid === group.owner) {
            const editButton = document.createElement("button");
            editButton.className = "btn btn-warning";
            editButton.textContent = "Edit Group";

            const deleteButton = document.createElement("button");
            deleteButton.className = "btn btn-danger";
            deleteButton.textContent = "Delete Group";

            deleteButton.addEventListener("click", () => {
                if (confirm("Are you sure you want to delete this group?")) {
                    db.collection("groups").doc(groupID).delete().then(() => {
                        window.location.reload();
                    });
                }
            });

            editButton.addEventListener("click", () => {
                modalFAQ.querySelector(".modal-title").innerHTML = `
                    <input type="text" class="form-control" id="editGroupName" value="${group.title}">
                `;
                modalFAQ.querySelector(".modal-body").innerHTML = `
                    <div class="mb-3">
                        <label for="editGroupDescription" class="form-label">Description</label>
                        <textarea class="form-control" id="editGroupDescription" rows="3">${group.description}</textarea>
                    </div>
                    <div class="mb-3">
                        <label for="editPickupTime" class="form-label">Pickup Time</label>
                        <input type="text" class="form-control" id="editPickupTime" value="${group.pickup_time || ''}">
                    </div>
                    <div class="mb-3">
                        <label for="editPickupLocation" class="form-label">Pickup Location</label>
                        <input type="text" class="form-control" id="editPickupLocation" value="${group.pickup_Location || ''}">
                    </div>
                    <div class="mb-3">
                        <label for="editOneWayTrip" class="form-label">One Way Trip</label>
                        <select class="form-select" id="editOneWayTrip">
                            <option value="Yes" ${group.oneWayTrip ? 'selected' : ''}>Yes</option>
                            <option value="No" ${!group.oneWayTrip ? 'selected' : ''}>No</option>
                        </select>
                    </div>
                `;

                modalFooter.innerHTML = `
                    <button class="btn btn-success" id="saveChangesBtn">Save Changes</button>
                `;

                document.getElementById("saveChangesBtn").addEventListener("click", async () => {
                    const updatedName = document.getElementById("editGroupName").value.trim();
                    const updatedDescription = document.getElementById("editGroupDescription").value.trim();
                    const updatedPickupTime = document.getElementById("editPickupTime").value.trim();
                    const updatedPickupLocation = document.getElementById("editPickupLocation").value.trim();
                    const updatedOneWayTrip = document.getElementById("editOneWayTrip").value === "Yes";

                    if (!updatedName || !updatedDescription || !updatedPickupTime || !updatedPickupLocation) {
                        alert("All fields are required.");
                        return;
                    }

                    try {
                        await db.collection("groups").doc(groupID).update({
                            title: updatedName,
                            description: updatedDescription,
                            pickup_time: updatedPickupTime,
                            pickup_Location: updatedPickupLocation,
                            oneWayTrip: updatedOneWayTrip,
                        });

                        const toastElement = document.getElementById("saveSuccessToast");
                        const toast = new bootstrap.Toast(toastElement);
                        toast.show();

                        modalFAQ.querySelector(".modal-title").textContent = updatedName;
                        modalFAQ.querySelector(".modal-body").innerHTML = `
                            <p><strong>Owner:</strong> ${group.ownerName || "Unknown Owner"}</p>
                            <p>Pickup Time: ${updatedPickupTime}</p>
                            <p>Pickup Location: ${updatedPickupLocation}</p>
                            <p>One Way Trip: ${updatedOneWayTrip ? "Yes" : "No"}</p>
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
            modalFooter.appendChild(deleteButton);
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

// Initialize functions
getNameFromAuth();
displayJoinedGroups();
