import { Badge } from '@mui/material';

const MessagesIcon = ({
  active,
  messageCount,
}: {
  active: boolean;
  messageCount: number;
}) => {
  return (
    <div
      style={{
        borderBottom: active ? '4px solid #8ACDA0' : '4px solid transparent',
        width: '55px',
        textAlign: 'center',
      }}
    >
      <Badge badgeContent={messageCount} color="warning" max={99}>
        <svg
          width="21"
          height="20"
          viewBox="0 0 21 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M19.5 13C19.5 13.5304 19.2893 14.0391 18.9142 14.4142C18.5391 14.7893 18.0304 15 17.5 15H5.5L1.5 19V3C1.5 2.46957 1.71071 1.96086 2.08579 1.58579C2.46086 1.21071 2.96957 1 3.5 1H17.5C18.0304 1 18.5391 1.21071 18.9142 1.58579C19.2893 1.96086 19.5 2.46957 19.5 3V13Z"
            stroke="#777777"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Badge>
      <span
        style={{
          margin: '0',
          fontSize: '9px',
          fontWeight: '600',
          textDecoration: 'none',
          color: active ? '#1B1B1B' : '#777777',
        }}
      >
        Messages
      </span>
    </div>
  );
};

export default MessagesIcon;
