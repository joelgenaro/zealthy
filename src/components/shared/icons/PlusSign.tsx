const PlusSign = ({ color = '#1B1B1B' }) => {
  return (
    <svg width={18} height={18} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M1 9h16M9 1v16"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default PlusSign;
