const VoiceResponse = require('twilio').twiml.VoiceResponse;
export const response = new VoiceResponse();
response.pause({ length: 5 });
response.play(
  'https://api.getzealthy.com/storage/v1/object/public/automated_calls/UPDATED%20ROBOCALL%20-%20IF%20VOICEMAIL.wav'
);

response.pause({ length: 3 });
response.hangup();
console.log(response.toString());

export const missingIntakeVoicemail = response;
