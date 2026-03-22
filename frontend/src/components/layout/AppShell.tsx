import { Outlet } from 'react-router-dom';
import Header from './Header';
import GridOverlay from '../shared/GridOverlay';

export default function AppShell() {
  return (
    <div className="min-h-screen flex flex-col relative">
      <GridOverlay />
      <Header />
      <main className="flex-1 relative z-10 p-6 lg:p-8 max-w-[1320px] mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
}
