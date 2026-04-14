/* ============================================
   CHARTS.JS — Lightweight Chart Drawing
   Using HTML5 Canvas for Dashboard Charts
   ============================================ */

(function() {
  'use strict';

  /* ---------- Color Palette ---------- */
  function getChartColors() {
    var style = getComputedStyle(document.documentElement);
    return {
      primary: style.getPropertyValue('--clr-primary').trim() || '#4A1D96',
      accent: style.getPropertyValue('--clr-accent').trim() || '#7C3AED',
      secondary: style.getPropertyValue('--clr-secondary').trim() || '#D4A843',
      success: style.getPropertyValue('--clr-success').trim() || '#10B981',
      info: style.getPropertyValue('--clr-info').trim() || '#3B82F6',
      error: style.getPropertyValue('--clr-error').trim() || '#EF4444',
      warning: style.getPropertyValue('--clr-warning').trim() || '#F59E0B',
      text: style.getPropertyValue('--clr-text-muted').trim() || '#9B8FB0',
      border: style.getPropertyValue('--clr-border-light').trim() || '#F0ECF5',
      surface: style.getPropertyValue('--clr-surface').trim() || '#FFFFFF'
    };
  }

  /* ---------- Utility Functions ---------- */
  function hexToRgba(hex, alpha) {
    hex = hex.replace('#', '');
    if (hex.length === 3) {
      hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    }
    var r = parseInt(hex.substring(0, 2), 16);
    var g = parseInt(hex.substring(2, 4), 16);
    var b = parseInt(hex.substring(4, 6), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
  }

  /* ---------- LINE CHART ---------- */
  window.drawLineChart = function(canvasId, data, options) {
    var canvas = document.getElementById(canvasId);
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var colors = getChartColors();
    var opts = Object.assign({ lineColor: colors.accent, fillColor: hexToRgba(colors.accent, 0.08), gridColor: colors.border, labelColor: colors.text, labels: [], values: [], lineWidth: 3 }, options || {});

    // High DPI
    var rect = canvas.parentElement.getBoundingClientRect();
    var dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    ctx.scale(dpr, dpr);

    var w = rect.width;
    var h = rect.height;
    var pad = { top: 20, right: 20, bottom: 40, left: 50 };
    var chartW = w - pad.left - pad.right;
    var chartH = h - pad.top - pad.bottom;
    var values = data.values || opts.values;
    var labels = data.labels || opts.labels;
    var max = Math.max.apply(null, values) * 1.15;
    var min = 0;

    ctx.clearRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = opts.gridColor;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    for (var gi = 0; gi <= 4; gi++) {
      var gy = pad.top + (chartH / 4) * gi;
      ctx.beginPath();
      ctx.moveTo(pad.left, gy);
      ctx.lineTo(w - pad.right, gy);
      ctx.stroke();

      // Y labels
      var val = Math.round(max - (max / 4) * gi);
      ctx.fillStyle = opts.labelColor;
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(val >= 1000 ? (val / 1000).toFixed(1) + 'k' : val, pad.left - 8, gy + 4);
    }
    ctx.setLineDash([]);

    // X labels
    ctx.fillStyle = opts.labelColor;
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'center';
    for (var xi = 0; xi < labels.length; xi++) {
      var lx = pad.left + (chartW / (labels.length - 1)) * xi;
      ctx.fillText(labels[xi], lx, h - pad.bottom + 20);
    }

    // Line + fill
    var points = [];
    for (var i = 0; i < values.length; i++) {
      var px = pad.left + (chartW / (values.length - 1)) * i;
      var py = pad.top + chartH - (values[i] / max) * chartH;
      points.push({ x: px, y: py });
    }

    // Filled area
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (var j = 1; j < points.length; j++) {
      var xc = (points[j].x + points[j - 1].x) / 2;
      ctx.bezierCurveTo(xc, points[j - 1].y, xc, points[j].y, points[j].x, points[j].y);
    }
    ctx.lineTo(points[points.length - 1].x, pad.top + chartH);
    ctx.lineTo(points[0].x, pad.top + chartH);
    ctx.closePath();
    var grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + chartH);
    grad.addColorStop(0, opts.fillColor || hexToRgba(opts.lineColor, 0.15));
    grad.addColorStop(1, hexToRgba(opts.lineColor, 0));
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (var k = 1; k < points.length; k++) {
      var xc2 = (points[k].x + points[k - 1].x) / 2;
      ctx.bezierCurveTo(xc2, points[k - 1].y, xc2, points[k].y, points[k].x, points[k].y);
    }
    ctx.strokeStyle = opts.lineColor;
    ctx.lineWidth = opts.lineWidth;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();

    // Dots
    for (var d = 0; d < points.length; d++) {
      ctx.beginPath();
      ctx.arc(points[d].x, points[d].y, 4, 0, Math.PI * 2);
      ctx.fillStyle = opts.lineColor;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(points[d].x, points[d].y, 2, 0, Math.PI * 2);
      ctx.fillStyle = opts.surface || '#fff';
      ctx.fill();
    }
  };

  /* ---------- BAR CHART ---------- */
  window.drawBarChart = function(canvasId, data, options) {
    var canvas = document.getElementById(canvasId);
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var colors = getChartColors();
    var opts = Object.assign({ barColors: [colors.accent, colors.secondary, colors.success, colors.info, colors.primary, colors.warning], gridColor: colors.border, labelColor: colors.text, labels: [], values: [], barRadius: 6 }, options || {});

    var rect = canvas.parentElement.getBoundingClientRect();
    var dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    ctx.scale(dpr, dpr);

    var w = rect.width;
    var h = rect.height;
    var pad = { top: 20, right: 20, bottom: 40, left: 50 };
    var chartW = w - pad.left - pad.right;
    var chartH = h - pad.top - pad.bottom;
    var values = data.values || opts.values;
    var labels = data.labels || opts.labels;
    var max = Math.max.apply(null, values) * 1.15;

    ctx.clearRect(0, 0, w, h);

    // Grid
    ctx.strokeStyle = opts.gridColor;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    for (var gi = 0; gi <= 4; gi++) {
      var gy = pad.top + (chartH / 4) * gi;
      ctx.beginPath();
      ctx.moveTo(pad.left, gy);
      ctx.lineTo(w - pad.right, gy);
      ctx.stroke();
      var val = Math.round(max - (max / 4) * gi);
      ctx.fillStyle = opts.labelColor;
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(val, pad.left - 8, gy + 4);
    }
    ctx.setLineDash([]);

    // Bars
    var barGap = 12;
    var barW = (chartW - barGap * (values.length + 1)) / values.length;
    barW = Math.min(barW, 48);
    var totalBarsW = barW * values.length + barGap * (values.length - 1);
    var startX = pad.left + (chartW - totalBarsW) / 2;

    for (var i = 0; i < values.length; i++) {
      var bx = startX + (barW + barGap) * i;
      var bh = (values[i] / max) * chartH;
      var by = pad.top + chartH - bh;
      var r = Math.min(opts.barRadius, barW / 2, bh / 2);
      var color = opts.barColors[i % opts.barColors.length];

      // Rounded top bar
      ctx.beginPath();
      ctx.moveTo(bx, by + bh);
      ctx.lineTo(bx, by + r);
      ctx.arcTo(bx, by, bx + r, by, r);
      ctx.lineTo(bx + barW - r, by);
      ctx.arcTo(bx + barW, by, bx + barW, by + r, r);
      ctx.lineTo(bx + barW, by + bh);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();

      // Label
      ctx.fillStyle = opts.labelColor;
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(labels[i], bx + barW / 2, h - pad.bottom + 18);
    }
  };

  /* ---------- PIE / DONUT CHART ---------- */
  window.drawPieChart = function(canvasId, data, options) {
    var canvas = document.getElementById(canvasId);
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var colors = getChartColors();
    var opts = Object.assign({ colors: [colors.accent, colors.secondary, colors.success, colors.info, colors.error, colors.warning], labels: [], values: [], donut: true, donutWidth: 35, labelColor: colors.text }, options || {});

    var rect = canvas.parentElement.getBoundingClientRect();
    var dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    ctx.scale(dpr, dpr);

    var w = rect.width;
    var h = rect.height;
    var values = data.values || opts.values;
    var labels = data.labels || opts.labels;
    var total = values.reduce(function(s, v) { return s + v; }, 0);
    var cx = w / 2;
    var cy = h / 2 - 10;
    var radius = Math.min(w, h) / 2 - 30;

    ctx.clearRect(0, 0, w, h);

    var startAngle = -Math.PI / 2;
    for (var i = 0; i < values.length; i++) {
      var sliceAngle = (values[i] / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, startAngle, startAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = opts.colors[i % opts.colors.length];
      ctx.fill();
      startAngle += sliceAngle;
    }

    // Donut hole
    if (opts.donut) {
      ctx.beginPath();
      ctx.arc(cx, cy, radius - opts.donutWidth, 0, Math.PI * 2);
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--clr-surface').trim() || '#fff';
      ctx.fill();

      // Center text
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--clr-text').trim();
      ctx.font = 'bold 20px Playfair Display, serif';
      ctx.textAlign = 'center';
      ctx.fillText(total.toLocaleString(), cx, cy + 2);
      ctx.font = '11px Inter, sans-serif';
      ctx.fillStyle = opts.labelColor;
      ctx.fillText('Total', cx, cy + 18);
    }

    // Legend
    var legendY = h - 18;
    var legendItemW = w / labels.length;
    for (var li = 0; li < labels.length; li++) {
      var lx = legendItemW * li + legendItemW / 2;
      ctx.fillStyle = opts.colors[li % opts.colors.length];
      ctx.beginPath();
      ctx.arc(lx - 20, legendY, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = opts.labelColor;
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(labels[li], lx - 12, legendY + 4);
    }
  };

  /* ---------- AREA CHART ---------- */
  window.drawAreaChart = function(canvasId, data, options) {
    var canvas = document.getElementById(canvasId);
    if (!canvas) return;
    var colors = getChartColors();
    var datasets = data.datasets || [{ values: data.values || [], color: colors.accent, label: 'Data' }];
    var opts = Object.assign({ gridColor: colors.border, labelColor: colors.text, labels: data.labels || [] }, options || {});

    // Use line chart engine with multiple datasets
    for (var di = 0; di < datasets.length; di++) {
      var ds = datasets[di];
      drawLineChart(canvasId, {
        labels: di === 0 ? opts.labels : [],
        values: ds.values
      }, {
        lineColor: ds.color,
        fillColor: hexToRgba(ds.color, 0.08),
        gridColor: di === 0 ? opts.gridColor : 'transparent',
        labelColor: opts.labelColor,
        lineWidth: 2
      });
    }
  };

  /* ---------- HORIZONTAL BAR CHART ---------- */
  window.drawHorizontalBarChart = function(canvasId, data, options) {
    var canvas = document.getElementById(canvasId);
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var colors = getChartColors();
    var opts = Object.assign({ barColors: [colors.accent, colors.secondary, colors.success, colors.info, colors.primary, colors.warning], gridColor: colors.border, labelColor: colors.text, barRadius: 6, barHeight: 24 }, options || {});

    var rect = canvas.parentElement.getBoundingClientRect();
    var dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    ctx.scale(dpr, dpr);

    var w = rect.width, h = rect.height;
    var values = data.values, labels = data.labels;
    var max = Math.max.apply(null, values) * 1.1;
    var pad = { top: 15, right: 50, bottom: 10, left: 90 };
    var chartW = w - pad.left - pad.right;
    var chartH = h - pad.top - pad.bottom;
    var barH = Math.min(opts.barHeight, (chartH / values.length) - 12);
    var gap = (chartH - barH * values.length) / (values.length + 1);

    ctx.clearRect(0, 0, w, h);

    for (var i = 0; i < values.length; i++) {
      var by = pad.top + gap + (barH + gap) * i;
      var bw = (values[i] / max) * chartW;
      var r = Math.min(opts.barRadius, barH / 2, bw);
      var color = opts.barColors[i % opts.barColors.length];

      // Background track
      ctx.fillStyle = hexToRgba(color, 0.08);
      ctx.beginPath();
      ctx.roundRect(pad.left, by, chartW, barH, [4]);
      ctx.fill();

      // Filled bar with rounded right end
      ctx.beginPath();
      ctx.moveTo(pad.left, by);
      ctx.lineTo(pad.left + bw - r, by);
      ctx.arcTo(pad.left + bw, by, pad.left + bw, by + r, r);
      ctx.lineTo(pad.left + bw, by + barH - r);
      ctx.arcTo(pad.left + bw, by + barH, pad.left + bw - r, by + barH, r);
      ctx.lineTo(pad.left, by + barH);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();

      // Label left
      ctx.fillStyle = opts.labelColor;
      ctx.font = '12px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(labels[i], pad.left - 10, by + barH / 2);

      // Value right
      ctx.fillStyle = color;
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(values[i], pad.left + bw + 8, by + barH / 2);
    }
  };

  /* ---------- RADAR / SPIDER CHART ---------- */
  window.drawRadarChart = function(canvasId, data, options) {
    var canvas = document.getElementById(canvasId);
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var colors = getChartColors();
    var opts = Object.assign({ fillColor: hexToRgba(colors.accent, 0.2), strokeColor: colors.accent, gridColor: colors.border, labelColor: colors.text, dotColor: colors.accent, levels: 5 }, options || {});

    var rect = canvas.parentElement.getBoundingClientRect();
    var dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    ctx.scale(dpr, dpr);

    var w = rect.width, h = rect.height;
    var labels = data.labels, values = data.values;
    var n = labels.length;
    var cx = w / 2, cy = h / 2;
    var radius = Math.min(w, h) / 2 - 40;
    var angleStep = (Math.PI * 2) / n;
    var max = data.max || 100;

    ctx.clearRect(0, 0, w, h);

    // Grid levels (pentagons/polygons)
    for (var lv = 1; lv <= opts.levels; lv++) {
      var lvR = (radius / opts.levels) * lv;
      ctx.beginPath();
      for (var gi = 0; gi < n; gi++) {
        var ga = -Math.PI / 2 + angleStep * gi;
        var gx = cx + lvR * Math.cos(ga);
        var gy = cy + lvR * Math.sin(ga);
        if (gi === 0) ctx.moveTo(gx, gy);
        else ctx.lineTo(gx, gy);
      }
      ctx.closePath();
      ctx.strokeStyle = hexToRgba(opts.gridColor.replace('#','').length ? opts.gridColor : '#ccc', lv === opts.levels ? 0.4 : 0.15);
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Axis lines
    for (var ai = 0; ai < n; ai++) {
      var aa = -Math.PI / 2 + angleStep * ai;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + radius * Math.cos(aa), cy + radius * Math.sin(aa));
      ctx.strokeStyle = hexToRgba(opts.gridColor.replace('#','').length ? opts.gridColor : '#ccc', 0.15);
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Data polygon
    ctx.beginPath();
    for (var di = 0; di < n; di++) {
      var da = -Math.PI / 2 + angleStep * di;
      var dr = (values[di] / max) * radius;
      var dx = cx + dr * Math.cos(da);
      var dy = cy + dr * Math.sin(da);
      if (di === 0) ctx.moveTo(dx, dy);
      else ctx.lineTo(dx, dy);
    }
    ctx.closePath();
    ctx.fillStyle = opts.fillColor;
    ctx.fill();
    ctx.strokeStyle = opts.strokeColor;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Dots + labels
    for (var pi = 0; pi < n; pi++) {
      var pa = -Math.PI / 2 + angleStep * pi;
      var pr = (values[pi] / max) * radius;
      var px = cx + pr * Math.cos(pa);
      var py = cy + pr * Math.sin(pa);

      // Dot glow
      ctx.beginPath();
      ctx.arc(px, py, 6, 0, Math.PI * 2);
      ctx.fillStyle = hexToRgba(opts.dotColor, 0.3);
      ctx.fill();
      // Dot
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fillStyle = opts.dotColor;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(px, py, 2, 0, Math.PI * 2);
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--clr-surface').trim() || '#fff';
      ctx.fill();

      // Label
      var lbx = cx + (radius + 22) * Math.cos(pa);
      var lby = cy + (radius + 22) * Math.sin(pa);
      ctx.fillStyle = opts.labelColor;
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = Math.abs(Math.cos(pa)) < 0.01 ? 'center' : (Math.cos(pa) > 0 ? 'left' : 'right');
      ctx.textBaseline = 'middle';
      ctx.fillText(labels[pi], lbx, lby);
    }
  };

  /* ---------- GAUGE / SPEEDOMETER CHART ---------- */
  window.drawGaugeChart = function(canvasId, data, options) {
    var canvas = document.getElementById(canvasId);
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var colors = getChartColors();
    var opts = Object.assign({ trackColor: colors.border, labelColor: colors.text, segments: [
      { color: colors.error, label: 'Low' },
      { color: colors.warning, label: 'Med' },
      { color: colors.success, label: 'High' }
    ], value: data.value || 0, max: data.max || 100, label: data.label || '', lineWidth: 28 }, options || {});

    var rect = canvas.parentElement.getBoundingClientRect();
    var dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    ctx.scale(dpr, dpr);

    var w = rect.width, h = rect.height;
    var cx = w / 2, cy = h * 0.58;
    var radius = Math.min(w / 2, h * 0.55) - opts.lineWidth;
    var startAngle = Math.PI * 0.8;
    var endAngle = Math.PI * 2.2;
    var totalArc = endAngle - startAngle;

    ctx.clearRect(0, 0, w, h);

    // Track background
    ctx.beginPath();
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.strokeStyle = hexToRgba(opts.trackColor, 0.15);
    ctx.lineWidth = opts.lineWidth;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Colored segments
    var segCount = opts.segments.length;
    var segArc = totalArc / segCount;
    for (var si = 0; si < segCount; si++) {
      var segStart = startAngle + segArc * si;
      var segEnd = segStart + segArc;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, segStart + 0.02, segEnd - 0.02);
      ctx.strokeStyle = hexToRgba(opts.segments[si].color, 0.25);
      ctx.lineWidth = opts.lineWidth;
      ctx.lineCap = 'round';
      ctx.stroke();
    }

    // Value arc
    var valueAngle = startAngle + (opts.value / opts.max) * totalArc;
    var valueGrad = ctx.createLinearGradient(cx - radius, cy, cx + radius, cy);
    for (var vi = 0; vi < opts.segments.length; vi++) {
      valueGrad.addColorStop(vi / opts.segments.length, opts.segments[vi].color);
    }
    ctx.beginPath();
    ctx.arc(cx, cy, radius, startAngle, valueAngle);
    ctx.strokeStyle = valueGrad;
    ctx.lineWidth = opts.lineWidth;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Needle dot
    var nx = cx + radius * Math.cos(valueAngle);
    var ny = cy + radius * Math.sin(valueAngle);
    ctx.beginPath();
    ctx.arc(nx, ny, opts.lineWidth / 2 + 2, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(nx, ny, opts.lineWidth / 2 - 2, 0, Math.PI * 2);
    var dotColor = opts.segments[Math.min(Math.floor((opts.value / opts.max) * segCount), segCount - 1)].color;
    ctx.fillStyle = dotColor;
    ctx.fill();

    // Center value
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--clr-text').trim() || '#1a1a2e';
    ctx.font = 'bold 32px Playfair Display, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(opts.value + '%', cx, cy - 5);

    // Label
    ctx.fillStyle = opts.labelColor;
    ctx.font = '12px Inter, sans-serif';
    ctx.fillText(opts.label, cx, cy + 22);

    // Segment labels
    for (var sli = 0; sli < segCount; sli++) {
      var sla = startAngle + segArc * sli + segArc / 2;
      var slx = cx + (radius + opts.lineWidth + 12) * Math.cos(sla);
      var sly = cy + (radius + opts.lineWidth + 12) * Math.sin(sla);
      ctx.fillStyle = opts.segments[sli].color;
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(opts.segments[sli].label, slx, sly);
    }
  };

  /* ---------- RING PROGRESS CHART ---------- */
  window.drawRingChart = function(canvasId, data, options) {
    var canvas = document.getElementById(canvasId);
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var colors = getChartColors();
    var opts = Object.assign({ labelColor: colors.text, ringWidth: 18, gap: 8 }, options || {});

    var rect = canvas.parentElement.getBoundingClientRect();
    var dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    ctx.scale(dpr, dpr);

    var w = rect.width, h = rect.height;
    var rings = data.rings || [];
    var cx = w / 2, cy = h / 2 - 12;
    var maxR = Math.min(w, h) / 2 - 30;
    var ringColors = [colors.accent, colors.secondary, colors.success, colors.info, colors.error];

    ctx.clearRect(0, 0, w, h);

    for (var ri = 0; ri < rings.length; ri++) {
      var r = maxR - (opts.ringWidth + opts.gap) * ri;
      var progress = rings[ri].value / rings[ri].max;
      var color = rings[ri].color || ringColors[ri % ringColors.length];

      // Track
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = hexToRgba(color, 0.1);
      ctx.lineWidth = opts.ringWidth;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Progress arc
      ctx.beginPath();
      ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
      ctx.strokeStyle = color;
      ctx.lineWidth = opts.ringWidth;
      ctx.lineCap = 'round';
      ctx.stroke();
    }

    // Center text — total percentage
    var avgPct = Math.round(rings.reduce(function(s, r) { return s + (r.value / r.max) * 100; }, 0) / rings.length);
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--clr-text').trim() || '#1a1a2e';
    ctx.font = 'bold 24px Playfair Display, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(avgPct + '%', cx, cy - 4);
    ctx.font = '11px Inter, sans-serif';
    ctx.fillStyle = opts.labelColor;
    ctx.fillText('Average', cx, cy + 16);

    // Legend below
    var legendY = h - 12;
    var legendW = w / rings.length;
    for (var li = 0; li < rings.length; li++) {
      var lx = legendW * li + legendW / 2;
      var lColor = rings[li].color || ringColors[li % ringColors.length];
      ctx.fillStyle = lColor;
      ctx.beginPath();
      ctx.arc(lx - 22, legendY, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = opts.labelColor;
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(rings[li].label, lx - 14, legendY + 3);
    }
  };

})();
