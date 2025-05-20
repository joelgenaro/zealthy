const VoiceResponse = require('twilio').twiml.VoiceResponse;
const response = new VoiceResponse();

const gather = response.gather({
  numDigits: 1,
  action: 'https://app.getzealthy.com/api/twilio/redirect-call',
  method: 'POST',
});
gather.play(
  'https://api.getzealthy.com/storage/v1/object/public/automated_calls/update_payment_voicemail-_2_.wav'
);

response.pause({ length: 3 });
response.hangup();
console.log(response.toString());

export const failedPaymentAnswered = response;
