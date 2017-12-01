class Api {
  constructor() {
    this.baseUrl = 'https://perfapi.perf-data-api.top10vpn-data.prod.top10vpn.co/sdata/results?';
    this.fetchParams = { method: 'GET' }
  }

  fetchData(src, dst, tpd) {
    let params = `src=${src}&dest=${dst}&tpd=${tpd}`;
    let url = this.baseUrl + params;
    console.log('API call made: ' + url);
    
    return fetch(url, this.fetchParams)
      .then(res => {return res.json()});
  }
}