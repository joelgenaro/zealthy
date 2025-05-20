const Medications2 = ({ active }: { active: boolean }) => {
  return (
    <div
      style={{
        borderBottom: active ? '4px solid #8ACDA0' : '4px solid transparent',
        width: '55px',
        textAlign: 'center',
      }}
    >
      <svg
        width="25"
        height="24"
        viewBox="0 0 25 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M5.5 8L5.5 16C5.5 19.866 8.63401 23 12.5 23C16.366 23 19.5 19.866 19.5 16V8C19.5 4.13401 16.366 1 12.5 1C8.63401 1 5.5 4.13401 5.5 8Z"
          stroke="#777777"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <line
          x1="5.5"
          y1="12.25"
          x2="19.5"
          y2="12.25"
          stroke="#777777"
          strokeWidth="1.5"
        />
      </svg>

      <span
        style={{
          margin: '0',
          fontSize: '9px',
          fontWeight: '600',
          textDecoration: 'none',
          textAlign: 'center',
          color: active ? '#1B1B1B' : '#777777',
        }}
      >
        Medication
      </span>
    </div>
  );
};

export default Medications2;
