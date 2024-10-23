document.getElementById('nextStep').addEventListener('click', function() {
    const servicesForm = document.getElementById('servicesForm');
    const selectedServices = Array.from(servicesForm.elements['services'])
        .filter(service => service.checked)
        .map(service => service.value);

    // Show questions based on selected services
    if (selectedServices.includes('web-development')) {
        document.getElementById('webDevelopmentQuestions').style.display = 'block';
    }
    if (selectedServices.includes('digital-marketing')) {
        document.getElementById('digitalMarketingQuestions').style.display = 'block';
    }
    if (selectedServices.includes('web-hosting')) {
        document.getElementById('webHostingQuestions').style.display = 'block';
    }

    document.getElementById('step1').style.display = 'none';
    document.getElementById('step2').style.display = 'block';
});

document.getElementById('generateProposal').addEventListener('click', function() {
    let proposal = '<h3>Selected Packages:</h3>';
    let totalCost = 0;

    // Web Development
    const webDevPackage = document.getElementById('webDevPackage').value;
    if (webDevPackage) {
        switch(webDevPackage) {
            case 'starter':
                proposal += '<p>Web Development: Starter Package - NRs 35,000</p>';
                totalCost += 35000;
                break;
            case 'standard':
                proposal += '<p>Web Development: Standard Package - NRs 60,000</p>';
                totalCost += 60000;
                break;
            case 'premium':
                proposal += '<p>Web Development: Premium Package - NRs 85,000</p>';
                totalCost += 85000;
                break;
        }
    }

    // Digital Marketing
    const dmPackage = document.getElementById('dmPackage').value;
    if (dmPackage) {
        switch(dmPackage) {
            case 'gt1':
                proposal += '<p>Digital Marketing: GT 1 Package - NRs 30,000</p>';
                totalCost += 30000;
                break;
            case 'gt2':
                proposal += '<p>Digital Marketing: GT 2 Package - NRs 50,000</p>';
                totalCost += 50000;
                break;
            case 'gt3':
                proposal += '<p>Digital Marketing: GT 3 Package - NRs 80,000</p>';
                totalCost += 80000;
                break;
            case 'gt4':
                proposal += '<p>Digital Marketing: GT 4 Package - NRs 100,000</p>';
                totalCost += 100000;
                break;
        }
    }

    // Web Hosting
    const hostingPackage = document.getElementById('hostingPackage').value;
    if (hostingPackage) {
        switch(hostingPackage) {
            case 'basic':
                proposal += '<p>Web Hosting: Basic Package - NRs 5,000/year</p>';
                totalCost += 5000;
                break;
            case 'professional':
                proposal += '<p>Web Hosting: Professional Package - NRs 8,000/year</p>';
                totalCost += 8000;
                break;
            case 'business':
                proposal += '<p>Web Hosting: Business Package - NRs 18,000/year</p>';
                totalCost += 18000;
                break;
        }
    }

    proposal += `<h3>Total Estimated Cost: NRs ${totalCost}</h3>`;

    document.getElementById('step2').style.display = 'none';
    document.getElementById('step3').style.display = 'block';
    document.getElementById('proposalDetails').innerHTML = proposal;
});
