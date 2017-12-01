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
let views = {
  filter: new Filter(onFilterChanged, onFilterSubmit, onFiltersExpand),
  vpnList: new VpnList(onSortFastest)
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
    vpns: []
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
      filtersMinimized: true
    })
  });
}

function onFiltersExpand() {
  setState({
    filtersMinimized: false
  })
}

function onSortFastest() {
  let sorted = state.vpns.sort((a, b) => {
    return a.dlMbps + b.dlMbps;
  })

  setState({
    vpns: sorted
  })
}

init();