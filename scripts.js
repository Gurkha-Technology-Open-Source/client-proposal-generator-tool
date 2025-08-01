document.addEventListener("DOMContentLoaded", () => {
    const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR4YHLJ-QG-5mniI5lWB9KsfvItj2zngZwIQa0Lb-FD4O0sYCRUTb_LcOZPxFYY_w5_rASmd_TaXipw/pub?gid=0&single=true&output=csv";
    const cacheBustedUrl = `${csvUrl}&_=${new Date().getTime()}`;

    Promise.all([
        fetch("data.json").then(response => response.json()),
        fetch(cacheBustedUrl).then(response => response.text())
    ]).then(([localData, csvData]) => {
        window.proposalData = localData;
        const digitalMarketingService = window.proposalData.services.find(s => s.id === "digitalMarketing");
        if (digitalMarketingService) {
            digitalMarketingService.packages = parseCsv(csvData);
        }

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

function parseCsv(csv) {
    const lines = csv.split('\n').filter(line => line.trim() !== '');
    if (lines.length < 2) {
        console.error("CSV data is too short to contain headers and data.");
        return [];
    }

    const parseCsvLine = (line) => {
        const values = [];
        let inQuote = false;
        let currentField = "";
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                if (inQuote && i + 1 < line.length && line[i + 1] === '"') {
                    currentField += '"';
                    i++;
                } else {
                    inQuote = !inQuote;
                }
            } else if (char === ',' && !inQuote) {
                values.push(currentField.trim());
                currentField = "";
            } else {
                currentField += char;
            }
        }
        values.push(currentField.trim());
        return values;
    };

    const headerLine = lines[1];
    const headers = parseCsvLine(headerLine);

    const packages = [];

    for (let i = 1; i < headers.length; i++) {
        const pkg = {
            id: headers[i].replace(/\s+/g, '-').toLowerCase(),
            name: headers[i],
            price: "",
            features: "",
            fullDescription: ""
        };
        let description = "";

        for (let j = 2; j < lines.length; j++) {
            const rowValues = parseCsvLine(lines[j]);
            const featureName = rowValues[0] ? rowValues[0].trim() : "";
            const featureValue = rowValues[i] ? rowValues[i].trim() : "";

            if (featureName.toLowerCase() === 'total cost') {
                pkg.price = `NRs ${featureValue}`;
            } else if (featureName) {
                description += `${featureName}: ${featureValue}\n`;
            }
        }
        pkg.fullDescription = description.trim();
        pkg.features = description.split('\n').filter(f => f.trim() !== '').slice(0, 2).join(', ');
        packages.push(pkg);
    }
    return packages;
}

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
                    <label class="form-check-label" for="${pkg.id}">${pkg.name} - ${pkg.price}</label>
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

    let proposalText = `Date Published: ${publishedDate}\n`;
    proposalText += `Proposal Expiry: ${formattedExpiryDate}\n\n`;
    proposalText += "Based on your selections, here are the details of the packages you've chosen:\n\n";

    const selectedPackages = document.querySelectorAll('input[type="radio"]:checked');

    selectedPackages.forEach(pkgRadio => {
        const serviceId = pkgRadio.dataset.service;
        const service = window.proposalData.services.find(s => s.id === serviceId);
        if (service) {
            const pkg = service.packages.find(p => p.name === pkgRadio.value);
            if (pkg) {
                proposalText += `${service.name} Package: ${pkg.name}\n`;
                proposalText += `${pkg.fullDescription}\n\n`;
            }
        }
    });

    document.getElementById("proposalPreview").innerText = proposalText;
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
    doc.text(document.getElementById("proposalPreview").innerText, 10, 10);
    doc.save("proposal.pdf");
}

