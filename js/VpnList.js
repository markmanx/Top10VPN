class VpnList {
  constructor(onSort, onInfoClicked, onInfoClosed) {
    this.onSort = onSort;
    this.onInfoClicked = onInfoClicked;
    this.onInfoClosed = onInfoClosed;
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
          <div class="vpn-label">Download Speed <div class="circle-icon info-icon" msg_type="DOWNLOAD">i</div></div>
          <div>${vpn.dlMbps.toFixed(1)}Mbps</div>
        </div>
        <div class="vpn-info-cell">
          <div class="vpn-label">Ping Time <div class="circle-icon info-icon" msg_type="PING">i</div></div>
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
        <div id="sort-container">
          <div id="sort" class="button">Sort by Fastest</div>
        </div>
        <div id="info-msg-container">
          <div id="msg-detail-container">
            <div id="info-msg-title"></div>
            <div id="info-msg-text"></div>
          </div>
          <div id="close-info-msg" class="circle-icon">&#10005;</div>
        </div>
      </div>
    `
    parent.appendChild(wrapper);

    // Store element references once they've been rendered to the DOM
    this.els = {
      wrapper: wrapper,
      vpnsContainer: document.getElementById('vpns-container'),
      footer: document.getElementById('footer-container'),
      sortContainer: document.getElementById('sort-container'),
      sort: document.getElementById('sort'),
      infoContainer: document.getElementById('info-msg-container'),
      closeInfo: document.getElementById('close-info-msg'),
      infoMsgTitle: document.getElementById('info-msg-title'),
      infoMsgText: document.getElementById('info-msg-text')
    }

    // Add event listeners
    this.els.closeInfo.addEventListener('click', this.onInfoClosed);
    this.els.sort.addEventListener('click', this.onSort);
  }

  onUpdate(changes, prevState) {
    if (changes.hasOwnProperty('vpns') || changes.hasOwnProperty('sortVPNsBy')) {
      // Apply any sorting techniques to our VPNs list
      let sortedVpns = this.sortVPNs(state.vpns, state.sortVPNsBy);

      if (sortedVpns.length == 0) {
        this.els.vpnsContainer.innerHTML = 'No results';
        this.els.footer.setAttribute('class', 'hide');
      } else {
        this.els.vpnsContainer.innerHTML = '';
        this.els.footer.setAttribute('class', '');
        for (let prop in sortedVpns) {
          let vpn = sortedVpns[prop];
          let tpd = {...prevState, ...changes}.filters.tpd.text;
          this.els.vpnsContainer.innerHTML += this.createVpnContainer(vpn, tpd);
          Array.from(document.getElementsByClassName('info-icon')).forEach(item => {
            let msgType = item.getAttribute('msg_type');
            item.onclick = () => { this.onInfoClicked(INFO_MSGS[msgType]) }
          })
        }
      }

      let sortBtnText;
      if (state.sortVPNsBy == null) {
        sortBtnText = this.getSortTypeById(VPN_SORT_TYPES.FASTEST);
      } else {
        sortBtnText = this.getSortTypeById(!state.sortVPNsBy);
      }
      this.els.sort.innerHTML = `Sort by ${sortBtnText}`;
    }

    if (changes.hasOwnProperty('infoMsg')) {
      let msg = changes.infoMsg;
      this.els.sortContainer.setAttribute('class', msg == null ? '' : 'hide');
      this.els.infoContainer.setAttribute('class', msg == null ? 'hide' : '')

      if (msg !== null) {
        this.els.infoMsgTitle.innerHTML = msg.title;
        this.els.infoMsgText.innerHTML = msg.text;
      }
    }
  }

  sortVPNs(vpnsList, type) {
    switch(type) {
      case VPN_SORT_TYPES.FASTEST:
        return vpnsList.sort((a, b) => {
          return a.dlMbps < b.dlMbps ? 1 : -1;
        })
      case VPN_SORT_TYPES.SLOWEST:
        return vpnsList.sort((a, b) => {
          return a.dlMbps > b.dlMbps ? 1 : -1;
        })
      default: 
        return vpnsList;
    }
  }

  getSortTypeById(id) {
    for (let prop in VPN_SORT_TYPES) {
      if (VPN_SORT_TYPES[prop] == id) return prop;
    }
  }
}