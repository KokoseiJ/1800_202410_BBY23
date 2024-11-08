document.addEventListener("DOMContentLoaded", function () {
    const modalFAQ = document.getElementById("modal-FAQ");

    modalFAQ.addEventListener("show.bs.modal", function (event) {
      const button = event.relatedTarget; // Button that triggered the modal
      const cardBody = button.closest(".card-body"); // Get the card body

      // Retrieve card content
      const title = cardBody.querySelector(".group-title").textContent;
      const owner = cardBody.querySelector(".group-owner").textContent;
      const description = cardBody.querySelector(".group-description").textContent;

      // Populate modal fields
      modalFAQ.querySelector(".modal-title").textContent = title;
      modalFAQ.querySelector(".modal-body").innerHTML = `
        <p><strong>Owner:</strong> ${owner}</p>
        <p>${description}</p>
        <button
                id="request-btn"
                class="btn btn-primary position-absolute bottom-0 end-0 m-3"
                
              >
                Request to Join
              </button>
      `;
    });
  });