//new with filter
// import type { ReactNode } from 'react';
// import Header from './header';

// // import Menubar from './Menubar';

// type LayoutProps = {
//   children: ReactNode;
//   onSelectTypeId?: (id: number) => void;
// };

// export default function Layout({ children, onSelectTypeId }: LayoutProps) {
//   return (
//     <main className="min-h-screen overflow-hidden bg-white">

//       <Header onSelectTypeId={onSelectTypeId} />

//       <div className="relative">

//         {/* <div className="my-6 flex flex-row items-center justify-center">
//           <Menubar />
//         </div>  */}

//         <div className="grid flex-1 items-end gap-4 p-6">{children}</div>
//       </div>
//     </main>
//   );
// }

// in github
import { type FC, type ReactNode } from 'react';
import Header from './header';

type MainLayoutProps = {
  children: ReactNode;
};

const MainLayout: FC<MainLayoutProps> = ({ children }) => {
  return (
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
  );
};

export default MainLayout;
