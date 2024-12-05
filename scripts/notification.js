const userModal = new bootstrap.Modal("#userModal");
const notifModal = new bootstrap.Modal("#notificationModal");


async function populateUserModal(userId) {
  const { getAvatarUrlFromEmail } = await import ("./gravatar.js");

  const modal = document.getElementById("userModal");
  const thumbnail = modal.querySelector("img");
  const name = modal.querySelector("h2");
  const program = modal.querySelector(".user-program");
  const age = modal.querySelector(".user-age");
  const socialMedia = modal.querySelector(".user-socialMedia");
  const city = modal.querySelector(".user-city")
  console.log(age);



  const userDataQuery = await db.collection("users").doc(userId).get();
  const userData = await userDataQuery.data();

  thumbnail.src = await getAvatarUrlFromEmail(userData.email);
  name.textContent = userData.name;
  program.textContent = userData.program;
  age.textContent = userData.age;
  socialMedia.textContent = userData.socialMedia;
  city.textContent = userData.city;
  return;
}


async function showUserModal(userId) {
  await populateUserModal(userId);

  notifModal.hide();
  userModal.show();
}


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
      <span><strong>User: </strong><a class="usertrigger" style="cursor: pointer;">${userData.name}</a> - <strong>Group: </strong> ${groupData.title}</span>
      <button class="btn btn-success btn-sm" onclick="acceptRequest('${doc.id}')">Accept</button>
      <button class="btn btn-danger btn-sm" onclick="declineRequest('${doc.id}')">Decline</button>
    `;
    listItem.querySelector("a.usertrigger").addEventListener("click", ()=>{
      showUserModal(requestData.userId);
    })
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


document.getElementById("userModal").addEventListener(
  "hide.bs.modal", (e)=>{
    notifModal.show();
  }
)
