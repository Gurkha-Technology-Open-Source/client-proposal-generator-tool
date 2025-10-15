document.addEventListener("DOMContentLoaded", () => {
    fetch("data.json")
        .then(response => response.json())
        .then(data => {
            window.proposalData = data;
            const serviceForm = document.getElementById("serviceForm");
            window.proposalData.services.forEach(service => {
                const serviceDiv = document.createElement("div");
                serviceDiv.className = "form-check";
                serviceDiv.innerHTML = `
                    <input type="checkbox" class="form-check-input" id="${service.id}" name="service" value="${service.name}">
                    <label class="form-check-label" for="${service.id}">${service.name}</label>
                    <small class="form-text text-muted">${service.description}</small>
                `;
                serviceForm.appendChild(serviceDiv);
            });
            document.getElementById("service-preloader").classList.add("d-none");
            serviceForm.classList.remove("d-none");
            document.getElementById("nextStepButton").classList.remove("d-none");
        });
});

function updateProgressBar(step) {
    const progressBar = document.querySelector(".progress-bar");
    const percentage = (step / 3) * 100;
    progressBar.style.width = `${percentage}%`;
    progressBar.innerText = `Step ${step}`;
}

function nextStep() {
    document.getElementById("service-selection").classList.add("d-none");
    document.getElementById("package-questions").classList.remove("d-none");
    updateProgressBar(2);

    const packageOptionsContainer = document.getElementById("package-options-container");
    packageOptionsContainer.innerHTML = "";

    const selectedServices = Array.from(document.querySelectorAll('input[name="service"]:checked')).map(cb => cb.id);

    selectedServices.forEach(serviceId => {
        const service = window.proposalData.services.find(s => s.id === serviceId);
        if (service) {
            const serviceOptionsDiv = document.createElement("div");
            serviceOptionsDiv.className = "service-options mb-4";
            serviceOptionsDiv.innerHTML = `<h5>${service.name} Packages:</h5>`;

            service.packages.forEach(pkg => {
                const packageDiv = document.createElement("div");
                packageDiv.className = "form-check";
                packageDiv.innerHTML = `
                    <input type="radio" class="form-check-input" name="${service.id}Package" id="${pkg.id}" value="${pkg.name}" data-service="${service.id}">
                    <label class="form-check-label radio-label" for="${pkg.id}">${pkg.name} - ${pkg.price}</label>
                    <small class="form-text text-muted">${pkg.features}</small>
                `;
                serviceOptionsDiv.appendChild(packageDiv);
            });

            packageOptionsContainer.appendChild(serviceOptionsDiv);
        }
    });
}

function prevStep(step) {
    if (step === 1) {
        document.getElementById("package-questions").classList.add("d-none");
        document.getElementById("service-selection").classList.remove("d-none");
        updateProgressBar(1);
    } else if (step === 2) {
        document.getElementById("proposal").classList.add("d-none");
        document.getElementById("package-questions").classList.remove("d-none");
        updateProgressBar(2);
    }
}

function generateProposal() {
    document.getElementById("package-questions").classList.add("d-none");
    document.getElementById("proposal").classList.remove("d-none");
    updateProgressBar(3);

    const currentDate = new Date();
    const publishedDate = currentDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    
    const expiryDate = new Date();
    expiryDate.setDate(currentDate.getDate() + 3);
    const formattedExpiryDate = expiryDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    let proposalHTML = `
        <div class="proposal-header">
            <p><strong>Date Published:</strong> ${publishedDate}</p>
            <p><strong>Proposal Expiry:</strong> ${formattedExpiryDate}</p>
        </div>
        <hr>
        <h4>Proposal Details</h4>
        <p>Based on your selections, here are the details of the packages you've chosen:</p>
    `;

    const selectedPackages = document.querySelectorAll('input[type="radio"]:checked');

    selectedPackages.forEach(pkgRadio => {
        const serviceId = pkgRadio.dataset.service;
        const service = window.proposalData.services.find(s => s.id === serviceId);
        if (service) {
            const pkg = service.packages.find(p => p.name === pkgRadio.value);
            if (pkg) {
                proposalHTML += `
                    <div class="package-details">
                        <h5>${service.name} Package: ${pkg.name}</h5>
                        <p>${pkg.fullDescription.replace(/\n/g, '<br>')}</p>
                    </div>
                `;
            }
        }
    });

    document.getElementById("proposalPreview").innerHTML = proposalHTML;
}

function resetForm() {
    document.getElementById("serviceForm").reset();
    document.getElementById("package-options-container").innerHTML = "";
    document.getElementById("proposal").classList.add("d-none");
    document.getElementById("service-selection").classList.remove("d-none");
    updateProgressBar(1);
}

function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const proposalHTML = document.getElementById("proposalPreview").innerHTML;
    doc.html(proposalHTML, {
        callback: function (doc) {
            doc.save("proposal.pdf");
        },
        x: 10,
        y: 10
    });
}

