document.addEventListener("DOMContentLoaded", () => {
    const preloader = document.getElementById('preloader');
    const progressBar = preloader.querySelector('.progress-bar');
    let progress = 0;

    const interval = setInterval(() => {
        progress += 10;
        progressBar.style.width = progress + '%';
        progressBar.setAttribute('aria-valuenow', progress);

        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 500);
        }
    }, 200);

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

    const headerLine = lines[0];
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

        for (let j = 1; j < lines.length; j++) {
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

function clearSelection() {
    const checkboxes = document.querySelectorAll('input[name="service"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
}

function selectAllServices() {
    const checkboxes = document.querySelectorAll('input[name="service"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = true;
    });
}

function updateTotalCost() {
    let totalCost = 0;
    const selectedPackages = document.querySelectorAll('input[type="radio"]:checked');

    selectedPackages.forEach(pkgRadio => {
        const serviceId = pkgRadio.dataset.service;
        const service = window.proposalData.services.find(s => s.id === serviceId);
        if (service) {
            const pkg = service.packages.find(p => p.name === pkgRadio.value);
            if (pkg) {
                const priceString = pkg.price.replace(/[^0-9]/g, '');
                if (priceString) {
                    totalCost += parseInt(priceString, 10);
                }
            }
        }
    });

    document.getElementById('totalCost').innerText = `NRs ${totalCost.toLocaleString()}`;
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
            let buttonsHTML = '';
            if (service.packages.length > 0) {
                buttonsHTML = `
                    <button type="button" class="btn btn-sm btn-outline-primary mb-2" onclick="toggleAllPackages('${service.id}', true)">Select First</button>
                    <button type="button" class="btn btn-sm btn-outline-secondary mb-2" onclick="toggleAllPackages('${service.id}', false)">Deselect All</button>
                `;
            }
            serviceOptionsDiv.innerHTML = `
                <h5>${service.name} Packages:</h5>
                ${buttonsHTML}
            `;

            service.packages.forEach(pkg => {
                const packageDiv = document.createElement("div");
                packageDiv.className = "form-check";
                packageDiv.innerHTML = `
                    <input type="radio" class="form-check-input" name="${service.id}Package" id="${pkg.id}" value="${pkg.name}" data-service="${service.id}" onchange="updateTotalCost()">
                    <label class="form-check-label radio-label" for="${pkg.id}">${pkg.name} - ${pkg.price}</label>
                    <small class="form-text text-muted">${pkg.features}</small>
                `;
                serviceOptionsDiv.appendChild(packageDiv);
            });

            packageOptionsContainer.appendChild(serviceOptionsDiv);
        }
    });
    updateTotalCost();
}

function toggleAllPackages(serviceId, select) {
    const radioButtons = document.querySelectorAll(`input[name="${serviceId}Package"]`);
    if (select) {
        if(radioButtons.length > 0) {
            radioButtons[0].checked = true;
        }
    } else {
        radioButtons.forEach(radio => {
            radio.checked = false;
        });
    }
    updateTotalCost();
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
    let totalCost = 0;

    selectedPackages.forEach(pkgRadio => {
        const serviceId = pkgRadio.dataset.service;
        const service = window.proposalData.services.find(s => s.id === serviceId);
        if (service) {
            const pkg = service.packages.find(p => p.name === pkgRadio.value);
            if (pkg) {
                proposalHTML += `
                    <div class="package-details">
                        <h5>${service.name} Package: ${pkg.name}</h5>
                        <p><strong>Price:</strong> ${pkg.price}</p>
                        <p>${pkg.fullDescription.replace(/\n+/g, '<br>')}</p>
                    </div>
                `;
                const priceString = pkg.price.replace(/[^0-9]/g, '');
                if (priceString) {
                    totalCost += parseInt(priceString, 10);
                }
            }
        }
    });

    proposalHTML += `
        <hr>
        <div class="text-right">
            <h5>Total Cost: NRs ${totalCost.toLocaleString()}</h5>
        </div>
    `;

    document.getElementById("proposalPreview").innerHTML = proposalHTML;
    document.getElementById('totalCost').innerText = `NRs ${totalCost.toLocaleString()}`;
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
    const proposal = document.getElementById('proposalPreview');
    const originalMaxHeight = proposal.style.maxHeight;
    const originalOverflowY = proposal.style.overflowY;

    // Temporarily remove height restrictions to capture the whole content
    proposal.style.maxHeight = 'none';
    proposal.style.overflowY = 'visible';

    html2canvas(proposal, {
        scrollY: -window.scrollY,
        windowWidth: proposal.scrollWidth,
        windowHeight: proposal.scrollHeight
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4'
        });

        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        const pageHeight = pdf.internal.pageSize.getHeight();

        let heightLeft = pdfHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
            position = heightLeft - pdfHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
            heightLeft -= pageHeight;
        }

        pdf.save('proposal.pdf');

        // Restore original styles
        proposal.style.maxHeight = originalMaxHeight;
        proposal.style.overflowY = originalOverflowY;
    });
}
