import { type FC, type ReactNode } from 'react';
import Header from './header';
import Layout from '@/components/main/Layout';
type MainLayoutProps = {
  children: ReactNode;
};

const MainLayout: FC<MainLayoutProps> = ({ children }) => {
  return (
    <Layout>
      <main className="min-h-screen overflow-hidden bg-white">
        <Header />
        {/* <div className="relative">
        <div
          className='my-6 flex flex-row items-center justify-center'
            
        >
          <Menubar/>
        </div>
        <div className="grid flex-1 items-start gap-4 p-0">{children}</div>
      </div> */}
        <div className="grid flex-1 items-end gap-4 p-6">{children}</div>
      </main>
    </Layout>
  );
};

export default MainLayout;
