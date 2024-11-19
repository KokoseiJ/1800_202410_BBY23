async function handleRequestUpdate(querySnapshot) {
  const dot = document.querySelector("div.notif-container").querySelector("span.dot");
  const requestsList = document.getElementById("requestsList");

  // Clear any existing list items before fetching
  requestsList.innerHTML = "";

  // if no requests, hide the dot
  if (querySnapshot.empty) {
    requestsList.innerHTML = "<li class='list-group-item'>No new requests.</li>";
    dot.classList.add("d-none");
    return;
  }

  // we got requests, show dot
  dot.classList.remove("d-none");

  // iter through docs, make element and append to requestlist
  querySnapshot.forEach(async (doc) => {
    const requestData = doc.data();
    const userData = await db.collection("users").doc(requestData.userId).get().then((doc)=>doc.data());
    console.log(db.collection("users").doc(requestData.userId));
    console.log(userData);
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


function handleRequestError(query) {
  const requestsList = document.getElementById("requestsList");

  console.error("Error fetching join requests: ", error);
  requestsList.innerHTML = "<li class='list-group-item'>Error loading requests. Please try again.</li>";
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

firebase.auth().onAuthStateChanged((user)=>{
  if (!user) {
    console.error("No user detected?");
    return;
  }
  db.collection("joinRequests")
    .where("ownerId", "==", user.uid)
    .where("status", "==", "pending")
    .onSnapshot(handleRequestUpdate,
                handleRequestError);
});
