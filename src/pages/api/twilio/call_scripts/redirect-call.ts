const VoiceResponse = require('twilio').twiml.VoiceResponse;
export const response = new VoiceResponse();
response.dial('+18778700323');

console.log(response.toString());

export const redirectCall = response;
