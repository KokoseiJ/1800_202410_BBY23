// Ensure currentUserId and currentGroupId are accessible
const currentUserId = "currentUserId"; // Replace this with logic to get the logged-in user ID

document.addEventListener("DOMContentLoaded", function () {
    const modalFAQ = document.getElementById("modal-FAQ");

    modalFAQ.addEventListener("show.bs.modal", function (event) {
      const button = event.relatedTarget;
      const cardBody = button.closest(".card-body");
      const title = cardBody.querySelector(".group-title").textContent;
      const owner = cardBody.querySelector(".group-owner").textContent;
      const description = cardBody.querySelector(".group-description").textContent;
      
      // Assume the currentGroupId is set based on the selected group
      const currentGroupId = "your-group-id"; // Update with logic to set the group ID

      modalFAQ.querySelector(".modal-title").textContent = title;
      modalFAQ.querySelector(".modal-body").innerHTML = `
        <p><strong>Owner:</strong> ${owner}</p>
        <p>${description}</p>
      `;

      // Only show "Request to Join" button if not owner
      if (owner !== currentUserId) {
        const requestButton = document.createElement("button");
        requestButton.className = "btn btn-primary position-absolute bottom-0 end-0 m-3";
        requestButton.id = "request-btn";
        requestButton.textContent = "Request to Join";
        modalFAQ.querySelector(".modal-body").appendChild(requestButton);

        // Event listener to handle request
        requestButton.addEventListener("click", function () {
          // Firestore request to join logic here
          joinGroup(currentUserId, currentGroupId, requestButton);
        });
      }
    });
});
function joinGroup(userId, groupId, button) {
  // Reference Firestore
  const db = firebase.firestore();

  // Add join request to Firestore
  db.collection("joinRequests").add({
    userId: userId,
    groupId: groupId,
    status: "pending",
    requestedAt: firebase.firestore.FieldValue.serverTimestamp()
  })
  .then(() => {
    button.textContent = "Request Sent";
    button.disabled = true;

    // Show the success toast
    const toastElement = document.getElementById("successToast");
    const toast = new bootstrap.Toast(toastElement);
    toast.show();
  })
  .catch((error) => {
    console.error("Error sending request: ", error);
    alert("There was an error sending your request. Please try again.");
  });
}
