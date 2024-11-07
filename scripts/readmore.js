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
      `;
    });
  });