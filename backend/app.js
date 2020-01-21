const Nexmo = require('nexmo');

const nexmo = new Nexmo({
  apiKey: '5a81e6c0',
  apiSecret: 'rDvEODsnqKXYwg1a',
});

const from = '18563449243';
const to = '16692819438';
const text = 'Your ride has been booked';

nexmo.message.sendSms(from, to, text);

  
