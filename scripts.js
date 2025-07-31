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
            proposalText += "Our Starter package is perfect for small businesses and startups. It includes a fully responsive design with up to 5 custom-designed pages, basic on-page SEO to improve search engine visibility, and 3 months of dedicated technical support.\n";
        } else if (webDevPackage.value === "Standard") {
            proposalText += "The Standard package is designed for growing businesses. It includes everything in the Starter package, expanded to 10 pages, with advanced SEO features, and 6 months of comprehensive support to ensure your website runs smoothly.\n";
        } else if (webDevPackage.value === "Premium") {
            proposalText += "Our Premium package offers a complete solution for established businesses. It includes up to 25 pages, advanced SEO, e-commerce functionality, and a full year of priority support, ensuring your online presence is robust and scalable.\n";
        }
    }

    // Digital Marketing Package
    const dmPackage = document.querySelector('input[name="dmPackage"]:checked');
    if (dmPackage) {
        proposalText += `\nDigital Marketing Package: ${dmPackage.value}\n`;
        if (dmPackage.value === "GT 1") {
            proposalText += "The GT 1 package is ideal for businesses starting with digital marketing. It includes 4 creative designs for social media, a USD $53 advertising credit to kickstart your campaigns, and an estimated reach of over 80,000 potential customers.\n";
        } else if (dmPackage.value === "GT 2") {
            proposalText += "The GT 2 package is designed for businesses looking to expand their digital footprint. It includes 8 creative designs, a USD $88 advertising credit, and an estimated reach of over 133,000, helping you connect with a larger audience.\n";
        } else if (dmPackage.value === "GT 3") {
            proposalText += "Our GT 3 package is tailored for aggressive growth. It includes 18 creative designs, a generous USD $176 advertising credit, and an impressive reach of over 266,000, maximizing your market penetration.\n";
        } else if (dmPackage.value === "GT 4") {
            proposalText += "The GT 4 package offers a fully customized digital marketing strategy. It includes 20 creative designs and a tailored reach based on your specific business goals, without a fixed advertising credit, providing maximum flexibility.\n";
        }
    }

    // Web Hosting Package
    const hostingPackage = document.querySelector('input[name="hostingPackage"]:checked');
    if (hostingPackage) {
        proposalText += `\nWeb Hosting Package: ${hostingPackage.value}\n`;
        if (hostingPackage.value === "Basic") {
            proposalText += "Our Basic hosting plan is perfect for personal websites and small projects. It includes 1GB of disk space, unmetered bandwidth, and one professional email account, providing a reliable and affordable hosting solution.\n";
        } else if (hostingPackage.value === "Professional") {
            proposalText += "The Professional hosting plan is ideal for small businesses and freelancers. It offers 5GB of disk space, unmetered bandwidth, and 5 professional email accounts, giving you more room to grow.\n";
        } else if (hostingPackage.value === "Business") {
            proposalText += "Our Business hosting plan is designed for high-traffic websites and e-commerce stores. It comes with 25GB of disk space, unmetered bandwidth, and 15 professional email accounts, ensuring top performance and reliability.\n";
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
