const VoiceResponse = require('twilio').twiml.VoiceResponse;
export const response = new VoiceResponse();
response.pause({ length: 6 });
response.play(
  'https://staging.api.getzealthy.com/storage/v1/object/public/automated_calls/ILV_1.mp3'
);

response.pause({ length: 3 });
response.hangup();

export const patientJoinedRoomVm = response;
