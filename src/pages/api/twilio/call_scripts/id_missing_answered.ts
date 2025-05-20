const VoiceResponse = require('twilio').twiml.VoiceResponse;
const response = new VoiceResponse();

const gather = response.gather({
  numDigits: 1,
  action: 'https://app.getzealthy.com/api/twilio/redirect-call',
  method: 'POST',
});
gather.play(
  'https://api.getzealthy.com/storage/v1/object/public/automated_calls/UPDATED%20ROBOCALL%20-%20IF%20ANSWERS%20(ID-V).wav'
);

response.pause({ length: 3 });
response.hangup();
console.log(response.toString());

export const idMissingAnswered = response;
