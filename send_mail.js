var send = require('gmail-send')({
//var send = require('../index.js')({
  user: 'freelance@kolesnikdenis.com',
  pass: 'freelance321',
  to:   'kolesnik@ots.kh.ua',
  subject: 'validation mail from geo freelancer',
  html:    '<b>submit you mail</b> click <a href="#">there</a><br><hr>from <i>freelancer.kolesnikdenis.com</i>'            // HTML
});

console.log('* [example 1.1] sending test email');
var filepath = './pengbrew_160x160.png';  // File to attach
send({ // Overriding default parameters
  subject: 'attached '+filepath,         // Override value set as default
  files: [ filepath ],
}, function (err, res) {
  console.log('* [example 1.1] send() callback returned: err:', err, '; res:', res);
});
