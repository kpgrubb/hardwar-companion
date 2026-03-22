import { Outlet } from 'react-router-dom';
import Header from './Header';

export default function AppShell() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 p-4 max-w-[1280px] mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
}
