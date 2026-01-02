// Main Application
class SachinsGoogleForm {
    constructor() {
        this.forms = JSON.parse(localStorage.getItem('sachinForms')) || [];
        this.responses = JSON.parse(localStorage.getItem('sachinResponses')) || [];
        this.settings = JSON.parse(localStorage.getItem('sachinSettings')) || this.getDefaultSettings();
        this.currentForm = null;
        this.selectedElement = null;
        this.currentSection = 'forms';
        this.particles = null;
        
        this.init();
    }
    
    getDefaultSettings() {
        return {
            theme: 'light',
            enable3D: true,
            enableAnimations: true,
            enableParticles: true,
            emailNotifications: true,
            localStorage: true,
            primaryColor: '#6a11cb',
            secondaryColor: '#2575fc'
        };
    }
    
    init() {
        this.setupEventListeners();
        this.loadForms();
        this.updateStats();
        this.initParticles();
        this.applyTheme();
        this.showSection('forms');
    }
    
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.target.closest('.nav-btn').dataset.section;
                this.showSection(section);
            });
        });
        
        // Create Form Buttons
        document.getElementById('createFormBtn')?.addEventListener('click', () => {
            this.createNewForm();
            this.showSection('create');
        });
        
        document.getElementById('createFirstForm')?.addEventListener('click', () => {
            this.createNewForm();
            this.showSection('create');
        });
        
        // Form Builder
        this.setupFormBuilder();
        
        // Settings
        this.setupSettings();
        
        // Responses
        this.setupResponses();
        
        // Templates
        this.setupTemplates();
        
        // Modals
        this.setupModals();
        
        // Theme Controls
        this.setupThemeControls();
    }
    
    showSection(section) {
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`)?.classList.add('active');
        
        // Update content sections
        document.querySelectorAll('.content-section').forEach(sectionEl => {
            sectionEl.classList.remove('active');
        });
        document.getElementById(`${section}-section`)?.classList.add('active');
        
        this.currentSection = section;
        
        // Update specific sections
        if (section === 'forms') {
            this.loadForms();
        } else if (section === 'responses') {
            this.loadResponses();
        } else if (section === 'create') {
            this.initFormBuilder();
        }
    }
    
    createNewForm() {
        const newForm = {
            id: Date.now().toString(),
            title: 'Untitled Form',
            description: 'Form description',
            theme: 'default',
            elements: [],
            created: new Date().toISOString(),
            modified: new Date().toISOString(),
            settings: {
                requireLogin: false,
                captcha: false,
                responseLimit: 0,
                timeLimit: 0
            }
        };
        
        this.currentForm = newForm;
        this.updateFormPreview();
        
        // Add default element
        this.addFormElement({
            type: 'text',
            title: 'What is your name?',
            required: true,
            placeholder: 'Enter your name'
        });
    }
    
    setupFormBuilder() {
        const dropZone = document.getElementById('dropZone');
        const formElements = document.getElementById('formElements');
        const elementItems = document.querySelectorAll('.element-item');
        
        // Drag and Drop
        elementItems.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', item.dataset.type);
                e.dataTransfer.effectAllowed = 'copy';
            });
        });
        
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
            dropZone.classList.add('drag-over');
        });
        
        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('drag-over');
        });
        
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            
            const elementType = e.dataTransfer.getData('text/plain');
            this.addFormElement({ type: elementType });
        });
        
        // Click to add
        elementItems.forEach(item => {
            item.addEventListener('click', () => {
                this.addFormElement({ type: item.dataset.type });
            });
        });
        
        // Save Form Button
        document.getElementById('saveFormBtn')?.addEventListener('click', () => {
            this.saveForm();
        });
        
        // Preview Form Button
        document.getElementById('previewFormBtn')?.addEventListener('click', () => {
            this.previewForm();
        });
        
        // Form Title and Description
        const formTitle = document.querySelector('.form-title-input');
        const formDesc = document.querySelector('.form-description-input');
        
        if (formTitle && this.currentForm) {
            formTitle.value = this.currentForm.title;
            formTitle.addEventListener('input', (e) => {
                if (this.currentForm) {
                    this.currentForm.title = e.target.value;
                }
            });
        }
        
        if (formDesc && this.currentForm) {
            formDesc.value = this.currentForm.description;
            formDesc.addEventListener('input', (e) => {
                if (this.currentForm) {
                    this.currentForm.description = e.target.value;
                }
            });
        }
    }
    
    addFormElement(config) {
        if (!this.currentForm) return;
        
        const defaultConfigs = {
            text: {
                type: 'text',
                id: `element_${Date.now()}`,
                title: 'Short Answer',
                placeholder: 'Enter your answer',
                required: false
            },
            paragraph: {
                type: 'paragraph',
                id: `element_${Date.now()}`,
                title: 'Long Answer',
                placeholder: 'Enter your answer here...',
                required: false
            },
            'multiple-choice': {
                type: 'multiple-choice',
                id: `element_${Date.now()}`,
                title: 'Multiple Choice',
                options: ['Option 1', 'Option 2', 'Option 3'],
                required: false,
                allowOther: false
            },
            checkbox: {
                type: 'checkbox',
                id: `element_${Date.now()}`,
                title: 'Checkboxes',
                options: ['Option 1', 'Option 2', 'Option 3'],
                required: false,
                allowOther: false
            },
            dropdown: {
                type: 'dropdown',
                id: `element_${Date.now()}`,
                title: 'Dropdown',
                options: ['Option 1', 'Option 2', 'Option 3'],
                required: false
            },
            file: {
                type: 'file',
                id: `element_${Date.now()}`,
                title: 'File Upload',
                required: false,
                allowedTypes: ['image/*', '.pdf', '.doc', '.docx'],
                maxSize: 5 // MB
            },
            'linear-scale': {
                type: 'linear-scale',
                id: `element_${Date.now()}`,
                title: 'Linear Scale',
                min: 1,
                max: 5,
                minLabel: 'Poor',
                maxLabel: 'Excellent',
                required: false
            },
            date: {
                type: 'date',
                id: `element_${Date.now()}`,
                title: 'Date',
                required: false
            },
            time: {
                type: 'time',
                id: `element_${Date.now()}`,
                title: 'Time',
                required: false
            },
            section: {
                type: 'section',
                id: `element_${Date.now()}`,
                title: 'Section Title',
                description: 'Section description'
            }
        };
        
        const elementConfig = { ...defaultConfigs[config.type], ...config };
        this.currentForm.elements.push(elementConfig);
        this.updateFormPreview();
        this.selectElement(elementConfig.id);
    }
    
    updateFormPreview() {
        const formElements = document.getElementById('formElements');
        if (!formElements || !this.currentForm) return;
        
        formElements.innerHTML = '';
        
        if (this.currentForm.elements.length === 0) {
            formElements.innerHTML = `
                <div class="form-element-placeholder">
                    <i class="fas fa-arrow-down"></i>
                    <p>Drag form elements here or click to add</p>
                </div>
            `;
            return;
        }
        
        this.currentForm.elements.forEach(element => {
            const elementEl = this.createElementHTML(element);
            formElements.appendChild(elementEl);
        });
    }
    
    createElementHTML(element) {
        const div = document.createElement('div');
        div.className = `form-element ${element.id === this.selectedElement?.id ? 'selected' : ''}`;
        div.dataset.id = element.id;
        
        let content = '';
        
        switch (element.type) {
            case 'text':
                content = `
                    <div class="element-header">
                        <input type="text" class="element-title" value="${element.title}" placeholder="Question">
                        ${element.required ? '<span class="element-required">*</span>' : ''}
                        <div class="element-actions">
                            <button class="element-action-btn" data-action="delete"><i class="fas fa-trash"></i></button>
                            <button class="element-action-btn" data-action="duplicate"><i class="fas fa-copy"></i></button>
                            <button class="element-action-btn" data-action="settings"><i class="fas fa-cog"></i></button>
                        </div>
                    </div>
                    <input type="text" class="input-3d" placeholder="${element.placeholder || 'Enter your answer'}" disabled>
                `;
                break;
                
            case 'paragraph':
                content = `
                    <div class="element-header">
                        <input type="text" class="element-title" value="${element.title}" placeholder="Question">
                        ${element.required ? '<span class="element-required">*</span>' : ''}
                        <div class="element-actions">
                            <button class="element-action-btn" data-action="delete"><i class="fas fa-trash"></i></button>
                            <button class="element-action-btn" data-action="duplicate"><i class="fas fa-copy"></i></button>
                            <button class="element-action-btn" data-action="settings"><i class="fas fa-cog"></i></button>
                        </div>
                    </div>
                    <textarea class="textarea-3d" placeholder="${element.placeholder || 'Enter your answer here...'}" disabled></textarea>
                `;
                break;
                
            case 'multiple-choice':
                content = `
                    <div class="element-header">
                        <input type="text" class="element-title" value="${element.title}" placeholder="Question">
                        ${element.required ? '<span class="element-required">*</span>' : ''}
                        <div class="element-actions">
                            <button class="element-action-btn" data-action="delete"><i class="fas fa-trash"></i></button>
                            <button class="element-action-btn" data-action="duplicate"><i class="fas fa-copy"></i></button>
                            <button class="element-action-btn" data-action="settings"><i class="fas fa-cog"></i></button>
                        </div>
                    </div>
                    <div class="option-group">
                        ${element.options?.map((option, index) => `
                            <div class="option-item">
                                <input type="radio" name="${element.id}" disabled>
                                <input type="text" class="option-text" value="${option}" placeholder="Option ${index + 1}" disabled>
                                <button class="option-remove"><i class="fas fa-times"></i></button>
                            </div>
                        `).join('')}
                        ${element.allowOther ? `
                            <div class="option-item">
                                <input type="radio" name="${element.id}" disabled>
                                <input type="text" class="option-text" value="Other..." disabled>
                                <button class="option-remove"><i class="fas fa-times"></i></button>
                            </div>
                        ` : ''}
                        <button class="add-option-btn"><i class="fas fa-plus"></i> Add option</button>
                    </div>
                `;
                break;
                
            case 'checkbox':
                content = `
                    <div class="element-header">
                        <input type="text" class="element-title" value="${element.title}" placeholder="Question">
                        ${element.required ? '<span class="element-required">*</span>' : ''}
                        <div class="element-actions">
                            <button class="element-action-btn" data-action="delete"><i class="fas fa-trash"></i></button>
                            <button class="element-action-btn" data-action="duplicate"><i class="fas fa-copy"></i></button>
                            <button class="element-action-btn" data-action="settings"><i class="fas fa-cog"></i></button>
                        </div>
                    </div>
                    <div class="option-group">
                        ${element.options?.map((option, index) => `
                            <div class="option-item">
                                <input type="checkbox" disabled>
                                <input type="text" class="option-text" value="${option}" placeholder="Option ${index + 1}" disabled>
                                <button class="option-remove"><i class="fas fa-times"></i></button>
                            </div>
                        `).join('')}
                        ${element.allowOther ? `
                            <div class="option-item">
                                <input type="checkbox" disabled>
                                <input type="text" class="option-text" value="Other..." disabled>
                                <button class="option-remove"><i class="fas fa-times"></i></button>
                            </div>
                        ` : ''}
                        <button class="add-option-btn"><i class="fas fa-plus"></i> Add option</button>
                    </div>
                `;
                break;
                
            case 'dropdown':
                content = `
                    <div class="element-header">
                        <input type="text" class="element-title" value="${element.title}" placeholder="Question">
                        ${element.required ? '<span class="element-required">*</span>' : ''}
                        <div class="element-actions">
                            <button class="element-action-btn" data-action="delete"><i class="fas fa-trash"></i></button>
                            <button class="element-action-btn" data-action="duplicate"><i class="fas fa-copy"></i></button>
                            <button class="element-action-btn" data-action="settings"><i class="fas fa-cog"></i></button>
                        </div>
                    </div>
                    <select class="select-3d" disabled>
                        <option value="">Select an option</option>
                        ${element.options?.map(option => `
                            <option value="${option}">${option}</option>
                        `).join('')}
                    </select>
                `;
                break;
                
            case 'linear-scale':
                content = `
                    <div class="element-header">
                        <input type="text" class="element-title" value="${element.title}" placeholder="Question">
                        ${element.required ? '<span class="element-required">*</span>' : ''}
                        <div class="element-actions">
                            <button class="element-action-btn" data-action="delete"><i class="fas fa-trash"></i></button>
                            <button class="element-action-btn" data-action="duplicate"><i class="fas fa-copy"></i></button>
                            <button class="element-action-btn" data-action="settings"><i class="fas fa-cog"></i></button>
                        </div>
                    </div>
                    <div class="linear-scale">
                        ${Array.from({length: element.max - element.min + 1}, (_, i) => i + element.min).map(num => `
                            <div class="scale-point">
                                <input type="radio" name="${element.id}" value="${num}" disabled>
                                <label>${num}</label>
                            </div>
                        `).join('')}
                    </div>
                    <div class="scale-labels">
                        <span>${element.minLabel || 'Min'}</span>
                        <span>${element.maxLabel || 'Max'}</span>
                    </div>
                `;
                break;
                
            case 'section':
                content = `
                    <div class="element-header">
                        <input type="text" class="element-title" value="${element.title}" placeholder="Section Title" style="font-size: 1.5em;">
                        <div class="element-actions">
                            <button class="element-action-btn" data-action="delete"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                    <textarea class="form-description-input">${element.description || 'Section description'}</textarea>
                `;
                break;
                
            default:
                content = `<p>Element type not supported</p>`;
        }
        
        div.innerHTML = content;
        
        // Add event listeners
        div.addEventListener('click', (e) => {
            if (!e.target.closest('.element-action-btn')) {
                this.selectElement(element.id);
            }
        });
        
        // Element actions
        div.querySelectorAll('.element-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = e.target.closest('.element-action-btn').dataset.action;
                this.handleElementAction(element.id, action);
            });
        });
        
        // Title editing
        const titleInput = div.querySelector('.element-title');
        if (titleInput) {
            titleInput.addEventListener('input', (e) => {
                const element = this.currentForm.elements.find(el => el.id === element.id);
                if (element) element.title = e.target.value;
            });
        }
        
        return div;
    }
    
    selectElement(elementId) {
        this.selectedElement = this.currentForm?.elements.find(el => el.id === elementId);
        
        // Update UI
        document.querySelectorAll('.form-element').forEach(el => {
            el.classList.remove('selected');
        });
        document.querySelector(`[data-id="${elementId}"]`)?.classList.add('selected');
        
        // Update properties panel
        this.updatePropertiesPanel();
    }
    
    updatePropertiesPanel() {
        const panel = document.getElementById('propertiesContent');
        if (!panel) return;
        
        if (!this.selectedElement) {
            panel.innerHTML = `
                <div class="no-selection">
                    <i class="fas fa-mouse-pointer"></i>
                    <p>Select an element to edit its properties</p>
                </div>
            `;
            return;
        }
        
        let propertiesHTML = `
            <div class="property-group">
                <h4>General</h4>
                <div class="property-item">
                    <label>Title</label>
                    <input type="text" class="input-3d" value="${this.selectedElement.title}" 
                           onchange="app.updateElementProperty('title', this.value)">
                </div>
                ${this.selectedElement.type !== 'section' ? `
                    <div class="property-item">
                        <label class="switch-3d">
                            <input type="checkbox" ${this.selectedElement.required ? 'checked' : ''} 
                                   onchange="app.updateElementProperty('required', this.checked)">
                            <span class="slider-3d"></span>
                            <span>Required</span>
                        </label>
                    </div>
                ` : ''}
            </div>
        `;
        
        // Type-specific properties
        switch (this.selectedElement.type) {
            case 'text':
            case 'paragraph':
                propertiesHTML += `
                    <div class="property-group">
                        <h4>Placeholder</h4>
                        <div class="property-item">
                            <input type="text" class="input-3d" value="${this.selectedElement.placeholder || ''}" 
                                   onchange="app.updateElementProperty('placeholder', this.value)">
                        </div>
                    </div>
                `;
                break;
                
            case 'multiple-choice':
            case 'checkbox':
            case 'dropdown':
                propertiesHTML += `
                    <div class="property-group">
                        <h4>Options</h4>
                        ${this.selectedElement.options?.map((option, index) => `
                            <div class="property-item" style="display: flex; gap: 10px; margin-bottom: 10px;">
                                <input type="text" class="input-3d" value="${option}" 
                                       onchange="app.updateOption(${index}, this.value)">
                                <button class="btn-3d btn-sm" onclick="app.removeOption(${index})">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        `).join('')}
                        <button class="btn-3d btn-sm" onclick="app.addOption()">
                            <i class="fas fa-plus"></i> Add Option
                        </button>
                        ${this.selectedElement.type === 'multiple-choice' || this.selectedElement.type === 'checkbox' ? `
                            <div class="property-item" style="margin-top: 15px;">
                                <label class="switch-3d">
                                    <input type="checkbox" ${this.selectedElement.allowOther ? 'checked' : ''} 
                                           onchange="app.updateElementProperty('allowOther', this.checked)">
                                    <span class="slider-3d"></span>
                                    <span>Add "Other" option</span>
                                </label>
                            </div>
                        ` : ''}
                    </div>
                `;
                break;
                
            case 'linear-scale':
                propertiesHTML += `
                    <div class="property-group">
                        <h4>Scale Settings</h4>
                        <div class="property-item">
                            <label>Minimum</label>
                            <input type="number" class="input-3d" value="${this.selectedElement.min}" 
                                   onchange="app.updateElementProperty('min', parseInt(this.value))">
                        </div>
                        <div class="property-item">
                            <label>Maximum</label>
                            <input type="number" class="input-3d" value="${this.selectedElement.max}" 
                                   onchange="app.updateElementProperty('max', parseInt(this.value))">
                        </div>
                        <div class="property-item">
                            <label>Min Label</label>
                            <input type="text" class="input-3d" value="${this.selectedElement.minLabel || ''}" 
                                   onchange="app.updateElementProperty('minLabel', this.value)">
                        </div>
                        <div class="property-item">
                            <label>Max Label</label>
                            <input type="text" class="input-3d" value="${this.selectedElement.maxLabel || ''}" 
                                   onchange="app.updateElementProperty('maxLabel', this.value)">
                        </div>
                    </div>
                `;
                break;
                
            case 'section':
                propertiesHTML += `
                    <div class="property-group">
                        <h4>Description</h4>
                        <div class="property-item">
                            <textarea class="textarea-3d" 
                                      onchange="app.updateElementProperty('description', this.value)">${this.selectedElement.description || ''}</textarea>
                        </div>
                    </div>
                `;
                break;
        }
        
        panel.innerHTML = propertiesHTML;
    }
    
    updateElementProperty(property, value) {
        if (!this.selectedElement) return;
        
        this.selectedElement[property] = value;
        this.updateFormPreview();
        this.updatePropertiesPanel();
    }
    
    addOption() {
        if (!this.selectedElement || !this.selectedElement.options) return;
        
        this.selectedElement.options.push(`Option ${this.selectedElement.options.length + 1}`);
        this.updateFormPreview();
        this.updatePropertiesPanel();
    }
    
    updateOption(index, value) {
        if (!this.selectedElement || !this.selectedElement.options) return;
        
        this.selectedElement.options[index] = value;
        this.updateFormPreview();
    }
    
    removeOption(index) {
        if (!this.selectedElement || !this.selectedElement.options) return;
        
        this.selectedElement.options.splice(index, 1);
        this.updateFormPreview();
        this.updatePropertiesPanel();
    }
    
    handleElementAction(elementId, action) {
        const elementIndex = this.currentForm.elements.findIndex(el => el.id === elementId);
        if (elementIndex === -1) return;
        
        switch (action) {
            case 'delete':
                this.currentForm.elements.splice(elementIndex, 1);
                this.selectedElement = null;
                break;
                
            case 'duplicate':
                const element = this.currentForm.elements[elementIndex];
                const duplicate = JSON.parse(JSON.stringify(element));
                duplicate.id = `element_${Date.now()}`;
                this.currentForm.elements.splice(elementIndex + 1, 0, duplicate);
                break;
                
            case 'settings':
                this.selectElement(elementId);
                break;
        }
        
        this.updateFormPreview();
    }
    
    saveForm() {
        if (!this.currentForm) {
            alert('No form to save!');
            return;
        }
        
        this.currentForm.modified = new Date().toISOString();
        
        // Check if form already exists
        const existingIndex = this.forms.findIndex(f => f.id === this.currentForm.id);
        if (existingIndex > -1) {
            this.forms[existingIndex] = this.currentForm;
        } else {
            this.forms.push(this.currentForm);
        }
        
        localStorage.setItem('sachinForms', JSON.stringify(this.forms));
        this.loadForms();
        
        // Show success message
        this.showNotification('Form saved successfully!', 'success');
    }
    
    previewForm() {
        if (!this.currentForm) {
            alert('No form to preview!');
            return;
        }
        
        // Generate preview URL
        const formUrl = `${window.location.origin}${window.location.pathname}?preview=${this.currentForm.id}`;
        window.open(formUrl, '_blank');
    }
    
    loadForms() {
        const formsGrid = document.getElementById('formsGrid');
        if (!formsGrid) return;
        
        if (this.forms.length === 0) {
            formsGrid.innerHTML = `
                <div class="no-forms">
                    <div class="empty-state-3d">
                        <i class="fas fa-file-alt"></i>
                        <h3>No forms yet</h3>
                        <p>Create your first 3D form to get started</p>
                        <button class="btn-3d btn-primary" id="createFirstForm">
                            <i class="fas fa-magic"></i> Create First Form
                        </button>
                    </div>
                </div>
            `;
            
            document.getElementById('createFirstForm')?.addEventListener('click', () => {
                this.createNewForm();
                this.showSection('create');
            });
            
            return;
        }
        
        formsGrid.innerHTML = this.forms.map(form => `
            <div class="form-card-3d" data-form-id="${form.id}">
                <div class="form-card-preview">
                    <i class="fas fa-file-alt"></i>
                </div>
                <div class="form-card-info">
                    <h3>${form.title}</h3>
                    <div class="form-card-meta">
                        <span><i class="fas fa-calendar"></i> ${new Date(form.modified).toLocaleDateString()}</span>
                        <span><i class="fas fa-list-ol"></i> ${form.elements.length} questions</span>
                    </div>
                    <div class="form-card-actions">
                        <button class="action-btn" data-action="edit">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="action-btn" data-action="share">
                            <i class="fas fa-share"></i> Share
                        </button>
                        <button class="action-btn" data-action="responses">
                            <i class="fas fa-chart-bar"></i> View
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Add event listeners to form cards
        formsGrid.querySelectorAll('.form-card-3d').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.action-btn')) {
                    const formId = card.dataset.formId;
                    this.editForm(formId);
                }
            });
            
            card.querySelectorAll('.action-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const formId = card.dataset.formId;
                    const action = btn.dataset.action;
                    
                    switch (action) {
                        case 'edit':
                            this.editForm(formId);
                            break;
                        case 'share':
                            this.shareForm(formId);
                            break;
                        case 'responses':
                            this.viewFormResponses(formId);
                            break;
                    }
                });
            });
        });
    }
    
    editForm(formId) {
        const form = this.forms.find(f => f.id === formId);
        if (form) {
            this.currentForm = JSON.parse(JSON.stringify(form));
            this.showSection('create');
            this.updateFormPreview();
        }
    }
    
    shareForm(formId) {
        const form = this.forms.find(f => f.id === formId);
        if (!form) return;
        
        const formLink = `${window.location.origin}${window.location.pathname}?form=${formId}`;
        const embedCode = `<iframe src="${formLink}" width="100%" height="500" frameborder="0"></iframe>`;
        
        document.getElementById('formLink').value = formLink;
        document.getElementById('embedCode').value = embedCode;
        
        this.showModal('formModal');
    }
    
    viewFormResponses(formId) {
        // Implement form responses view
        this.showSection('responses');
        // Filter responses for this form
        // Implement this based on your response data structure
    }
    
    setupResponses() {
        // Export CSV
        document.getElementById('exportCSV')?.addEventListener('click', () => {
            this.exportResponses('csv');
        });
        
        // Export JSON
        document.getElementById('exportJSON')?.addEventListener('click', () => {
            this.exportResponses('json');
        });
        
        // Clear responses
        document.getElementById('clearResponses')?.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all responses? This action cannot be undone.')) {
                this.responses = [];
                localStorage.setItem('sachinResponses', JSON.stringify([]));
                this.loadResponses();
                this.showNotification('All responses cleared', 'success');
            }
        });
    }
    
    loadResponses() {
        const responsesBody = document.getElementById('responsesBody');
        if (!responsesBody) return;
        
        if (this.responses.length === 0) {
            responsesBody.innerHTML = `
                <tr class="no-responses">
                    <td colspan="6">
                        <div class="empty-state-3d">
                            <i class="fas fa-inbox"></i>
                            <p>No responses yet</p>
                        </div>
                    </td>
                </tr>
            `;
            
            document.getElementById('responseCount').textContent = '0';
            document.getElementById('todayResponses').textContent = '0';
            document.getElementById('avgTime').textContent = '0s';
            document.getElementById('responseRate').textContent = '0%';
            
            return;
        }
        
        // Calculate stats
        const today = new Date().toDateString();
        const todayResponses = this.responses.filter(r => 
            new Date(r.timestamp).toDateString() === today
        ).length;
        
        const totalTime = this.responses.reduce((sum, r) => sum + (r.duration || 0), 0);
        const avgTime = totalTime / this.responses.length;
        
        // Update stats
        document.getElementById('responseCount').textContent = this.responses.length;
        document.getElementById('todayResponses').textContent = todayResponses;
        document.getElementById('avgTime').textContent = `${Math.round(avgTime)}s`;
        document.getElementById('responseRate').textContent = '100%';
        
        // Update table
        responsesBody.innerHTML = this.responses.map((response, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${new Date(response.timestamp).toLocaleString()}</td>
                <td>${response.respondent || 'Anonymous'}</td>
                <td>${response.email || 'N/A'}</td>
                <td>${response.duration || 0}s</td>
                <td>
                    <button class="btn-3d btn-sm" onclick="app.viewResponse(${index})">
                        <i class="fas fa-eye"></i> View
                    </button>
                </td>
            </tr>
        `).join('');
        
        // Update chart
        this.updateResponseChart();
    }
    
    updateResponseChart() {
        const ctx = document.getElementById('responseChart');
        if (!ctx) return;
        
        // Group responses by day
        const responsesByDay = {};
        this.responses.forEach(response => {
            const date = new Date(response.timestamp).toDateString();
            responsesByDay[date] = (responsesByDay[date] || 0) + 1;
        });
        
        const labels = Object.keys(responsesByDay).slice(-7); // Last 7 days
        const data = labels.map(label => responsesByDay[label] || 0);
        
        // Destroy existing chart if it exists
        if (this.responseChartInstance) {
            this.responseChartInstance.destroy();
        }
        
        this.responseChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Responses',
                    data: data,
                    borderColor: 'rgb(106, 17, 203)',
                    backgroundColor: 'rgba(106, 17, 203, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }
    
    viewResponse(index) {
        const response = this.responses[index];
        if (!response) return;
        
        const modalContent = document.getElementById('responseDetails');
        modalContent.innerHTML = `
            <div class="response-details">
                <div class="response-header">
                    <h4>Response #${index + 1}</h4>
                    <p>Submitted: ${new Date(response.timestamp).toLocaleString()}</p>
                </div>
                <div class="response-answers">
                    ${response.answers ? Object.entries(response.answers).map(([question, answer]) => `
                        <div class="answer-item">
                            <strong>${question}:</strong>
                            <span>${answer}</span>
                        </div>
                    `).join('') : '<p>No answer data</p>'}
                </div>
            </div>
        `;
        
        this.showModal('responseModal');
    }
    
    exportResponses(format) {
        if (this.responses.length === 0) {
            alert('No responses to export!');
            return;
        }
        
        let content, mimeType, filename;
        
        if (format === 'csv') {
            // Create CSV
            const headers = ['Timestamp', 'Respondent', 'Email', 'Duration'];
            const rows = this.responses.map(r => [
                new Date(r.timestamp).toISOString(),
                r.respondent || '',
                r.email || '',
                r.duration || 0
            ]);
            
            content = [headers, ...rows].map(row => 
                row.map(cell => `"${cell}"`).join(',')
            ).join('\n');
            
            mimeType = 'text/csv';
            filename = `responses_${Date.now()}.csv`;
            
        } else if (format === 'json') {
            content = JSON.stringify(this.responses, null, 2);
            mimeType = 'application/json';
            filename = `responses_${Date.now()}.json`;
        }
        
        // Create download link
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification(`${format.toUpperCase()} exported successfully`, 'success');
    }
    
    setupTemplates() {
        document.querySelectorAll('.use-template').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const template = e.target.closest('.template-card-3d').dataset.template;
                this.useTemplate(template);
            });
        });
    }
    
    useTemplate(templateName) {
        const templates = {
            contact: {
                title: 'Contact Form',
                description: 'Please fill out this contact form and we will get back to you soon.',
                elements: [
                    {
                        type: 'text',
                        title: 'Full Name',
                        required: true,
                        placeholder: 'Enter your full name'
                    },
                    {
                        type: 'text',
                        title: 'Email Address',
                        required: true,
                        placeholder: 'your.email@example.com'
                    },
                    {
                        type: 'text',
                        title: 'Phone Number',
                        required: false,
                        placeholder: '+1 (555) 123-4567'
                    },
                    {
                        type: 'multiple-choice',
                        title: 'How can we help you?',
                        required: true,
                        options: ['General Inquiry', 'Support', 'Sales', 'Feedback', 'Other']
                    },
                    {
                        type: 'paragraph',
                        title: 'Message',
                        required: true,
                        placeholder: 'Please provide details about your inquiry...'
                    }
                ]
            },
            survey: {
                title: 'Customer Satisfaction Survey',
                description: 'Help us improve our services by providing your valuable feedback.',
                elements: [
                    {
                        type: 'linear-scale',
                        title: 'How satisfied are you with our service?',
                        min: 1,
                        max: 5,
                        minLabel: 'Very Dissatisfied',
                        maxLabel: 'Very Satisfied',
                        required: true
                    },
                    {
                        type: 'multiple-choice',
                        title: 'How did you hear about us?',
                        required: false,
                        options: ['Social Media', 'Search Engine', 'Friend/Colleague', 'Advertisement', 'Other']
                    },
                    {
                        type: 'checkbox',
                        title: 'What features do you value the most?',
                        required: false,
                        options: ['User Interface', 'Performance', 'Customer Support', 'Price', 'Features']
                    },
                    {
                        type: 'paragraph',
                        title: 'Any additional comments or suggestions?',
                        required: false,
                        placeholder: 'Your feedback is valuable to us...'
                    }
                ]
            }
        };
        
        const template = templates[templateName];
        if (!template) return;
        
        this.createNewForm();
        this.currentForm.title = template.title;
        this.currentForm.description = template.description;
        this.currentForm.elements = JSON.parse(JSON.stringify(template.elements));
        
        // Update element IDs
        this.currentForm.elements.forEach(element => {
            element.id = `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        });
        
        this.updateFormPreview();
        this.showNotification(`"${template.title}" template loaded`, 'success');
    }
    
    setupSettings() {
        // Load settings
        const settings = this.settings;
        
        // Theme selector
        const themeSelector = document.getElementById('themeSelector');
        if (themeSelector) {
            themeSelector.value = settings.theme;
            themeSelector.addEventListener('change', (e) => {
                this.updateSetting('theme', e.target.value);
                this.applyTheme();
            });
        }
        
        // Reset theme
        document.getElementById('resetTheme')?.addEventListener('click', () => {
            this.updateSetting('theme', 'light');
            if (themeSelector) themeSelector.value = 'light';
            this.applyTheme();
        });
        
        // Switches
        const switches = [
            'enable3D', 'enableAnimations', 'enableParticles',
            'emailNotifications', 'responseAlerts', 'requireLogin',
            'captchaEnabled', 'localStorage', 'exportAuto'
        ];
        
        switches.forEach(setting => {
            const element = document.getElementById(setting);
            if (element) {
                element.checked = settings[setting] || false;
                element.addEventListener('change', (e) => {
                    this.updateSetting(setting, e.target.checked);
                });
            }
        });
        
        // Inputs
        const inputs = ['responseLimit', 'timeLimit', 'emailReceipt'];
        inputs.forEach(setting => {
            const element = document.getElementById(setting);
            if (element && settings[setting] !== undefined) {
                element.value = settings[setting];
                element.addEventListener('input', (e) => {
                    this.updateSetting(setting, e.target.value);
                });
            }
        });
    }
    
    updateSetting(key, value) {
        this.settings[key] = value;
        localStorage.setItem('sachinSettings', JSON.stringify(this.settings));
        
        if (key === 'enable3D') {
            this.toggle3DEffects(value);
        } else if (key === 'enableParticles') {
            this.toggleParticles(value);
        }
    }
    
    setupThemeControls() {
        // Color picker
        const colorPicker = document.getElementById('primaryColor');
        if (colorPicker) {
            colorPicker.value = this.settings.primaryColor || '#6a11cb';
            colorPicker.addEventListener('input', (e) => {
                this.updateSetting('primaryColor', e.target.value);
                this.applyTheme();
            });
        }
        
        // Theme presets
        document.querySelectorAll('.theme-preset').forEach(preset => {
            preset.addEventListener('click', () => {
                const theme = preset.dataset.theme;
                const colors = {
                    purple: { primary: '#6a11cb', secondary: '#2575fc' },
                    blue: { primary: '#2575fc', secondary: '#00b4db' },
                    red: { primary: '#ff416c', secondary: '#ff4b2b' },
                    green: { primary: '#00b09b', secondary: '#96c93d' },
                    dark: { primary: '#2d3436', secondary: '#636e72' }
                };
                
                if (colors[theme]) {
                    this.updateSetting('primaryColor', colors[theme].primary);
                    this.updateSetting('secondaryColor', colors[theme].secondary);
                    if (colorPicker) colorPicker.value = colors[theme].primary;
                    this.applyTheme();
                }
            });
        });
    }
    
    applyTheme() {
        const root = document.documentElement;
        const settings = this.settings;
        
        // Apply colors
        root.style.setProperty('--primary-color', settings.primaryColor || '#6a11cb');
        root.style.setProperty('--secondary-color', settings.secondaryColor || '#2575fc');
        
        // Apply theme
        if (settings.theme === 'dark') {
            root.style.setProperty('--dark-color', '#f8f9fa');
            root.style.setProperty('--light-color', '#2d3436');
            root.style.setProperty('--gray-color', '#adb5bd');
            document.body.style.backgroundColor = '#2d3436';
            document.body.style.color = '#f8f9fa';
        } else {
            root.style.setProperty('--dark-color', '#2d3436');
            root.style.setProperty('--light-color', '#f8f9fa');
            root.style.setProperty('--gray-color', '#adb5bd');
            document.body.style.backgroundColor = '';
            document.body.style.color = '';
        }
        
        // Auto theme based on system preference
        if (settings.theme === 'auto') {
            const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (isDark) {
                root.style.setProperty('--dark-color', '#f8f9fa');
                root.style.setProperty('--light-color', '#2d3436');
                root.style.setProperty('--gray-color', '#adb5bd');
                document.body.style.backgroundColor = '#2d3436';
                document.body.style.color = '#f8f9fa';
            }
        }
    }
    
    toggle3DEffects(enable) {
        const elements = document.querySelectorAll('.container-3d, .header-3d, .main-content, .form-card-3d');
        elements.forEach(el => {
            el.style.transformStyle = enable ? 'preserve-3d' : 'flat';
            el.style.perspective = enable ? '1000px' : 'none';
        });
    }
    
    toggleParticles(enable) {
        if (enable && !this.particles) {
            this.initParticles();
        } else if (!enable && this.particles) {
            this.particles = null;
            const canvas = document.getElementById('particlesCanvas');
            if (canvas) {
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
    }
    
    initParticles() {
        const canvas = document.getElementById('particlesCanvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        const particles = [];
        const particleCount = 100;
        
        // Create particles
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 3 + 1,
                speedX: Math.random() * 1 - 0.5,
                speedY: Math.random() * 1 - 0.5,
                color: `rgba(106, 17, 203, ${Math.random() * 0.5 + 0.1})`
            });
        }
        
        // Animation loop
        const animate = () => {
            if (!this.settings.enableParticles) return;
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach(particle => {
                particle.x += particle.speedX;
                particle.y += particle.speedY;
                
                // Bounce off edges
                if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
                if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;
                
                // Draw particle
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fillStyle = particle.color;
                ctx.fill();
                
                // Draw connections
                particles.forEach(otherParticle => {
                    const dx = particle.x - otherParticle.x;
                    const dy = particle.y - otherParticle.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < 100) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(106, 17, 203, ${0.1 * (1 - distance/100)})`;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(particle.x, particle.y);
                        ctx.lineTo(otherParticle.x, otherParticle.y);
                        ctx.stroke();
                    }
                });
            });
            
            requestAnimationFrame(animate);
        };
        
        animate();
        this.particles = particles;
        
        // Handle window resize
        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });
    }
    
    setupModals() {
        // Close modals
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                this.hideModal(btn.closest('.modal-3d').id);
            });
        });
        
        // Close on background click
        document.querySelectorAll('.modal-3d').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal(modal.id);
                }
            });
        });
        
        // Copy link
        document.getElementById('copyLinkBtn')?.addEventListener('click', () => {
            const linkInput = document.getElementById('formLink');
            linkInput.select();
            document.execCommand('copy');
            this.showNotification('Link copied to clipboard!', 'success');
        });
        
        // Copy embed code
        document.getElementById('copyEmbedBtn')?.addEventListener('click', () => {
            const embedTextarea = document.getElementById('embedCode');
            embedTextarea.select();
            document.execCommand('copy');
            this.showNotification('Embed code copied to clipboard!', 'success');
        });
    }
    
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
        }
    }
    
    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    }
    
    updateStats() {
        // Update dashboard stats
        const totalResponses = this.responses.length;
        const activeForms = this.forms.length;
        const totalViews = this.responses.reduce((sum, r) => sum + (r.views || 1), 0);
        const completionRate = this.responses.length > 0 ? '100%' : '0%';
        
        document.getElementById('totalResponses')?.textContent = totalResponses;
        document.getElementById('activeForms')?.textContent = activeForms;
        document.getElementById('totalViews')?.textContent = totalViews;
        document.getElementById('completionRate')?.textContent = completionRate;
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification-3d notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        `;
        
        // Add to body
        document.body.appendChild(notification);
        
        // Add styles if not already added
        if (!document.getElementById('notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification-3d {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: white;
                    padding: 15px 20px;
                    border-radius: 10px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    z-index: 10000;
                    transform: translateX(150%);
                    animation: slideInRight 0.3s ease forwards;
                    transform-style: preserve-3d;
                }
                .notification-success {
                    border-left: 5px solid #51cf66;
                }
                .notification-info {
                    border-left: 5px solid #339af0;
                }
                .notification-warning {
                    border-left: 5px solid #ff922b;
                }
                .notification-error {
                    border-left: 5px solid #ff4757;
                }
                .notification-3d i {
                    font-size: 1.2em;
                }
                .notification-success i { color: #51cf66; }
                .notification-info i { color: #339af0; }
                .notification-warning i { color: #ff922b; }
                .notification-error i { color: #ff4757; }
                .notification-close {
                    background: none;
                    border: none;
                    font-size: 1.5em;
                    color: #adb5bd;
                    cursor: pointer;
                    margin-left: 10px;
                }
                @keyframes slideInRight {
                    to { transform: translateX(0) translateZ(20px); }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0) translateZ(20px); }
                    to { transform: translateX(150%) translateZ(20px); }
                }
            `;
            document.head.appendChild(styles);
        }
        
        // Add close button event
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.style.animation = 'slideOutRight 0.3s ease forwards';
            setTimeout(() => notification.remove(), 300);
        });
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease forwards';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }
    
    initFormBuilder() {
        // Initialize form builder if needed
        if (this.currentForm) {
            this.updateFormPreview();
        }
    }
}

// Initialize the application
const app = new SachinsGoogleForm();

// Make app globally available for inline event handlers
window.app = app;

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Save form: Ctrl/Cmd + S
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        app.saveForm();
    }
    
    // New form: Ctrl/Cmd + N
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        app.createNewForm();
        app.showSection('create');
    }
    
    // Escape: Close modals
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal-3d').forEach(modal => {
            if (modal.style.display === 'flex') {
                modal.style.display = 'none';
            }
        });
    }
});

// Handle URL parameters
window.addEventListener('load', () => {
    const urlParams = new URLSearchParams(window.location.search);
    
    if (urlParams.has('preview')) {
        const formId = urlParams.get('preview');
        const form = app.forms.find(f => f.id === formId);
        if (form) {
            // Show preview mode
            app.showFormPreview(form);
        }
    }
    
    if (urlParams.has('form')) {
        const formId = urlParams.get('form');
        const form = app.forms.find(f => f.id === formId);
        if (form) {
            // Show form submission page
            app.showFormSubmission(form);
        }
    }
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SachinsGoogleForm;
}