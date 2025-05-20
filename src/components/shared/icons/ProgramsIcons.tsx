interface ProgramsIconProps {
  active: boolean;
  purchaseText?: 'Programs' | 'Shop' | 'Explore' | 'Cares' | 'Trending';
}

const ProgramsIcon = ({
  active,
  purchaseText = 'Trending',
}: ProgramsIconProps) => {
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
          d="M10.5 3H3.5V10H10.5V3Z"
          stroke="#777777"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M21.5 3H14.5V10H21.5V3Z"
          stroke="#777777"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M21.5 14H14.5V21H21.5V14Z"
          stroke="#777777"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10.5 14H3.5V21H10.5V14Z"
          stroke="#777777"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <p
        style={{
          margin: '0',
          fontSize: '9px',
          fontWeight: '600',
          textDecoration: 'none',
          textAlign: 'center',
          color: active ? '#1B1B1B' : '#777777',
        }}
      >
        {purchaseText}
      </p>
    </div>
  );
};

export default ProgramsIcon;
