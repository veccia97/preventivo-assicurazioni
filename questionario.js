document.addEventListener('DOMContentLoaded', () => {
    // Gestione degli step
    const steps = document.querySelectorAll('.form-step');
    const progressBar = document.getElementById('progress-bar');
    const dynamicIndicators = document.getElementById('dynamic-indicators');
    const btnNext = document.getElementById('btn-next');
    const btnPrev = document.getElementById('btn-prev');
    const btnAnalyze = document.getElementById('btn-analyze');
    const formNavButtons = document.getElementById('form-nav-buttons');
    const questionnaireForm = document.getElementById('questionnaire-form');
    let currentStepIndex = 0;

    // Configurazione Percorsi
    let selectedPath = null; // 'Privato' o 'Azienda'
    let activeStepsSequence = []; // Conterrà gli id degli step attivi
    const stepIntro = document.getElementById('step-intro');
    const stepFinal = document.getElementById('step-final');
    const stepProcessing = document.getElementById('step-processing');

    // Ascolta la Scelta Iniziale
    const pathRadios = document.querySelectorAll('input[name="Tipologia_Analisi"]');
    pathRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            selectedPath = e.target.value;
            buildPathSequence();
        });
    });

    function buildPathSequence() {
        // Nascondi il progresso finché non scelgono il path
        document.getElementById('progress-wrapper').classList.remove('hidden');

        activeStepsSequence = [stepIntro.id]; // Step 0

        // Aggiungi step basati sul path
        steps.forEach(step => {
            if (step.dataset.path === selectedPath) {
                activeStepsSequence.push(step.id);
            }
        });

        // Aggiungi step finali
        activeStepsSequence.push(stepFinal.id);
        activeStepsSequence.push(stepProcessing.id); // Nascoso fino all'invio

        currentStepIndex = 1; // Avanza automaticamente allo step 1 del percorso

        // Crea indicatori dinamici
        dynamicIndicators.innerHTML = '';
        const numVisibileSteps = activeStepsSequence.length - 1; // escludi processing
        for (let i = 1; i < numVisibileSteps; i++) {
            let ind = document.createElement('div');
            ind.className = 'step-indicator';
            ind.innerText = i;
            if (i === 1) ind.classList.add('active');
            dynamicIndicators.appendChild(ind);
        }

        updateSteps();
    }

    // Elementi condizionali UI - Privato
    const radioFamiglia = document.querySelectorAll('input[name="Famiglia_P"]');
    const figliDetailsP = document.getElementById('figli-details-p');
    const inputDettagliFigliP = document.getElementById('dettagli_figli_p');

    radioFamiglia.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'Con Figli/Soggetti a carico') {
                figliDetailsP.classList.remove('hidden');
                inputDettagliFigliP.required = true;
                setTimeout(() => figliDetailsP.style.opacity = '1', 10);
            } else {
                figliDetailsP.style.opacity = '0';
                inputDettagliFigliP.required = false;
                inputDettagliFigliP.value = '';
                setTimeout(() => figliDetailsP.classList.add('hidden'), 300);
            }
        });
    });

    const radioAbitazione = document.querySelectorAll('input[name="Abitazione_P"]');
    const mutuoDetailsP = document.getElementById('mutuo-details-p');
    const inputImportoMutuoP = document.getElementById('importo_mutuo_p');

    radioAbitazione.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'Proprieta con mutuo') {
                mutuoDetailsP.classList.remove('hidden');
                setTimeout(() => mutuoDetailsP.style.opacity = '1', 10);
            } else {
                mutuoDetailsP.style.opacity = '0';
                inputImportoMutuoP.value = '';
                setTimeout(() => mutuoDetailsP.classList.add('hidden'), 300);
            }
        });
    });

    function updateSteps() {
        if (!selectedPath && currentStepIndex === 0) {
            formNavButtons.style.display = 'none'; // Nessun bottone, aspetta click card
            steps.forEach(s => { s.classList.remove('active'); s.style.opacity = '0'; });
            stepIntro.classList.add('active');
            stepIntro.style.opacity = '1';
            return;
        }

        // Nascondi tutti
        steps.forEach(step => {
            step.classList.remove('active');
            step.style.opacity = '0';
        });

        // Mostra lo step corrente
        const activeStepId = activeStepsSequence[currentStepIndex];
        const activeStep = document.getElementById(activeStepId);
        activeStep.classList.add('active');
        setTimeout(() => activeStep.style.opacity = '1', 50);

        // UI Bottoni e NavBar
        formNavButtons.style.display = 'flex';
        const numVisibileSteps = activeStepsSequence.length - 1; // Escludo elaborazione

        if (currentStepIndex === 1) { // Dopo intro
            btnPrev.disabled = false; // Può tornare alla scelta
            btnPrev.onclick = () => { window.location.reload(); } // Hard reset della scelta per semplicità
            btnNext.classList.remove('hidden');
            btnAnalyze.classList.add('hidden');
        } else if (currentStepIndex === numVisibileSteps - 1) { // Step Finale Privacy
            btnPrev.disabled = false;
            btnPrev.onclick = normalPrev;
            btnNext.classList.add('hidden');
            btnAnalyze.classList.remove('hidden');
        } else if (currentStepIndex === numVisibileSteps) { // Elaborazione
            formNavButtons.style.display = 'none';
        } else {
            btnPrev.disabled = false;
            btnPrev.onclick = normalPrev;
            btnNext.classList.remove('hidden');
            btnAnalyze.classList.add('hidden');
        }

        // Barra Progresso
        const progressPercentage = (currentStepIndex / (numVisibileSteps - 1)) * 100;
        progressBar.style.width = `${progressPercentage}%`;

        // Indicatori
        const inds = document.querySelectorAll('.step-indicator');
        inds.forEach((ind, idx) => {
            if (idx + 1 < currentStepIndex) {
                ind.classList.add('completed'); ind.classList.remove('active');
            } else if (idx + 1 === currentStepIndex) {
                ind.classList.add('active'); ind.classList.remove('completed');
            } else {
                ind.classList.remove('active', 'completed');
            }
        });
    }

    function isStepValid(stepId) {
        const step = document.getElementById(stepId);
        const requiredInputs = step.querySelectorAll('input[required], select[required]');
        let isValid = true;

        requiredInputs.forEach(input => {
            if (input.type === 'radio' || input.type === 'checkbox') {
                const name = input.name;
                const checked = step.querySelector(`input[name="${name}"]:checked`);
                if (!checked) {
                    isValid = false;
                    const group = input.closest('.input-group') || input.closest('.privacy-policy');
                    if (group) {
                        group.style.border = '2px solid red';
                        setTimeout(() => group.style.border = 'none', 3000);
                    }
                }
            } else if (!input.value.trim()) {
                isValid = false;
                input.style.borderColor = 'red';
                input.addEventListener('input', function () {
                    this.style.borderColor = '';
                }, { once: true });
            }
        });

        return isValid;
    }

    btnNext.addEventListener('click', () => {
        const activeStepId = activeStepsSequence[currentStepIndex];
        if (isStepValid(activeStepId)) {
            currentStepIndex++;
            updateSteps();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            alert('Per favore, compila tutti i campi obbligatori di questa sezione prima di procedere.');
        }
    });

    function normalPrev() {
        if (currentStepIndex > 1) {
            currentStepIndex--;
            updateSteps();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    // Inizializzazione 0
    updateSteps();

    // Analisi e invio
    btnAnalyze.addEventListener('click', async () => {
        const activeStepId = activeStepsSequence[currentStepIndex];
        if (!isStepValid(activeStepId)) {
            alert('Per favore, accetta la normativa sulla privacy e fornisci il consenso.');
            return;
        }

        currentStepIndex++; // Passa ad elaborazione
        updateSteps();

        const riskProfile = calcolaPunteggioRischi();
        compilaPDFData(riskProfile);

        try {
            const pdfBlob = await generaPDF();
            await inviaEmailConWeb3Forms(pdfBlob, riskProfile.datiCliente, riskProfile);

            // Mostra successo, togliendo il form e mostrando success-screen
            document.querySelector('.form-steps-wrapper').style.display = 'none';
            document.getElementById('progress-wrapper').style.display = 'none';
            document.getElementById('success-screen').classList.remove('hidden');

            // Salva URL
            const pdfUrl = URL.createObjectURL(pdfBlob);
            const downloadContainer = document.getElementById('download-btn-container');
            downloadContainer.innerHTML = `
                <a href="${pdfUrl}" download="Risk_Report_${selectedPath}.pdf" class="btn btn-primary" style="background-color: #0f172a; padding: 15px 30px; font-size: 1.1rem; width: 100%; max-width: 400px; display: inline-block;">
                    <i class="fa-solid fa-download"></i> Scarica il tuo Report Sicuro
                </a>
            `;

        } catch (error) {
            console.error("Errore Invio:", error);
            document.getElementById(activeStepsSequence[currentStepIndex]).innerHTML = `
                <div style="text-align: center; padding: 40px 20px;">
                    <i class="fa-solid fa-triangle-exclamation fa-3x" style="color: #ef4444; margin-bottom: 20px;"></i>
                    <h2>Oops! C'è stato un problema.</h2>
                    <p>Si è verificato questo errore di connettività: ${error.message}</p>
                    <a href="https://wa.me/393319290177" class="btn btn-primary" style="margin-top: 20px;">Contattaci su WhatsApp</a>
                </div>
            `;
        }
    });

    // ======= LOGICA MATRICI DI RISCHIO ======= //

    function calcolaPunteggioRischi() {
        const formData = new FormData(questionnaireForm);
        const data = Object.fromEntries(formData.entries());
        data.TipologiaCompilazione = selectedPath;

        let punteggi = {};

        if (selectedPath === 'Privato') {
            punteggi = {
                vita: 0,
                infortuni: 0,
                malattia: 0,
                casaRC: 0,
                previdenza: 0 // New!
            };

            const eta = parseInt(data.Eta_P);
            const freqFigli = data.Famiglia_P === 'Con Figli/Soggetti a carico';
            const prof = data.Professione_P;
            const redd = data.Reddito_P; // 'Fino a 30.000€', 'Tra 30.000€ e 70.000€', 'Oltre 70.000€'
            const abitazione = data.Abitazione_P;
            // 'Affitto', 'Proprieta senza mutuo', 'Proprieta con mutuo'
            const fondoPens = data.Pensione_P === 'Si';

            // --- VITA (Esposizione del nucleo senza il portatore di reddito)
            if (freqFigli) punteggi.vita += 5;
            if (abitazione === 'Proprieta con mutuo') punteggi.vita += 4;
            if (data.Famiglia_P === 'Coppia senza figli') punteggi.vita += 3;
            if (prof === 'Libero Professionista / Autonomo' || prof === 'Imprenditore') punteggi.vita += 2;

            // --- INFORTUNI E INVALIDITA' (Perdita capacita lavorativa)
            if (prof === 'Libero Professionista / Autonomo' || prof === 'Imprenditore') punteggi.infortuni += 5;
            if (prof === 'Dipendente Privato') punteggi.infortuni += 3;
            // reddito
            if (redd === 'Fino a 30.000€') punteggi.infortuni += 4; // Meno capacità di reggere il colpo
            if (eta > 30 && eta < 60) punteggi.infortuni += 2;

            // --- MALATTIA E LTC (Spese sanitarie e Non Autosufficienza)
            if (eta > 45) punteggi.malattia += 4;
            if (prof === 'Libero Professionista / Autonomo' || prof === 'Imprenditore') punteggi.malattia += 3;
            if (redd === 'Tra 30.000€ e 70.000€' || redd === 'Oltre 70.000€') punteggi.malattia += 3; // Più abituati alla sanità privata
            if (freqFigli) punteggi.malattia += 2;

            // --- CASA E RC FAMIGLIA (Danni a terzi e catastrofali casa)
            if (abitazione.includes('Proprieta')) punteggi.casaRC += 5;
            if (freqFigli) punteggi.casaRC += 4; // Figli minori causano danni
            if (abitazione === 'Affitto') punteggi.casaRC += 3; // Rischio locativo e ricorstruzione a terzi

            // --- PREVIDENZA (Gap Pensionistico)
            if (!fondoPens) punteggi.previdenza += 8;
            if (fondoPens && (prof === 'Libero Professionista / Autonomo')) punteggi.previdenza += 3; // Le P.Iva versano meno contributi Inps

        } else {
            // AZIENDE
            punteggi = {
                rcTerziOperai: 0,
                incendioAsset: 0,
                cyberDati: 0,
                tutelaLegale: 0,
                keyMan: 0
            };

            const loc = data.Locali_A; // Smart, Ufficio, Capannone
            const merci = data.MerciPericolose_A === 'Si';
            const cyber = data.DatiCyber_A === 'Si';
            const keyM = data.Keyman_A === 'Si';
            const dip = parseInt(data.Dipendenti_A) || 1;
            const fatt = data.Fatturato_A;
            const sett = data.Settore_A;

            // --- RCT / RCO (Responsabilità Civile Aziendale verso terzi ed operai)
            if (dip > 1) punteggi.rcTerziOperai += 5;
            if (sett === 'Edilizia/Costruzioni' || sett === 'Produzione/Artigianato') punteggi.rcTerziOperai += 4;
            if (loc !== 'Smart Working / Nessuno') punteggi.rcTerziOperai += 2;

            // --- ASSET / PATRIMONIO AZIENDALE (Danni ai fabbricati, merci, machinery breakdown)
            if (loc === 'Capannone / Negozio') punteggi.incendioAsset += 5;
            if (merci) punteggi.incendioAsset += 4;
            if (loc === 'Ufficio / Studio') punteggi.incendioAsset += 2;

            // --- CYBER SECURITY E PRIVACY
            if (cyber) punteggi.cyberDati += 7;
            if (sett === 'IT/Servizi Digitali') punteggi.cyberDati += 6;
            if (sett === 'Professionisti/Consulenza') punteggi.cyberDati += 4;

            // --- TUTELA LEGALE E D&O (Esposizione processuale o penale amministratore)
            if (dip > 3) punteggi.tutelaLegale += 4;
            if (sett === 'Edilizia/Costruzioni') punteggi.tutelaLegale += 5;
            if (fatt === 'Da 500K a 2M' || fatt === 'Oltre 2M') punteggi.tutelaLegale += 4;

            // --- KEY MAN (Morte amminnistratore / socio cruciale)
            if (keyM) punteggi.keyMan += 8;
            if (dip <= 5 && fatt !== 'Fino a 100K') punteggi.keyMan += 3; // Aziende molto piccole ma redditive dipendono troppo dal fondatore
        }

        // Normalizza tutto max 10
        for (let key in punteggi) {
            punteggi[key] = Math.min(10, punteggi[key]);
        }

        return {
            datiCliente: data,
            risultati: punteggi,
            tipo: selectedPath
        };
    }

    function compilaPDFData(profile) {
        document.getElementById('pdf-date').innerText = 'Data elaborazione algoritmica: ' + new Date().toLocaleDateString('it-IT');
        document.getElementById('pdf-tipo-analisi').innerText = `ANALISI RISCHIO ${profile.tipo.toUpperCase()}`;

        const d = profile.datiCliente;
        const s = profile.risultati;
        let htmlDati = '';
        let rischioArray = [];
        let htmlRaccomandazioni = '<ul>';

        if (profile.tipo === 'Privato') {
            htmlDati = `
                <li><strong>Nominativo:</strong> ${d.Nome_P} ${d.Cognome_P} (${d.Eta_P} anni)</li>
                <li><strong>Professione:</strong> ${d.Professione_P}</li>
                <li><strong>Famiglia:</strong> ${d.Famiglia_P} ${d.Dettagli_Figli_P ? '(' + d.Dettagli_Figli_P + ')' : ''}</li>
                <li><strong>Abitazione:</strong> ${d.Abitazione_P} ${d.Importo_Mutuo_P ? '(Mutuo: ' + d.Importo_Mutuo_P + ')' : ''}</li>
                <li><strong>Reddito Stimato:</strong> ${d.Reddito_P}</li>
                <li><strong>Fondo Pensione:</strong> ${d.Pensione_P}</li>
            `;
            rischioArray = [
                { ramo: 'Tutela del Reddito Familiare (Morte/Perdita autosufficienza)', punteggio: s.vita },
                { ramo: 'Protezione da Infortuni e Invalidità Grave', punteggio: s.infortuni },
                { ramo: 'Salute e Gestione Spese Mediche', punteggio: s.malattia },
                { ramo: 'Tutela Patrimonio, Casa e Responsabilità Terzi', punteggio: s.casaRC },
                { ramo: 'Rischio Gap Previdenziale (Pensione)', punteggio: s.previdenza }
            ];

            if (s.vita >= 7) htmlRaccomandazioni += '<li><strong>Vita Caso Morte (TCM):</strong> Essenziale. Il nucleo o le garanzie bancarie dipendono pesantemente da te. Devi sterilizzare il debito/impegno.</li>';
            if (s.infortuni >= 7) htmlRaccomandazioni += '<li><strong>Invalidità da Infortunio:</strong> Prioritaria. Proteggere la capacità reddituale è il primo pilastro, specie per autonomi.</li>';
            if (s.casaRC >= 6) htmlRaccomandazioni += '<li><strong>Responsabilità Civile Capofamiglia:</strong> Assolutamente raccomandata per tutelare i tuoi risparmi da richieste di danni terzi (esiti dei figli/casa).</li>';
            if (s.previdenza >= 8) htmlRaccomandazioni += '<li><strong>Fondo Pensione Integrativo:</strong> Assente. Rischio di drastico calo del tenore di vita in età avanzata. Inizia subito beneficiando della deducibilità.</li>';

        } else {
            htmlDati = `
                <li><strong>Azienda:</strong> ${d.RagioneSociale_A} (P.IVA: ${d.PIVA_A})</li>
                <li><strong>Referente:</strong> ${d.Referente_A} (${d.Ruolo_A})</li>
                <li><strong>Settore:</strong> ${d.Settore_A} | <strong>Fatturato:</strong> ${d.Fatturato_A}</li>
                <li><strong>Addetti:</strong> ${d.Dipendenti_A}</li>
                <li><strong>Sede:</strong> ${d.Locali_A} | <strong>Veicoli:</strong> ${d.Veicoli_A}</li>
                <li><strong>Risk Factors:</strong> Merci: ${d.MerciPericolose_A} | Cyber: ${d.DatiCyber_A} | KeyMan: ${d.Keyman_A}</li>
            `;
            rischioArray = [
                { ramo: 'Responsabilità Civile (RCT / RCO)', punteggio: s.rcTerziOperai },
                { ramo: 'Protezione Asset (Locali, Merci, Business Interruption)', punteggio: s.incendioAsset },
                { ramo: 'Cyber Privacy Data Breach', punteggio: s.cyberDati },
                { ramo: 'Tutela Legale e D&O (Amministratori)', punteggio: s.tutelaLegale },
                { ramo: 'Rischio Key Man (Deficit uomo chiave)', punteggio: s.keyMan }
            ];

            if (s.rcTerziOperai >= 7) htmlRaccomandazioni += '<li><strong>RC Aziendale/Operai:</strong> Alta priorità. Necessario massimale adeguato al numero di esposti e fatturato per danni a terzi o dipendenti.</li>';
            if (s.incendioAsset >= 7) htmlRaccomandazioni += '<li><strong>All Risk / Incendio Locali:</strong> Critico. Urgente mettere in sicurezza le mura aziendali e i danni da interruzione d\'esercizio.</li>';
            if (s.cyberDati >= 7) htmlRaccomandazioni += '<li><strong>Cyber Risk:</strong> I dati che tratti espongono la tua SRL a sequestri IT e sanzioni GDPR. Serve pronto intervento.</li>';
            if (s.tutelaLegale >= 6) htmlRaccomandazioni += '<li><strong>Tutela Legale:</strong> Esposizione contrattuale alta. Da valutare D&O per proteggere i beni personali degli amministratori.</li>';
            if (s.keyMan >= 8) htmlRaccomandazioni += '<li><strong>Key Man:</strong> Senza le figure apicali l\'azienda si incaglia. Si raccomanda polizza per iniezione di capitali immediata.</li>';
        }

        htmlRaccomandazioni += '</ul>';
        if (htmlRaccomandazioni === '<ul></ul>') htmlRaccomandazioni = '<p>Non si rilevano criticità insostenibili allo stato attuale. Si rimanda ad un auditing approfondito.</p>';

        document.getElementById('pdf-client-data').innerHTML = htmlDati;
        document.getElementById('pdf-recommendations').innerHTML = htmlRaccomandazioni;

        // Ordinamento per visualizzare grafico
        rischioArray.sort((a, b) => b.punteggio - a.punteggio);
        let riskHtml = '<ul style="list-style-type: none; padding: 0;">';
        rischioArray.forEach(item => {
            let color = '#10b981'; // Verde Base
            let label = 'CONTROLLATO';
            if (item.punteggio >= 8) { color = '#b91c1c'; label = 'CRITICITÀ ++'; }
            else if (item.punteggio >= 5) { color = '#f59e0b'; label = 'ATTENZIONE'; }

            riskHtml += `
                <li style="margin-bottom: 20px;">
                    <div style="font-weight: bold; margin-bottom: 5px; font-size: 13px;">${item.ramo}</div>
                    <div style="display: flex; align-items: center;">
                        <span style="display:inline-block; width: 150px; height: 12px; background: #e2e8f0; border-radius: 6px; margin-right: 15px; overflow: hidden;">
                            <span style="display:inline-block; height: 100%; width: ${item.punteggio * 10}%; background: ${color};"></span>
                        </span>
                        <span style="color: ${color}; font-weight: bold; font-size: 12px;">SCORE: ${item.punteggio}/10 - ${label}</span>
                    </div>
                </li>
            `;
        });
        riskHtml += '</ul>';
        document.getElementById('pdf-risk-analysis').innerHTML = riskHtml;
    }

    async function generaPDF() {
        const element = document.getElementById('pdf-content');
        element.style.display = 'block';

        try {
            const canvas = await html2canvas(element, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');

            const pdf = new window.jspdf.jsPDF('portrait', 'mm', 'a4');
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            return pdf.output('blob');

        } finally {
            element.style.display = 'none';
        }
    }

    async function inviaEmailConWeb3Forms(pdfBlob, datiCliente, riskProfile) {
        const formData = new FormData();

        formData.append('access_key', 'e238d261-2c69-44d5-8ecd-c191d0777c05');
        const subjectName = riskProfile.tipo === 'Privato' ? `${datiCliente.Nome_P} ${datiCliente.Cognome_P}` : datiCliente.RagioneSociale_A;
        formData.append('subject', `RISULTATO ANALISI RISCHIO - ${riskProfile.tipo.toUpperCase()} - ${subjectName}`);
        formData.append('from_name', 'Motore Risk Management');
        formData.append('to', 'fveccia@aeaassicurazioni.it');
        formData.append('replyto', riskProfile.tipo === 'Privato' ? datiCliente.Email_P : datiCliente.Email_A);

        // Costruzione dinamica del corpo Email
        let t = `RIEPILOGO PROFILO (${riskProfile.tipo.toUpperCase()})\n\n`;

        if (riskProfile.tipo === 'Privato') {
            t += `Nominativo: ${datiCliente.Nome_P} ${datiCliente.Cognome_P} (${datiCliente.Eta_P} anni)\n`;
            t += `Cellulare: ${datiCliente.Telefono_P} | Email: ${datiCliente.Email_P}\n`;
            t += `Lavoro: ${datiCliente.Professione_P} | Reddito: ${datiCliente.Reddito_P}\n`;
            t += `Famiglia: ${datiCliente.Famiglia_P}  ${datiCliente.Dettagli_Figli_P ? '(' + datiCliente.Dettagli_Figli_P + ')' : ''}\n`;
            t += `Immobile: ${datiCliente.Abitazione_P} ${datiCliente.Importo_Mutuo_P ? '- Mutuo Rimanenze: ' + datiCliente.Importo_Mutuo_P : ''}\n\n`;

            t += `--- MATRICE RISCHI ---\n`;
            const s = riskProfile.risultati;
            t += `VITA/Premorienza: ${s.vita}/10\n`;
            t += `INFORTUNI: ${s.infortuni}/10\n`;
            t += `SALUTE/Malattia: ${s.malattia}/10\n`;
            t += `CASA / R.C. Terzi: ${s.casaRC}/10\n`;
            t += `Previdenza Inps: ${s.previdenza}/10\n`;
        } else {
            t += `Azienda: ${datiCliente.RagioneSociale_A} | P.IVA: ${datiCliente.PIVA_A}\n`;
            t += `Settore: ${datiCliente.Settore_A} | Dipendenti: ${datiCliente.Dipendenti_A}\n`;
            t += `Referente: ${datiCliente.Referente_A} (${datiCliente.Ruolo_A})\n`;
            t += `Cellulare: ${datiCliente.Telefono_A} | Email: ${datiCliente.Email_A}\n`;
            t += `Fatturato: ${datiCliente.Fatturato_A} | Locali: ${datiCliente.Locali_A}\n`;
            t += `Risk Modifiers: Merci Pericolose (${datiCliente.MerciPericolose_A}) | Cyber Risk (${datiCliente.DatiCyber_A}) | KeyMan (${datiCliente.Keyman_A})\n\n`;

            t += `--- MATRICE RISCHI AZIENDALI ---\n`;
            const s = riskProfile.risultati;
            t += `R.C. Terzi e Operai: ${s.rcTerziOperai}/10\n`;
            t += `Incendio / Danni Asset: ${s.incendioAsset}/10\n`;
            t += `Cyber / Data Breach: ${s.cyberDati}/10\n`;
            t += `Key Man: ${s.keyMan}/10\n`;
            t += `Tutela Legale: ${s.tutelaLegale}/10\n`;
        }

        t += `\nIl Cliente ha generato il suo Report Analitico in PDF e vi ha acconsentito il trattamento limitato.`;
        formData.append('Corpo_Analisi_Dettagliata', t);

        const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.message);
        return result;
    }
});
