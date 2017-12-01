class VpnList {
  constructor(onSortFastest) {
    this.onSortFastest = onSortFastest;
  }

  createVpnContainer(vpn, tpd, onSortFastest) {
    return `
      <div class="vpn-wrapper">
        <div class="vpn-name">${vpn.displayName}</div>
        <div class="vpn-info-cell">
          <div class="vpn-label">Period</div>
          <div>${tpd}</div>
        </div>
        <div class="vpn-info-cell">
          <div class="vpn-label">Download Speed</div>
          <div>${vpn.dlMbps.toFixed(1)}Mbps</div>
        </div>
        <div class="vpn-info-cell">
          <div class="vpn-label">Ping Time</div>
          <div>${vpn.pingAvg}ms</div>
        </div>
      </div>
    `
  }

  renderTo(parent) {
    let wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <div id="vpns-container"></div>
      <div id="footer-container">
        <div id="sort-fastest" class="button">Sort by Fastest</div>
      </div>
    `
    parent.appendChild(wrapper);

    // Store element references once they've been rendered to the DOM
    this.els = {
      wrapper: wrapper,
      vpnsContainer: document.getElementById('vpns-container'),
      footer: document.getElementById('footer-container'),
      sortFastest: document.getElementById('sort-fastest')
    }

    // Add event listeners
    this.els.sortFastest.addEventListener('click', this.onSortFastest);
  }

  onUpdate(changes, prevState) {
    if (changes.hasOwnProperty('vpns')) {
      
      if (changes.vpns.length == 0) {
        this.els.vpnsContainer.innerHTML = 'No results';
        this.els.footer.setAttribute('class', 'hide');
      } else {
        this.els.vpnsContainer.innerHTML = '';
        this.els.footer.setAttribute('class', '');
        for (let prop in changes.vpns) {
          let vpn = changes.vpns[prop];
          let tpd = {...prevState, ...changes}.filters.tpd.text;
          this.els.vpnsContainer.innerHTML += this.createVpnContainer(vpn, tpd);
        }
      }
    }
  }
}