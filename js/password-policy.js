/* Shared client-side password policy for the main app and the legacy setup page.
   The server enforces the same rules in src/accounts.js. */
var PWRULES = [
  ["8-72 characters", function (v) { return v.length >= 8 && v.length <= 72; }],
  ["Uppercase letter (A-Z)", function (v) { return /[A-Z]/.test(v); }],
  ["Lowercase letter (a-z)", function (v) { return /[a-z]/.test(v); }],
  ["Number (0-9)", function (v) { return /[0-9]/.test(v); }],
  ["Symbol (!@#$%...)", function (v) { return /[^A-Za-z0-9\s]/.test(v); }]
];

function pwMissing(v) {
  var m = [];
  if (v.length < 8 || v.length > 72) m.push("8-72 characters");
  if (!/[A-Z]/.test(v)) m.push("an uppercase letter");
  if (!/[a-z]/.test(v)) m.push("a lowercase letter");
  if (!/[0-9]/.test(v)) m.push("a number");
  if (!/[^A-Za-z0-9\s]/.test(v)) m.push("a symbol");
  return m;
}

function pwList(a) {
  return a.length < 2 ? (a[0] || "") : a.slice(0, -1).join(", ") + " and " + a[a.length - 1];
}

function pwError(v) {
  var m = pwMissing(v);
  if (!m.length) return "";
  if (v.length < 8 || v.length > 72) return "New password must be 8-72 characters long.";
  return "New password must include " + pwList(m) + ".";
}

function pwReqHTML(v, c) {
  v = String(v || "");
  c = String(c == null ? "" : c);
  var met = PWRULES.filter(function (r) { return r[1](v); }).length;
  var label = !v ? "Start typing" : (met === 5 ? (v.length >= 12 ? "Strong" : "Good") : (met === 4 ? "Fair" : "Weak"));
  var cls = !v ? "idle" : (met === 5 ? (v.length >= 12 ? "strong" : "good") : (met === 4 ? "fair" : "weak"));
  var bars = "", list = "";
  for (var i = 0; i < 5; i++) bars += '<i class="' + (i < met ? "on" : "") + '"></i>';
  list = PWRULES.map(function (r) {
    var ok = r[1](v);
    return '<li class="' + (ok ? "ok" : "") + '">' + r[0] + '</li>';
  }).join("");
  var match = !c
    ? '<p class="pwmatch">Re-enter the new password to confirm.</p>'
    : (c === v ? '<p class="pwmatch ok">Passwords match.</p>' : '<p class="pwmatch bad">Passwords do not match.</p>');
  return '<div class="pwcheck"><div class="pwmeter ' + cls + '" role="img" aria-label="Password strength: ' + label + '">' + bars + '</div><p class="pwstrength ' + cls + '"><b>' + label + '</b>' + (v ? " · " + met + " of 5 rules met" : "") + '</p><ul class="pwreq">' + list + '</ul>' + match + '</div>';
}
