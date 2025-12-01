import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { Notifications } from "./Notifications";
import { useAppContext } from "../../context/AppContext";

export function Layout() {
  const { customerSession } = useAppContext();
  const accountInactive = customerSession?.status === "inactive";
  return (
    <div className="app-shell">
      <Header />
      {accountInactive && (
        <div className="account-status-banner" role="status">
          Tu cuenta está desactivada. Contáctanos para reactivarla.
        </div>
      )}
      <main>
        <Outlet />
      </main>
      <Notifications />
      <Footer />
    </div>
  );
}
