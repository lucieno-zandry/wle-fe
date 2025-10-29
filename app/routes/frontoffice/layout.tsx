import React from "react";
import { Outlet, useLoaderData } from "react-router";
import { getAuthUser } from "~/api/httpRequests";
import Footer from "~/components/footer";
import Navbar from "~/components/navbar";
import { useUserStore } from "~/hooks/use-user";

export const clientLoader = async () => {
    const { data } = await getAuthUser();
    const user = data?.user || null;

    return user;
}

export default function () {
    const { setUser, user } = useUserStore();
    const loaderUser = useLoaderData<User | null>();

    React.useEffect(() => {
        setUser(loaderUser);
    }, [loaderUser, setUser]);

    return <div className="flex flex-col min-h-screen bg-gradient-to-b from-white to-gray-100">
        <Navbar />
        <Outlet />
        <Footer />
    </div>
}