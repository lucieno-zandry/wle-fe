import { Outlet } from "react-router";
import Footer from "~/components/footer";
import Navbar from "~/components/navbar";

export default function () {
    return <div className="flex flex-col min-h-screen bg-gradient-to-b from-white to-gray-100">
        <Navbar />
        <Outlet />
        <Footer />
    </div>
}