document.addEventListener('DOMContentLoaded', async () => {
    // URL del API se carga desde config.js
    const formContent = document.getElementById('form-content');
    const loading = document.getElementById('loading');
    const successMessage = document.getElementById('success-message');
    const errorMessage = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');
    const formTitle = document.getElementById('form-title');

    // Obtener el ID del formulario de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const formId = urlParams.get('id');

    if (!formId) {
        showError('No se especificó un formulario. Por favor, usa un enlace válido.');
        return;
    }

    // API wrapper
    const api = {
        getFormulario: (id) => fetchApi(`/formularios/public/${id}`),
        submitForm: (formId, respuestas) => fetchApi(`/formularios/${formId}/envios/public`, { method: 'POST', body: { respuestas } }),
        getDepartamentos: () => fetchApi('/geodata/departamentos'),
        getMunicipios: (departamento) => fetchApi(`/geodata/municipios/${departamento}`)
    };

    async function fetchApi(endpoint, options = {}) {
        try {
            const config = { 
                method: options.method || 'GET', 
                headers: { 'Content-Type': 'application/json' } 
            };
            if (options.body) config.body = JSON.stringify(options.body);
            const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

            if (response.status === 204) {
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error desconocido.');
            }

            return data;
        } catch (error) {
            console.error(`API Error: ${endpoint}`, error);
            throw error;
        }
    }

    function showError(message) {
        loading.style.display = 'none';
        formContent.style.display = 'none';
        errorText.textContent = message;
        errorMessage.style.display = 'block';
    }

    function showSuccess() {
        loading.style.display = 'none';
        formContent.style.display = 'none';
        successMessage.style.display = 'block';
    }

    // Cargar el formulario
    try {
        const form = await api.getFormulario(formId);
        
        if (!form || !form.is_public) {
            showError('Este formulario no está disponible públicamente.');
            return;
        }

        formTitle.textContent = form.name;
        loading.style.display = 'none';
        formContent.style.display = 'block';
        
        renderForm(form);
    } catch (error) {
        showError('No se pudo cargar el formulario. ' + error.message);
    }

    function renderForm(form) {
        const formEl = document.createElement('form');
        formEl.id = 'public-form';

        const questions = [];
        (form.modulos || []).forEach(m => {
            const fieldset = document.createElement('fieldset');
            fieldset.innerHTML = `<legend>${m.name}</legend>`;
            (m.preguntas || []).forEach(q => { 
                questions.push(q); 
                fieldset.appendChild(createQuestionElement(q, false, 0)); 
            });
            formEl.appendChild(fieldset);
        });

        const submitBtn = document.createElement('button');
        submitBtn.type = 'submit';
        submitBtn.className = 'btn btn-primary';
        submitBtn.textContent = 'Enviar Formulario';
        formEl.appendChild(submitBtn);

        formEl.addEventListener('submit', e => handleFormSubmit(e, formId, questions));
        formContent.appendChild(formEl);

        setupConditionalListeners(formEl);
    }

    function setupConditionalListeners(formEl) {
        const triggers = new Set();
        formEl.querySelectorAll('[data-conditional-trigger]').forEach(el => {
            triggers.add(el.dataset.conditionalTrigger);
        });

        triggers.forEach(triggerName => {
            const triggerWrapper = formEl.querySelector(`[data-question-name="${triggerName}"]`);
            if (triggerWrapper) {
                const input = triggerWrapper.querySelector('input, select');
                if (input) {
                    input.addEventListener('change', () => evaluateConditions(formEl));
                }
            }
        });
        evaluateConditions(formEl);
    }

    function evaluateConditions(formEl) {
        const currentValues = {};
        formEl.querySelectorAll('[data-question-name]').forEach(qWrapper => {
            const qName = qWrapper.dataset.questionName;
            const input = qWrapper.querySelector('input, select');
            if (input) {
                if (input.type === 'checkbox') {
                    currentValues[qName] = input.checked ? 'true' : 'false';
                } else {
                    currentValues[qName] = input.value;
                }
            }
        });

        formEl.querySelectorAll('[data-conditional-trigger]').forEach(el => {
            const triggerName = el.dataset.conditionalTrigger;
            const expectedValueString = el.dataset.conditionalValue;
            const actualValue = currentValues[triggerName];

            const possibleValues = expectedValueString.split(',').map(v => v.trim());

            if (possibleValues.includes(actualValue)) {
                el.style.display = '';
            } else {
                el.style.display = 'none';
            }
        });
    }

    function createQuestionElement(q, isSubQuestion = false, itemIndex = 0) {
        const questionName = q.text || q.name;
        const questionId = isSubQuestion ? `sub-q-${itemIndex}-${questionName.replace(/\s+/g, '-')}` : `q-${q.id}`;
        const rules = q.rules ? (typeof q.rules === 'string' ? JSON.parse(q.rules) : q.rules) : {};

        const wrapper = document.createElement('div');
        wrapper.className = 'form-group';
        wrapper.setAttribute('data-question-name', questionName);

        if (rules.conditional) {
            wrapper.style.display = 'none';
            wrapper.setAttribute('data-conditional-trigger', rules.conditional.triggerQuestionText);
            wrapper.setAttribute('data-conditional-value', rules.conditional.triggerValue);
        }

        if (q.type === 'repartidor') {
            wrapper.innerHTML = `<h4>${questionName}</h4>`;
            const container = document.createElement('div');
            container.id = `repartidor-container-${q.id}`;
            container.className = 'repartidor-main-container';
            const addBtn = document.createElement('button');
            addBtn.type = 'button';
            addBtn.className = 'btn';
            addBtn.textContent = `Añadir a ${questionName}`;
            let repartidorItemCounter = 0;
            addBtn.addEventListener('click', () => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'repartidor-item';
                itemDiv.setAttribute('data-item-index', repartidorItemCounter);
                (rules.subQuestions || []).forEach(subQ => {
                    if (subQ.firstItemOnly && repartidorItemCounter > 0) {
                        return;
                    }
                    itemDiv.appendChild(createQuestionElement(subQ, true, repartidorItemCounter));
                });
                const removeBtn = document.createElement('button');
                removeBtn.type = 'button';
                removeBtn.className = 'btn btn-danger btn-sm';
                removeBtn.textContent = 'Eliminar Item';
                removeBtn.addEventListener('click', () => itemDiv.remove());
                itemDiv.appendChild(removeBtn);
                container.appendChild(itemDiv);
                repartidorItemCounter++;
            });
            wrapper.appendChild(container);
            wrapper.appendChild(addBtn);
        } else {
            const label = document.createElement('label');
            label.setAttribute('for', questionId);
            label.textContent = questionName;
            
            const field = createField(q.type, questionId, rules);
            
            if (q.type === 'booleano' || q.type === 'terminos') {
                wrapper.appendChild(field);
                wrapper.appendChild(label);
            } else {
                wrapper.appendChild(label);
                wrapper.appendChild(field);
            }
        }
        return wrapper;
    }

    function createField(type, id, rules) {
        let inputEl;
        switch (type) {
            case 'numero': 
                inputEl = document.createElement('input'); 
                inputEl.type = 'number'; 
                break;
            case 'fecha': 
                inputEl = document.createElement('input'); 
                inputEl.type = 'date'; 
                break;
            case 'booleano': 
            case 'terminos': 
                inputEl = document.createElement('input'); 
                inputEl.type = 'checkbox'; 
                break;
            case 'listado_definido':
                inputEl = document.createElement('div');
                inputEl.className = 'defined-list-group';
                inputEl.id = id;
                (rules.options || []).forEach(opt => {
                    const itemDiv = document.createElement('div');
                    itemDiv.className = 'defined-list-item';
                    
                    const itemLabel = document.createElement('label');
                    itemLabel.textContent = opt;
                    itemLabel.style.marginRight = '10px';

                    const numInput = document.createElement('input');
                    numInput.type = 'number';
                    numInput.min = '0';
                    numInput.value = '0';
                    numInput.dataset.optionName = opt;
                    numInput.className = 'defined-list-input';

                    itemDiv.appendChild(itemLabel);
                    itemDiv.appendChild(numInput);
                    inputEl.appendChild(itemDiv);
                });
                break;
            case 'seleccion_unica':
                if (rules.quantity) {
                    inputEl = document.createElement('div');
                    inputEl.className = 'quantity-options-group';
                    (rules.options || []).forEach((opt, index) => {
                        const optionId = `${id}-${index}`;
                        const optionDiv = document.createElement('div');
                        optionDiv.className = 'quantity-option-item';
                        
                        const radioInput = document.createElement('input');
                        radioInput.type = 'radio';
                        radioInput.id = optionId;
                        radioInput.name = id;
                        radioInput.value = opt;

                        const radioLabel = document.createElement('label');
                        radioLabel.setAttribute('for', optionId);
                        radioLabel.textContent = opt;

                        const quantitySelect = document.createElement('select');
                        quantitySelect.id = `${optionId}-quantity`;
                        quantitySelect.className = 'quantity-selector';
                        quantitySelect.style.display = 'none';
                        for (let i = rules.quantity.min; i <= rules.quantity.max; i++) {
                            const option = document.createElement('option');
                            option.value = i;
                            option.textContent = i;
                            quantitySelect.appendChild(option);
                        }
                        
                        radioInput.addEventListener('change', () => {
                            optionDiv.parentElement.querySelectorAll('.quantity-selector').forEach(sel => {
                                sel.style.display = 'none';
                            });
                            if (radioInput.checked) {
                                quantitySelect.style.display = 'block';
                            }
                        });

                        optionDiv.appendChild(radioInput);
                        optionDiv.appendChild(radioLabel);
                        optionDiv.appendChild(quantitySelect);
                        inputEl.appendChild(optionDiv);
                    });
                } else {
                    inputEl = document.createElement('select');
                    const defaultOption = document.createElement('option');
                    defaultOption.value = '';
                    defaultOption.textContent = 'Selecciona una opción';
                    defaultOption.disabled = true;
                    defaultOption.selected = true;
                    inputEl.appendChild(defaultOption);
                    (rules.options || []).forEach(opt => { 
                        const o = document.createElement('option'); 
                        o.value = opt; 
                        o.textContent = opt; 
                        inputEl.appendChild(o); 
                    });
                }
                break;
            case 'seleccion_multiple':
                inputEl = document.createElement('div');
                inputEl.className = 'checkbox-group';
                (rules.options || []).forEach((opt, index) => {
                    const checkDiv = document.createElement('div');
                    checkDiv.className = 'quantity-option-item';
                    const checkId = `${id}-${index}`;
                    
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.id = checkId;
                    checkbox.name = id;
                    checkbox.value = opt;

                    const label = document.createElement('label');
                    label.setAttribute('for', checkId);
                    label.className = 'checkbox-label';
                    label.textContent = opt;
                    
                    checkDiv.appendChild(checkbox);
                    checkDiv.appendChild(label);

                    if (rules.quantity) {
                        const quantitySelect = document.createElement('select');
                        quantitySelect.id = `${checkId}-quantity`;
                        quantitySelect.className = 'quantity-selector';
                        quantitySelect.style.display = 'none';
                        for (let i = rules.quantity.min; i <= rules.quantity.max; i++) {
                            const option = document.createElement('option');
                            option.value = i;
                            option.textContent = i;
                            quantitySelect.appendChild(option);
                        }
                        checkbox.addEventListener('change', () => {
                            quantitySelect.style.display = checkbox.checked ? 'block' : 'none';
                        });
                        checkDiv.appendChild(quantitySelect);
                    }
                    inputEl.appendChild(checkDiv);
                });
                break;
            case 'seleccion_dependiente':
                inputEl = document.createElement('div');
                inputEl.className = 'dependent-select-group';
                const parentSelect = document.createElement('select');
                parentSelect.id = `${id}-parent`;
                parentSelect.name = `${id}-parent`;
                parentSelect.innerHTML = '<option value="" disabled selected>Selecciona un Departamento</option>';
                api.getDepartamentos().then(departamentos => {
                    parentSelect.innerHTML = '<option value="" disabled selected>Selecciona un Departamento</option>';
                    (departamentos || []).forEach(dept => {
                        const option = document.createElement('option');
                        option.value = dept;
                        option.textContent = dept;
                        parentSelect.appendChild(option);
                    });
                }).catch(err => { 
                    console.error('Error cargando departamentos:', err); 
                    parentSelect.innerHTML = '<option value="" disabled selected>Error al cargar</option>'; 
                });

                const childSelect = document.createElement('select');
                childSelect.id = `${id}-child`;
                childSelect.name = `${id}-child`;
                childSelect.innerHTML = '<option value="" disabled selected>Selecciona un Municipio</option>';

                parentSelect.addEventListener('change', async () => {
                    childSelect.innerHTML = '<option value="" disabled selected>Cargando Municipios...</option>';
                    const selectedDept = parentSelect.value;
                    if (selectedDept) {
                        try {
                            const municipios = await api.getMunicipios(selectedDept);
                            childSelect.innerHTML = '<option value="" disabled selected>Selecciona un Municipio</option>';
                            (municipios || []).forEach(mun => {
                                const option = document.createElement('option');
                                option.value = mun;
                                option.textContent = mun;
                                childSelect.appendChild(option);
                            });
                        } catch (err) {
                            console.error('Error cargando municipios:', err);
                            childSelect.innerHTML = '<option value="" disabled selected>Error al cargar</option>';
                        }
                    } else {
                        childSelect.innerHTML = '<option value="" disabled selected>Selecciona un Municipio</option>';
                    }
                });
                inputEl.appendChild(parentSelect);
                inputEl.appendChild(childSelect);
                break;
            default: 
                inputEl = document.createElement('input'); 
                inputEl.type = 'text'; 
                break;
        }
        
        if (type !== 'seleccion_multiple' && type !== 'seleccion_dependiente' && !(type === 'seleccion_unica' && rules.quantity) && type !== 'listado_definido') { 
            inputEl.id = id; 
            inputEl.name = id; 
        }
        if (type === 'texto' && rules.pattern) { 
            inputEl.pattern = rules.pattern; 
            inputEl.title = `Debe seguir el formato: ${rules.pattern}`;
        }
        return inputEl;
    }

    async function handleFormSubmit(event, formId, questions) {
        event.preventDefault();
        const formEl = event.target;
        const respuestas = {};

        for (const q of questions) {
            const wrapper = formEl.querySelector(`[data-question-name="${q.text}"]`);
            if (wrapper && wrapper.style.display === 'none') {
                continue;
            }

            const questionName = q.text;
            const id = `q-${q.id}`;
            let questionValue;

            const rules = q.rules ? (typeof q.rules === 'string' ? JSON.parse(q.rules) : q.rules) : {};

            if (q.type === 'repartidor') {
                const repartidorItems = [];
                const container = formEl.querySelector(`#repartidor-container-${q.id}`);
                if (container) {
                    container.querySelectorAll('.repartidor-item').forEach(item => {
                        const itemData = {};
                        const itemIndex = item.dataset.itemIndex;
                        (rules.subQuestions || []).forEach(subQ => {
                            if (subQ.firstItemOnly && itemIndex !== '0') {
                                return;
                            }
                            const subQId = `sub-q-${itemIndex}-${subQ.name.replace(/\s+/g, '-')}`;
                            const subRules = subQ.rules ? (typeof subQ.rules === 'string' ? JSON.parse(subQ.rules) : subQ.rules) : {};
                            let subValue;

                            if (subQ.type === 'listado_definido') {
                                const listData = {};
                                const subContainer = item.querySelector(`#${subQId}`);
                                if (subContainer) {
                                    subContainer.querySelectorAll('.defined-list-input').forEach(inp => {
                                        const optName = inp.dataset.optionName;
                                        const val = parseInt(inp.value, 10);
                                        if (val > 0) {
                                            listData[optName] = val;
                                        }
                                    });
                                }
                                if (Object.keys(listData).length > 0) {
                                    subValue = listData;
                                }
                            } else if (subQ.type === 'seleccion_multiple') {
                                const checkboxes = item.querySelectorAll(`input[name="${subQId}"]:checked`);
                                if (checkboxes.length > 0) {
                                    if (subRules.quantity) {
                                        const selectedWithQuantity = {};
                                        checkboxes.forEach(cb => {
                                            const quantitySelect = item.querySelector(`#${cb.id}-quantity`);
                                            if (quantitySelect) {
                                                selectedWithQuantity[cb.value] = parseInt(quantitySelect.value, 10);
                                            } else {
                                                selectedWithQuantity[cb.value] = 1;
                                            }
                                        });
                                        subValue = selectedWithQuantity;
                                    } else {
                                        subValue = Array.from(checkboxes).map(cb => cb.value);
                                    }
                                }
                            } else if (subQ.type === 'seleccion_unica') {
                                if (subRules.quantity) {
                                    const selectedRadio = item.querySelector(`input[name="${subQId}"]:checked`);
                                    if (selectedRadio) {
                                        const quantitySelect = item.querySelector(`#${selectedRadio.id}-quantity`);
                                        if (quantitySelect && quantitySelect.style.display !== 'none') {
                                            subValue = {
                                                option: selectedRadio.value,
                                                quantity: parseInt(quantitySelect.value, 10)
                                            };
                                        } else {
                                            subValue = selectedRadio.value;
                                        }
                                    }
                                } else {
                                    const selectEl = item.querySelector(`#${subQId}`);
                                    if (selectEl) {
                                        subValue = selectEl.value;
                                    }
                                }
                            } else if (subQ.type === 'seleccion_dependiente') {
                                const parentEl = item.querySelector(`#${subQId}-parent`);
                                const childEl = item.querySelector(`#${subQId}-child`);
                                if (parentEl && childEl && parentEl.value && childEl.value) {
                                    subValue = { parent: parentEl.value, child: childEl.value };
                                }
                            } else if (subQ.type === 'booleano' || subQ.type === 'terminos') {
                                const inputEl = item.querySelector(`#${subQId}`);
                                if (inputEl) {
                                    subValue = inputEl.checked;
                                }
                            } else {
                                const inputEl = item.querySelector(`#${subQId}`);
                                if (inputEl) {
                                    subValue = inputEl.value;
                                }
                            }

                            if (subValue !== undefined && subValue !== null && subValue !== '' && (typeof subValue !== 'object' || Object.keys(subValue).length > 0)) {
                                itemData[subQ.name] = subValue;
                            }
                        });

                        if (Object.keys(itemData).length > 0) {
                            repartidorItems.push(itemData);
                        }
                    });
                }
                questionValue = repartidorItems;
            } else if (q.type === 'listado_definido') {
                const listData = {};
                const container = formEl.querySelector(`#q-${q.id}`);
                if (container) {
                    container.querySelectorAll('.defined-list-input').forEach(inp => {
                        const optName = inp.dataset.optionName;
                        const val = parseInt(inp.value, 10);
                        if (val > 0) {
                            listData[optName] = val;
                        }
                    });
                }
                if (Object.keys(listData).length > 0) {
                    questionValue = listData;
                }
            } else if (q.type === 'seleccion_multiple') {
                const checkboxes = formEl.querySelectorAll(`input[name="${id}"]:checked`);
                if (checkboxes.length > 0) {
                    if (rules.quantity) {
                        const selectedWithQuantity = {};
                        checkboxes.forEach(cb => {
                            const quantitySelect = formEl.querySelector(`#${cb.id}-quantity`);
                            if (quantitySelect) {
                                selectedWithQuantity[cb.value] = parseInt(quantitySelect.value, 10);
                            } else {
                                selectedWithQuantity[cb.value] = 1;
                            }
                        });
                        questionValue = selectedWithQuantity;
                    } else {
                        questionValue = Array.from(checkboxes).map(cb => cb.value);
                    }
                }
            } else if (q.type === 'seleccion_unica') {
                if (rules.quantity) {
                    const selectedRadio = formEl.querySelector(`input[name="${id}"]:checked`);
                    if (selectedRadio) {
                        const quantitySelect = formEl.querySelector(`#${selectedRadio.id}-quantity`);
                        if (quantitySelect && quantitySelect.style.display !== 'none') {
                            questionValue = {
                                option: selectedRadio.value,
                                quantity: parseInt(quantitySelect.value, 10)
                            };
                        } else {
                            questionValue = selectedRadio.value;
                        }
                    }
                } else {
                    const selectEl = formEl.querySelector(`#${id}`);
                    if (selectEl) {
                        questionValue = selectEl.value;
                    }
                }
            } else if (q.type === 'seleccion_dependiente') {
                const parentEl = formEl.querySelector(`#${id}-parent`);
                const childEl = formEl.querySelector(`#${id}-child`);
                if (parentEl && childEl && parentEl.value && childEl.value) {
                    questionValue = { parent: parentEl.value, child: childEl.value };
                }
            } else if (q.type === 'booleano' || q.type === 'terminos') {
                const inputEl = formEl.querySelector(`#${id}`);
                if (inputEl) {
                    questionValue = inputEl.checked;
                }
            } else {
                const inputEl = formEl.querySelector(`#${id}`);
                if (inputEl) {
                    questionValue = inputEl.value;
                }
            }
            
            if (questionValue !== undefined && questionValue !== null && (questionValue.length === undefined || questionValue.length !== 0)) {
                respuestas[questionName] = questionValue;
            }
        }

        try {
            await api.submitForm(formId, respuestas);
            showSuccess();
        } catch (error) {
            console.error('Error al enviar formulario:', error);
            showError('No se pudo enviar el formulario. ' + error.message);
        }
    }
});
