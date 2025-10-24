import { createBrowserRouter, RouterProvider } from 'react-router';
import DetectHarmPage from './features/G16-CommunitySupportMap/pages/detectHarmpage';

const router = createBrowserRouter([
  {
    path: '/harm',
    element: <DetectHarmPage />,
  },
]);
function App() {
  return <RouterProvider router={router} />;
}

export default App;
