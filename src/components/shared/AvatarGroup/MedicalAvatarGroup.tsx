import AvatarGroup from './AvatarGroup';

// Doctors Image
import MaleDoctor1 from 'public/doctor-images/male-doctor-1.png';
import MaleDoctor2 from 'public/doctor-images/male-doctor-2.png';
import MaleDoctor3 from 'public/doctor-images/male-doctor-3.png';
import MaleDoctor4 from 'public/doctor-images/male-doctor-4.png';
import FemaleDoctor1 from 'public/doctor-images/female-doctor-1.png';
import FemaleDoctor2 from 'public/doctor-images/female-doctor-2.png';

interface MedicalAvatarGroupProps {
  height: number;
  width: number;
}

const MedicalAvatarGroup = ({ height, width }: MedicalAvatarGroupProps) => (
  <AvatarGroup
    height={height}
    width={width}
    max={6}
    images={[
      MaleDoctor1.src,
      FemaleDoctor1.src,
      MaleDoctor2.src,
      MaleDoctor3.src,
      MaleDoctor4.src,
      FemaleDoctor2.src,
    ]}
  />
);

export default MedicalAvatarGroup;
