class Filter {
  constructor(onChange, onSubmit, onExpand) {
    this.onChange = onChange;
    this.onSubmit = onSubmit;
    this.onExpand = onExpand;
  }

  createDropDown(type, label, list) {
    let selectOptions = '';

    list.forEach((item, i) => {
      selectOptions += `
        <option value="${i}">
          ${item.text}
        </option>`;
    })

    return `
      <div class="dropdown">
        <div class="dropdown-label">${label}</div>
        <select class="dropdown-list" type="${type}">
          ${selectOptions}
        </select>
      </div>
    `
  }
  
  createRadioButtons(type, label, list) {
    let radioButtons = '';
    
    list.forEach((item, i) => {
      radioButtons += `
        <div class="radio-button" type="${type}" list_id="${i}">
          ${item.text}
        </div>
      `;
    })

    return `
      <div class="radio">
        <div class="radio-label">${label}</div>
        <div class="radio-buttons-container">
          ${radioButtons}
        </div>
      </div>
    `
  }

  renderTo(parent) {
    let srcsFilter = this.createDropDown('src', 'Where are you now?', LOCATIONS);
    let dstsFilter = this.createDropDown('dst', 'Where do you want to VPN into?', LOCATIONS);
    let tpdsFilter = this.createRadioButtons('tpd', 'Period to test', TPDS);

    let wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <div id="expanded-view">
        ${srcsFilter}
        ${dstsFilter}
        ${tpdsFilter}
        <div id="submit" class="button">View Results</div>
      </div>
      <div id="mini-view">
        <div id="mini-view-content"></div>
        <div id="expand-filters">change</div>
      </div>
    `
    parent.appendChild(wrapper);

    // Store element references once they've been rendered to the DOM
    this.els = {
      wrapper: wrapper,
      radioButtons: Array.from(document.getElementsByClassName('radio-button')),
      dropdowns: Array.from(document.getElementsByClassName('dropdown-list')),
      submit: document.getElementById('submit'),
      expandedView: document.getElementById('expanded-view'),
      miniView: document.getElementById('mini-view'),
      miniViewContent: document.getElementById('mini-view-content'),
      expandFilters: document.getElementById('expand-filters')
    }

    // Attach event listeners
    this.els.radioButtons.forEach(el => {
      let type = el.getAttribute('type');
      let listId = el.getAttribute('list_id');
      el.addEventListener('click', () => this.onChange(type, listId));
    })

    this.els.dropdowns.forEach(el => {
      let type = el.getAttribute('type');
      el.addEventListener('change', () => {
        let listId = el.options[el.selectedIndex].value;
        this.onChange(type, listId);
      })
    })

    this.els.submit.addEventListener('click', () => this.onSubmit() )
    this.els.expandFilters.addEventListener('click', () => this.onExpand() )
  }

  onUpdate(changes, prevState) {
    if (changes.hasOwnProperty('filters')) {

      // Set each controls view based on the state
      this.els.radioButtons.forEach(el => {
        let listId = el.getAttribute('list_id');
        el.setAttribute('class', (TPDS[listId] == changes.filters.tpd ? 'radio-button highlight' : 'radio-button'));
      })
      this.els.dropdowns[0].value = this.getLocationIdByCode(changes.filters.src.code);
      this.els.dropdowns[1].value = this.getLocationIdByCode(changes.filters.dst.code);
      this.els.miniViewContent.innerHTML = `${changes.filters.src.text} - ${changes.filters.dst.text}, ${changes.filters.tpd.text}`
    }

    if (changes.hasOwnProperty('filtersMinimized')) {
      this.els.expandedView.setAttribute('class', changes.filtersMinimized ? 'hide' : '');
      this.els.miniView.setAttribute('class', changes.filtersMinimized ? '' : 'hide');
    }
  }

  getLocationIdByCode(code) {
    let match;

    LOCATIONS.forEach((item, id) => {
      if (item.code == code) match = id;
    })
    return match;
  }
}