import Router from 'next/router';
import { useEffect } from 'react';

interface RedirectProps {
  url: string;
}

const Redirect = ({ url }: RedirectProps) => {
  useEffect(() => {
    Router.push(url);
  }, [url]);

  return null;
};

export default Redirect;
