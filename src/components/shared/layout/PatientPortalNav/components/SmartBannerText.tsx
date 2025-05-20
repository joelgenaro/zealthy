import React from 'react';

interface AppInfo {
  header: string;
  subheader: string;
  CTA: string;
}

const SmartBannerText = ({ appInfo }: { appInfo: AppInfo }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <h1
        style={{
          fontSize: '14px',
          fontWeight: 'bold',
          margin: '0',
          width: '100%',
        }}
      >
        {appInfo.header}
      </h1>
      <p
        style={{
          fontSize: '12px',
          color: 'grey',
          margin: '0',
          width: '100%',
          padding: '0',
        }}
      >
        {appInfo.subheader}
      </p>
      <p
        style={{
          fontSize: '12px',
          color: 'grey',
          margin: '0',
          width: '100%',
        }}
      >
        {appInfo.CTA}
      </p>
    </div>
  );
};

export default SmartBannerText;
