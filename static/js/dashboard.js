/* global LinearGauge:false RadialGauge:false */
$(function() {
  function handleGetResponseResHourly(data) {
    var blank_val, html, table, level_row, flow_row;
    blank_val = (' '.repeat(10) + '--').slice(-10);
    html = $.parseHTML(data.replace(/<img[^>]+>/gi, ''));
    table = $('div.content_left_column table:has(tr:nth-child(14):last-child:has(td:nth-child(15):last-child))', html);
    level_row = $('tr:has(td:nth-child(2):not(:contains(' + blank_val + ')))', table).last();
    flow_row = $('tr:has(td:nth-child(8):not(:contains(' + blank_val + '))):has(td:nth-child(10):not(:contains(' + blank_val + ')))', table).last();
    draw_gauges({
      'title': {
        'level': format_date_title($('td:nth-child(1)', level_row).text()),
        'flow': format_date_title($('td:nth-child(1)', flow_row).text())},
      'value': {
        'level': parseFloat($('td:nth-child(2)', level_row).text()),
        'inflow': parseInt($('td:nth-child(8)', flow_row).text()),
        'outflow': parseInt($('td:nth-child(6)', flow_row).text())}});
  }

  function range(start, stop, step) {
    var a, b;
    a=[start];
    b=start;
    while(b < stop) {
      b += step;
      a.push(b);
    }
    return a;
  }

  function ticks(max_val) {
    // Dynamically adjust tick size to leave gauge readable.
    var vals, order, val;
    vals = [
      {flow: 8, ticks: {major: 1, minor: 0.5}},
      {flow: 4, ticks: {major: 1, minor: 0.2}},
      {flow: 2, ticks: {major: 0.5, minor: 0.1}},
      {flow: 1, ticks: {major: 0.25, minor: 0.05}},
      {flow: 0, ticks: {major: 0.1, minor: 0.05}}
    ];
    order = Math.floor((Math.log(max_val) / Math.LN10) + 0.000000001);
    for (i = 0; i < vals.length; i++) {
      if ((max_val / Math.pow(10, order)) >= vals[i]['flow']) {
        val = vals[i];
        break;
      }
    }
    val['ticks']['major'] *= Math.pow(10, order);
    val['ticks']['minor'] *= Math.pow(10, order);
    return val['ticks'];
  }

  function max_flow(inflow_val, outflow_val) {
    // Dynamically set gauge max to next major tick.
    var max_val, tick;
    max_val = Math.max(inflow_val, outflow_val, 1);
    tick = ticks(max_val)['major'];
    if ((Math.floor(max_val / tick) * tick) == max_val) {
      // At a tick mark already, leave as-as.
      return max_val;
    }
    // Next major tick.
    return ((Math.floor(max_val / tick) + 1) * tick);
  }

  function format_date_title(date_str) {
    var d, mon, hrs, ampm;
    d = new Date(date_str);
    mon = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()];
    hrs = (d.getHours() + 12) % 12 || 12;
    ampm = (d.getHours() >= 12) ? 'pm' : 'am';
    return (mon + ' ' + d.getDate() + ' ' + hrs + ampm);
  }

  function draw_gauges(data) {
    var max_flow_val, level_gauge, inflow_gauge, outflow_gauge;
    max_flow_val = max_flow(data['value']['inflow'], data['value']['outflow']);
    $('#level-title').text('Lake Level, ' + data['title']['level']);
    $('#inflow-title').text('Inflow, ' + data['title']['flow']);
    $('#outflow-title').text('Outflow, ' + data['title']['flow']);
    level_gauge = new LinearGauge({
      renderTo: 'level-gauge',
      width: 180,
      height: 311,
      units: 'Feet',
      minValue: 600,
      maxValue: 925,
      exactTicks: true,
      majorTicks: range(600, 900, 50).concat(925),
      minorTicks: 10,
      borderShadowWidth: 0,
      borders: false,
      animationDuration: 2000,
      animationRule: 'dequint',
      needleSide: 'left',
      colorBarProgress: '#0099cc',
      colorBar: '#ffffff',
      barBeginCircle: false,
      fontValueSize: 16,
      highlights: [
        {
          from: 850,
          to: 870,
          color: 'rgba(255, 255, 0, .75)'
        }, {
          from: 870,
          to: 885,
          color: 'rgba(255, 127, 0, .75)'
        }, {
          from: 885,
          to: 901,
          color: 'rgba(200, 0, 0, .75)'
        }, {
          from: 901,
          to: 920,
          color: 'rgba(100, 100, 100, .75)'
        }
      ]
    }).draw();
    inflow_gauge = new RadialGauge({
      renderTo: 'inflow-gauge',
      width: 170,
      height: 170,
      units: 'cfps',
      minValue: 0,
      maxValue: max_flow(data['value']['inflow'], data['value']['outflow']),
      exactTicks: true,
      majorTicks: range(0, max_flow_val, ticks(max_flow_val)['major']),
      minorTicks: ticks(max_flow_val)['minor'],
      borderShadowWidth: 0,
      borders: false,
      animationDuration: 2000,
      animationRule: 'dequint',
      valueBoxWidth: 32,
      valueDec: 0,
      fontValueSize: 32,
      highlights: []
    }).draw();
    outflow_gauge = new RadialGauge({
      renderTo: 'outflow-gauge',
      width: 170,
      height: 170,
      units: 'cfps',
      minValue: 0,
      maxValue: max_flow_val,
      exactTicks: true,
      majorTicks: range(0, max_flow_val, ticks(max_flow_val)['major']),
      minorTicks: ticks(max_flow_val)['minor'],
      borderShadowWidth: 0,
      borders: false,
      animationDuration: 2000,
      animationRule: 'dequint',
      valueBoxWidth: 32,
      valueDec: 0,
      fontValueSize: 32,
      highlights: []
    }).draw();
    // Set values after drawing to cause animation.
    level_gauge.value = data['value']['level'];
    inflow_gauge.value = data['value']['inflow'];
    outflow_gauge.value = data['value']['outflow'];
  }
  
  jQuery(document).ready(function(){
    var CORSURLPrefix, url;
    CORSURLPrefix = 'https://cors-anywhere.herokuapp.com/';
    url = 'http://cdec.water.ca.gov/cgi-progs/queryF?ORO';
    $.get(CORSURLPrefix + url, handleGetResponseResHourly);
  });
});
