import { type FC, type ReactNode } from 'react';
import Header from './header';

type MainLayoutProps = {
  children: ReactNode;
};

const MainLayout: FC<MainLayoutProps> = ({ children }) => {
  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      {/* <div className="relative">
        <div
          className='my-6 flex flex-row items-center justify-center'
            
        >
          <MenuBar />
        </div>
        <div className="grid flex-1 items-start gap-4 p-0">{children}</div>
      </div> */}
      <div className="grid flex-1 items-start gap-4 p-0">{children}</div>
    </main>
  );
};

export default MainLayout;
