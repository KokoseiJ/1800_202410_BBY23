document.getElementById("notificationBtn").addEventListener("click", function () {
  // Fetch join requests when the Notification button is clicked
  fetchJoinRequests();
});

function fetchJoinRequests() {
  const db = firebase.firestore();
  const currentUserId = "your-owner-id"; // Replace with the actual logic to get the current logged-in user ID

  // Clear any existing list items before fetching
  const requestsList = document.getElementById("requestsList");
  requestsList.innerHTML = "";

  // Query Firestore for join requests where the current user is the group owner
  db.collection("joinRequests")
    .where("groupOwnerId", "==", currentUserId)
    .where("status", "==", "pending") // Optional: Only show pending requests
    .get()
    .then((querySnapshot) => {
      if (querySnapshot.empty) {
        requestsList.innerHTML = "<li class='list-group-item'>No new requests.</li>";
      } else {
        querySnapshot.forEach((doc) => {
          const requestData = doc.data();
          const listItem = document.createElement("li");
          listItem.className = "list-group-item d-flex justify-content-between align-items-center";
          listItem.innerHTML = `
            <span><strong>User:</strong> ${requestData.userId} - <strong>Group:</strong> ${requestData.groupName}</span>
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
