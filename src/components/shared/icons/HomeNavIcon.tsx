const HomeNavIcon = ({ active }: { active: boolean }) => {
  return (
    <div
      style={{
        borderBottom: active ? '4px solid #8ACDA0' : '4px solid transparent',
        width: '55px',
        textAlign: 'center',
      }}
    >
      <svg
        width="45"
        height="25"
        viewBox="0 0 25 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M3.5 9L12.5 2L21.5 9V20C21.5 20.5304 21.2893 21.0391 20.9142 21.4142C20.5391 21.7893 20.0304 22 19.5 22H5.5C4.96957 22 4.46086 21.7893 4.08579 21.4142C3.71071 21.0391 3.5 20.5304 3.5 20V9Z"
          stroke="#1B1B1B"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9.5 22V12H15.5V22"
          stroke="#1B1B1B"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
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
        Home
      </span>
    </div>
  );
};

export default HomeNavIcon;
