document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('quote-form');
    const steps = document.querySelectorAll('.form-step');
    const indicators = document.querySelectorAll('.step-indicator');
    const btnNext = document.getElementById('btn-next');
    const btnPrev = document.getElementById('btn-prev');
    const btnSubmit = document.getElementById('btn-submit');
    const progressBar = document.getElementById('progress-bar');
    const loadingOverlay = document.getElementById('loading-overlay');

    let currentStep = 0;

    // Initialize progress bar
    updateProgress();

    // Event Listeners for Navigation
    btnNext.addEventListener('click', () => {
        if (validateStep(currentStep)) {
            currentStep++;
            showStep(currentStep);
            updateProgress();
            updateButtons();
        }
    });

    btnPrev.addEventListener('click', () => {
        currentStep--;
        showStep(currentStep);
        updateProgress();
        updateButtons();
    });

    // Handle Form Submission
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        // Final validation
        if (!validateStep(currentStep)) return;

        // Visual loading state
        loadingOverlay.classList.remove('hidden');

        const formData = new FormData(form);

        fetch(form.action, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        })
            .then(response => response.json())
            .then(data => {
                loadingOverlay.classList.add('hidden');
                if (data.success) {
                    // Hide all steps and show success message
                    steps.forEach(step => step.classList.remove('active'));
                    document.getElementById('success-message').classList.remove('hidden');

                    // Hide navigation buttons
                    document.querySelector('.form-navigation').classList.add('hidden');
                    document.querySelector('.subtitle').classList.add('hidden');
                    document.querySelector('#step-5 h2').classList.add('hidden');
                    document.querySelector('.radio-group').classList.add('hidden');
                    document.querySelector('.privacy-policy').classList.add('hidden');

                    // Mark all steps complete
                    indicators.forEach(ind => ind.classList.add('completed'));
                    progressBar.style.width = '100%';

                    // Reset form data after short delay
                    setTimeout(() => form.reset(), 3000);
                } else {
                    alert('Si è verificato un errore. Riprova più tardi.');
                }
            })
            .catch(error => {
                loadingOverlay.classList.add('hidden');
                alert('Errore di connessione. Controlla la tua rete e riprova.');
            });
    });

    // Insurance Situation Logic
    const sitRadios = document.querySelectorAll('input[name="Situazione_Assicurativa"]');
    const targaRifGroup = document.getElementById('targa-riferimento-group');
    const targaRifInput = document.getElementById('targa_riferimento');

    if (sitRadios && targaRifGroup && targaRifInput) {
        sitRadios.forEach(radio => {
            radio.addEventListener('change', function () {
                if (this.value === 'Acquisto Veicolo - Legge Bersani' || this.value === 'Sostituzione Veicolo') {
                    targaRifGroup.classList.remove('hidden');
                    targaRifInput.required = true;
                } else {
                    targaRifGroup.classList.add('hidden');
                    targaRifInput.required = false;
                }
            });
        });
    }

    // Vehicle Type Icon Toggle
    const tipoRadios = document.querySelectorAll('input[name="Tipo_Veicolo"]');
    const targaIcon = document.querySelector('label[for="targa"]').nextElementSibling.querySelector('i');
    const marcaIcon = document.querySelector('label[for="marca"]').nextElementSibling.querySelector('i');
    const modelloIcon = document.querySelector('label[for="modello"]').nextElementSibling.querySelector('i');
    const meseAnnoIcon = document.querySelector('label[for="mese_anno_immatricolazione"]').nextElementSibling.querySelector('i');
    const allestimentoIcon = document.querySelector('label[for="allestimento"]').nextElementSibling.querySelector('i');

    if (tipoRadios && targaIcon && marcaIcon && modelloIcon) {
        const targaInput = document.getElementById('targa');
        tipoRadios.forEach(radio => {
            radio.addEventListener('change', function () {
                if (this.value === 'Motociclo') {
                    targaIcon.className = 'fa-solid fa-motorcycle';
                    marcaIcon.className = 'fa-solid fa-motorcycle';
                    modelloIcon.className = 'fa-solid fa-motorcycle';
                    if (allestimentoIcon) allestimentoIcon.className = 'fa-solid fa-motorcycle';

                    if (targaInput) {
                        targaInput.placeholder = "Es. AA 00000";
                        targaInput.pattern = "[A-Za-z]{2}[0-9]{5}";
                        targaInput.title = "Inserisci una targa moto valida (es. AA00000)";
                        targaInput.maxLength = 7;
                    }
                } else if (this.value === 'Ciclomotore') {
                    targaIcon.className = 'fa-solid fa-motorcycle';
                    marcaIcon.className = 'fa-solid fa-motorcycle';
                    modelloIcon.className = 'fa-solid fa-motorcycle';
                    if (allestimentoIcon) allestimentoIcon.className = 'fa-solid fa-motorcycle';

                    if (targaInput) {
                        targaInput.placeholder = "Es. X00000";
                        targaInput.pattern = "[A-Za-z0-9]{6}";
                        targaInput.title = "Inserisci una targa ciclomotore valida a 6 caratteri (es. X00000)";
                        targaInput.maxLength = 6;
                    }
                } else {
                    targaIcon.className = 'fa-solid fa-car-rear';
                    marcaIcon.className = 'fa-solid fa-car';
                    modelloIcon.className = 'fa-solid fa-car-side';
                    if (allestimentoIcon) allestimentoIcon.className = 'fa-solid fa-sliders';

                    if (targaInput) {
                        targaInput.placeholder = "Es. AA 000 AA";
                        targaInput.pattern = "[A-Za-z]{2}[0-9]{3}[A-Za-z]{2}";
                        targaInput.title = "Inserisci una targa auto valida (es. AA000AA)";
                        targaInput.maxLength = 7;
                    }
                }
            });
        });
    }

    // Functions
    function showStep(stepIndex) {
        // Hide all steps
        steps.forEach((step, index) => {
            step.classList.remove('active');
            if (index === stepIndex) {
                step.classList.add('active');
            }
        });

        // Update indicators
        indicators.forEach((indicator, index) => {
            indicator.classList.remove('active');
            indicator.classList.remove('completed');

            if (index < stepIndex) {
                indicator.classList.add('completed');
            } else if (index === stepIndex) {
                indicator.classList.add('active');
            }
        });
    }

    function updateProgress() {
        // Calculate progress percentage based on 4 steps (0, 1, 2, 3)
        const percent = (currentStep / (steps.length - 1)) * 100;
        progressBar.style.width = `${percent}%`;
    }

    function updateButtons() {
        // Handle Prev button
        if (currentStep === 0) {
            btnPrev.disabled = true;
        } else {
            btnPrev.disabled = false;
        }

        // Handle Next / Submit button
        if (currentStep === steps.length - 1) {
            btnNext.classList.add('hidden');
            btnSubmit.classList.remove('hidden');
        } else {
            btnNext.classList.remove('hidden');
            btnSubmit.classList.add('hidden');
        }
    }

    function validateStep(stepIndex) {
        const currentStepEl = steps[stepIndex];
        const inputs = currentStepEl.querySelectorAll('input[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (input.type === 'radio') {
                const radioGroup = currentStepEl.querySelectorAll(`input[name="${input.name}"]`);
                let isRadioSelected = false;
                radioGroup.forEach(radio => {
                    if (radio.checked) isRadioSelected = true;
                });

                if (!isRadioSelected) {
                    isValid = false;
                    // Highlight the radio group somehow
                    const radioWrapper = currentStepEl.querySelector('.radio-group');
                    if (radioWrapper) {
                        radioWrapper.style.border = '1px solid var(--error)';
                        setTimeout(() => radioWrapper.style.border = 'none', 2000);
                    }
                }
            } else if (!input.value.trim() && input.type !== 'checkbox') {
                isValid = false;
                showError(input);
            } else if (input.type === 'email' && !validateEmail(input.value)) {
                isValid = false;
                showError(input);
            } else if (input.type === 'checkbox' && !input.checked) {
                isValid = false;
                const checkmarkWrapper = input.closest('.custom-checkbox');
                if (checkmarkWrapper) {
                    checkmarkWrapper.style.border = '1px solid var(--error)';
                    setTimeout(() => checkmarkWrapper.style.border = '1px solid var(--input-border)', 2000);
                }
            } else {
                removeError(input);
            }
        });

        return isValid;
    }

    function showError(input) {
        const wrapper = input.closest('.input-wrapper');
        if (wrapper) {
            wrapper.classList.add('error');
        }
    }

    function removeError(input) {
        const wrapper = input.closest('.input-wrapper');
        if (wrapper) {
            wrapper.classList.remove('error');
        }
    }

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Clear error on input typing
    form.addEventListener('input', (e) => {
        if (e.target.required) {
            removeError(e.target);
        }
    });
});

// File Upload Logic
document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('libretto');
    const fileNameDisplay = document.getElementById('file-name-display');
    const fileNameText = document.getElementById('file-name-text');
    const removeFileBtn = document.getElementById('remove-file-btn');

    if (fileInput && fileNameDisplay && fileNameText && removeFileBtn) {
        fileInput.addEventListener('change', function () {
            if (this.files && this.files.length > 0) {
                const file = this.files[0];
                fileNameText.textContent = file.name;
                fileNameDisplay.classList.remove('hidden');
            } else {
                fileNameDisplay.classList.add('hidden');
            }
        });

        removeFileBtn.addEventListener('click', function (e) {
            e.preventDefault();
            fileInput.value = ''; // Clear the file input
            fileNameDisplay.classList.add('hidden');
        });
    }
});



// Date Auto-formatter
document.addEventListener('DOMContentLoaded', () => {
    const meseAnnoInput = document.getElementById('mese_anno_immatricolazione');

    if (meseAnnoInput) {
        meseAnnoInput.addEventListener('input', function (e) {
            let input = this.value.replace(/\D/g, '').substring(0, 6); // Remove non-digits, max 6 numbers

            // Add slash after two digits if we have more than 2 digits
            if (input.length > 2) {
                this.value = input.substring(0, 2) + '/' + input.substring(2);
            } else {
                this.value = input;
            }
        });

        // Handle backspace properly
        meseAnnoInput.addEventListener('keydown', function (e) {
            if (e.key === 'Backspace' && this.value.length === 4 && this.value.includes('/')) {
                this.value = this.value.substring(0, 2);
            }
        });
    }
});
