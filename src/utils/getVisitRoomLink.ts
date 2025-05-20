const getVisitRoomLink = (
  daily_room: string,
  appointment_id: number
): string => {
  let base_url;
  if (typeof window === 'undefined') {
    base_url = 'https://app.getzealthy.com';
  } else {
    base_url = window.location.origin;
  }
  return base_url + `/visit/room/${daily_room}?appointment=${appointment_id}`;
};

export default getVisitRoomLink;
