const VoiceResponse = require('twilio').twiml.VoiceResponse;
export const response = new VoiceResponse();
response.pause({ length: 5 });
response.play(
  'https://api.getzealthy.com/storage/v1/object/public/automated_calls/update_payment_voicemail-_2_.wav'
);

response.pause({ length: 3 });
response.hangup();
console.log(response.toString());

export const failedPaymentVoicemail = response;
