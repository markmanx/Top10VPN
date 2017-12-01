const rootEl = document.getElementById('root');
const LOCATIONS = [
    {code: 'fra', text: 'France'},
    {code: 'lon', text: 'London, UK'},
    {code: 'nyc', text: 'New York, US'},
    {code: 'sfo', text: 'San Francisco, US'},
    {code: 'sgp', text: 'Singapore'},
    {code: 'syd', text: 'Sydney, Australia'}
  ]
const TPDS = [
  {days: 0, text: 'Right Now'}, 
  {days: 7, text: 'Last 7 days'}, 
  {days: 30, text: 'Last 30 days'}
]
const INFO_MSGS = {
  DOWNLOAD: {title: 'Download Speed', text: 'Average download speed recorded in our tests'},
  PING: {title: 'Ping Response Time', text: 'Average ping response time recorded in our tests'}
}
const VPN_SORT_TYPES = {
  FASTEST: 0,
  SLOWEST: 1
}
let views = {
  filter: new Filter(onFilterChanged, onFilterSubmit, onFiltersExpand),
  vpnList: new VpnList(onSort, onInfoClicked, onInfoClosed)
}
let api = new Api();
let state = {};


function init() {
  // Add views to the DOM
  views.filter.renderTo(rootEl);
  views.vpnList.renderTo(rootEl);

  // Set the app's initial state
  setState({
    filters: {
      src: LOCATIONS[1],
      dst: LOCATIONS[2],
      tpd: TPDS[1]
    },
    filtersMinimized: false,
    vpns: [],
    infoMsg: null,
    sortVPNsBy: null
  })
}

function setState(changes) {
  let prevState = {...state};
  state = {...state, ...changes};

  for (let prop in views) {
    views[prop].onUpdate(changes, prevState);
  }

  console.log(changes)
}

function onFilterChanged(type, listId) {
  let val;

  switch(type) {
    case 'src':
    case 'dst':
      val = LOCATIONS[listId];
      break;
    case 'tpd':
      val = TPDS[listId];
      break;
  }

  let filters = {...state.filters};
  filters[type] = val;

  setState({
    filters: filters
  })
}

function onFilterSubmit() {
  let filters = state.filters;

  api.fetchData(filters.src.code, filters.dst.code, filters.tpd.days)
  .then(json => {
    // Convert the json object to an array
    let arr = [];
    for (let prop in json) {
      arr.push(json[prop]);
    }

    setState({
      vpns: arr,
      filtersMinimized: true,
      sortVPNsBy: null
    })
  });
}

function onFiltersExpand() {
  setState({
    filtersMinimized: false
  })
}

function onSort() {
  let sortBy;

  if (state.sortVPNsBy == null) {
    sortBy = VPN_SORT_TYPES.FASTEST;
  } else {
    sortBy = state.sortVPNsBy == VPN_SORT_TYPES.FASTEST ? VPN_SORT_TYPES.SLOWEST : VPN_SORT_TYPES.FASTEST;
  }

  setState({
    sortVPNsBy: sortBy
  })
}

function onInfoClicked(infoMsg) {
  setState({
    infoMsg: infoMsg
  });
}

function onInfoClosed() {
  setState({
    infoMsg: null
  });
}

init();