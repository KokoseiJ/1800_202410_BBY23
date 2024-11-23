document.addEventListener("DOMContentLoaded", function () {
  const modalFAQ = document.getElementById("modal-FAQ");

  modalFAQ.addEventListener("show.bs.modal", function (event) {
      // Get the button that triggered the modal and the relevant card body
      const button = event.relatedTarget;
      const cardBody = button.closest(".card-body");

      // Extract details from the card
      const title = cardBody.querySelector(".group-title").textContent;
      const owner = cardBody.querySelector(".group-owner").textContent;
      const description = cardBody.querySelector(".group-description").textContent;

      // Extract hidden input values
      const currentUserId = firebase.auth().currentUser.uid; // Current logged-in 
      const currentGroupId = cardBody.querySelector(".group-id").value; // Group doc ID
      const groupOwnerId = cardBody.querySelector(".group-owner-id").value;

      console.log("Modal Data:", { title, owner, description, currentUserId, currentGroupId, groupOwnerId });

      // Populate modal with group information
      const modalBody = modalFAQ.querySelector(".modal-body");
      modalBody.innerHTML = `
          <p><strong>Owner:</strong> ${owner}</p>
          <p>${description}</p>
      `;

      const modalTitle = modalFAQ.querySelector(".modal-title");
      modalTitle.textContent = title; // Default title

      // Clear previous buttons in the modal footer
      const modalFooter = modalFAQ.querySelector(".modal-footer");
      modalFooter.innerHTML = "";

      // Check if the current user is the group owner
      if (currentUserId === groupOwnerId) {
          // Add an "Edit Group" button for the owner
          const editButton = document.createElement("button");
          editButton.className = "btn btn-warning";
          editButton.textContent = "Edit Group";

          // Append "Edit Group" button to the footer
          modalFooter.appendChild(editButton);

          // Event listener to switch to edit mode
          editButton.addEventListener("click", function () {
              // Replace the title with an editable input field
              modalTitle.innerHTML = `
                  <input type="text" class="form-control" id="editGroupName" value="${title}" />
              `;

              // Replace static description with input field
              modalBody.innerHTML = `
                  <div class="mb-3">
                      <label for="editGroupDescription" class="form-label">Description</label>
                      <textarea class="form-control" id="editGroupDescription" rows="3">${description}</textarea>
                  </div>
              `;

              // Replace "Edit Group" button with "Save Changes"
              modalFooter.innerHTML = `
                  <button class="btn btn-success" id="saveChangesBtn">Save Changes</button>
              `;

              // Add logic to save changes to Firestore
              document.getElementById("saveChangesBtn").addEventListener("click", function () {
                  const updatedName = document.getElementById("editGroupName").value.trim();
                  const updatedDescription = document.getElementById("editGroupDescription").value.trim();

                  if (!updatedName || !updatedDescription) {
                      alert("Both fields are required.");
                      return;
                  }

                  console.log("Attempting to update group:", { currentGroupId, updatedName, updatedDescription });

                  const db = firebase.firestore();
                  db.collection("groups")
                      .doc(currentGroupId) // Use document ID for update
                      .update({
                          title: updatedName,
                          description: updatedDescription
                      })
                      .then(() => {
                        // Show the success toast
                        const toastElement = document.getElementById("saveSuccessToast");
                        const toast = new bootstrap.Toast(toastElement);
                        toast.show();
                    
                        // Update the modal content with the new info
                        modalTitle.textContent = updatedName; // Update title
                        modalBody.innerHTML = `
                            <p><strong>Owner:</strong> ${owner}</p>
                            <p>${updatedDescription}</p>
                        `;
                        modalFooter.innerHTML = ""; // Clear footer
                    })
                    .catch((error) => {
                        console.error("Error updating group:", error);
                        alert("Failed to update group. Check the console for details.");
                    });
                    
              });
          });
      } else {
          // Add "Request to Join" button for non-owners
          const requestButton = document.createElement("button");
          requestButton.className = "btn btn-primary";
          requestButton.textContent = "Request to Join";

          // Event listener to handle join requests
          requestButton.addEventListener("click", function () {
              joinGroup(currentUserId, currentGroupId, groupOwnerId, requestButton);
          });

          // Append "Request to Join" button to the footer
          modalFooter.appendChild(requestButton);
      }
  });
});

/**
* Handles the "Request to Join" functionality.
* @param {string} userId - The ID of the current user.
* @param {string} groupId - The ID of the group.
* @param {string} ownerId - The ID of the group owner.
* @param {HTMLElement} button - The button element for "Request to Join".
*/
function joinGroup(userId, groupId, ownerId, button) {
  // Reference Firestore
  const db = firebase.firestore();

  // Add join request to Firestore
  db.collection("joinRequests")
      .add({
          userId: userId,
          groupId: groupId,
          ownerId: ownerId,
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
          console.error("Error sending request:", error);
          alert("There was an error sending your request. Please try again.");
      });
      
} 
