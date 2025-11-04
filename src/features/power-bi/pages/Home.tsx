import React from 'react';
import Categories from '../components/Categories';

function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="my-5 text-center text-xl font-bold">
        Access your Citizen Portal
      </h1>
      <div className="flex content-around gap-5">
        <Categories title={'Summary City Performance Dashboard'} />
        <Categories title={'Public Trends Report'} />
      </div>
    </div>
  );
}

export default Home;
