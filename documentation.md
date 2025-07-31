# Project Documentation

## 1. Overview

The Client Proposal Generator is a single-page web application built with HTML, CSS (Bootstrap), and vanilla JavaScript. It allows users to select from a predefined list of services and packages to generate a simple text-based proposal. The generated proposal can then be downloaded as a PDF file.

## 2. File Structure

- `index.html`: The main HTML file containing the structure of the web page, including the forms for service and package selection.
- `scripts.js`: Contains the JavaScript logic for handling user interactions, generating the proposal, and creating the PDF.
- `README.md`: Provides a general overview of the project.
- `LICENSE`: The project's license file.

## 3. Code Breakdown

### 3.1. `index.html`

The HTML is structured into three main sections, managed by Bootstrap's grid and utility classes:

- **`service-selection`**: The initial view where users can select the services they are interested in (e.g., Web Development, Digital Marketing). It contains a form with checkboxes for each service.
- **`package-questions`**: This section is initially hidden (`d-none`). It becomes visible after the user clicks the "Next" button in the service selection. It contains different sets of radio buttons for the available packages under each service.
- **`proposal`**: This section is also hidden by default. It displays the final generated proposal text and provides buttons to "Start Over" or "Download PDF".

### 3.2. `scripts.js`

The JavaScript file handles the core logic of the application.

- **`nextStep()`**: 
  - Hides the service selection view and shows the package selection view.
  - It checks which service checkboxes are selected and only displays the relevant package options.

- **`generateProposal()`**:
  - Collects the values from the selected package radio buttons.
  - Constructs a proposal string by concatenating the details of the chosen packages.
  - Hides the package selection view and displays the proposal view.
  - Sets the generated text content of the `proposalContent` paragraph.

- **`resetForm()`**:
  - Resets the service selection form.
  - Hides all package options and the proposal view.
  - Shows the initial service selection view.

- **`downloadPDF()`**:
  - Initializes a new `jsPDF` object.
  - Takes the text content from the `proposalContent` paragraph.
  - Creates a new PDF document with the proposal text.
  - Saves the PDF with the filename `proposal.pdf`.

## 4. How to Customize

### 4.1. Adding/Editing Services

1.  **In `index.html`**: Add a new checkbox and label within the `service-selection` div.
2.  **In `index.html`**: Create a new `div` with a unique ID inside the `package-questions` section to hold the package options for the new service.
3.  **In `scripts.js`**: Update the `nextStep()` function to show the new package options when the corresponding service is selected.

### 4.2. Adding/Editing Packages

1.  **In `index.html`**: Add or modify the radio buttons and labels within the respective service's package options `div`.
2.  **In `scripts.js`**: Update the `generateProposal()` function to include the text for the new or modified packages.
