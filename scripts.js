function nextStep() {
    document.getElementById("service-selection").classList.add("d-none");
    document.getElementById("package-questions").classList.remove("d-none");

    if (document.getElementById("webDev").checked) {
        document.getElementById("webDevOptions").classList.remove("d-none");
    }
    if (document.getElementById("digitalMarketing").checked) {
        document.getElementById("digitalMarketingOptions").classList.remove("d-none");
    }
    if (document.getElementById("webHosting").checked) {
        document.getElementById("webHostingOptions").classList.remove("d-none");
    }
}

function generateProposal() {
    let proposalText = "Based on your selections, here are the details of the packages you've chosen:\n\n";

    // Web Development Package
    const webDevPackage = document.querySelector('input[name="webDevPackage"]:checked');
    if (webDevPackage) {
        proposalText += `Web Development Package: ${webDevPackage.value}\n`;
        if (webDevPackage.value === "Starter") {
            proposalText += "Includes up to 5 pages, SEO, and 3 months of support.\n";
        } else if (webDevPackage.value === "Standard") {
            proposalText += "Includes up to 10 pages, SEO, and 6 months of support.\n";
        } else if (webDevPackage.value === "Premium") {
            proposalText += "Includes up to 25 pages, SEO, and 1 year of support.\n";
        }
    }

    // Digital Marketing Package
    const dmPackage = document.querySelector('input[name="dmPackage"]:checked');
    if (dmPackage) {
        proposalText += `\nDigital Marketing Package: ${dmPackage.value}\n`;
        if (dmPackage.value === "GT 1") {
            proposalText += "Includes 4 creative designs, USD $53 credit, and reach up to 80K+.\n";
        } else if (dmPackage.value === "GT 2") {
            proposalText += "Includes 8 creative designs, USD $88 credit, and reach up to 133K+.\n";
        } else if (dmPackage.value === "GT 3") {
            proposalText += "Includes 18 creative designs, USD $176 credit, and reach up to 266K+.\n";
        } else if (dmPackage.value === "GT 4") {
            proposalText += "Includes 20 creative designs, no credit, and a custom reach.\n";
        }
    }

    // Web Hosting Package
    const hostingPackage = document.querySelector('input[name="hostingPackage"]:checked');
    if (hostingPackage) {
        proposalText += `\nWeb Hosting Package: ${hostingPackage.value}\n`;
        if (hostingPackage.value === "Basic") {
            proposalText += "1GB Disk Space, Unlimited Bandwidth, and 1 Email Account.\n";
        } else if (hostingPackage.value === "Professional") {
            proposalText += "5GB Disk Space, Unlimited Bandwidth, and 5 Email Accounts.\n";
        } else if (hostingPackage.value === "Business") {
            proposalText += "25GB Disk Space, Unlimited Bandwidth, and 15 Email Accounts.\n";
        }
    }

    document.getElementById("package-questions").classList.add("d-none");
    document.getElementById("proposal").classList.remove("d-none");
    document.getElementById("proposalContent").innerText = proposalText;
}

function resetForm() {
    document.getElementById("serviceForm").reset();
    document.querySelectorAll(".service-options").forEach(option => option.classList.add("d-none"));
    document.getElementById("service-selection").classList.remove("d-none");
    document.getElementById("package-questions").classList.add("d-none");
    document.getElementById("proposal").classList.add("d-none");
}

function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text(document.getElementById("proposalContent").innerText, 10, 10);
    doc.save("proposal.pdf");
}
