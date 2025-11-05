// initialize current step
window.currentStep = 1;

document.addEventListener("DOMContentLoaded", () => {
    const preloader = document.getElementById('preloader');
    const progressBar = preloader.querySelector('.progress-bar');
    let progress = 0;

    // applyBackground();  // moved to CSS — commented out to avoid duplication

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

    // improved fetch + UI fallback (replaces the Promise.all ... then(...) block)
    Promise.allSettled([
        fetch("data.json").then(r => r.json()),
        fetch(cacheBustedUrl).then(r => r.text())
    ]).then(results => {
        const localResult = results[0];
        const csvResult = results[1];

        if (localResult.status !== 'fulfilled') {
            console.error('Failed to load local data.json', localResult.reason);
            // show minimal error to user
            document.getElementById('service-preloader').classList.add('d-none');
            const errDiv = document.createElement('div');
            errDiv.className = 'alert alert-danger';
            errDiv.textContent = 'Failed to load services data.';
            document.getElementById('serviceForm').appendChild(errDiv);
            return;
        }

        window.proposalData = localResult.value;

        let csvDataText = null;
        if (csvResult && csvResult.status === 'fulfilled') {
            csvDataText = csvResult.value;
        } else {
            console.warn('CSV fetch failed, using local data only.', csvResult && csvResult.reason);
        }

        const digitalMarketingService = window.proposalData.services.find(s => s.id === "digitalMarketing");
        if (digitalMarketingService) {
            if (csvDataText) {
                digitalMarketingService.packages = parseCsv(csvDataText);
            } else if (!Array.isArray(digitalMarketingService.packages)) {
                digitalMarketingService.packages = [];
            }
        }

        const serviceForm = document.getElementById("serviceForm");
        window.proposalData.services.forEach(service => {
            const serviceDiv = document.createElement("div");
            serviceDiv.className = "form-check";

            const input = document.createElement('input');
            input.type = 'checkbox';
            input.className = 'form-check-input';
            input.id = service.id;
            input.name = 'service';
            input.value = service.name;

            const label = document.createElement('label');
            label.className = 'form-check-label';
            label.htmlFor = service.id;
            label.textContent = service.name;

            const small = document.createElement('small');
            small.className = 'form-text text-muted';
            small.textContent = service.description;

            serviceDiv.appendChild(input);
            serviceDiv.appendChild(label);
            serviceDiv.appendChild(document.createElement('br'));
            serviceDiv.appendChild(small);

            serviceForm.appendChild(serviceDiv);
        });

        // Improve: disable Next until a service is selected and toggle on change
        const nextBtn = document.getElementById("nextStepButton");
        if (nextBtn) nextBtn.disabled = true;
        serviceForm.addEventListener('change', () => {
            const anyChecked = serviceForm.querySelectorAll('input[name="service"]:checked').length > 0;
            if (nextBtn) nextBtn.disabled = !anyChecked;
        });

        document.getElementById("service-preloader").classList.add("d-none");
        serviceForm.classList.remove("d-none");
        if (nextBtn) nextBtn.classList.remove("d-none");
    }).catch(err => {
        console.error('Unexpected error loading data', err);
    });
});

// improved parseCsv: trim BOM, support CRLF, keep quoted newlines (only minor tweaks)
function parseCsv(csv) {
    if (!csv) return [];
    // Remove BOM if present
    if (csv.charCodeAt(0) === 0xFEFF) csv = csv.slice(1);
    const lines = csv.replace(/\r\n/g, '\n').split('\n').filter(line => line.trim() !== '');
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
                values.push(currentField);
                currentField = "";
            } else {
                currentField += char;
            }
        }
        values.push(currentField);
        // Do NOT trim inside quotes; trim outer whitespace
        return values.map(v => v.trim());
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
            const featureName = rowValues[0] || "";
            const featureValue = rowValues[i] || "";

            if (featureName.toLowerCase() === 'total cost') {
                const numeric = featureValue.replace(/[^0-9.]/g, '');
                pkg.price = numeric ? `NRs ${Number(numeric).toLocaleString()}` : `NRs ${featureValue}`;
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

// safer price parsing and thousands-separator handling (replace updateTotalCost)
function updateTotalCost() {
    let totalCost = 0.0;
    const selectedPackages = document.querySelectorAll('input[type="radio"]:checked');

    selectedPackages.forEach(pkgRadio => {
        const serviceId = pkgRadio.dataset.service;
        const service = window.proposalData && window.proposalData.services && window.proposalData.services.find(s => s.id === serviceId);
        if (service) {
            const pkg = service.packages.find(p => p.name === pkgRadio.value);
            if (pkg && pkg.price) {
                // keep digits and decimal point, remove commas/currency
                const cleaned = pkg.price.replace(/[^0-9.,]/g, '').replace(/,/g, '');
                const value = parseFloat(cleaned) || 0;
                totalCost += value;
            }
        }
    });

    // show as integer if whole number, otherwise show two decimals
    const formatted = Number.isInteger(totalCost) ? totalCost.toLocaleString() : totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const costEl = document.getElementById('totalCost');
    if (costEl) costEl.innerText = `NRs ${formatted}`;
}

function updateProgressBar(step) {
    // ensure numeric and clamp between 1 and 3
    const totalSteps = 3;
    const newStep = Math.max(1, Math.min(totalSteps, Number(step) || 1));
    window.currentStep = newStep;

    // pick a visible progress-bar (ignore hidden/preloader ones)
    const bars = Array.from(document.querySelectorAll('.progress-bar'));
    let progressBar = bars.find(b => b.offsetParent !== null && b.getBoundingClientRect().width > 0);
    if (!progressBar) progressBar = bars[0];
    if (!progressBar) return; // nothing to update

    const percentage = (newStep / totalSteps) * 100;
    progressBar.style.width = `${percentage}%`;
    progressBar.setAttribute('aria-valuenow', Math.round(percentage));
    progressBar.textContent = `Step ${newStep}`;
}

function nextStep() {
    const selectedServices = Array.from(document.querySelectorAll('input[name="service"]:checked')).map(cb => cb.id);
    if (selectedServices.length === 0) {
        // show a brief warning instead of proceeding
        const warn = document.createElement('div');
        warn.className = 'alert alert-warning mt-2';
        warn.textContent = 'Please select at least one service to continue.';
        const container = document.getElementById('service-selection');
        // remove existing warns
        const existing = container.querySelectorAll('.alert-warning');
        existing.forEach(n => n.remove());
        container.insertBefore(warn, container.firstChild);
        return;
    }

    document.getElementById("service-selection").classList.add("d-none");
    document.getElementById("package-questions").classList.remove("d-none");
    // increment step (max 3)
    updateProgressBar(Math.min(3, window.currentStep + 1));

    const packageOptionsContainer = document.getElementById("package-options-container");
    packageOptionsContainer.innerHTML = "";

    // fallback for debounced updater
    const debouncedUpdater = window.debouncedUpdateTotalCost || updateTotalCost;

    selectedServices.forEach(serviceId => {
        const service = window.proposalData.services.find(s => s.id === serviceId);
        if (service) {
            const serviceOptionsDiv = document.createElement("div");
            serviceOptionsDiv.className = "service-options mb-4";

            const h5 = document.createElement('h5');
            h5.textContent = `${service.name} Packages:`;
            serviceOptionsDiv.appendChild(h5);

            if (service.packages && service.packages.length > 0) {
                const btnWrap = document.createElement('div');
                btnWrap.className = 'mb-2';

                const selectFirstBtn = document.createElement('button');
                selectFirstBtn.type = 'button';
                selectFirstBtn.className = 'btn btn-sm btn-outline-primary mr-2';
                selectFirstBtn.textContent = 'Select First';
                selectFirstBtn.setAttribute('aria-label', `Select first package for ${service.name}`);
                selectFirstBtn.addEventListener('click', () => toggleAllPackages(service.id, true));

                const deselectBtn = document.createElement('button');
                deselectBtn.type = 'button';
                deselectBtn.className = 'btn btn-sm btn-outline-secondary';
                deselectBtn.textContent = 'Deselect All';
                deselectBtn.setAttribute('aria-label', `Deselect all packages for ${service.name}`);
                deselectBtn.addEventListener('click', () => toggleAllPackages(service.id, false));

                btnWrap.appendChild(selectFirstBtn);
                btnWrap.appendChild(deselectBtn);
                serviceOptionsDiv.appendChild(btnWrap);
            }

            (service.packages || []).forEach(pkg => {
                const packageDiv = document.createElement("div");
                packageDiv.className = "form-check";

                const input = document.createElement('input');
                input.type = 'radio';
                input.className = 'form-check-input';
                input.name = `${service.id}Package`;
                input.id = pkg.id;
                input.value = pkg.name;
                input.dataset.service = service.id;
                input.setAttribute('aria-label', `${pkg.name} option for ${service.name}`);
                input.addEventListener('change', debouncedUpdater);

                const label = document.createElement('label');
                label.className = 'form-check-label radio-label';
                label.htmlFor = pkg.id;
                label.textContent = `${pkg.name} - ${pkg.price}`;

                const small = document.createElement('small');
                small.className = 'form-text text-muted';
                small.textContent = pkg.features || '';

                packageDiv.appendChild(input);
                packageDiv.appendChild(label);
                packageDiv.appendChild(document.createElement('br'));
                packageDiv.appendChild(small);

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
        if (radioButtons.length > 0) {
            radioButtons[0].checked = true;
            radioButtons[0].dispatchEvent(new Event('change', { bubbles: true }));
        }
    } else {
        radioButtons.forEach(radio => {
            radio.checked = false;
            radio.dispatchEvent(new Event('change', { bubbles: true }));
        });
    }
    // use debounced updater as a final guarantee
    if (window.debouncedUpdateTotalCost) window.debouncedUpdateTotalCost();
}

function prevStep(step) {
    if (step === 1) {
        document.getElementById("package-questions").classList.add("d-none");
        document.getElementById("service-selection").classList.remove("d-none");
        // decrement step (min 1)
        updateProgressBar(Math.max(1, (window.currentStep || 1) - 1));
    } else if (step === 2) {
        document.getElementById("proposal").classList.add("d-none");
        document.getElementById("package-questions").classList.remove("d-none");
        // decrement step (min 1)
        updateProgressBar(Math.max(1, (window.currentStep || 1) - 1));
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

    const fragment = document.createDocumentFragment();

    const headerDiv = document.createElement('div');
    headerDiv.className = 'proposal-header';
    const pDate = document.createElement('p');
    pDate.innerHTML = `<strong>Date Published:</strong> ${publishedDate}`;
    const pExpiry = document.createElement('p');
    pExpiry.innerHTML = `<strong>Proposal Expiry:</strong> ${formattedExpiryDate}`;
    headerDiv.appendChild(pDate);
    headerDiv.appendChild(pExpiry);
    fragment.appendChild(headerDiv);

    fragment.appendChild(document.createElement('hr'));

    const h4 = document.createElement('h4');
    h4.textContent = 'Proposal Details';
    fragment.appendChild(h4);

    const intro = document.createElement('p');
    intro.textContent = 'Based on your selections, here are the details of the packages you\'ve chosen:';
    fragment.appendChild(intro);

    const selectedPackages = document.querySelectorAll('input[type="radio"]:checked');
    let totalCost = 0.0;

    selectedPackages.forEach(pkgRadio => {
        const serviceId = pkgRadio.dataset.service;
        const service = window.proposalData.services.find(s => s.id === serviceId);
        if (service) {
            const pkg = service.packages.find(p => p.name === pkgRadio.value);
            if (pkg) {
                const packageDiv = document.createElement('div');
                packageDiv.className = 'package-details';

                const title = document.createElement('h5');
                title.textContent = `${service.name} Package: ${pkg.name}`;
                packageDiv.appendChild(title);

                const priceP = document.createElement('p');
                priceP.innerHTML = `<strong>Price:</strong> ${pkg.price}`;
                packageDiv.appendChild(priceP);

                // fullDescription lines -> safe text nodes with <br>
                const descContainer = document.createElement('p');
                const lines = (pkg.fullDescription || '').split(/\n+/).filter(Boolean);
                lines.forEach((line, idx) => {
                    const txt = document.createTextNode(line);
                    descContainer.appendChild(txt);
                    if (idx < lines.length - 1) descContainer.appendChild(document.createElement('br'));
                });
                packageDiv.appendChild(descContainer);

                fragment.appendChild(packageDiv);

                const cleaned = (pkg.price || '').replace(/[^0-9.,]/g, '').replace(/,/g, '');
                totalCost += parseFloat(cleaned) || 0;
            }
        }
    });

    fragment.appendChild(document.createElement('hr'));

    const totalDiv = document.createElement('div');
    totalDiv.className = 'text-right';
    const totalH5 = document.createElement('h5');
    const formattedTotal = Number.isInteger(totalCost) ? totalCost.toLocaleString() : totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    totalH5.textContent = `Total Cost: NRs ${formattedTotal}`;
    totalDiv.appendChild(totalH5);
    fragment.appendChild(totalDiv);

    const preview = document.getElementById("proposalPreview");
    if (preview) {
        preview.innerHTML = '';
        preview.appendChild(fragment);
    }
    const costEl = document.getElementById('totalCost');
    if (costEl) costEl.innerText = `NRs ${formattedTotal}`;
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
    if (!proposal) return;
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
            position = -(pdfHeight - heightLeft);
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
            heightLeft -= pageHeight;
        }

        pdf.save('proposal.pdf');
    }).catch(err => {
        console.error('Error generating PDF', err);
    }).finally(() => {
        // Restore original styles no matter success/failure
        proposal.style.maxHeight = originalMaxHeight;
        proposal.style.overflowY = originalOverflowY;
    });
}

// small debounce helper and exposed debounced updater
function debounce(fn, wait = 100) {
    let timer = null;
    return function(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), wait);
    };
}
window.debouncedUpdateTotalCost = debounce(() => updateTotalCost(), 120);
