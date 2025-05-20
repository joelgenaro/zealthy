const VoiceResponse = require('twilio').twiml.VoiceResponse;
const response = new VoiceResponse();

const gather = response.gather({
  numDigits: 1,
  action: 'https://app.getzealthy.com/api/twilio/redirect-call',
  method: 'POST',
});
gather.play(
  'https://staging.api.getzealthy.com/storage/v1/object/public/automated_calls/ILV_1.mp3'
);

response.pause({ length: 3 });
response.hangup();
export const patientJoinedRoom = response;
