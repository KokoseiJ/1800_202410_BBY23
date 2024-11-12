document.getElementById("notificationBtn").addEventListener("click", function () {
  // Fetch join requests when the Notification button is clicked
  fetchJoinRequests();
});

function fetchJoinRequests() {
  const db = firebase.firestore();
  const currentUserId = firebase.auth().currentUser.uid;

  // Clear any existing list items before fetching
  const requestsList = document.getElementById("requestsList");
  requestsList.innerHTML = "";

  // Query Firestore for join requests where the current user is the group owner
  db.collection("joinRequests")
    .where("ownerId", "==", currentUserId)
    .where("status", "==", "pending") // Optional: Only show pending requests
    .get()
    .then((querySnapshot) => {
      console.log({queries: querySnapshot})
      if (querySnapshot.empty) {
        requestsList.innerHTML = "<li class='list-group-item'>No new requests.</li>";
      } else {
        querySnapshot.forEach(async (doc) => {
          const requestData = doc.data();
          const userData = await db.collection("users").doc(requestData.userId).get().then((doc)=>doc.data());
          const groupData = await db.collection("groups").doc(requestData.groupId).get().then((doc)=>doc.data());
          const listItem = document.createElement("li");
          listItem.className = "list-group-item d-flex justify-content-between align-items-center";
          listItem.innerHTML = `
            <span><strong>User:</strong> ${userData.name} - <strong>Group:</strong> ${groupData.title}</span>
            <button class="btn btn-success btn-sm" onclick="acceptRequest('${doc.id}')">Accept</button>
            <button class="btn btn-danger btn-sm" onclick="declineRequest('${doc.id}')">Decline</button>
          `;
          requestsList.appendChild(listItem);
        });
      }
    })
    .catch((error) => {
      console.error("Error fetching join requests: ", error);
      requestsList.innerHTML = "<li class='list-group-item'>Error loading requests. Please try again.</li>";
    });
}

async function acceptRequest(reqId) {
  const currentReqDoc = db.collection("joinRequests").doc(reqId);
  const reqData = await currentReqDoc.get().then((doc)=>doc.data());

  const currentGroupDoc = db.collection("groups").doc(reqData.groupId);
  const groupData = await currentGroupDoc.get().then((doc)=>doc.data());

  // man firestore sucks
  const members = groupData.members;
  if (!members) {
    members = [];
  }

  members.push(reqData.userId);

  await currentGroupDoc.update({
    members: members
  });

  await currentReqDoc.delete();

  // TODO: close modal or refresh or something
  return;
}


async function declineRequest(reqId) {
  await db.collection("joinRequests").doc(reqId).delete();
  return;
}
